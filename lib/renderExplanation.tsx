import Keyword from "@/components/Keyword";

function renderLine(line: string, tone: "correction" | "amelioration", lineKey: string): React.ReactNode[] {
  const parts = line.split(/(\*\*[^*]+\*\*|«[^»]+»)/g).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Keyword key={`${lineKey}-${i}`} tone={tone}>
          {part.slice(2, -2)}
        </Keyword>
      );
    }
    if (part.startsWith("«") && part.endsWith("»")) {
      return (
        <bdi key={`${lineKey}-${i}`} className="font-medium">
          {part}
        </bdi>
      );
    }
    return <span key={`${lineKey}-${i}`}>{part}</span>;
  });
}

export function renderExplanation(
  text: string,
  tone: "correction" | "amelioration"
): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split(/\n+/).filter((l) => l.trim().length > 0);

  if (lines.length <= 1) {
    return renderLine(text, tone, "l0");
  }

  return lines.map((line, i) => (
    <span key={`line-${i}`} className="block">
      {renderLine(line.trim(), tone, `l${i}`)}
    </span>
  ));
}
