import { NextRequest, NextResponse } from "next/server";
import { callMistral } from "@/lib/engine/providers/mistral";
import { callGroq } from "@/lib/engine/providers/groq";
import { callOllama } from "@/lib/engine/providers/ollama";

export const runtime = "edge";

const SYSTEM_PROMPT = `Tu es un coach de français discret pour un adulte francophone d'origine marocaine
(darija), niveau A2+/B1. Tu reçois UNE phrase brute, telle qu'il/elle l'a écrite.

Fais deux passes, dans l'ordre :

1) CORRECTION — corrige uniquement les erreurs réelles : grammaire, conjugaison, genre,
   accords, confusions phonologiques fréquentes chez un locuteur darija (ex: b/p),
   calques lexicaux du darija/arabe vers le français. Ne change rien d'autre.
   Si la phrase est déjà correcte, "corrected" doit être identique à la phrase reçue.

2) AMÉLIORATION — à partir de la version corrigée, propose une reformulation plus
   naturelle, idiomatique, au registre courant poli, sans changer le sens.
   Si la phrase corrigée est déjà naturelle, "improved" doit être identique à "corrected".

Pour chaque passe où tu as changé la phrase, donne une explication très courte en
français (une phrase, simple, jamais de jargon grammatical technique) ET une
explication en darija marocain (transcrite en lettres latines, familière, une phrase max).
Si tu n'as rien changé à une passe, laisse les explications correspondantes vides ("").

Réponds STRICTEMENT en JSON valide, sans texte ni markdown autour, avec exactement ce format:
{"corrected": "...", "correctionChanged": true, "correctionExplanationFr": "...", "correctionExplanationDarija": "...", "improved": "...", "improvementChanged": true, "improvementExplanationFr": "...", "improvementExplanationDarija": "..."}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sentence: string = body?.sentence || "";
    const situationTitle: string = body?.situationTitle || "";

    if (!sentence.trim()) {
      return NextResponse.json({ ok: false, reason: "empty" }, { status: 400 });
    }

    const provider = (process.env.AI_PROVIDER || "none").toLowerCase();

    if (provider === "none") {
      return NextResponse.json({ ok: false, reason: "ai_disabled" });
    }

    const userPrompt = `Situation: ${situationTitle}\nPhrase: "${sentence}"`;
    const params = { system: SYSTEM_PROMPT, user: userPrompt };

    let raw: string;
    try {
      if (provider === "mistral") raw = await callMistral(params);
      else if (provider === "groq") raw = await callGroq(params);
      else if (provider === "ollama") raw = await callOllama(params);
      else return NextResponse.json({ ok: false, reason: "unknown_provider" });
    } catch (err) {
      // Fallback graceful : le client utilisera le moteur local seul.
      return NextResponse.json({ ok: false, reason: "provider_error" });
    }

    const cleaned = raw.replace(/```json|```/g, "").trim();
    let parsed: {
      corrected?: string;
      correctionChanged?: boolean;
      correctionExplanationFr?: string;
      correctionExplanationDarija?: string;
      improved?: string;
      improvementChanged?: boolean;
      improvementExplanationFr?: string;
      improvementExplanationDarija?: string;
    };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ ok: false, reason: "parse_error" });
    }

    if (!parsed.corrected && !parsed.improved) {
      return NextResponse.json({ ok: false, reason: "no_content" });
    }

    return NextResponse.json({
      ok: true,
      corrected: parsed.corrected || sentence,
      correctionChanged: Boolean(parsed.correctionChanged),
      correctionExplanationFr: parsed.correctionExplanationFr || "",
      correctionExplanationDarija: parsed.correctionExplanationDarija || "",
      improved: parsed.improved || parsed.corrected || sentence,
      improvementChanged: Boolean(parsed.improvementChanged),
      improvementExplanationFr: parsed.improvementExplanationFr || "",
      improvementExplanationDarija: parsed.improvementExplanationDarija || "",
      provider,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: "unexpected_error" }, { status: 500 });
  }
}
