import { AnalysisResult } from "@/types";
import DiffView from "./DiffView";
import CoachNote from "./CoachNote";

export default function BeforeAfter({ result }: { result: AnalysisResult }) {
  const hasCorrections = result.correctionNotes.length > 0;
  const hasImprovements = result.improvementNotes.length > 0;

  return (
    <div className="space-y-5 animate-fadeUp">
      <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 dark:border-sand/10 dark:bg-ink/40">
        <p className="mb-2 text-eyebrow font-semibold uppercase text-ink/40 dark:text-sand/40">
          Ce que vous avez écrit
        </p>
        <p className="text-body-lg leading-relaxed text-ink/70 dark:text-sand/70">{result.original}</p>
      </section>

      <section className="rounded-2xl border border-clay/25 bg-clay/[0.04] p-5 dark:border-rose/30 dark:bg-clay/10">
        <p className="mb-2 text-eyebrow font-semibold uppercase text-clay dark:text-rose">
          Correction
        </p>
        <DiffView segments={result.correctionDiff} />
        {hasCorrections ? (
          <div className="mt-4 space-y-2">
            {result.correctionNotes.map((note) => (
              <CoachNote
                key={note.ruleId}
                explanationFr={note.explanationFr}
                explanationDarija={note.explanationDarija}
                tone="correction"
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-body text-ink/50 dark:text-sand/50">
            Aucune erreur détectée — votre phrase était déjà correcte.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-zellige/25 bg-zellige/[0.04] p-5 dark:border-zellige/40 dark:bg-zellige/10">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-eyebrow font-semibold uppercase text-zellige2 dark:text-saffron">
            Version naturelle
          </p>
          {result.usedAI && (
            <span className="rounded-full bg-zellige/10 px-2.5 py-0.5 text-[11px] font-semibold text-zellige2 dark:bg-zellige/20 dark:text-saffron">
              enrichie par IA
            </span>
          )}
        </div>
        <DiffView segments={result.improvementDiff} />
        {hasImprovements ? (
          <div className="mt-4 space-y-2">
            {result.improvementNotes.map((note) => (
              <CoachNote
                key={note.ruleId}
                explanationFr={note.explanationFr}
                explanationDarija={note.explanationDarija}
                tone="amelioration"
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-body text-ink/50 dark:text-sand/50">
            Votre formulation était déjà naturelle.
          </p>
        )}
      </section>

      {result.matchedIdioms.length > 0 && (
        <section className="rounded-2xl border border-saffron/30 bg-saffron/10 p-5 dark:border-saffron/40 dark:bg-saffron/10">
          <p className="mb-3 text-eyebrow font-semibold uppercase text-saffronDeep dark:text-saffron">
            À retenir de cette situation
          </p>
          <ul className="space-y-3">
            {result.matchedIdioms.map((idiom) => (
              <li key={idiom.id}>
                <p className="font-display text-h3 font-semibold text-ink dark:text-sand">
                  {idiom.expression}
                </p>
                <p className="text-body text-ink/70 dark:text-sand/70">{idiom.meaningFr}</p>
                <p className="text-body italic text-ink/50 dark:text-sand/50">« {idiom.example} »</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
