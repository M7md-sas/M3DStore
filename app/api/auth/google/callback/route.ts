import { NextResponse } from "next/server";
import {
  googleAuthReady,
  exchangeCode,
  upsertUser,
  sessionCookie,
  originOf,
  STATE_COOKIE,
} from "@/lib/auth";

/** يرجع الزبون إلى الصفحة مع سبب واضح بدل شاشة خطأ صمّاء */
function back(request: Request, path: string, error?: string) {
  const url = new URL(path, originOf(request));
  if (error) url.searchParams.set("auth_error", error);
  const res = NextResponse.redirect(url.toString());
  res.cookies.delete(STATE_COOKIE);
  return res;
}

export async function GET(request: Request) {
  if (!googleAuthReady())
    return NextResponse.json({ error: "الدخول بقوقل غير مفعّل" }, { status: 404 });

  const params = new URL(request.url).searchParams;
  const cookie = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith(`${STATE_COOKIE}=`))
    ?.slice(STATE_COOKIE.length + 1);

  const [expectedState, next = "/track"] = decodeURIComponent(cookie ?? "").split("|");

  // الزبون ضغط «إلغاء» عند قوقل — رجوع هادئ بلا رسالة خطأ
  if (params.get("error")) return back(request, next);

  const state = params.get("state");
  const code = params.get("code");
  if (!code || !state || !expectedState || state !== expectedState)
    return back(request, next, "state");

  const profile = await exchangeCode(code, request);
  if (!profile) return back(request, next, "exchange");

  const res = back(request, next);
  res.cookies.set(sessionCookie(upsertUser(profile)));
  return res;
}
