"use client";

import { useCallback, useEffect, useState } from "react";

type Review = {
  id: number;
  name: string;
  rating: number;
  body: string;
  created_at: string;
};

type Summary = { count: number; average: number };

/** نجوم — تُستخدم للعرض وللاختيار */
function Stars({
  value,
  onPick,
  size = 16,
}: {
  value: number;
  onPick?: (n: number) => void;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden
            fill={filled ? "#e0a92a" : "none"}
            stroke={filled ? "#e0a92a" : "#d6d0c2"}
            strokeWidth={1.8}
            strokeLinejoin="round"
          >
            <path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 16.9 6.7 19.7l1.1-6.1L3.4 9.4l6-.8Z" />
          </svg>
        );
        return onPick ? (
          <button
            key={n}
            type="button"
            onClick={() => onPick(n)}
            aria-label={`${n} من 5`}
            className="cursor-pointer p-0.5 transition-transform hover:scale-110"
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </span>
  );
}

/**
 * تقييمات المنتج — تُعرض المعتمدة فقط، ولا يكتب إلا من اشترى.
 * نطلب رمز الطلب لأنه الدليل الوحيد على الشراء في متجر بلا حسابات إجبارية.
 */
export default function ProductReviews({ productId }: { productId: number }) {
  const [summary, setSummary] = useState<Summary>({ count: 0, average: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ order_code: "", name: "", rating: 0, body: "" });
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await fetch(`/api/reviews?product=${productId}`).then((r) => r.json());
      setSummary(d.summary ?? { count: 0, average: 0 });
      setReviews(d.reviews ?? []);
    } catch {
      /* التقييمات إضافة — فشلها لا يكسر صفحة المنتج */
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (form.rating < 1) {
      setMsg("اختر عدد النجوم");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, product_id: productId }),
      });
      const d = await res.json();
      if (!res.ok) setMsg(d.error ?? "تعذّر الإرسال");
      else {
        setDone(true);
        setOpen(false);
      }
    } catch {
      setMsg("تعذّر الإرسال — تحقق من الاتصال");
    }
    setBusy(false);
  };

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold md:text-2xl">آراء المشترين</h2>
        {!done && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="cursor-pointer rounded-full border border-line px-5 py-2 text-sm font-bold transition-colors hover:bg-surface-2"
          >
            {open ? "إغلاق" : "قيّم هذا المنتج"}
          </button>
        )}
      </div>

      {summary.count > 0 ? (
        <div className="mt-3 flex items-center gap-3">
          <Stars value={summary.average} size={20} />
          <span className="text-sm font-bold tabular">{summary.average}</span>
          <span className="text-sm text-muted tabular">({summary.count} تقييم)</span>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">
          ما فيه تقييمات بعد — كن أول من يشاركنا رأيه بعد استلام قطعتك.
        </p>
      )}

      {done && (
        <p className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-sm font-bold text-success">
          وصلنا تقييمك، شكرًا لك. يظهر بعد مراجعته.
        </p>
      )}

      {open && (
        <form
          onSubmit={submit}
          className="panel-soft mt-5 space-y-4 rounded-2xl border border-line bg-surface p-5"
        >
          <div>
            <label htmlFor="rv-code" className="mb-1.5 block text-sm font-bold">رمز الطلب</label>
            <input
              id="rv-code"
              required
              dir="ltr"
              value={form.order_code}
              onChange={(e) => setForm({ ...form, order_code: e.target.value.toUpperCase() })}
              placeholder="ORD-123456"
              className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-right outline-none transition-colors focus:border-primary"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-bold">تقييمك</span>
            <Stars value={form.rating} size={28} onPick={(n) => setForm({ ...form, rating: n })} />
          </div>

          <div>
            <label htmlFor="rv-name" className="mb-1.5 block text-sm font-bold">
              اسمك <span className="font-normal text-muted">(اختياري)</span>
            </label>
            <input
              id="rv-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="يظهر مع رأيك"
              className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 outline-none transition-colors focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="rv-body" className="mb-1.5 block text-sm font-bold">
              رأيك <span className="font-normal text-muted">(اختياري)</span>
            </label>
            <textarea
              id="rv-body"
              rows={3}
              maxLength={600}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="كيف كانت القطعة؟ اللون؟ الجودة؟"
              className="w-full resize-y rounded-xl border border-line bg-surface px-4 py-2.5 outline-none transition-colors focus:border-primary"
            />
          </div>

          {msg && <p role="alert" className="text-sm font-bold text-danger">{msg}</p>}

          <button
            type="submit"
            disabled={busy}
            className="cursor-pointer rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "جارٍ الإرسال..." : "أرسل التقييم"}
          </button>
        </form>
      )}

      {reviews.length > 0 && (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="panel-soft rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2.5">
                  <Stars value={r.rating} />
                  <span className="font-bold">{r.name || "مشترٍ"}</span>
                </span>
                <span className="text-xs text-muted tabular" dir="ltr">
                  {r.created_at.slice(0, 10)}
                </span>
              </div>
              {r.body && (
                <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {r.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
