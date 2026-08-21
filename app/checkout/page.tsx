"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart";
import { sar, PAYMENT_METHODS } from "@/lib/format";
import { SHIPPING_FLAT, FREE_SHIPPING_OVER } from "@/lib/shipping";
import { ShieldIcon } from "@/components/Icons";

const CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الأحساء",
  "الطائف", "بريدة", "تبوك", "خميس مشيط", "أبها", "حائل", "جازان", "نجران", "الجبيل", "ينبع", "مدينة أخرى",
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  const [form, setForm] = useState({ name: "", phone: "", city: "الرياض", address: "", payment: "mada" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold">لا يوجد شيء لإتمامه</h1>
        <p className="mt-2 text-muted">سلتك فاضية — أضف منتجات أول</p>
        <Link href="/products" className="mt-6 inline-block rounded-xl bg-primary px-7 py-3.5 font-bold text-white transition-colors hover:bg-primary-hover">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("اكتب اسمك الكامل");
    if (!/^05\d{8}$/.test(form.phone.trim()))
      return setError("رقم الجوال لازم يكون بصيغة 05xxxxxxxx");
    if (!form.address.trim()) return setError("اكتب عنوان التوصيل (الحي والشارع)");

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          phone: form.phone.trim(),
          city: form.city,
          address: form.address.trim(),
          payment_method: form.payment,
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ، حاول مرة ثانية");
      clear();
      router.push(`/pay/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة ثانية");
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none transition-colors focus:border-primary";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">إتمام الطلب</h1>
      <p className="mt-1 text-muted">خطوة أخيرة ويوصلك طلبك</p>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-extrabold">بيانات التوصيل</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-bold">الاسم الكامل</label>
                <input id="name" className={inputCls} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: محمد العتيبي" />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-bold">رقم الجوال</label>
                <input id="phone" inputMode="tel" dir="ltr" className={`${inputCls} text-right`} value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05xxxxxxxx" />
                <p className="mt-1 text-xs text-muted">نستخدمه للتواصل وتتبع الطلب</p>
              </div>
              <div>
                <label htmlFor="city" className="mb-1.5 block text-sm font-bold">المدينة</label>
                <select id="city" className={`${inputCls} cursor-pointer`} value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="mb-1.5 block text-sm font-bold">العنوان التفصيلي</label>
                <input id="address" className={inputCls} value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="الحي، الشارع، رقم المبنى" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-extrabold">وسيلة الدفع</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <ShieldIcon width={16} height={16} className="text-success" />
              جميع المدفوعات مشفّرة وتتم عبر بوابة دفع معتمدة في السعودية
            </p>
            <div className="mt-4 grid gap-2.5">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 font-bold transition-colors duration-200 ${
                    form.payment === m.id
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-line bg-surface hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={form.payment === m.id}
                    onChange={() => setForm({ ...form, payment: m.id })}
                    className="h-4 w-4 accent-[#0f766e]"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">طلبك</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span>{i.name} <span className="text-muted tabular">×{i.qty}</span></span>
                <span className="font-bold tabular">{sar(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">الشحن</dt>
              <dd className={`font-bold tabular ${shipping === 0 ? "text-success" : ""}`}>
                {shipping === 0 ? "مجاني" : sar(shipping)}
              </dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-extrabold">الإجمالي</dt>
              <dd className="font-extrabold text-primary tabular">{sar(total)}</dd>
            </div>
          </dl>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-sm font-bold text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full cursor-pointer rounded-xl bg-primary py-3.5 font-bold text-white transition-colors duration-200 hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "جارٍ إنشاء الطلب..." : "متابعة للدفع الآمن"}
          </button>
        </aside>
      </form>
    </div>
  );
}
