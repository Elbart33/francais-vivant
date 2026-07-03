import { NextRequest, NextResponse } from "next/server";
import { callMistral } from "@/lib/engine/providers/mistral";
import { callGroq } from "@/lib/engine/providers/groq";
import { callOllama } from "@/lib/engine/providers/ollama";
import { callGemini } from "@/lib/engine/providers/gemini";

export const runtime = "edge";

const SYSTEM_PROMPT_MISTRAL = `Tu es un coach de français discret pour un adulte francophone d'origine marocaine (darija), niveau A2+/B1.

Tu reçois UNE phrase en français, telle que l'utilisateur l'a écrite.

Fais deux passes, dans l'ordre :

1) CORRECTION — corrige uniquement les erreurs réelles : grammaire, conjugaison, genre, accords, confusions phonologiques fréquentes chez un locuteur darija (ex: b/p), calques lexicaux du darija/arabe vers le français. Ne change rien d'autre. Si la phrase est déjà correcte, "corrected" doit être identique à la phrase reçue.

2) AMÉLIORATION — à partir de la version corrigée, propose une reformulation plus naturelle, idiomatique, au registre courant poli, sans changer le sens. Si la phrase corrigée est déjà naturelle, "improved" doit être identique à "corrected".

Pour chaque passe où tu as changé la phrase, donne une explication très courte en français (une phrase, simple, jamais de jargon grammatical technique).
Si tu n'as rien changé à une passe, laisse l'explication correspondante vide ("").

Réponds STRICTEMENT en JSON valide, sans texte ni markdown autour, avec exactement ce format:
{"corrected": "...", "correctionChanged": true, "correctionExplanationFr": "...", "improved": "...", "improvementChanged": true, "improvementExplanationFr": "..."}`;

const SYSTEM_PROMPT_GEMINI = `أنت مدرب دارجة مغربية و فرونسي. خدمتك هي تصحيح الجمل ديال الناس اللي كيتعلمو الفرنسية.

مهمتك:
1. تصحيح الجملة من ناحية القواعد و الصرف و التذكير و التأنيث.
2. تحسين الجملة باش تكون أكثر طبيعية و مفهومة.
3. شرح التصحيح و التحسين بالدارجة المغربية.

قواعد مهمة:
- كترد فقط بالدارجة المغربية، مكتوبة بالحروف العربية. ماشي بالحروف اللاتينية.
- الشرح ديالك يكون قصير و مفهوم و بالدارجة.
- الجواب يكون JSON بهذا الشكل بالضبط:
{
  "corrected": "الجملة المصححة",
  "correctionChanged": true,
  "correctionExplanationDarija": "شرح التصحيح بالدارجة",
  "improved": "الجملة المحسنة",
  "improvementChanged": true,
  "improvementExplanationDarija": "شرح التحسين بالدارجة"
}

إذا ما بدلتي حاجة فالتصحيح، خلي correctionChanged=false و الشرح فارغ.
إذا ما بدلتي حاجة فالتحسين، خلي improvementChanged=false و الشرح فارغ.

ماشي نص ولا markdown، غير JSON.`;

function extractString(text: string, key: string): string {
  const re = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "s");
  const m = text.match(re);
  return m ? m[1].replace(/\\n/g, " ").replace(/\\"/g, '"') : "";
}

function extractBool(text: string, key: string): boolean {
  const re = new RegExp(`"${key}"\\s*:\\s*(true|false)`);
  const m = text.match(re);
  return m ? m[1] === "true" : false;
}

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
      return NextResponse.json({
        ok: false,
        reason: "ai_disabled",
        debug: {
          rawProviderValue: process.env.AI_PROVIDER ?? null,
          hasMistralKey: Boolean(process.env.MISTRAL_API_KEY),
          hasGroqKey: Boolean(process.env.GROQ_API_KEY),
          hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
        },
      });
    }

    const userPrompt = `Situation: ${situationTitle}\nPhrase: "${sentence}"`;

    let raw: string;
    let usedProvider: string = provider;

    try {
      if (provider === "gemini") {
        const params = { system: SYSTEM_PROMPT_GEMINI, user: userPrompt };
        raw = await callGemini(params);
        usedProvider = "gemini";
      } else if (provider === "mistral") {
        const params = { system: SYSTEM_PROMPT_MISTRAL, user: userPrompt };
        raw = await callMistral(params);
        usedProvider = "mistral";
      } else if (provider === "groq") {
        const params = { system: SYSTEM_PROMPT_MISTRAL, user: userPrompt };
        raw = await callGroq(params);
        usedProvider = "groq";
      } else if (provider === "ollama") {
        const params = { system: SYSTEM_PROMPT_MISTRAL, user: userPrompt };
        raw = await callOllama(params);
        usedProvider = "ollama";
      } else {
        return NextResponse.json({ ok: false, reason: "unknown_provider" });
      }
    } catch (err) {
      console.error("Provider error:", err);
      return NextResponse.json({ ok: false, reason: "provider_error" });
    }

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    const jsonSlice =
      firstBrace !== -1 && lastBrace !== -1
        ? cleaned.slice(firstBrace, lastBrace + 1)
        : cleaned;

    let parsed: any;
    try {
      parsed = JSON.parse(jsonSlice);
    } catch {
      const corrected = extractString(raw, "corrected");
      if (!corrected) {
        console.error("Parse error (fallback failed). Raw:", raw);
        return NextResponse.json({ ok: false, reason: "parse_error", debugRaw: raw });
      }
      parsed = {
        corrected,
        correctionChanged: extractBool(raw, "correctionChanged"),
        correctionExplanationFr: extractString(raw, "correctionExplanationFr"),
        correctionExplanationDarija: extractString(raw, "correctionExplanationDarija"),
        improved: extractString(raw, "improved") || corrected,
        improvementChanged: extractBool(raw, "improvementChanged"),
        improvementExplanationFr: extractString(raw, "improvementExplanationFr"),
        improvementExplanationDarija: extractString(raw, "improvementExplanationDarija"),
      };
    }

    if (!parsed.corrected && !parsed.improved) {
      return NextResponse.json({ ok: false, reason: "no_content" });
    }

    let correctionExplanationFr = "";
    let correctionExplanationDarija = "";
    let improvementExplanationFr = "";
    let improvementExplanationDarija = "";

    if (usedProvider === "gemini") {
      correctionExplanationDarija = parsed.correctionExplanationDarija || "";
      improvementExplanationDarija = parsed.improvementExplanationDarija || "";
    } else {
      correctionExplanationFr = parsed.correctionExplanationFr || "";
      improvementExplanationFr = parsed.improvementExplanationFr || "";
    }

    return NextResponse.json({
      ok: true,
      corrected: parsed.corrected || sentence,
      correctionChanged: Boolean(parsed.correctionChanged),
      correctionExplanationFr: correctionExplanationFr,
      correctionExplanationDarija: correctionExplanationDarija,
      improved: parsed.improved || parsed.corrected || sentence,
      improvementChanged: Boolean(parsed.improvementChanged),
      improvementExplanationFr: improvementExplanationFr,
      improvementExplanationDarija: improvementExplanationDarija,
      provider: usedProvider,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ ok: false, reason: "unexpected_error" }, { status: 500 });
  }
}
