import { NextResponse } from "next/server";
import { COOKIE_NAME, sessionToken, verifyPassword } from "@/lib/admin-auth";
import { allow, clientIp } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";

export async function POST(request: Request) {
  // خمس محاولات كل ربع ساعة: تكفي من نسي كلمته، وتُبطئ أداة تخمين
  if (!allow(`admin-login:${clientIp(request.headers)}`, 5, 15 * 60 * 1000))
    return NextResponse.json(
      { error: "محاولات كثيرة — انتظر ربع ساعة" },
      { status: 429 }
    );

  const { password } = (await request.json()) as { password: string };
  if (!password || !verifyPassword(password))
    return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    // كوكي الزبون كان محميًا بـ secure وكوكي الأدمن لا — وهو الأخطر
    secure: SITE_URL.startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 12, // 12 ساعة
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
