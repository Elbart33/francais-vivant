"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import situationsData from "@/data/situations.json";
import { Situation } from "@/types";
import Icon from "@/components/Icon";
import BeforeAfter from "@/components/BeforeAfter";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useUserMemory } from "@/hooks/useUserMemory";

const situations = situationsData as Situation[];

type Step = "context" | "comprehension" | "input" | "result";

export default function SituationFlowClient({ id }: { id: string }) {
  const router = useRouter();
  const situation = useMemo(() => situations.find((s) => s.id === id), [id]);

  const [step, setStep] = useState<Step>("context");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userSentence, setUserSentence] = useState("");
  const [saved, setSaved] = useState(false);

  const { result, loading, analyze } = useAnalysis();
  const { saveAttempt } = useUserMemory();

  if (!situation) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white/60 p-6 text-center">
        <p className="text-ink/70">Cette situation n'existe pas (ou plus).</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded-full bg-zellige px-5 py-2 text-sm font-semibold text-sand"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    setShowAnswer(true);
  };

  const handleAnalyze = async () => {
    if (!userSentence.trim()) return;
    await analyze(userSentence.trim(), situation.title, situation.idiomIds);
    setStep("result");
  };

  const handleSave = () => {
    if (!result) return;
    saveAttempt({
      situationId: situation.id,
      timestamp: Date.now(),
      original: result.original,
      corrected: result.corrected,
      improved: result.improved,
      correctionNotes: result.correctionNotes,
      improvementNotes: result.improvementNotes,
    });
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <StepIndicator step={step} />

      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-saffron/15 text-saffronDeep">
          <Icon name={situation.icon} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {situation.title}
        </h1>
      </div>

      {step === "context" && (
        <div className="animate-fadeUp space-y-5 rounded-2xl border border-ink/10 bg-white/60 p-6">
          <p className="text-ink/80 leading-relaxed">{situation.context}</p>
          <button
            onClick={() => setStep("comprehension")}
            className="rounded-full bg-zellige px-5 py-2.5 text-sm font-semibold text-sand transition-transform hover:scale-[1.02]"
          >
            Continuer
          </button>
        </div>
      )}

      {step === "comprehension" && (
        <div className="animate-fadeUp space-y-5 rounded-2xl border border-ink/10 bg-white/60 p-6">
          <p className="rounded-xl bg-mist p-4 italic text-ink/80">
            {situation.comprehension.prompt}
          </p>
          <p className="font-medium text-ink">{situation.comprehension.question}</p>
          <div className="space-y-2">
            {situation.comprehension.options.map((opt, i) => {
              const isCorrect = i === situation.comprehension.answerIndex;
              const isSelected = i === selectedOption;
              return (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(i)}
                  disabled={showAnswer}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    showAnswer && isCorrect
                      ? "border-zellige bg-zellige/10 text-zellige2 font-semibold"
                      : showAnswer && isSelected && !isCorrect
                      ? "border-clay bg-clay/10 text-clay font-semibold"
                      : "border-ink/10 bg-white hover:border-zellige/30"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {showAnswer && (
            <button
              onClick={() => setStep("input")}
              className="rounded-full bg-zellige px-5 py-2.5 text-sm font-semibold text-sand transition-transform hover:scale-[1.02]"
            >
              Continuer
            </button>
          )}
        </div>
      )}

      {step === "input" && (
        <div className="animate-fadeUp space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-6">
          <p className="font-medium text-ink">{situation.task}</p>
          <p className="text-sm text-ink/50">{situation.starterHint}</p>
          <textarea
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            rows={4}
            placeholder="Écrivez votre réponse ici, comme vous la diriez à l'oral..."
            className="w-full rounded-xl border border-ink/15 bg-white p-4 text-ink placeholder:text-ink/30 focus:border-zellige"
          />
          <button
            onClick={handleAnalyze}
            disabled={!userSentence.trim() || loading}
            className="rounded-full bg-zellige px-5 py-2.5 text-sm font-semibold text-sand transition-transform hover:scale-[1.02] disabled:opacity-40"
          >
            {loading ? "Analyse en cours..." : "Voir ma correction"}
          </button>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-6">
          <BeforeAfter result={result} />
          <div className="flex flex-wrap gap-3">
            {!saved ? (
              <button
                onClick={handleSave}
                className="rounded-full bg-zellige px-5 py-2.5 text-sm font-semibold text-sand"
              >
                Enregistrer ma progression
              </button>
            ) : (
              <span className="rounded-full bg-zellige/10 px-5 py-2.5 text-sm font-semibold text-zellige2">
                Progression enregistrée
              </span>
            )}
            <button
              onClick={() => router.push("/")}
              className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink/70 hover:bg-white"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ["context", "comprehension", "input", "result"];
  const currentIndex = steps.indexOf(step);
  return (
    <div className="flex gap-1.5">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= currentIndex ? "bg-zellige" : "bg-ink/10"
          }`}
        />
      ))}
    </div>
  );
}
