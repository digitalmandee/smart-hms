import { useEffect } from "react";
import { useMyStores, useStores, useStoreContext } from "@/hooks/useStores";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Auto-selects a store for the logged-in user.
 * - If user manages exactly one store, auto-selects it.
 * - If user manages multiple, selects the first one.
 * - If user is admin (not a store manager), defaults to "all" when showAll is true, or first available store.
 */
export function useDefaultStore(
  storeId: string,
  setStoreId: (id: string) => void,
  showAll = false
) {
  const { profile } = useAuth();
  const { data: myStores } = useMyStores();
  const autoContext = useStoreContext();
  const { data: allStores } = useStores(undefined, autoContext);

  useEffect(() => {
    // Only auto-select if no store is selected yet (or is the default empty string)
    if (storeId && storeId !== "") return;

    if (myStores && myStores.length > 0) {
      // User manages stores — pick their first one
      setStoreId(myStores[0].id);
    } else if (allStores && allStores.length > 0) {
      if (showAll) {
        setStoreId("all");
      } else {
        setStoreId(allStores[0].id);
      }
    }
  }, [myStores, allStores, storeId, setStoreId, showAll]);
}
