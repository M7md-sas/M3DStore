"use client";

import { useCallback, useEffect, useState } from "react";
import { sar } from "@/lib/format";
import { TrashIcon } from "./Icons";

export type CouponRow = {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  min_total: number;
  max_uses: number;
  used: number;
  expires_at: string;
  active: number;
};

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-4 py-2.5 outline-none transition-colors focus:border-primary";

const empty = {
  code: "",
  kind: "percent" as "percent" | "fixed",
  value: "",
  min_total: "",
  max_uses: "",
  expires_at: "",
};

/** إدارة كوبونات الخصم — إنشاء وإيقاف وحذف */
export default function CouponsTab() {
  const [items, setItems] = useState<CouponRow[] | null>(null);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await fetch("/api/admin/coupons").then((r) => r.json());
      setItems(d.coupons ?? []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    if (!res.ok) setErr(d.error ?? "حدث خطأ");
    else setForm(empty);
    setBusy(false);
    load();
  };

  const toggle = async (c: CouponRow) => {
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: c.code, active: c.active ? 0 : 1 }),
    });
    load();
  };

  const remove = async (c: CouponRow) => {
    if (!confirm(`حذف الكوبون ${c.code} نهائيًا؟`)) return;
    await fetch("/api/admin/coupons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: c.code }),
    });
    load();
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      <form
        onSubmit={create}
        className="h-fit space-y-4 rounded-2xl border border-line bg-surface p-5"
      >
        <h2 className="text-lg font-extrabold">كوبون جديد</h2>

        <div>
          <label htmlFor="c-code" className="mb-1 block text-sm font-bold">الرمز</label>
          <input
            id="c-code"
            required
            dir="ltr"
            className={`${inputCls} text-right`}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="WELCOME10"
          />
          <p className="mt-1 text-xs text-muted">حروف إنجليزية وأرقام، 3–24 خانة</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="c-kind" className="mb-1 block text-sm font-bold">النوع</label>
            <select
              id="c-kind"
              className={`${inputCls} cursor-pointer`}
              value={form.kind}
              onChange={(e) =>
                setForm({ ...form, kind: e.target.value as "percent" | "fixed" })
              }
            >
              <option value="percent">نسبة %</option>
              <option value="fixed">مبلغ ثابت</option>
            </select>
          </div>
          <div>
            <label htmlFor="c-value" className="mb-1 block text-sm font-bold">
              {form.kind === "percent" ? "النسبة" : "المبلغ"}
            </label>
            <input
              id="c-value"
              required
              inputMode="decimal"
              dir="ltr"
              className={`${inputCls} text-right`}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="c-min" className="mb-1 block text-sm font-bold">حد أدنى</label>
            <input
              id="c-min"
              inputMode="decimal"
              dir="ltr"
              className={`${inputCls} text-right`}
              value={form.min_total}
              onChange={(e) => setForm({ ...form, min_total: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label htmlFor="c-uses" className="mb-1 block text-sm font-bold">أقصى استخدام</label>
            <input
              id="c-uses"
              inputMode="numeric"
              dir="ltr"
              className={`${inputCls} text-right`}
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              placeholder="0"
            />
            <p className="mt-1 text-xs text-muted">صفر = بلا حد</p>
          </div>
        </div>

        <div>
          <label htmlFor="c-exp" className="mb-1 block text-sm font-bold">
            ينتهي في <span className="font-normal text-muted">(اختياري)</span>
          </label>
          <input
            id="c-exp"
            type="date"
            dir="ltr"
            className={`${inputCls} text-right`}
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          />
        </div>

        {err && <p role="alert" className="text-sm font-bold text-danger">{err}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full cursor-pointer rounded-xl bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? "..." : "أنشئ الكوبون"}
        </button>
      </form>

      <div>
        {items === null ? (
          <p className="py-10 text-center text-muted">جارٍ التحميل...</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-muted">
            ما فيه كوبونات بعد — أنشئ واحدًا من النموذج.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((c) => {
              const expired = Boolean(c.expires_at) && c.expires_at < today;
              const drained = c.max_uses > 0 && c.used >= c.max_uses;
              return (
                <div key={c.code} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold tabular" dir="ltr">{c.code}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {c.kind === "percent" ? `خصم ${c.value}%` : `خصم ${sar(c.value)}`}
                        {c.min_total > 0 && ` — يبدأ من ${sar(c.min_total)}`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted tabular">
                        استُخدم {c.used}
                        {c.max_uses > 0 ? ` من ${c.max_uses}` : ""}
                        {c.expires_at ? ` — ينتهي ${c.expires_at}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {(expired || drained) && (
                        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-muted">
                          {expired ? "منتهٍ" : "اكتمل"}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggle(c)}
                        className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                          c.active
                            ? "bg-success-soft text-success"
                            : "bg-surface-2 text-muted"
                        }`}
                      >
                        {c.active ? "مفعّل" : "موقوف"}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(c)}
                        aria-label={`حذف ${c.code}`}
                        className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
