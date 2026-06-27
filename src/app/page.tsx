import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { HazardRibbon } from "@/components/HazardRibbon";
import { IslandChips } from "@/components/IslandChips";
import { SectionTabs } from "@/components/SectionTabs";
import {
  getActiveWeatherAlerts,
  getAdvisories,
  getOverviewPulses,
  getUpcomingCruiseCalls,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [pulses, alerts, advisories, cruiseCalls] = await Promise.all([
    getOverviewPulses(),
    getActiveWeatherAlerts(),
    getAdvisories(),
    getUpcomingCruiseCalls(),
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

        <SectionTabs pulses={pulses} cruiseCalls={cruiseCalls} />
      </main>
      <Footer />
    </>
  );
}
