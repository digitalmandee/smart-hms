import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type KsaIntegration = "nphies" | "wasfaty" | "tatmeen" | "hesn" | "nafath" | "sehhaty" | "zatca";

interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

const TEST_CONFIGS: Record<KsaIntegration, { functionName: string; body: Record<string, unknown> }> = {
  nphies: {
    functionName: "nphies-gateway",
    body: { action: "eligibility_check", patient_id: "TEST-000", insurance_id: "TEST-INS" },
  },
  wasfaty: {
    functionName: "wasfaty-gateway",
    body: { action: "test", prescription_data: { test: true } },
  },
  tatmeen: {
    functionName: "tatmeen-gateway",
    body: { action: "report_movement", movement_data: { gtin: "00000000000000", serial_number: "TEST", movement_type: "dispense", test: true } },
  },
  hesn: {
    functionName: "hesn-gateway",
    body: { action: "submit_report", report_data: { report_type: "communicable_disease", test: true } },
  },
  nafath: {
    functionName: "nafath-gateway",
    body: { action: "initiate_verification", national_id: "0000000000" },
  },
  sehhaty: {
    functionName: "sehhaty-gateway",
    body: { action: "push", sync_data: { sync_type: "appointment", patient_national_id: "0000000000", description: "Test sync", appointment_date: new Date().toISOString() } },
  },
  zatca: {
    functionName: "zatca-phase2",
    body: { action: "test", invoice_data: { test: true } },
  },
};

export function useKsaConnectionTest() {
  const [testing, setTesting] = useState<KsaIntegration | null>(null);
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const { toast } = useToast();

  const testConnection = async (integration: KsaIntegration) => {
    setTesting(integration);
    const config = TEST_CONFIGS[integration];

    try {
      const { data, error } = await supabase.functions.invoke(config.functionName, {
        body: config.body,
      });

      const result: TestResult = {
        success: !error,
        message: error ? `Error: ${error.message}` : (data?.message || data?.status || "Connection successful"),
        timestamp: new Date().toISOString(),
        details: data,
      };

      setResults((prev) => ({ ...prev, [integration]: result }));

      toast({
        title: result.success ? "✅ Test Passed" : "❌ Test Failed",
        description: `${integration.toUpperCase()}: ${result.message}`,
        variant: result.success ? "default" : "destructive",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      const result: TestResult = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
      };
      setResults((prev) => ({ ...prev, [integration]: result }));
      toast({
        title: "❌ Test Failed",
        description: `${integration.toUpperCase()}: ${message}`,
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  return { testConnection, testing, results };
}
