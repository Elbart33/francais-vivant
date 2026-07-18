"use client";

import { useCallback, useEffect, useState } from "react";
import { SituationAttempt, UserMemory } from "@/types";
import { loadMemory, recordAttempt, resetMemory } from "@/lib/storage/userMemory";

export function useUserMemory() {
  const [memory, setMemory] = useState<UserMemory | null>(null);

  useEffect(() => {
    setMemory(loadMemory());

    // Demande a iOS/Safari de traiter le stockage local comme persistant,
    // pour reduire (sans garantir) le risque de perte de la progression
    // sur les PWA ajoutees a l'ecran d'accueil.
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
  }, []);

  const saveAttempt = useCallback((attempt: SituationAttempt) => {
    const updated = recordAttempt(attempt);
    setMemory({ ...updated });
    return updated;
  }, []);

  const clear = useCallback(() => {
    resetMemory();
    setMemory(loadMemory());
  }, []);

  return { memory, saveAttempt, clear };
}
