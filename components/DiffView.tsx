import { DiffSegment } from "@/types";

const styles: Record<DiffSegment["kind"], string> = {
  same: "",
  corrected: "bg-clay/15 text-clay font-semibold rounded px-1 py-0.5 underline decoration-clay/40 decoration-2 underline-offset-2",
  improved: "bg-zellige/12 text-zellige2 font-semibold rounded px-1 py-0.5",
};

export default function DiffView({ segments }: { segments: DiffSegment[] }) {
  return (
    <p className="text-lg leading-relaxed text-ink">
      {segments.map((seg, i) => (
        <span key={i} className={styles[seg.kind]} title={seg.note ? `avant : ${seg.note}` : undefined}>
          {seg.text}
          {i < segments.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
