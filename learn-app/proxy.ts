import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, DEBUG_COOKIE, authToken, debugToken } from "@/lib/auth";

/** Redirect to a path inside the /learn basePath. */
function redirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  // with basePath, nextUrl.pathname is the path inside the app ("/debug", not "/learn/debug")
  const path = request.nextUrl.pathname;

  // optional site password (staging only): leave SITE_PASSWORD unset in production — the app is public
  const password = process.env.SITE_PASSWORD;
  if (password && !path.startsWith("/login") && !path.startsWith("/api/login") && request.cookies.get(AUTH_COOKIE)?.value !== (await authToken(password))) {
    if (path.startsWith("/api/")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return redirect(request, "/login");
  }

  // debug mode: its own password; without DEBUG_PASSWORD the pages do not exist
  if (path.startsWith("/debug") || path.startsWith("/api/debug-login")) {
    const debugPassword = process.env.DEBUG_PASSWORD;
    if (!debugPassword) return new NextResponse("Not found", { status: 404 });
    if (path === "/debug/login" || path.startsWith("/api/debug-login")) return NextResponse.next();
    if (request.cookies.get(DEBUG_COOKIE)?.value !== (await debugToken(debugPassword))) return redirect(request, "/debug/login");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|images/).*)"],
};
