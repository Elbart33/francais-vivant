import { AnalysisResult } from "@/types";
import DiffView from "./DiffView";
import CoachNote from "./CoachNote";
import { getLanguageConfig } from "@/config/languages";

export default function BeforeAfter({ result }: { result: AnalysisResult }) {
  const hasCorrections = result.correctionNotes.length > 0;
  const hasImprovements = result.improvementNotes.length > 0;
  const config = getLanguageConfig();
  const t = config.situationFlow;
  const dir = config.dir;
  const lang = config.lang;

  return (
    <div className="space-y-5 animate-fadeUp">
      <div className="px-1">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink/40 dark:text-sand/40">
          {t.startingPointLabel}
        </p>
        <p className="text-lg leading-relaxed text-ink/60 dark:text-sand/60" dir="auto">
          {result.original}
        </p>
      </div>

      <section className="rounded-2xl border border-clay/25 bg-clay/[0.04] p-5 dark:border-rose/30 dark:bg-clay/10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-clay dark:text-rose">
          {t.correctionLabel}
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
          <p dir={dir} lang={lang} className="mt-3 text-base text-ink/50 dark:text-sand/50">
            {t.noErrorMessage}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-zellige/25 bg-zellige/[0.04] p-5 dark:border-zellige/40 dark:bg-zellige/10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-zellige2 dark:text-saffron">
          {t.improvedLabel}
        </p>
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
          <p dir={dir} lang={lang} className="mt-3 text-base text-ink/50 dark:text-sand/50">
            {t.alreadyNaturalMessage}
          </p>
        )}
      </section>

      {result.matchedIdioms.length > 0 && (
        <section className="rounded-2xl border border-saffron/30 bg-saffron/10 p-5 dark:border-saffron/40 dark:bg-saffron/10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-saffronDeep dark:text-saffron">
            {t.toRememberLabel}
          </p>
          <ul className="space-y-3">
            {result.matchedIdioms.map((idiom) => (
              <li key={idiom.id}>
                <p className="font-display text-lg font-semibold text-ink dark:text-sand" dir="auto">
                  {idiom.expression}
                </p>
                <p className="text-base text-ink/70 dark:text-sand/70" dir="auto">{idiom.meaningFr}</p>
                <p className="text-base italic text-ink/50 dark:text-sand/50" dir="auto">« {idiom.example} »</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
