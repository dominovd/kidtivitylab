import { NextResponse } from "next/server";
import { AUTH_COOKIE, authToken, COOKIE_PATH } from "@/lib/auth";

export async function POST(request: Request) {
  const password = process.env.SITE_PASSWORD;
  const body = (await request.json().catch(() => ({}))) as { password?: string };

  if (!password || body.password !== password) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await authToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
