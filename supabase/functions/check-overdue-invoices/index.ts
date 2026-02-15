import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  organization_id: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  };
  organization: {
    name: string;
    email: string | null;
  };
}

interface OrgSettings {
  organization_id: string;
  settings: Record<string, string>;
  org_name: string;
}

serve(async (req: Request): Promise<Response> => {
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

    console.log("Starting overdue invoice check...");

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

    // Get all organizations with overdue notifications enabled
    const { data: orgSettings, error: orgError } = await supabase
      .from("organization_settings")
      .select(`
        organization_id,
        setting_key,
        setting_value,
        organizations!inner(name)
      `)
      .in("setting_key", [
        "overdue_notifications_enabled",
        "overdue_notification_days",
        "overdue_email_enabled",
        "overdue_reminder_interval",
        "overdue_max_reminders"
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
      
      // Check if overdue notifications are enabled
      if (settings.overdue_notifications_enabled !== "true") {
        continue;
      }

      if (settings.overdue_email_enabled !== "true") {
        continue;
      }

      const daysAfterDue = parseInt(settings.overdue_notification_days || "7");
      const reminderInterval = parseInt(settings.overdue_reminder_interval || "7");
      const maxReminders = parseInt(settings.overdue_max_reminders || "3");

      // Calculate the cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAfterDue);

      // Fetch overdue invoices for this organization
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          invoice_date,
          total_amount,
          paid_amount,
          organization_id,
          patient:patients!inner(id, first_name, last_name, email, phone),
          organization:organizations!inner(name, email)
        `)
        .eq("organization_id", orgId)
        .in("status", ["pending", "partially_paid"])
        .lt("invoice_date", cutoffDate.toISOString().split("T")[0]);

      if (invoicesError) {
        console.error(`Error fetching invoices for org ${orgId}:`, invoicesError);
        continue;
      }

      // Process each overdue invoice
      for (const invoice of (invoices as unknown as Invoice[]) || []) {
        const patientEmail = invoice.patient?.email;
        
        if (!patientEmail) {
          console.log(`No email for patient on invoice ${invoice.invoice_number}`);
          continue;
        }

        // Check existing notifications for this invoice
        const { data: existingNotifications, error: notifError } = await supabase
          .from("notification_logs")
          .select("id, sent_at")
          .eq("reference_id", invoice.id)
          .eq("notification_type", "overdue_invoice")
          .eq("channel", "email")
          .eq("status", "sent")
          .order("sent_at", { ascending: false });

        if (notifError) {
          console.error(`Error checking notifications for invoice ${invoice.id}:`, notifError);
          continue;
        }

        // Check if we've exceeded max reminders
        if (existingNotifications && existingNotifications.length >= maxReminders) {
          console.log(`Max reminders reached for invoice ${invoice.invoice_number}`);
          continue;
        }

        // Check if enough time has passed since last notification
        if (existingNotifications && existingNotifications.length > 0) {
          const lastSent = new Date(existingNotifications[0].sent_at);
          const daysSinceLastReminder = Math.floor(
            (Date.now() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceLastReminder < reminderInterval) {
            console.log(`Too soon for reminder on invoice ${invoice.invoice_number}`);
            continue;
          }
        }

        // Calculate outstanding amount
        const outstandingAmount = (invoice.total_amount || 0) - (invoice.paid_amount || 0);
        const patientName = `${invoice.patient.first_name} ${invoice.patient.last_name || ""}`.trim();

        // Send email
        try {
          const emailResult = await resend.emails.send({
            from: `${orgData.org_name} <${fromEmail}>`,
            to: [patientEmail],
            subject: `Payment Reminder - Invoice #${invoice.invoice_number}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Payment Reminder</h2>
                <p>Dear ${patientName},</p>
                <p>This is a friendly reminder that your invoice <strong>#${invoice.invoice_number}</strong> dated ${new Date(invoice.invoice_date).toLocaleDateString()} is now overdue.</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
                  <p style="margin: 10px 0 0;"><strong>Invoice Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString()}</p>
                  <p style="margin: 10px 0 0;"><strong>Total Amount:</strong> ${invoice.total_amount?.toFixed(2)}</p>
                  <p style="margin: 10px 0 0;"><strong>Outstanding Balance:</strong> ${outstandingAmount.toFixed(2)}</p>
                </div>
                
                <p>Please arrange payment at your earliest convenience.</p>
                <p>If you have already made this payment, please disregard this notice.</p>
                
                <p style="margin-top: 30px;">Thank you,<br><strong>${orgData.org_name}</strong></p>
              </div>
            `,
          });

          console.log(`Email sent for invoice ${invoice.invoice_number}:`, emailResult);

          // Log the notification
          await supabase.from("notification_logs").insert({
            organization_id: orgId,
            notification_type: "overdue_invoice",
            reference_id: invoice.id,
            recipient_email: patientEmail,
            channel: "email",
            status: "sent",
          });

          totalSent++;
          results.push({
            invoice_number: invoice.invoice_number,
            patient: patientName,
            email: patientEmail,
            status: "sent"
          });
        } catch (emailError: any) {
          console.error(`Error sending email for invoice ${invoice.invoice_number}:`, emailError);
          
          // Log the failed notification
          await supabase.from("notification_logs").insert({
            organization_id: orgId,
            notification_type: "overdue_invoice",
            reference_id: invoice.id,
            recipient_email: patientEmail,
            channel: "email",
            status: "failed",
            error_message: emailError.message,
          });

          results.push({
            invoice_number: invoice.invoice_number,
            patient: patientName,
            email: patientEmail,
            status: "failed",
            error: emailError.message
          });
        }
      }
    }

    console.log(`Overdue invoice check complete. Sent ${totalSent} notifications.`);

    return new Response(
      JSON.stringify({ message: "Overdue invoice check complete", sent: totalSent, results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in check-overdue-invoices:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
