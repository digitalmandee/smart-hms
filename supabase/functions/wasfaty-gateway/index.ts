import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * Wasfaty (وصفتي) E-Prescription Gateway
 * 
 * Saudi MOH Electronic Prescription System Integration
 * Supports:
 * - Prescription submission
 * - Status checking
 * - Dispensing verification
 */

interface WasfatyMedication {
  drugCode: string;
  drugName: string;
  drugNameAr?: string;
  dosage: string;
  frequency: string;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months';
  quantity: number;
  instructions?: string;
  refillsAllowed?: number;
}

interface WasfatyPrescriptionRequest {
  patientNationalId: string;
  patientName: string;
  patientNameAr?: string;
  doctorLicenseNumber: string;
  doctorName: string;
  facilityId: string;
  diagnosisCodes: string[];
  medications: WasfatyMedication[];
  notes?: string;
}

function buildWasfatyPayload(data: WasfatyPrescriptionRequest): object {
  return {
    header: {
      messageId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      facilityId: data.facilityId,
    },
    patient: {
      nationalId: data.patientNationalId,
      name: data.patientName,
      nameAr: data.patientNameAr,
    },
    prescriber: {
      licenseNumber: data.doctorLicenseNumber,
      name: data.doctorName,
    },
    prescription: {
      diagnosisCodes: data.diagnosisCodes,
      medications: data.medications.map(med => ({
        drugCode: med.drugCode,
        drugName: med.drugName,
        drugNameAr: med.drugNameAr,
        dosageInstructions: {
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          durationUnit: med.durationUnit,
        },
        quantity: med.quantity,
        specialInstructions: med.instructions,
        refillsAllowed: med.refillsAllowed || 0,
      })),
      notes: data.notes,
    },
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, prescription_id, organization_id } = body;

    // Get organization config
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("wasfaty_enabled, wasfaty_facility_id, country_code")
      .eq("id", organization_id)
      .single();

    if (orgError || !org) {
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!org.wasfaty_enabled || org.country_code !== 'SA') {
      return new Response(
        JSON.stringify({ error: "Wasfaty not enabled for this organization" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const wasfatyApiKey = Deno.env.get("WASFATY_API_KEY");
    const wasfatyBaseUrl = Deno.env.get("WASFATY_BASE_URL") || "https://wasfaty.sa/api/v1";

    switch (action) {
      case "submit": {
        // Get prescription details
        const { data: rxData, error: rxError } = await supabase
          .from("wasfaty_prescriptions")
          .select(`
            *,
            patient:patients(first_name, last_name, national_id),
            doctor:doctors(
              license_number,
              profile:profiles(full_name)
            )
          `)
          .eq("id", prescription_id)
          .single();

        if (rxError || !rxData) {
          return new Response(
            JSON.stringify({ error: "Prescription not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const patient = rxData.patient as any;
        const doctor = rxData.doctor as any;

        const payload = buildWasfatyPayload({
          patientNationalId: patient?.national_id || '',
          patientName: `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim(),
          doctorLicenseNumber: doctor?.license_number || '',
          doctorName: doctor?.profile?.full_name || '',
          facilityId: org.wasfaty_facility_id || '',
          diagnosisCodes: rxData.diagnosis_codes || [],
          medications: (rxData.medications as WasfatyMedication[]) || [],
        });

        // In production, this would call the actual Wasfaty API
        // For now, simulate the response
        if (!wasfatyApiKey) {
          // Development/sandbox mode - simulate success
          const mockWasfatyId = `WSF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          const { error: updateError } = await supabase
            .from("wasfaty_prescriptions")
            .update({
              wasfaty_prescription_id: mockWasfatyId,
              wasfaty_status: 'submitted',
              submitted_at: new Date().toISOString(),
              submitted_by: user.id,
              response_data: { 
                mode: 'sandbox', 
                prescriptionId: mockWasfatyId,
                message: 'Sandbox submission successful'
              },
            })
            .eq("id", prescription_id);

          if (updateError) {
            console.error("Failed to update prescription:", updateError);
          }

          return new Response(
            JSON.stringify({
              success: true,
              wasfaty_id: mockWasfatyId,
              status: 'submitted',
              message: "Prescription submitted to Wasfaty (sandbox mode)",
              sandbox: true,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Production API call
        const response = await fetch(`${wasfatyBaseUrl}/prescriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${wasfatyApiKey}`,
            'X-Facility-Id': org.wasfaty_facility_id || '',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          await supabase
            .from("wasfaty_prescriptions")
            .update({
              wasfaty_status: 'failed',
              error_message: result.error || 'Submission failed',
              response_data: result,
            })
            .eq("id", prescription_id);

          return new Response(
            JSON.stringify({ error: result.error || 'Wasfaty submission failed', details: result }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await supabase
          .from("wasfaty_prescriptions")
          .update({
            wasfaty_prescription_id: result.prescriptionId,
            wasfaty_status: 'submitted',
            submitted_at: new Date().toISOString(),
            submitted_by: user.id,
            response_data: result,
          })
          .eq("id", prescription_id);

        return new Response(
          JSON.stringify({
            success: true,
            wasfaty_id: result.prescriptionId,
            status: 'submitted',
            message: "Prescription submitted to Wasfaty successfully",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check_status": {
        const { data: rxData } = await supabase
          .from("wasfaty_prescriptions")
          .select("wasfaty_prescription_id, wasfaty_status")
          .eq("id", prescription_id)
          .single();

        if (!rxData?.wasfaty_prescription_id) {
          return new Response(
            JSON.stringify({ error: "Prescription not submitted to Wasfaty" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!wasfatyApiKey) {
          // Sandbox mode
          return new Response(
            JSON.stringify({
              success: true,
              status: rxData.wasfaty_status,
              wasfaty_id: rxData.wasfaty_prescription_id,
              sandbox: true,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const response = await fetch(
          `${wasfatyBaseUrl}/prescriptions/${rxData.wasfaty_prescription_id}/status`,
          {
            headers: {
              'Authorization': `Bearer ${wasfatyApiKey}`,
              'X-Facility-Id': org.wasfaty_facility_id || '',
            },
          }
        );

        const result = await response.json();

        if (response.ok) {
          await supabase
            .from("wasfaty_prescriptions")
            .update({
              wasfaty_status: result.status,
              dispensed_at: result.dispensedAt || null,
              dispensing_pharmacy: result.dispensingPharmacy || null,
            })
            .eq("id", prescription_id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            ...result,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("Wasfaty gateway error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
