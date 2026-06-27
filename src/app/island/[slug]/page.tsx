import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { IslandChips } from "@/components/IslandChips";
import { PulseCard } from "@/components/PulseCard";
import { getIsland } from "@/lib/islands";
import { getIslandPulse } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function IslandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const island = getIsland(slug);
  if (!island) notFound();

  const cards = await getIslandPulse(slug);
  const asOf = cards[0]?.generatedAt;

  return (
    <>
      <SiteHeader
        kicker="Island pulse"
        title={island.nameTy && island.nameTy !== island.name ? `${island.name} · ${island.nameTy}` : island.name}
        summary={`What materially changed for ${island.name}, and why it matters.`}
        asOf={asOf}
      />
      <main className="mx-auto w-full max-w-6xl px-5 pb-14">
        <section className="border-b border-border py-6">
          <IslandChips active={slug} />
        </section>
        <section className="py-8">
          {cards.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <PulseCard key={card.id} card={card} />
              ))}
            </div>
          ) : (
            <p className="text-muted">
              No pulses for {island.name} yet. The pipeline writes island pulses as
              material items are ingested and analysed.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
