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

        const colorStyle =
          match.type === "idiom"
            ? "decoration-saffronDeep/50 dark:decoration-saffron/50 group-hover:decoration-saffronDeep dark:group-hover:decoration-saffron"
            : "decoration-zellige/45 dark:decoration-sand/35 group-hover:decoration-zellige dark:group-hover:decoration-sand/80";

        const glowStyle =
          match.type === "idiom"
            ? "from-saffron/0 via-saffron/[0.14] to-saffron/0 group-hover:from-saffron/[0.08] group-hover:via-saffron/[0.16] group-hover:to-saffron/[0.08]"
            : "from-zellige/0 via-zellige/[0.10] to-zellige/0 dark:via-sand/[0.10] group-hover:from-zellige/[0.05] group-hover:via-zellige/[0.12] group-hover:to-zellige/[0.05] dark:group-hover:via-sand/[0.12]";

        const dotColor =
          match.type === "idiom"
            ? "bg-saffronDeep dark:bg-saffron"
            : "bg-zellige dark:bg-sand";

        return (
          <span key={index} className="group relative inline-block">
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : match.key + index)}
              aria-expanded={isOpen}
              className={`
                relative -mx-0.5 cursor-help rounded-md px-0.5 py-0.5
                underline decoration-dotted decoration-[1.5px] underline-offset-[5px]
                transition-all duration-300 ease-out
                bg-gradient-to-b bg-[length:100%_100%]
                ${colorStyle} ${glowStyle}
                group-hover:-translate-y-[1px]
                ${isOpen ? "-translate-y-[1px] bg-zellige/[0.08] dark:bg-sand/[0.1]" : ""}
              `}
            >
              {part}
            </button>

            <span
              aria-hidden="true"
              className={`
                pointer-events-none absolute -bottom-[3px] start-1/2 h-1 w-1 -translate-x-1/2 rounded-full
                transition-all duration-300 ease-out
                ${dotColor}
                ${isOpen ? "scale-100 opacity-70" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-50"}
              `}
            />

            {isOpen && (
              <span
                role="tooltip"
                className="
                  absolute start-0 top-full z-20 mt-2 w-64 origin-top-left
                  rounded-xl border border-ink/10 bg-white p-3
                  text-sm font-normal normal-case leading-snug text-start
                  shadow-xl shadow-ink/10
                  animate-tooltipPop
                  dark:border-sand/10 dark:bg-ink dark:shadow-black/30
                "
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-1 start-4 h-2 w-2 rotate-45 border-s border-t border-ink/10 bg-white dark:border-sand/10 dark:bg-ink"
                />
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
