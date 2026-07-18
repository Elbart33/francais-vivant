import { CorrectionCategory } from "@/types";

const TIPS_DARIJA: Record<Exclude<CorrectionCategory, "aucune">, string> = {
  genre: "كتخلط بزاف بين المذكر و المؤنث دابا. حاول تحفظ الكلمة مع 'le' ولا 'la' قدامها، بحال جوج صحاب، ماشي غير القاعدة وحدها.",
  nombre: "التوافق فالجمع كايرجع بزاف. حيلة ساهلة: منين كتفكر 'بزاف ديال', فكر مباشرة فـ 's' فالآخر.",
  conjugaison: "التصريف كايرجع بزاف. ماشي مشكل — هادشي طبيعي، خاصو التكرار. حاول تقول الجملة بصوت عالي، غادي يعاونك تحفظ الصوت الصحيح.",
  phonologie: "شي أصوات قريبين لبعضهم (بحال b/p) كايرجعو بزاف. هادشي عادي بزاف، الودن كتعتاد مع الوقت و التمرين.",
  orthographe: "الإملاء ديال شي كلمات كايرجع بزاف. ماشي خاصك تحفظ كولشي مرة وحدة — حفظ غير كلمة وحدة فمرة، هادي اللي كترجع بزاف.",
  lexique: "شي كلمات ولا تعابير كايرجعو بزاف. هادشي عارف بلي هوما مفيدين فحياتك ديال كل يوم — يستاهلو تحفظهم مزيان.",
};

export default function ReinforcementTip({ category }: { category: CorrectionCategory }) {
  if (category === "aucune") return null;

  const tip = TIPS_DARIJA[category];
  if (!tip) return null;

  return (
    <div className="mt-3 rounded-xl border border-saffron/30 bg-saffron/10 p-4 dark:border-saffron/30 dark:bg-saffron/10">
      <p dir="rtl" lang="ar" className="text-lg sm:text-base leading-relaxed text-ink/80 dark:text-sand/80">
        {tip}
      </p>
    </div>
  );
}
