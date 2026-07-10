"use client";

import { useState } from "react";
import idiomsData from "@/data/idioms";
import lexiconData from "@/data/lexique.fr.json";

interface Idiom {
  id: string;
  expression: string;
  meaningFr: string;
  meaningDarija: string;
  example?: string;
}

interface LexiconEntry {
  meaningDarija: string;
  phonetic: string;
}

const idioms = idiomsData as Idiom[];
const lexicon = lexiconData as unknown as Record<string, LexiconEntry>;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function GlossedText({
  text,
  idiomIds = [],
  dir,
  lang,
  className = "",
}: {
  text: string;
  idiomIds?: string[];
  dir?: string;
  lang?: string;
  className?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const relevantIdioms = idioms
    .filter((idiom) => idiomIds.includes(idiom.id))
    .map((idiom) => ({ type: "idiom" as const, key: idiom.id, expression: idiom.expression, idiom }));

  const lexiconWords = Object.keys(lexicon)
    .filter((word) => text.toLowerCase().includes(word) && lexicon[word]?.meaningDarija && lexicon[word]?.phonetic)
    .map((word) => ({ type: "lexicon" as const, key: word, expression: word, entry: lexicon[word] }));

  const glossary = [...relevantIdioms, ...lexiconWords].sort(
    (a, b) => b.expression.length - a.expression.length
  );

  if (glossary.length === 0) {
    return (
      <p dir={dir} lang={lang} className={className}>
        {text}
      </p>
    );
  }

  const pattern = new RegExp(
    `(${glossary.map((g) => escapeRegExp(g.expression)).join("|")})`,
    "gi"
  );

  const parts = text.split(pattern);

  return (
    <p dir={dir} lang={lang} className={`${className} relative`}>
      {parts.map((part, index) => {
        const match = glossary.find(
          (g) => g.expression.toLowerCase() === part.toLowerCase()
        );

        if (!match) {
          return <span key={index}>{part}</span>;
        }

        const isOpen = openKey === match.key + index;
        const underlineStyle =
          match.type === "idiom"
            ? "decoration-saffronDeep/60 dark:decoration-saffron/60"
            : "decoration-ink/30 dark:decoration-sand/30";

        return (
          <span key={index} className="relative inline-block">
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : match.key + index)}
              className={`underline decoration-dotted underline-offset-4 ${underlineStyle}`}
            >
              {part}
            </button>
            {isOpen && (
              <span
                role="tooltip"
                className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-ink/10 bg-white p-3 text-sm font-normal normal-case leading-snug shadow-lg dark:border-sand/10 
dark:bg-ink"
              >
                {match.type === "idiom" ? (
                  <>
                    <span className="block text-ink/80 dark:text-sand/80">
                      {match.idiom.meaningFr}
                    </span>
                    {match.idiom.example && (
                      <span className="mt-1 block italic text-ink/50 dark:text-sand/50">
                        {match.idiom.example}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="block text-ink/80 dark:text-sand/80">
                      {match.entry.meaningDarija}
                    </span>
                    <span className="mt-1 block text-ink/50 dark:text-sand/50">
                      {match.entry.phonetic}
                    </span>
                  </>
                )}
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
}
