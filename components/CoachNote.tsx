"use client";

import { useState } from "react";

export default function CoachNote({
  explanationFr,
  explanationDarija,
  tone = "correction",
}: {
  explanationFr: string;
  explanationDarija?: string;
  tone?: "correction" | "amelioration";
}) {
  const [showDarija, setShowDarija] = useState(false);

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        tone === "correction"
          ? "border-clay/20 bg-clay/5 text-ink/90"
          : "border-zellige/20 bg-zellige/5 text-ink/90"
      }`}
    >
      <p>{explanationFr}</p>
      {explanationDarija && (
        <div className="mt-1.5">
          {showDarija ? (
            <p className="text-ink/60 italic">{explanationDarija}</p>
          ) : (
            <button
              type="button"
              onClick={() => setShowDarija(true)}
              className="text-xs font-semibold text-ink/50 underline decoration-dotted underline-offset-2 hover:text-ink/80"
            >
              Voir en darija
            </button>
          )}
        </div>
      )}
    </div>
  );
}
