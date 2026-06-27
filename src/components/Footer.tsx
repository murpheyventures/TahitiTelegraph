import { NihoMano } from "./Motifs";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface/60">
      <NihoMano className="h-2 w-full text-border" />
      <div className="mx-auto w-full max-w-6xl px-5 py-9 text-[0.8rem] text-muted">
        <p className="mb-2 font-serif text-base font-medium text-fg">TahitiTelegraph</p>
        <p className="mb-3 max-w-3xl">
          A personal, non-commercial brief for keeping an eye on the fenua. The reading here is
          drawn from public and official sources (ISPF, LEXPOL, IEOM, the Présidence, the
          Haut-commissariat, Météo-France, the Australian and Canadian travel advisories, and SPC)
          alongside local news, and every claim links back to where it came from.
        </p>
        <p className="max-w-3xl text-faint">
          This is not a news mirror, and it is not official advice. For anything to do with safety,
          always go to the official source linked in each alert. Facts and interpretation are kept
          clearly apart.
        </p>
      </div>
    </footer>
  );
}
