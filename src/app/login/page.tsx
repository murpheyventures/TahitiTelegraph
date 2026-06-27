import { TiareMark } from "@/components/Motifs";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/";

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-surface p-7">
        <div className="mb-5 flex items-center gap-2">
          <TiareMark className="h-5 w-5 text-coral" />
          <span className="text-lg font-bold tracking-tight text-fg">
            Tahiti<span className="text-primary">Telegraph</span>
          </span>
        </div>
        <p className="mb-5 text-[0.85rem] text-muted">
          Private brief. Enter the access password to continue.
        </p>
        <form method="post" action="/api/login" className="flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />
          <input
            type="password"
            name="password"
            autoFocus
            placeholder="Password"
            className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-primary"
          />
          {sp.error ? (
            <p className="text-[0.8rem] text-vig-red">Incorrect password.</p>
          ) : null}
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-2 font-medium text-primary-ink hover:opacity-90"
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}
