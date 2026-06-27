import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { getSourcesHealth } from "@/lib/data";

export const dynamic = "force-dynamic";

function fmt(d?: string | null): string {
  if (!d) return "·";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "·" : dt.toLocaleString("en-US");
}

const STATUS_COLOR: Record<string, string> = {
  ok: "text-strong",
  partial: "text-moderate",
  failed: "text-vig-red",
  running: "text-faint",
};

export default async function SourcesPage() {
  const sources = await getSourcesHealth();

  return (
    <>
      <SiteHeader
        kicker="Admin"
        title="Source registry & health"
        summary="The sources feeding the brief, their cadence, and the last ingestion run for each. Personal/admin view."
      />
      <main className="mx-auto w-full max-w-6xl px-5 pb-14 pt-8">
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border">
          <table className="w-full border-collapse text-left text-[0.85rem]">
            <thead>
              <tr className="border-b border-border bg-surface-2/60 text-[0.7rem] uppercase tracking-wide text-faint">
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Cadence</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold">Last run</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">New</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-fg">{s.name}</td>
                  <td className="px-4 py-3 text-muted">{s.sourceType}</td>
                  <td className="px-4 py-3 text-muted">{s.cadence}</td>
                  <td className="px-4 py-3">
                    <span className={s.active ? "text-strong" : "text-faint"}>
                      {s.active ? "yes" : "off"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-faint">{fmt(s.lastRunAt)}</td>
                  <td className={`px-4 py-3 ${s.lastStatus ? STATUS_COLOR[s.lastStatus] ?? "text-muted" : "text-faint"}`}>
                    {s.lastStatus ?? "never"}
                  </td>
                  <td className="px-4 py-3 text-muted">{s.lastItemsNew ?? "·"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
