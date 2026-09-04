import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

/** خروج — POST لا GET، حتى لا يُخرج الزبونَ رابطٌ في صفحة أخرى */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
