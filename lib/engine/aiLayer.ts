export interface AIEnrichmentResult {
  improved: string;
  darijaNote: string;
  provider: string;
}

/**
 * Optional AI enrichment layer.
 * Tries the configured cloud/local provider through /api/ai.
 * Returns null on ANY failure — callers must always have a local fallback ready.
 * The app is 100% functional if this always returns null.
 */
export async function tryAIEnrichment(
  sentence: string,
  situationTitle: string
): Promise<AIEnrichmentResult | null> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence, situationTitle }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.ok) return null;

    return {
      improved: data.improved,
      darijaNote: data.darijaNote || "",
      provider: data.provider || "ia",
    };
  } catch {
    // Réseau indisponible, quota dépassé, Ollama non lancé... peu importe :
    // l'app continue avec le moteur local uniquement.
    return null;
  }
}
