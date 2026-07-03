import { AnalysisResult } from "@/types";
import DiffView from "./DiffView";
import CoachNote from "./CoachNote";

export default function BeforeAfter({ result }: { result: AnalysisResult }) {
  const hasCorrections = result.correctionNotes.length > 0;
  const hasImprovements = result.improvementNotes.length > 0;

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Ce que vous avez écrit */}
      <section className="rounded-2xl border border-ink/10 bg-white/50 p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
          Ce que vous avez écrit
        </p>
        <p className="text-lg leading-relaxed text-ink/70">{result.original}</p>
      </section>

      {/* Correction */}
      <section className="rounded-2xl border border-clay/25 bg-clay/[0.04] p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-clay">
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
          <p className="mt-3 text-sm text-ink/50">
            Aucune erreur détectée — votre phrase était déjà correcte.
          </p>
        )}
      </section>

      {/* Version naturelle améliorée */}
      <section className="rounded-2xl border border-zellige/25 bg-zellige/[0.04] p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-zellige2">
            Version naturelle
          </p>
          {result.usedAI && (
            <span className="rounded-full bg-zellige/10 px-2.5 py-0.5 text-[11px] font-semibold text-zellige2">
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
          <p className="mt-3 text-sm text-ink/50">
            Votre formulation était déjà naturelle.
          </p>
        )}
      </section>

      {result.matchedIdioms.length > 0 && (
        <section className="rounded-2xl border border-saffron/30 bg-saffron/10 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-saffronDeep">
            À retenir de cette situation
          </p>
          <ul className="space-y-3">
            {result.matchedIdioms.map((idiom) => (
              <li key={idiom.id}>
                <p className="font-display text-base font-semibold text-ink">
                  {idiom.expression}
                </p>
                <p className="text-sm text-ink/70">{idiom.meaningFr}</p>
                <p className="text-sm italic text-ink/50">« {idiom.example} »</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
