import { NihoMano } from "./Motifs";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface/60">
      <NihoMano className="h-2 w-full text-border" />
      <div className="mx-auto w-full max-w-6xl px-5 py-9 text-[0.8rem] text-muted">
        <p className="mb-2 font-serif text-base font-medium text-fg">TahitiTelegraph</p>
        <p className="mb-3 max-w-3xl">
          A personal, non-commercial intelligence brief. Analysis is synthesized from public
          and official sources (ISPF, LEXPOL, IEOM, Présidence, Haut-commissariat, Météo-France,
          AU/CA travel advisories, SPC) and local news, with every claim linked back to its source.
        </p>
        <p className="max-w-3xl text-faint">
          Not a news mirror and not official advice. For safety decisions, always consult the
          official source linked in each alert. Facts and interpretation are labeled separately.
        </p>
      </div>
    </footer>
  );
}
