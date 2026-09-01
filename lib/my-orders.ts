"use client";

const STORAGE_KEY = "m3dstore_orders_v1";
const MAX = 20;

export type SavedOrder = { code: string; at: string };

/**
 * رموز الطلبات المحفوظة على جهاز الزبون.
 * نحفظ الرمز والتاريخ فقط — لا اسم ولا جوال ولا عنوان،
 * فجهاز مشترك لا يكشف بيانات صاحبه، والرمز وحده لا يفتح شيئًا بلا الموقع.
 */
export function listOrders(): SavedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((o) => o && typeof o.code === "string")
      .map((o) => ({ code: o.code, at: typeof o.at === "string" ? o.at : "" }));
  } catch {
    return [];
  }
}

export function rememberOrder(code: string): void {
  if (typeof window === "undefined" || !code) return;
  try {
    const next = [
      { code, at: new Date().toISOString() },
      ...listOrders().filter((o) => o.code !== code),
    ].slice(0, MAX);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* التخزين ممتلئ أو محظور — الرمز يبقى متاحًا يدويًا */
  }
}

export function forgetOrder(code: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(listOrders().filter((o) => o.code !== code))
    );
  } catch {
    /* تجاهل */
  }
}
