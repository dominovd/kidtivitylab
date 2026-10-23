import { NextResponse } from "next/server";
import { DEBUG_COOKIE, debugToken, COOKIE_PATH } from "@/lib/auth";

export async function POST(request: Request) {
  const password = process.env.DEBUG_PASSWORD;
  const body = (await request.json().catch(() => ({}))) as { password?: string };
  if (!password || body.password !== password) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEBUG_COOKIE, await debugToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
