import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from "../_shared/cors.ts";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string | null;
  token_number: number | null;
  organization_id: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  };
  doctor: {
    id: string;
    profile: {
      full_name: string;
    };
  } | null;
  branch: {
    name: string;
    address: string | null;
  };
  organization: {
    name: string;
  };
}

interface OrgSettings {
  organization_id: string;
  settings: Record<string, string>;
  org_name: string;
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication: require cron secret or JWT
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");

    if (cronSecret) {
      const providedSecret = req.headers.get("x-cron-secret");
      if (providedSecret !== cronSecret) {
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }
        const authClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
        const { error } = await authClient.auth.getClaims(authHeader.replace("Bearer ", ""));
        if (error) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }
    } else if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting appointment reminder check...");

    // Get Resend API key from system settings
    const { data: resendSetting } = await supabase
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", "resend_api_key")
      .single();

    const { data: fromEmailSetting } = await supabase
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", "notification_from_email")
      .single();

    const resendApiKey = resendSetting?.setting_value;
    const fromEmail = fromEmailSetting?.setting_value || "noreply@clinic.com";

    if (!resendApiKey) {
      console.log("Resend API key not configured");
      return new Response(
        JSON.stringify({ message: "Resend API key not configured", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Get all organizations with appointment reminders enabled
    const { data: orgSettings, error: orgError } = await supabase
      .from("organization_settings")
      .select(`
        organization_id,
        setting_key,
        setting_value,
        organizations!inner(name)
      `)
      .in("setting_key", [
        "appointment_reminder_enabled",
        "appointment_reminder_hours",
        "appointment_email_enabled"
      ]);

    if (orgError) {
      console.error("Error fetching org settings:", orgError);
      throw orgError;
    }

    // Group settings by organization
    const orgSettingsMap = new Map<string, OrgSettings>();
    
    orgSettings?.forEach((setting: any) => {
      const orgId = setting.organization_id;
      if (!orgSettingsMap.has(orgId)) {
        orgSettingsMap.set(orgId, {
          organization_id: orgId,
          settings: {},
          org_name: setting.organizations?.name || "Clinic"
        });
      }
      orgSettingsMap.get(orgId)!.settings[setting.setting_key] = setting.setting_value;
    });

    let totalSent = 0;
    const results: any[] = [];

    // Process each organization
    for (const [orgId, orgData] of orgSettingsMap) {
      const settings = orgData.settings;
      
      // Check if appointment reminders are enabled
      if (settings.appointment_reminder_enabled !== "true") {
        continue;
      }

      if (settings.appointment_email_enabled !== "true") {
        continue;
      }

      const hoursBeforeAppointment = parseInt(settings.appointment_reminder_hours || "24");

      // Calculate the time window for appointments
      const now = new Date();
      const windowStart = new Date(now.getTime() + (hoursBeforeAppointment - 1) * 60 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + (hoursBeforeAppointment + 1) * 60 * 60 * 1000);

      // Get the date range we need to check
      const startDate = windowStart.toISOString().split("T")[0];
      const endDate = windowEnd.toISOString().split("T")[0];

      // Fetch upcoming appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          token_number,
          organization_id,
          patient:patients!inner(id, first_name, last_name, email, phone),
          doctor:doctors(id, profile:profiles!inner(full_name)),
          branch:branches!inner(name, address),
          organization:organizations!inner(name)
        `)
        .eq("organization_id", orgId)
        .eq("status", "scheduled")
        .gte("appointment_date", startDate)
        .lte("appointment_date", endDate);

      if (appointmentsError) {
        console.error(`Error fetching appointments for org ${orgId}:`, appointmentsError);
        continue;
      }

      // Process each appointment
      for (const appointment of (appointments as unknown as Appointment[]) || []) {
        const patientEmail = appointment.patient?.email;
        
        if (!patientEmail) {
          console.log(`No email for patient on appointment ${appointment.id}`);
          continue;
        }

        // Calculate exact appointment datetime
        const appointmentDate = new Date(appointment.appointment_date);
        if (appointment.appointment_time) {
          const [hours, minutes] = appointment.appointment_time.split(":").map(Number);
          appointmentDate.setHours(hours, minutes, 0, 0);
        }

        // Check if appointment falls within the reminder window
        const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilAppointment < hoursBeforeAppointment - 1 || hoursUntilAppointment > hoursBeforeAppointment + 1) {
          continue;
        }

        // Check if we already sent a reminder for this appointment
        const { data: existingNotification } = await supabase
          .from("notification_logs")
          .select("id")
          .eq("reference_id", appointment.id)
          .eq("notification_type", "appointment_reminder")
          .eq("channel", "email")
          .eq("status", "sent")
          .single();

        if (existingNotification) {
          console.log(`Reminder already sent for appointment ${appointment.id}`);
          continue;
        }

        const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name || ""}`.trim();
        const doctorName = appointment.doctor?.profile?.full_name || "Your Doctor";
        const formattedDate = appointmentDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        const formattedTime = appointment.appointment_time 
          ? new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true
            })
          : "As scheduled";

        // Send email
        try {
          const emailResult = await resend.emails.send({
            from: `${orgData.org_name} <${fromEmail}>`,
            to: [patientEmail],
            subject: `Appointment Reminder - ${formattedDate}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Appointment Reminder</h2>
                <p>Dear ${patientName},</p>
                <p>This is a friendly reminder of your upcoming appointment:</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Date:</strong> ${formattedDate}</p>
                  <p style="margin: 10px 0 0;"><strong>Time:</strong> ${formattedTime}</p>
                  ${appointment.token_number ? `<p style="margin: 10px 0 0;"><strong>Token Number:</strong> ${appointment.token_number}</p>` : ""}
                  <p style="margin: 10px 0 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
                  <p style="margin: 10px 0 0;"><strong>Location:</strong> ${appointment.branch.name}</p>
                  ${appointment.branch.address ? `<p style="margin: 5px 0 0; color: #666; font-size: 14px;">${appointment.branch.address}</p>` : ""}
                </div>
                
                <p>Please arrive 10 minutes early. If you need to reschedule, please contact us as soon as possible.</p>
                
                <p style="margin-top: 30px;">Thank you,<br><strong>${orgData.org_name}</strong></p>
              </div>
            `,
          });

          console.log(`Email sent for appointment ${appointment.id}:`, emailResult);

          // Log the notification
          await supabase.from("notification_logs").insert({
            organization_id: orgId,
            notification_type: "appointment_reminder",
            reference_id: appointment.id,
            recipient_email: patientEmail,
            channel: "email",
            status: "sent",
          });

          totalSent++;
          results.push({
            appointment_id: appointment.id,
            patient: patientName,
            email: patientEmail,
            date: formattedDate,
            status: "sent"
          });
        } catch (emailError: any) {
          console.error(`Error sending email for appointment ${appointment.id}:`, emailError);
          
          // Log the failed notification
          await supabase.from("notification_logs").insert({
            organization_id: orgId,
            notification_type: "appointment_reminder",
            reference_id: appointment.id,
            recipient_email: patientEmail,
            channel: "email",
            status: "failed",
            error_message: emailError.message,
          });

          results.push({
            appointment_id: appointment.id,
            patient: patientName,
            email: patientEmail,
            date: formattedDate,
            status: "failed",
            error: emailError.message
          });
        }
      }
    }

    console.log(`Appointment reminder check complete. Sent ${totalSent} notifications.`);

    return new Response(
      JSON.stringify({ message: "Appointment reminder check complete", sent: totalSent, results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
