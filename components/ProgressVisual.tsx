import situationsData from "@/data/situations.json";
import { Situation } from "@/types";

const situations = situationsData as Situation[];

export default function ProgressVisual({
  situationsCompleted,
  streakDays,
}: {
  situationsCompleted: string[];
  streakDays: number;
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40 dark:text-sand/40">
          Les chemins que vous avez explorés
        </p>
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-5">
          {situations.map((s) => {
            const done = situationsCompleted.includes(s.id);
            return (
              <div
                key={s.id}
                className={`aspect-square rounded-xl border transition-all ${
                  done
                    ? "border-zellige bg-zellige text-sand shadow-md shadow-zellige/25"
                    : "border-ink/10 bg-white/40 text-ink/20 dark:border-sand/10 dark:bg-ink/40 dark:text-sand/20"
                } grid place-items-center`}
                title={s.title}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-ink/50 dark:text-sand/50">
          {situationsCompleted.length === 0
            ? "Aucun chemin exploré pour l'instant — commencez par une situation."
            : situationsCompleted.length === situations.length
            ? "Vous avez exploré toutes les situations disponibles."
            : "Chaque tuile allumée est une situation de vie où vous avez pratiqué."}
        </p>
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40 dark:text-sand/40">
          Votre régularité
        </p>
        <div className="flex items-end gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const lit = i < Math.min(streakDays, 7);
            return (
              <div
                key={i}
                className={`w-6 rounded-t-full transition-all ${
                  lit ? "bg-saffron" : "bg-ink/10 dark:bg-sand/10"
                }`}
                style={{ height: lit ? `${28 + i * 6}px` : "14px" }}
              />
            );
          })}
        </div>
        <p className="mt-3 text-sm text-ink/50 dark:text-sand/50">
          {streakDays <= 1
            ? "Revenez demain pour construire votre régularité."
            : `Vous pratiquez régulièrement depuis ${streakDays} jours consécutifs.`}
        </p>
      </div>
    </div>
  );
}
