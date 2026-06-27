import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { DomainChips } from "@/components/DomainChips";
import { PulseCard } from "@/components/PulseCard";
import { getDomain } from "@/lib/taxonomy";
import { getDomainPulses } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const domain = getDomain(slug);
  if (!domain) notFound();

  const cards = await getDomainPulses(slug);
  const asOf = cards[0]?.generatedAt;

  return (
    <>
      <SiteHeader
        kicker={domain.section === "tourism" ? "Tourism" : "Local News"}
        title={domain.labelEn}
        summary={domain.blurb}
        asOf={asOf}
      />
      <main className="mx-auto w-full max-w-6xl px-5 pb-14">
        <section className="border-b border-border py-6">
          <DomainChips active={slug} />
        </section>
        <section className="py-8">
          {cards.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <PulseCard key={card.id} card={card} showIsland />
              ))}
            </div>
          ) : (
            <p className="text-muted">No pulses tagged {domain.labelEn} yet.</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
