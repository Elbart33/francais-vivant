"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import situationsData from "@/data/situations";
import { Situation } from "@/types";
import Icon from "@/components/Icon";
import BeforeAfter from "@/components/BeforeAfter";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useUserMemory } from "@/hooks/useUserMemory";
import { pickWeightedSituation } from "@/lib/storage/userMemory";
import { getLanguageConfig } from "@/config/languages";
import GlossedText from "@/components/GlossedText";

const situations = situationsData as Situation[];

type Step = "context" | "comprehension" | "input" | "result";

function shuffleOptions(options: string[], answerIndex: number) {
  const indices = options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffledOptions = indices.map((i) => options[i]);
  const newAnswerIndex = indices.indexOf(answerIndex);
  return { shuffledOptions, newAnswerIndex };
}

export default function SituationFlowClient({ id }: { id: string }) {
  const router = useRouter();
  const situation = useMemo(() => situations.find((s) => s.id === id), [id]);
  const config = getLanguageConfig();
  const t = config.situationFlow;
  const dir = config.dir;
  const lang = config.lang;
  const isRtl = dir === "rtl";

  const [step, setStep] = useState<Step>("context");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userSentence, setUserSentence] = useState("");
  const [autoSaved, setAutoSaved] = useState(false);

  const { result, loading, analyze } = useAnalysis();
  const { memory, saveAttempt } = useUserMemory();

  const shuffled = useMemo(() => {
    if (!situation) return null;
    return shuffleOptions(
      situation.comprehension.options,
      situation.comprehension.answerIndex
    );
  }, [situation]);

  useEffect(() => {
    if (!result || autoSaved || !situation) return;
    saveAttempt({
      situationId: situation.id,
      timestamp: Date.now(),
      original: result.original,
      corrected: result.corrected,
      improved: result.improved,
      correctionNotes: result.correctionNotes,
      improvementNotes: result.improvementNotes,
    });
    setAutoSaved(true);
  }, [result, autoSaved, situation, saveAttempt]);

  if (!situation || !shuffled) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white/60 p-6 text-center dark:border-sand/10 dark:bg-ink/40">
        <p className="text-lg sm:text-base text-ink/70 dark:text-sand/70" dir={dir} lang={lang}>
          {t.notFound}
        </p>
        <button
          onClick={() => router.push("/")}
          dir={dir}
          lang={lang}
          className="mt-4 rounded-full bg-zellige px-5 py-2 text-base sm:text-sm font-semibold text-sand"
        >
          {t.backHome}
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
    await analyze(userSentence.trim(), situation.title, situation.idiomIds, situation.task);
    setStep("result");
  };

  const handleAnotherSituation = () => {
    const next = memory
      ? pickWeightedSituation(memory, situations, situation.id)
      : situations[Math.floor(Math.random() * situations.length)];
    router.push(`/situation/${next.id}`);
  };

  return (
    <div className="space-y-6">
      <StepIndicator step={step} />

      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-saffron/15 text-saffronDeep dark:bg-saffron/10 dark:text-saffron">
          <Icon name={situation.icon} />
        </span>
        <h1 dir={dir} lang={lang} className="font-display text-2xl font-semibold text-ink dark:text-sand">
          {situation.title}
        </h1>
      </div>

      {step === "context" && (
        <div className="animate-fadeUp space-y-5 rounded-2xl border border-ink/10 bg-white/60 p-6 dark:border-sand/10 dark:bg-ink/40">
          <GlossedText
            text={situation.context}
            idiomIds={situation.idiomIds}
            dir={dir}
            lang={lang}
            className="text-lg sm:text-base leading-relaxed text-ink/80 dark:text-sand/80"
          />
          <button
            onClick={() => setStep("comprehension")}
            dir={dir}
            lang={lang}
            className="rounded-full bg-zellige px-5 py-2.5 text-base sm:text-sm font-semibold text-sand transition-transform hover:scale-[1.02]"
          >
            {t.continueBtn}
          </button>
        </div>
      )}

      {step === "comprehension" && (
        <div className="animate-fadeUp space-y-5 rounded-2xl border border-ink/10 bg-white/60 p-6 dark:border-sand/10 dark:bg-ink/40">
          <p
            dir={dir}
            lang={lang}
            className="rounded-xl bg-mist p-4 text-lg sm:text-base italic text-ink/80 dark:bg-ink/60 dark:text-sand/80"
          >
            {situation.comprehension.prompt}
          </p>
          <p dir={dir} lang={lang} className="text-lg sm:text-base font-medium text-ink dark:text-sand">
            {situation.comprehension.question}
          </p>
          <div className="space-y-2">
            {shuffled.shuffledOptions.map((opt, i) => {
              const isCorrect = i === shuffled.newAnswerIndex;
              const isSelected = i === selectedOption;
              return (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(i)}
                  disabled={showAnswer}
                  dir={dir}
                  lang={lang}
                  className={`w-full rounded-xl border px-4 py-3 text-base sm:text-sm transition-colors ${
                    isRtl ? "text-right" : "text-left"
                  } ${
                    showAnswer && isCorrect
                      ? "animate-correctPulse border-zellige bg-zellige/10 text-zellige2 font-semibold dark:border-zellige dark:bg-zellige/20 dark:text-sand"
                      : showAnswer && isSelected && !isCorrect
                      ? "border-clay bg-clay/10 text-clay font-semibold dark:border-clay dark:bg-clay/20 dark:text-rose"
                      : "border-ink/10 bg-white text-ink hover:border-zellige/30 dark:border-sand/10 dark:bg-ink/60 dark:text-sand dark:hover:border-saffron/30"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {showAnswer && (
            <div className="mt-4 rounded-xl bg-mist/50 p-3 dark:bg-ink/30">
              {selectedOption === shuffled.newAnswerIndex ? (
                <p dir={dir} lang={lang} className="text-base sm:text-sm font-medium text-zellige2 dark:text-saffron">
                  {t.correctFeedbackPrefix} « {situation.comprehension.options[situation.comprehension.answerIndex]} »
                </p>
              ) : (
                <p dir={dir} lang={lang} className="text-base sm:text-sm font-medium text-clay dark:text-rose">
                  {t.incorrectFeedbackPrefix} « {situation.comprehension.options[situation.comprehension.answerIndex]} »
                </p>
              )}
              <button
                onClick={() => setStep("input")}
                dir={dir}
                lang={lang}
                className="mt-3 rounded-full bg-zellige px-5 py-2.5 text-base sm:text-sm font-semibold text-sand transition-transform hover:scale-[1.02]"
              >
                {t.continueBtn}
              </button>
            </div>
          )}
        </div>
      )}

      {step === "input" && (
        <div className="animate-fadeUp space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-6 dark:border-sand/10 dark:bg-ink/40">
          <GlossedText
            text={situation.task}
            idiomIds={situation.idiomIds}
            dir={dir}
            lang={lang}
            className="text-lg sm:text-base font-medium text-ink dark:text-sand"
          />
          <p dir={dir} lang={lang} className="text-base sm:text-sm text-ink/50 dark:text-sand/50">
            {situation.starterHint}
          </p>
          <textarea
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            rows={4}
            placeholder={t.inputPlaceholder}
            dir={dir}
            lang={lang}
            style={{ colorScheme: "light" }}
            className="w-full rounded-xl border border-ink/15 bg-white p-4 text-lg sm:text-base text-ink placeholder:text-ink/30 transition-colors duration-200 focus:border-zellige dark:border-sand/15 dark:bg-ink/60 dark:text-sand dark:placeholder:text-sand/30 dark:focus:border-saffron"
          />
          <button
            onClick={handleAnalyze}
            disabled={!userSentence.trim() || loading}
            dir={dir}
            lang={lang}
            className="rounded-full bg-zellige px-5 py-2.5 text-base sm:text-sm font-semibold text-sand transition-transform hover:scale-[1.02] disabled:opacity-40"
          >
            {loading ? t.analyzeButtonLoading : t.analyzeButtonIdle}
          </button>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-6">
          <BeforeAfter result={result} />
          <div className="flex flex-wrap items-center gap-3">
            <span dir={dir} lang={lang} className="text-xs text-ink/40 dark:text-sand/40">
              {autoSaved ? t.savedText : t.savingText}
            </span>
            <button
              onClick={handleAnotherSituation}
              dir={dir}
              lang={lang}
              className="rounded-full bg-saffron px-5 py-2.5 text-base sm:text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              {t.anotherSituationBtn}
            </button>
            <button
              onClick={() => router.push("/")}
              dir={dir}
              lang={lang}
              className="rounded-full border border-ink/15 px-5 py-2.5 text-base sm:text-sm font-semibold text-ink/70 hover:bg-white dark:border-sand/15 dark:text-sand/70 dark:hover:bg-ink/60"
            >
              {t.backHome}
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
          className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ease-out ${
            i <= currentIndex ? "bg-zellige" : "bg-ink/10 dark:bg-sand/10"
          }`}
        />
      ))}
    </div>
  );
}
