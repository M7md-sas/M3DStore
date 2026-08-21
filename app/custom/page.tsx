"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CheckIcon, ClockIcon, UploadIcon, XIcon } from "@/components/Icons";
import { notFound } from "next/navigation";
import { CUSTOM_ORDERS_ENABLED } from "@/lib/site";

export default function CustomOrderPage() {
  // الميزة معطّلة حاليًا — إخفاء الرابط وحده لا يكفي، الصفحة نفسها تُقفل
  if (!CUSTOM_ORDERS_ENABLED) notFound();

  const [form, setForm] = useState({ name: "", phone: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("لازم ترفع ملف التصميم أو صورة توضيحية للفكرة");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("name", form.name);
      fd.set("phone", form.phone);
      fd.set("description", form.description);
      fd.set("file", file);
      const res = await fetch("/api/custom", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ، حاول مرة ثانية");
      setSuccessCode(data.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة ثانية");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none transition-colors focus:border-primary";

  if (successCode) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckIcon width={36} height={36} />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold">وصلنا طلبك بنجاح</h1>
        <p className="mt-3 leading-relaxed text-muted">
          راح نراجع التصميم ونتأكد أنه قابل للطباعة، وبعدها نحدد السعر ونرسل لك
          رابط الدفع. <strong className="text-foreground">ما تدفع أي شيء قبل موافقتنا على الطلب.</strong>
        </p>
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">رمز التتبع الخاص فيك</p>
          <p className="mt-1 text-2xl font-extrabold text-primary tabular" dir="ltr">{successCode}</p>
          <p className="mt-2 text-xs text-muted">احفظ الرمز — تحتاجه مع رقم جوالك لمتابعة الحالة</p>
        </div>
        <Link
          href={`/track?code=${successCode}`}
          className="mt-6 inline-block rounded-xl bg-primary px-7 py-3.5 font-bold text-white transition-colors hover:bg-primary-hover"
        >
          تتبع طلبك الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">اطلب تصميمك الخاص</h1>
      <p className="mt-2 max-w-xl leading-relaxed text-muted">
        عندك فكرة أو ملف تصميم؟ ارفعه لنا واشرح طلبك. نراجعه أولًا ونحدد السعر —
        <strong className="text-foreground"> والدفع يكون فقط بعد موافقتنا على طلبك</strong>، بدون أي التزام مسبق.
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-primary-soft/60 p-4 text-sm leading-relaxed">
        <ClockIcon width={20} height={20} className="mt-0.5 shrink-0 text-primary" />
        <p>
          <strong>كيف تمشي العملية؟</strong> ترسل الطلب ← نراجعه خلال 24-48 ساعة ← إذا
          قبلناه يوصلك رابط دفع آمن ← نطبع ونشحن. وإذا كان التصميم غير قابل للطباعة
          نعتذر لك مع توضيح السبب.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-bold">الاسم</label>
            <input id="name" required className={inputCls} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكامل" />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-bold">رقم الجوال</label>
            <input id="phone" required inputMode="tel" dir="ltr" className={`${inputCls} text-right`} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05xxxxxxxx" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-bold">اشرح فكرتك</label>
          <textarea id="description" required rows={5} className={`${inputCls} resize-y`} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="مثال: أبغى مجسم شعار شركتي بارتفاع 15 سم، لون أسود، مع قاعدة..." />
          <p className="mt-1 text-xs text-muted">كل ما كان الشرح أوضح (المقاسات، اللون، الكمية) كان الرد أسرع</p>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-bold">ملف التصميم <span className="text-danger">*</span></span>
          <input
            ref={fileInput}
            type="file"
            accept=".stl,.obj,.3mf,.step,.stp,.png,.jpg,.jpeg,.webp,.pdf,.zip"
            className="sr-only"
            id="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex items-center justify-between rounded-xl border border-primary bg-primary-soft px-4 py-3">
              <span className="truncate text-sm font-bold text-primary" dir="ltr">{file.name}</span>
              <button
                type="button"
                aria-label="إزالة الملف"
                onClick={() => {
                  setFile(null);
                  if (fileInput.current) fileInput.current.value = "";
                }}
                className="cursor-pointer rounded-lg p-1.5 text-primary transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <XIcon width={18} height={18} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="file"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line bg-surface px-4 py-8 text-center transition-colors hover:border-primary hover:bg-primary-soft/40"
            >
              <UploadIcon width={28} height={28} className="text-primary" />
              <span className="font-bold">اضغط لرفع الملف (إجباري)</span>
              <span className="text-xs text-muted">STL, OBJ, 3MF, STEP, صور، PDF أو ZIP — حتى 40MB</span>
              <span className="text-xs text-muted">إذا ما عندك ملف تصميم ارفع صورة توضّح فكرتك</span>
            </label>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm font-bold text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-xl bg-primary py-4 text-lg font-extrabold text-white transition-colors duration-200 hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {loading ? "جارٍ إرسال الطلب..." : "أرسل الطلب للمراجعة"}
        </button>
      </form>
    </div>
  );
}
