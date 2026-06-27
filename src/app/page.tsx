import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { HazardRibbon } from "@/components/HazardRibbon";
import { IslandChips } from "@/components/IslandChips";
import { DomainChips } from "@/components/DomainChips";
import { PulseCard } from "@/components/PulseCard";
import {
  getActiveWeatherAlerts,
  getAdvisories,
  getOverviewPulses,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [pulses, alerts, advisories] = await Promise.all([
    getOverviewPulses(),
    getActiveWeatherAlerts(),
    getAdvisories(),
  ]);

  const asOf = pulses[0]?.generatedAt;

  return (
    <>
      <SiteHeader
        kicker="French Polynesia Intelligence"
        title="What's moving across the fenua"
        summary="A friendly place to catch up on what’s happening across our islands. The stories people are talking about, the changes worth knowing, and the little things that help you feel connected to life in French Polynesia."
        asOf={asOf}
      />
      <main className="mx-auto w-full max-w-6xl px-5 pb-14">
        <div className="py-6">
          <HazardRibbon alerts={alerts} advisories={advisories} />
        </div>

        <section className="border-t border-border py-6">
          <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-faint">
            Islands
          </p>
          <IslandChips />
        </section>

        <section className="border-t border-border py-6">
          <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-faint">
            Domains
          </p>
          <DomainChips />
        </section>

        <section className="border-t border-border py-8">
          <h2 className="mb-5 font-serif text-2xl font-medium tracking-tight text-fg">
            Latest from the islands
          </h2>
          {pulses.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pulses.map((card) => (
                <PulseCard key={card.id} card={card} showIsland />
              ))}
            </div>
          ) : (
            <p className="text-muted">
              No analysis yet. Run the ingestion + analysis pipeline (or{" "}
              <code className="text-primary">npm run db:seed</code>) to populate pulses.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
