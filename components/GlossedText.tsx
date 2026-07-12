"use client";

import { useState } from "react";
import idiomsData from "@/data/idioms";
import lexiconData from "@/data/lexique";

interface Idiom {
  id: string;
  expression: string;
  meaningFr: string;
  meaningDarija: string;
  example?: string;
}

interface LexiconEntry {
  meaningFr?: string;
  meaningDarija?: string;
  phonetic?: string;
}

const idioms = idiomsData as Idiom[];
const lexicon = lexiconData as unknown as Record<string, LexiconEntry>;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isValidEntry(entry: LexiconEntry | undefined): entry is LexiconEntry {
  return !!entry && (!!entry.meaningFr || !!entry.meaningDarija);
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
    .filter((word) => text.toLowerCase().includes(word.toLowerCase()) && isValidEntry(lexicon[word]))
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
                dir="ltr"
                className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-1 w-64 max-w-[85vw] rounded-xl border border-ink/10 bg-white p-3 text-sm font-normal normal-case leading-snug shadow-lg dark:border-sand/10 dark:bg-ink"
              >
                {match.type === "idiom" ? (
                  <>
                    <span dir="rtl" className="block text-ink/80 dark:text-sand/80">
                      {match.idiom.meaningFr}
                    </span>
                    {match.idiom.example && (
                      <span dir="rtl" className="mt-1 block italic text-ink/50 dark:text-sand/50">
                        {match.idiom.example}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {match.entry.meaningFr && (
                      <span className="block font-medium text-ink dark:text-sand">
                        {match.entry.meaningFr}
                      </span>
                    )}
                    {match.entry.meaningDarija && (
                      <span dir="rtl" className="mt-1 block text-ink/70 dark:text-sand/70">
                        {match.entry.meaningDarija}
                      </span>
                    )}
                    {match.entry.phonetic && (
                      <span className="mt-1 block text-ink/50 dark:text-sand/50">
                        {match.entry.phonetic}
                      </span>
                    )}
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
