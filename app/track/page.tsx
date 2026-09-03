"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ORDER_STATUS, CUSTOM_STATUS, sar, whatsappLink } from "@/lib/format";
import { CheckIcon, PackageIcon, SearchIcon, WhatsAppIcon } from "@/components/Icons";
import { listOrders, forgetOrder, type SavedOrder } from "@/lib/my-orders";

type TrackResult =
  | {
      type: "order";
      code: string;
      status: string;
      total: number;
      city: string;
      created_at: string;
      carrier: string;
      tracking: string;
      items: { name: string; qty: number; price: number; colors?: string[] }[];
    }
  | {
      type: "custom";
      code: string;
      status: string;
      price: number | null;
      admin_note: string;
      created_at: string;
    };

const ORDER_STEPS = ["pending_payment", "paid", "processing", "shipped", "delivered"];
const CUSTOM_STEPS = ["review", "approved", "paid", "printing", "shipped", "delivered"];

function TrackContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [saved, setSaved] = useState<SavedOrder[]>([]);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const justPaid = searchParams.get("paid") === "1";

  useEffect(() => {
    setSaved(listOrders());
  }, []);

  const lookup = useCallback(async (c: string) => {
    if (!c.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = searchParams.get("code");
    if (initial) lookup(initial);
  }, [searchParams, lookup]);

  const steps = result?.type === "order" ? ORDER_STEPS : CUSTOM_STEPS;
  const labels = result?.type === "order" ? ORDER_STATUS : CUSTOM_STATUS;
  const currentIdx = result ? steps.indexOf(result.status) : -1;
  const isTerminatedBadly = result && (result.status === "cancelled" || result.status === "rejected");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">تتبع طلبك</h1>
      <p className="mt-1 text-muted">اكتب رمز التتبع اللي وصلك عند إنشاء الطلب</p>

      {justPaid && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3 font-bold text-success">
          <CheckIcon width={20} height={20} />
          تم استلام دفعتك بنجاح — شكرًا لك!
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(code);
        }}
        className="mt-6 flex gap-2"
      >
        <div className="relative flex-1">
          <label htmlFor="track-code" className="sr-only">رمز التتبع</label>
          <input
            id="track-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            dir="ltr"
            placeholder="ORD-123456 أو CST-123456"
            className="w-full rounded-xl border border-line bg-surface py-3 pr-11 pl-4 text-right outline-none transition-colors focus:border-primary"
          />
          <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted">
            <PackageIcon width={18} height={18} />
          </span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-6 font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        >
          <SearchIcon width={18} height={18} />
          {loading ? "..." : "تتبع"}
        </button>
      </form>

      {saved.length > 0 && (
        <section className="mt-6 border border-line bg-surface">
          <h2 className="border-b border-line px-4 py-2 font-display text-sm font-bold">
            طلباتك على هذا الجهاز
          </h2>
          <ul className="divide-y divide-rule-soft">
            {saved.map((o) => (
              <li key={o.code} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setCode(o.code);
                    lookup(o.code);
                  }}
                  className="cursor-pointer font-mono text-sm font-bold tabular text-foreground transition-colors hover:text-primary"
                  dir="ltr"
                >
                  {o.code}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    forgetOrder(o.code);
                    setSaved(listOrders());
                  }}
                  aria-label={"إزالة " + o.code + " من هذا الجهاز"}
                  className="cursor-pointer text-xs text-muted transition-colors hover:text-danger"
                >
                  إزالة
                </button>
              </li>
            ))}
          </ul>
          <p className="border-t border-rule-soft px-4 py-2 text-xs text-muted">
            محفوظة في هذا المتصفح فقط. لو بدّلت جوالك، كلّمنا واتساب ونستخرج رقم طلبك.
          </p>
        </section>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-4 py-3 font-bold text-danger">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-8 rounded-3xl border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted">
                {result.type === "order" ? "طلب شراء" : "طلب تصميم مخصص"}
              </p>
              <p className="text-xl font-extrabold tabular" dir="ltr">{result.code}</p>
            </div>
            <span
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                isTerminatedBadly
                  ? "bg-danger-soft text-danger"
                  : result.status === "delivered"
                    ? "bg-success-soft text-success"
                    : "bg-primary-soft text-primary"
              }`}
            >
              {labels[result.status] ?? result.status}
            </span>
          </div>

          {/* خط التقدم */}
          {!isTerminatedBadly && currentIdx >= 0 && (
            <ol className="mt-6 space-y-0">
              {steps.map((s, i) => {
                const done = i < currentIdx;
                const current = i === currentIdx;
                return (
                  <li key={s} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < steps.length - 1 && (
                      <span
                        className={`absolute top-7 right-[13px] h-full w-0.5 ${done ? "bg-primary" : "bg-line"}`}
                        aria-hidden
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? "bg-primary text-white"
                          : current
                            ? "border-2 border-primary bg-primary-soft text-primary"
                            : "border border-line bg-surface text-muted"
                      }`}
                    >
                      {done ? <CheckIcon width={14} height={14} /> : i + 1}
                    </span>
                    <span className={`pt-0.5 text-sm font-bold ${current ? "text-primary" : done ? "" : "text-muted"}`}>
                      {labels[s]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          {/* تفاصيل */}
          {result.type === "order" && (
            <div className="mt-6 border-t border-line pt-4 text-sm">
              <ul className="space-y-1.5">
                {result.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{i.name} <span className="text-muted tabular">×{i.qty}</span></span>
                    <span className="font-bold tabular">{sar(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-line pt-3 font-extrabold">
                <span>الإجمالي</span>
                <span className="text-primary tabular">{sar(result.total)}</span>
              </div>

              {result.tracking && (
                <div className="mt-4 rounded-xl bg-primary-soft p-4">
                  <p className="text-xs font-bold text-primary">بيانات الشحنة</p>
                  <p className="mt-1 text-sm">
                    {result.carrier && <span className="font-bold">{result.carrier} — </span>}
                    رقم البوليصة:{" "}
                    <span dir="ltr" className="font-mono font-bold tabular">
                      {result.tracking}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    تابع شحنتك من موقع شركة الشحن بهذا الرقم.
                  </p>
                </div>
              )}
            </div>
          )}

          {result.type === "custom" && result.status === "approved" && result.price != null && (
            <div className="mt-6 rounded-2xl bg-success-soft p-5 text-center">
              <p className="font-bold text-success">مبروك! تم قبول تصميمك</p>
              <p className="mt-1 text-sm text-muted">السعر النهائي: <strong className="text-foreground tabular">{sar(result.price)}</strong></p>
              <Link
                href={`/pay/${result.code}`}
                className="mt-4 inline-block rounded-xl bg-primary px-8 py-3 font-bold text-white transition-colors hover:bg-primary-hover"
              >
                ادفع الآن بأمان
              </Link>
            </div>
          )}

          {result.type === "custom" && result.status === "rejected" && (
            <div className="mt-6 rounded-2xl bg-danger-soft p-5 text-sm leading-relaxed">
              <p className="font-bold text-danger">نعتذر، ما قدرنا نقبل هذا الطلب</p>
              {result.admin_note && <p className="mt-2">السبب: {result.admin_note}</p>}
              <p className="mt-2 text-muted">تقدر تعدل التصميم وترسله من جديد، أو تتواصل معنا واتساب</p>
            </div>
          )}

          {result.type === "custom" && result.status === "review" && (
            <p className="mt-6 rounded-2xl bg-accent-soft p-4 text-sm font-semibold leading-relaxed text-accent">
              طلبك قيد المراجعة حاليًا — راح نرد عليك خلال 24-48 ساعة. ما يُطلب منك أي دفع قبل الموافقة.
            </p>
          )}

          <a
            href={whatsappLink(`استفسار عن الطلب ${result.code}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-bold text-[#0C6B39] transition-colors hover:bg-primary-soft/40"
          >
            <WhatsAppIcon width={18} height={18} />
            استفسر عن طلبك واتساب
          </a>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  );
}
