import { NextRequest, NextResponse } from "next/server";
import { callMistral } from "@/lib/engine/providers/mistral";
import { callGroq } from "@/lib/engine/providers/groq";
import { callOllama } from "@/lib/engine/providers/ollama";

export const runtime = "edge";

const SYSTEM_PROMPT = `Tu es un assistant discret qui aide un francophone débutant (origine Maroc, darija) à
reformuler une phrase en français plus naturel et fluide, sans changer le sens.
Réponds STRICTEMENT en JSON, sans texte autour, avec ce format:
{"improved": "version naturelle de la phrase", "darija_note": "courte explication en darija (transcrite en lettres latines), une phrase max"}
La phrase donnée est déjà grammaticalement correcte : ton travail est uniquement de l'enrichir
(expressions idiomatiques, registre plus naturel), pas de la corriger.`;

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
    let parsed: { improved?: string; darija_note?: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ ok: false, reason: "parse_error" });
    }

    if (!parsed.improved) {
      return NextResponse.json({ ok: false, reason: "no_content" });
    }

    return NextResponse.json({
      ok: true,
      improved: parsed.improved,
      darijaNote: parsed.darija_note || "",
      provider,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: "unexpected_error" }, { status: 500 });
  }
}
