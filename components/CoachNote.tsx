"use client";
import { useState } from "react";
import { renderExplanation } from "@/lib/renderExplanation";
import { getLanguageConfig } from "@/config/languages";

export default function CoachNote({
  explanationFr,
  explanationDarija,
  tone = "correction",
}: {
  explanationFr: string;
  explanationDarija?: string;
  tone?: "correction" | "amelioration";
}) {
  const [showAppoint, setShowAppoint] = useState(false);
  const config = getLanguageConfig();
  const { primary, appointButtonLabel, appointButtonIcon, appointButtonDir } =
    config.coachNote;

  const primaryText = primary === "fr" ? explanationFr : explanationDarija;
  const appointText = primary === "fr" ? explanationDarija : explanationFr;
  const primaryDir = primary === "darija" ? "rtl" : undefined;
  const primaryLang = primary === "darija" ? "ar" : undefined;
  const appointDir = appointButtonDir;
  const appointLang = appointDir === "rtl" ? "ar" : undefined;

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-body ${
        tone === "correction"
          ? "border-clay/20 bg-clay/5 text-ink/90 dark:border-rose/25 dark:bg-clay/10 dark:text-sand/90"
          : "border-zellige/20 bg-zellige/5 text-ink/90 dark:border-zellige/30 dark:bg-zellige/10 dark:text-sand/90"
      }`}
    >
      {primaryText && (
        <p dir={primaryDir} lang={primaryLang} className="text-lg leading-relaxed">
          {renderExplanation(primaryText, tone)}
        </p>
      )}

      {appointText && (
        <div className={primaryText ? "mt-3" : ""}>
          {showAppoint ? (
            <p
              dir={appointDir}
              lang={appointLang}
              className="animate-fadeUp text-lg leading-relaxed text-ink dark:text-sand"
            >
              {renderExplanation(appointText, tone)}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setShowAppoint(true)}
              dir={appointDir}
              lang={appointLang}
              className={`animate-pulseSoft flex w-full items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 transition-colors ${
                appointDir === "rtl" ? "text-right" : "text-left"
              } ${
                tone === "correction"
                  ? "border-clay/40 bg-clay/10 hover:border-clay/60 hover:bg-clay/15 dark:border-rose/40 dark:bg-clay/15 dark:hover:border-rose/60 dark:hover:bg-clay/25"
                  : "border-zellige/40 bg-zellige/10 hover:border-zellige/60 hover:bg-zellige/15 dark:border-zellige/50 dark:bg-zellige/15 dark:hover:border-saffron/50 dark:hover:bg-zellige/25"
              }`}
            >
              <span className="text-base font-semibold text-ink dark:text-sand">
                {appointButtonLabel}
              </span>
              <span className="text-xl">{appointButtonIcon}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
