import { useActiveSession, CounterType, BillingSession } from "./useBillingSessions";

export interface RequireSessionResult {
  hasActiveSession: boolean;
  session: BillingSession | null;
  isLoading: boolean;
  sessionId: string | undefined;
}

/**
 * Hook to check and require an active billing session for payment collection.
 * Use this in any page/component that requires a billing session to be active.
 * 
 * @param counterType - Optional counter type to filter sessions (e.g., 'reception', 'pharmacy')
 * @returns Object containing session state and loading status
 */
export function useRequireSession(counterType?: CounterType): RequireSessionResult {
  const { data: activeSession, isLoading } = useActiveSession(counterType);

  return {
    hasActiveSession: !!activeSession,
    session: activeSession || null,
    isLoading,
    sessionId: activeSession?.id,
  };
}
