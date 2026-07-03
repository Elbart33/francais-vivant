"use client";

import { useCallback, useState } from "react";
import { AnalysisResult, AppliedNote } from "@/types";
import { runLocalPipeline } from "@/lib/engine/correctionEngine";
import { tryAIAnalysis } from "@/lib/engine/aiLayer";
import { wordDiff } from "@/lib/engine/diff";

export function useAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(
    async (rawSentence: string, situationTitle: string, situationIdiomIds: string[]) => {
      setLoading(true);

      // 1) Moteur local — toujours exécuté, garantit un résultat même sans réseau.
      // C'est la base de secours : si l'IA échoue, ce résultat est utilisé tel quel.
      const local = runLocalPipeline(rawSentence, situationIdiomIds);

      let corrected = local.corrected;
      let improved = local.improved;
      let correctionNotes: AppliedNote[] = local.correctionNotes;
      let improvementNotes: AppliedNote[] = local.improvementNotes;
      let correctionDiff = local.correctionDiff;
      let improvementDiff = local.improvementDiff;
      let usedAI = false;

      // 2) Couche IA — reçoit la phrase BRUTE (pas la version déjà filtrée par le
      // moteur local), pour pouvoir détecter des erreurs que les règles regex ne
      // couvrent pas. Tentative silencieuse, jamais bloquante : en cas d'échec on
      // garde le résultat local calculé ci-dessus.
      const ai = await tryAIAnalysis(rawSentence, situationTitle);

      if (ai) {
        usedAI = true;
        corrected = ai.corrected;
        improved = ai.improved;

        correctionNotes = ai.correctionChanged
          ? [
              {
                ruleId: `ai-correction-${ai.provider}`,
                before: rawSentence,
                after: ai.corrected,
                explanationFr:
                  ai.correctionExplanationFr || "Une petite correction a été apportée.",
                explanationDarija: ai.correctionExplanationDarija,
                stage: "correction",
              },
            ]
          : [];

        improvementNotes = ai.improvementChanged
          ? [
              {
                ruleId: `ai-improvement-${ai.provider}`,
                before: ai.corrected,
                after: ai.improved,
                explanationFr:
                  ai.improvementExplanationFr ||
                  "Reformulation proposée pour sonner plus naturel.",
                explanationDarija: ai.improvementExplanationDarija,
                stage: "amelioration",
              },
            ]
          : [];

        correctionDiff = wordDiff(rawSentence, corrected, "corrected");
        improvementDiff = wordDiff(corrected, improved, "improved");
      }

      const finalResult: AnalysisResult = {
        original: local.original,
        corrected,
        improved,
        correctionNotes,
        improvementNotes,
        correctionDiff,
        improvementDiff,
        usedAI,
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
