import situationsData from "@/data/situations.json";
import { Situation } from "@/types";
import SituationCard from "@/components/SituationCard";

const situations = situationsData as Situation[];

function situationOfTheDay(): Situation {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return situations[dayOfYear % situations.length];
}

export default function HomePage() {
  const today = situationOfTheDay();
  const rest = situations.filter((s) => s.id !== today.id);

  return (
    <div className="space-y-10">
      <section className="animate-fadeUp pt-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-zellige">
          Aujourd'hui
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          Un français qui vous ressemble,
          <br />
          une situation à la fois.
        </h1>
        <p className="mt-3 max-w-lg text-ink/60">
          Pratiquez à partir de vraies situations de vie. Pas de règles à apprendre,
          pas de niveaux à afficher — juste des conversations, corrigées et enrichies
          en douceur.
        </p>
      </section>

      <section>
        <SituationCard situation={today} featured />
      </section>

      <section>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink/40">
          Autres situations
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {rest.map((s) => (
            <SituationCard key={s.id} situation={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
