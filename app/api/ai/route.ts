import { NextRequest, NextResponse } from "next/server";
import { callMistral } from "@/lib/engine/providers/mistral";
import { callGroq } from "@/lib/engine/providers/groq";
import { callOllama } from "@/lib/engine/providers/ollama";
import { callGemini } from "@/lib/engine/providers/gemini";
import { getLanguageConfig } from "@/config/languages";

export const runtime = "edge";

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
    const situationTask: string = body?.situationTask || "";

    if (!sentence.trim()) {
      return NextResponse.json({ ok: false, reason: "empty" }, { status: 400 });
    }

    const provider = (process.env.AI_PROVIDER || "none").toLowerCase();
    const langConfig = getLanguageConfig();
    const prompts = langConfig.aiPrompts;

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

    const userPrompt = `Situation: ${situationTitle}\nTâche demandée: ${situationTask}\nPhrase: "${sentence}"`;

    let raw: string;
    let usedProvider: string = provider;

    try {
      if (provider === "gemini") {
        try {
          const params = { system: prompts.geminiPrimary, user: userPrompt };
          raw = await callGemini(params);
          usedProvider = "gemini";
        } catch (geminiErr) {
          console.error("Gemini failed, falling back to Groq:", geminiErr);
          const params = { system: prompts.geminiFallback, user: userPrompt };
          raw = await callGroq(params);
          usedProvider = "groq-darija";
        }
      } else if (provider === "mistral") {
        const params = { system: prompts.default, user: userPrompt };
        raw = await callMistral(params);
        usedProvider = "mistral";
      } else if (provider === "groq") {
        const params = { system: prompts.default, user: userPrompt };
        raw = await callGroq(params);
        usedProvider = "groq";
      } else if (provider === "ollama") {
        const params = { system: prompts.default, user: userPrompt };
        raw = await callOllama(params);
        usedProvider = "ollama";
      } else {
        return NextResponse.json({ ok: false, reason: "unknown_provider" });
      }
    } catch (err) {
      console.error("Provider error:", err);
      const isBusy = err instanceof Error && err.message === "COACH_BUSY";
      return NextResponse.json({
        ok: false,
        reason: isBusy ? "coach_busy" : "provider_error",
      });
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
        isRelevant: true,
        relevanceNoteFr: "",
        correctionCategory: extractString(raw, "correctionCategory") || "aucune",
      };
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
      isRelevant: parsed.isRelevant === undefined ? true : Boolean(parsed.isRelevant),
      relevanceNoteFr: parsed.relevanceNoteFr || "",
      correctionCategory: parsed.correctionCategory || "aucune",
      provider: usedProvider,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ ok: false, reason: "unexpected_error" }, { status: 500 });
  }
}
