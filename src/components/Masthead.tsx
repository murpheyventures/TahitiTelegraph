import Link from "next/link";
import { TiareMark } from "./Motifs";

export function Masthead() {
  return (
    <div className="flex items-center justify-between border-b border-border py-3">
      <Link href="/" className="group flex items-center gap-2 no-underline">
        <TiareMark className="h-4 w-4 text-coral" />
        <span className="text-[0.98rem] font-bold tracking-tight text-fg">
          Tahiti<span className="text-primary">Telegraph</span>
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-[0.78rem] font-medium text-muted">
        <Link href="/" className="no-underline hover:text-primary">Overview</Link>
        <Link href="/sources" className="no-underline hover:text-primary">Sources</Link>
        <span className="hidden text-[0.66rem] uppercase tracking-[0.18em] text-faint sm:inline">
          Personal brief
        </span>
      </nav>
    </div>
  );
}
