import { getDb } from "./db";

export type Coupon = {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  min_total: number;
  max_uses: number;
  used: number;
  expires_at: string;
  active: number;
};

export type CouponCheck =
  | { ok: true; code: string; discount: number; label: string }
  | { ok: false; error: string };

/** توحيد شكل الرمز: الحروف كبيرة وبلا مسافات، فلا يفشل بسبب طريقة كتابته */
export function normalizeCode(raw: unknown): string {
  return String(raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * التحقق من كوبون وحساب خصمه على مجموع فرعي معيّن.
 *
 * يُستدعى مرتين: مرة لعرض الخصم للزبون في صفحة الدفع، ومرة على الخادم
 * عند إنشاء الطلب. الحساب هنا وحده — فلا يُصدَّق خصمٌ يرسله المتصفح.
 */
export function checkCoupon(rawCode: unknown, subtotal: number): CouponCheck {
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, error: "اكتب رمز الكوبون" };

  const c = getDb().prepare("SELECT * FROM coupons WHERE code = ?").get(code) as
    | Coupon
    | undefined;

  if (!c || !c.active) return { ok: false, error: "رمز غير صالح" };

  if (c.expires_at && c.expires_at < new Date().toISOString().slice(0, 10))
    return { ok: false, error: "انتهت صلاحية هذا الكوبون" };

  if (c.max_uses > 0 && c.used >= c.max_uses)
    return { ok: false, error: "انتهى عدد استخدامات هذا الكوبون" };

  if (subtotal < c.min_total)
    return {
      ok: false,
      error: `الكوبون يبدأ من ${c.min_total} ر.س — أضف قطعًا للسلة`,
    };

  // الخصم لا يتجاوز المجموع الفرعي أبدًا: لا فواتير بالسالب
  const raw = c.kind === "percent" ? (subtotal * c.value) / 100 : c.value;
  const discount = Math.min(Math.round(raw * 100) / 100, subtotal);

  if (discount <= 0) return { ok: false, error: "رمز غير صالح" };

  return {
    ok: true,
    code: c.code,
    discount,
    label: c.kind === "percent" ? `خصم ${c.value}%` : `خصم ${c.value} ر.س`,
  };
}

/** يزيد عدّاد الاستخدام — يُستدعى داخل معاملة إنشاء الطلب لا خارجها */
export function markCouponUsed(code: string): void {
  getDb().prepare("UPDATE coupons SET used = used + 1 WHERE code = ?").run(code);
}
