import { NextResponse } from "next/server";
import { AUTH_COOKIE, authEnabled, authToken } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/") || "/";

  // If auth isn't enabled, just let them in.
  if (!authEnabled()) {
    return NextResponse.redirect(new URL(next, req.url), 303);
  }

  if (password && password === process.env.SITE_PASSWORD) {
    const res = NextResponse.redirect(new URL(next, req.url), 303);
    const token = await authToken(process.env.SITE_PASSWORD!);
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  return NextResponse.redirect(
    new URL(`/login?error=1&next=${encodeURIComponent(next)}`, req.url),
    303
  );
}
