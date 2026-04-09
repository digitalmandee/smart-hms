import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MFAState {
  isEnrolled: boolean;
  currentLevel: "aal1" | "aal2" | null;
  nextLevel: "aal1" | "aal2" | null;
  factorId: string | null;
  isLoading: boolean;
}

export function useMFA() {
  const [state, setState] = useState<MFAState>({
    isEnrolled: false,
    currentLevel: null,
    nextLevel: null,
    factorId: null,
    isLoading: true,
  });

  const checkMFA = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) {
        console.error("MFA check error:", error);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verifiedFactors = factors?.totp?.filter(f => f.status === "verified") || [];

      setState({
        isEnrolled: verifiedFactors.length > 0,
        currentLevel: data.currentLevel as "aal1" | "aal2",
        nextLevel: data.nextLevel as "aal1" | "aal2",
        factorId: verifiedFactors[0]?.id || null,
        isLoading: false,
      });
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    checkMFA();
  }, [checkMFA]);

  const enroll = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator App",
    });
    if (error) throw error;
    return data;
  }, []);

  const challengeAndVerify = useCallback(async (factorId: string, code: string) => {
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) throw challengeError;

    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    if (error) throw error;

    await checkMFA();
    return data;
  }, [checkMFA]);

  const unenroll = useCallback(async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
    await checkMFA();
  }, [checkMFA]);

  return {
    ...state,
    enroll,
    challengeAndVerify,
    unenroll,
    refresh: checkMFA,
  };
}
