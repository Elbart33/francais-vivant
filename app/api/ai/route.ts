import { NextRequest, NextResponse } from "next/server";
import { callMistral } from "@/lib/engine/providers/mistral";
import { callGroq } from "@/lib/engine/providers/groq";
import { callOllama } from "@/lib/engine/providers/ollama";

export const runtime = "edge";

// ═══════════════════════════════════════════════════════════════
//  SYSTEM PROMPT MIS À JOUR — Version en arabe pour forcer
//  la réponse en darija (caractères arabes) et éviter l'Arabizi.
// ═══════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `أنت مدرب لغة فرنسية لمتعلم مغربي مستوى A2+/B1.

مهمتك: تحليل جملة واحدة كتبها المتعلم، وتقديم تصحيح وتحسين مع شرح بالدارجة المغربية.

خطوتان بالترتيب:

1) التصحيح — صحح الأخطاء الحقيقية فقط (القواعد، الصرف، التذكير والتأنيث، الأخطاء الصوتية الشائعة عند المغاربة مثل ب/پ، الكلمات المستعارة من الدارجة أو العربية إلى الفرنسية).
   لا تغير أي شيء آخر. إذا كانت الجملة صحيحة، "corrected" تكون مطابقة للجملة الأصلية.

2) التحسين — من النسخة المصححة، قدم صياغة أكثر طبيعية، أكثر دقة، في المستوى العادي المهذب، دون تغيير المعنى.
   إذا كانت الجملة المصححة طبيعية بالفعل، "improved" تكون مطابقة لـ "corrected".

لكل خطوة غيرت فيها الجملة، قدم شرحًا قصيرًا جدًا:
- شرح بالفرنسية (جملة واحدة، بسيطة، بدون مصطلحات تقنية)
- شرح بالدارجة المغربية (جملة واحدة، بالحروف العربية، مفهومة وودودة)

إذا لم تغير شيئًا في خطوة ما، اترك الشرح فارغًا ("").

أجب بدقة بصيغة JSON صالحة، بدون نص أو markdown حولها، وبهذا الشكل تمامًا:
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
      return NextResponse.json({
        ok: false,
        reason: "ai_disabled",
        debug: {
          rawProviderValue: process.env.AI_PROVIDER ?? null,
          hasMistralKey: Boolean(process.env.MISTRAL_API_KEY),
          hasGroqKey: Boolean(process.env.GROQ_API_KEY),
        },
      });
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
