import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "m3d_admin";

/**
 * قيمة افتراضية للتطوير المحلي فقط. في الإنتاج نرمي خطأ بدل الرجوع
 * إليها: نشرة بلا متغيّر بيئة كانت ستفتح لوحة التحكم بكلمة مرور
 * مكتوبة في الكود ويعرفها كل من قرأ المستودع. الفشل الصاخب أأمن من
 * باب مفتوح بصمت.
 */
function required(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === "production")
    throw new Error(`${name} غير مضبوط — لوحة التحكم معطّلة`);
  return devFallback;
}

function adminPassword(): string {
  return required("ADMIN_PASSWORD", "change-me-123");
}

function secret(): string {
  return required("ADMIN_SECRET", "m3dstore-local-secret");
}

export function sessionToken(): string {
  return crypto.createHmac("sha256", secret()).update(adminPassword()).digest("hex");
}

export function verifyPassword(password: string): boolean {
  return sameSecret(password, adminPassword());
}

/** مقارنة ثابتة الزمن لأي نصّين — تُستخدم لكلمة المرور ولرمز الجلسة معًا */
function sameSecret(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  // المقارنة بـ === تُسرّب طول التطابق بزمن التنفيذ؛ كلمة المرور كانت
  // محميّة والرمز لا — وهو مفتاح الجلسة نفسه
  return Boolean(token) && sameSecret(token as string, sessionToken());
}

export { COOKIE_NAME };
