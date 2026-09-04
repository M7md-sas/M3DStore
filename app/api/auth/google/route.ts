import crypto from "crypto";
import { NextResponse } from "next/server";
import { googleAuthReady, redirectUri, originOf, STATE_COOKIE } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";

/** يبدأ الدخول: يولّد state ضد التزوير، ثم يحوّل الزبون إلى قوقل */
export async function GET(request: Request) {
  if (!googleAuthReady())
    return NextResponse.json({ error: "الدخول بقوقل غير مفعّل" }, { status: 404 });

  const state = crypto.randomBytes(32).toString("hex");

  // «إلى أين يرجع بعد الدخول» — مسار داخلي فقط، حتى لا تُستغل الصفحة
  // كجسر تحويل إلى موقع خارجي
  const raw = new URL(request.url).searchParams.get("next") ?? "/track";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/track";

  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
  auth.searchParams.set("redirect_uri", redirectUri(request));
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(auth.toString());
  res.cookies.set({
    name: STATE_COOKIE,
    value: `${state}|${next}`,
    httpOnly: true,
    sameSite: "lax",
    secure: SITE_URL.startsWith("https://") && !originOf(request).includes("localhost"),
    path: "/",
    maxAge: 600,
  });
  return res;
}
