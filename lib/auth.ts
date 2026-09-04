import crypto from "crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { SITE_URL } from "./site";

const COOKIE_NAME = "m3d_user";
const MAX_AGE = 60 * 60 * 24 * 90; // ٩٠ يومًا

export type User = { id: number; google_sub: string; email: string; name: string };

/**
 * دخول قوقل اختياري تمامًا: ما دامت المفاتيح غير موجودة، لا يظهر الزر
 * ولا يعمل أي مسار مصادقة — والشراء كضيف يبقى كما هو. نفس نمط
 * bankTransferReady: الميزة تُخفى حتى تُضبط، لا تنكسر.
 */
export function googleAuthReady(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function secret(): string {
  return process.env.ADMIN_SECRET || "m3dstore-local-secret";
}

/** التوقيع يمنع انتحال هوية بتحرير الكوكي — نفس مبدأ جلسة الأدمن */
function sign(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

function serialize(userId: number): string {
  const id = String(userId);
  return `${id}.${sign(id)}`;
}

function parse(raw: string | undefined): number | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;

  const id = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);
  const expected = sign(id);

  // مقارنة ثابتة الزمن حتى لا يُستنتج التوقيع الصحيح بقياس الوقت
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** الزبون الحالي، أو null لو كان ضيفًا — والضيف حالة مشروعة لا خطأ */
export async function currentUser(): Promise<User | null> {
  const store = await cookies();
  const id = parse(store.get(COOKIE_NAME)?.value);
  if (!id) return null;

  const row = getDb()
    .prepare("SELECT id, google_sub, email, name FROM users WHERE id = ?")
    .get(id) as User | undefined;
  return row ?? null;
}

export function sessionCookie(userId: number) {
  return {
    name: COOKIE_NAME,
    value: serialize(userId),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: SITE_URL.startsWith("https://"),
    path: "/",
    maxAge: MAX_AGE,
  };
}

export { COOKIE_NAME };

/** كوكي مؤقت يحمل state ضد التزوير + وجهة الرجوع بعد الدخول */
export const STATE_COOKIE = "m3d_oauth_state";

/**
 * أصل الموقع كما يراه المتصفح — وهو ما يُبنى عليه redirect_uri وروابط
 * رجوع الدفع، فأي خطأ فيه يكسر الدخول والدفع معًا.
 *
 * لا يصح اشتقاقه من الطلب في الإنتاج: خلف nginx يصل التطبيقَ مضيفٌ
 * داخلي (localhost:3000)، فينتج عنوان لا يعمل. لذلك نعتمد
 * NEXT_PUBLIC_SITE_URL المضبوط على الخادم، ولا نرجع إلى أصل الطلب
 * إلا في التطوير المحلي حيث لا يُضبط هذا المتغيّر.
 */
export function originOf(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return new URL(request.url).origin;
}

export function redirectUri(request: Request): string {
  return `${originOf(request)}/api/auth/google/callback`;
}

/** بيانات الحساب المستخرجة من رد قوقل */
export type GoogleProfile = { sub: string; email: string; name: string };

/**
 * يبدّل رمز التفويض بالبيانات. لا نتحقق من توقيع الـ id_token لأننا
 * استلمناه من خادم قوقل مباشرة عبر TLS لا من المتصفح — وهذا ما توصي به
 * قوقل نفسها لهذه الحالة. نتحقق من aud و iss كفحص إضافي رخيص.
 */
export async function exchangeCode(
  code: string,
  request: Request
): Promise<GoogleProfile | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri(request),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { id_token?: string };
  if (!data.id_token) return null;

  const parts = data.id_token.split(".");
  if (parts.length !== 3) return null;

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }

  const iss = String(payload.iss ?? "");
  if (iss !== "accounts.google.com" && iss !== "https://accounts.google.com") return null;
  if (String(payload.aud ?? "") !== process.env.GOOGLE_CLIENT_ID) return null;

  const sub = String(payload.sub ?? "");
  if (!sub) return null;

  return {
    sub,
    email: String(payload.email ?? ""),
    name: String(payload.name ?? ""),
  };
}

/** ينشئ الحساب أو يحدّث اسمه وبريده إن تغيّرا عند قوقل */
export function upsertUser(profile: GoogleProfile): number {
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM users WHERE google_sub = ?")
    .get(profile.sub) as { id: number } | undefined;

  if (existing) {
    db.prepare("UPDATE users SET email = ?, name = ? WHERE id = ?").run(
      profile.email,
      profile.name,
      existing.id
    );
    return existing.id;
  }

  const info = db
    .prepare("INSERT INTO users (google_sub, email, name) VALUES (?, ?, ?)")
    .run(profile.sub, profile.email, profile.name);
  return Number(info.lastInsertRowid);
}
