"use client";

import { useCallback, useState } from "react";
import { AnalysisResult } from "@/types";
import { runLocalPipeline } from "@/lib/engine/correctionEngine";
import { tryAIEnrichment } from "@/lib/engine/aiLayer";
import { wordDiff } from "@/lib/engine/diff";

export function useAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(
    async (rawSentence: string, situationTitle: string, situationIdiomIds: string[]) => {
      setLoading(true);

      // 1) Moteur local — toujours exécuté, garantit un résultat même sans réseau.
      const local = runLocalPipeline(rawSentence, situationIdiomIds);

      let improved = local.improved;
      let improvementDiff = local.improvementDiff;
      let usedAI = false;
      let aiExplanationDarija: string | undefined;

      // 2) Couche IA optionnelle — tentative silencieuse, jamais bloquante.
      const ai = await tryAIEnrichment(local.corrected, situationTitle);
      if (ai && ai.improved && ai.improved.trim().length > 0) {
        improved = ai.improved;
        improvementDiff = wordDiff(local.corrected, improved, "improved");
        usedAI = true;
        aiExplanationDarija = ai.darijaNote;
      }

      const finalResult: AnalysisResult = {
        original: local.original,
        corrected: local.corrected,
        improved,
        correctionNotes: local.correctionNotes,
        improvementNotes: local.improvementNotes,
        correctionDiff: local.correctionDiff,
        improvementDiff,
        usedAI,
        aiExplanationDarija,
        matchedIdioms: local.matchedIdioms,
      };

      setResult(finalResult);
      setLoading(false);
      return finalResult;
    },
    []
  );

  const reset = useCallback(() => setResult(null), []);

  return { result, loading, analyze, reset };
}
