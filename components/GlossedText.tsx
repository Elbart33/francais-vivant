"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
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

function TooltipPortal({
  anchorRef,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const bubble = bubbleRef.current;
    if (!anchor || !bubble) return;

    const anchorRect = anchor.getBoundingClientRect();
    const bubbleWidth = bubble.offsetWidth;
    const bubbleHeight = bubble.offsetHeight;
    const padding = 8;

    let left = anchorRect.left + anchorRect.width / 2 - bubbleWidth / 2;
    const maxLeft = window.innerWidth - bubbleWidth - padding;
    left = Math.max(padding, Math.min(left, maxLeft));

    let top = anchorRect.bottom + 4;
    const maxTop = window.innerHeight - bubbleHeight - padding;
    if (top > maxTop) {
      top = anchorRect.top - bubbleHeight - 4;
    }

    setStyle({ position: "fixed", left, top, opacity: 1 });
  }, [anchorRef, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={bubbleRef}
      role="tooltip"
      dir="ltr"
      style={style}
      className="z-50 w-64 max-w-[85vw] rounded-xl border border-ink/10 bg-white p-3 text-lg sm:text-base font-normal normal-case leading-snug shadow-lg transition-opacity dark:border-sand/20 dark:bg-[#1E3A34] dark:text-sand"
    >
      {children}
    </div>,
    document.body
  );
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
  const anchorRef = useRef<HTMLButtonElement>(null);

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

        const thisKey = match.key + index;
        const isOpen = openKey === thisKey;
        const underlineStyle =
          match.type === "idiom"
            ? "decoration-saffronDeep/60 dark:decoration-saffron/60"
            : "decoration-ink/30 dark:decoration-sand/30";

        return (
          <span key={index} className="relative inline-block">
            <button
              ref={isOpen ? anchorRef : undefined}
              type="button"
              onClick={() => setOpenKey(isOpen ? null : thisKey)}
              className={`underline decoration-dotted underline-offset-4 ${underlineStyle}`}
            >
              {part}
            </button>
            {isOpen && (
              <TooltipPortal anchorRef={anchorRef}>
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
              </TooltipPortal>
            )}
          </span>
        );
      })}
    </p>
  );
}
