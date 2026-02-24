import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  organization_id: string;
  test_recipient: string;
}

interface EmailSettings {
  email_provider: string | null;
  resend_api_key: string | null;
  sendgrid_api_key: string | null;
  smtp_host: string | null;
  smtp_port: string | null;
  smtp_username: string | null;
  smtp_password: string | null;
  smtp_encryption: string | null;
  email_from_name: string | null;
  email_from_address: string | null;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require authentication
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const jwtToken = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(jwtToken);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { organization_id, test_recipient }: RequestBody = await req.json();

    if (!organization_id || !test_recipient) {
      throw new Error("organization_id and test_recipient are required");
    }

    // Create service-role client for reading org settings
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch organization details
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organization_id)
      .single();

    // Fetch email settings for this organization
    const { data: settingsData } = await supabase
      .from("organization_settings")
      .select("setting_key, setting_value")
      .eq("organization_id", organization_id)
      .in("setting_key", [
        "email_provider",
        "resend_api_key",
        "sendgrid_api_key",
        "smtp_host",
        "smtp_port",
        "smtp_username",
        "smtp_password",
        "smtp_encryption",
        "email_from_name",
        "email_from_address",
      ]);

    // Convert to object
    const settings: EmailSettings = {
      email_provider: null,
      resend_api_key: null,
      sendgrid_api_key: null,
      smtp_host: null,
      smtp_port: null,
      smtp_username: null,
      smtp_password: null,
      smtp_encryption: null,
      email_from_name: null,
      email_from_address: null,
    };

    settingsData?.forEach((item) => {
      const key = item.setting_key as keyof EmailSettings;
      if (key in settings) {
        settings[key] = item.setting_value;
      }
    });

    // Validate configuration
    if (!settings.email_provider) {
      throw new Error("Email provider not configured. Please select a provider first.");
    }

    const fromName = settings.email_from_name || org?.name || "Test";
    const fromEmail = settings.email_from_address || "onboarding@resend.dev";
    const from = `${fromName} <${fromEmail}>`;

    // Send test email based on provider
    if (settings.email_provider === "resend") {
      if (!settings.resend_api_key) {
        throw new Error("Resend API key not configured");
      }

      const resend = new Resend(settings.resend_api_key);

      const result = await resend.emails.send({
        from,
        to: [test_recipient],
        subject: "✅ Email Configuration Test - Success!",
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">✅ Test Successful!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Congratulations! Your email configuration is working correctly.</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Organization:</strong> ${org?.name || "Unknown"}</p>
                <p style="margin: 5px 0;"><strong>Provider:</strong> Resend</p>
                <p style="margin: 5px 0;"><strong>From:</strong> ${from}</p>
                <p style="margin: 5px 0;"><strong>Sent at:</strong> ${new Date().toISOString()}</p>
              </div>
              <p style="color: #666; font-size: 14px;">
                Your organization is now ready to send automated email notifications to patients.
              </p>
            </div>
          </body>
          </html>
        `,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log("Test email sent via Resend:", result);
    } else if (settings.email_provider === "sendgrid") {
      throw new Error("SendGrid provider is not yet implemented. Please use Resend.");
    } else if (settings.email_provider === "smtp") {
      throw new Error("Custom SMTP is not yet implemented. Please use Resend.");
    } else {
      throw new Error(`Unknown email provider: ${settings.email_provider}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Test email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending test email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
