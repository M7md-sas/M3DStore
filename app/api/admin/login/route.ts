import { NextResponse } from "next/server";
import { COOKIE_NAME, sessionToken, verifyPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password: string };
  if (!password || !verifyPassword(password))
    return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
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
