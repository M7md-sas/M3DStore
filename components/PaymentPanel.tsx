"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAYMENT_METHODS, sar } from "@/lib/format";
import { CheckIcon, ShieldIcon } from "./Icons";

export default function PaymentPanel({
  code,
  amount,
  initialMethod,
}: {
  code: string;
  amount: number;
  initialMethod?: string;
}) {
  const router = useRouter();
  const [method, setMethod] = useState(initialMethod || "mada");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const pay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الدفع، حاول مرة ثانية");
      setDone(true);
      setTimeout(() => router.push(`/track?code=${code}&paid=1`), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل الدفع، حاول مرة ثانية");
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-success-soft p-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-white">
          <CheckIcon width={30} height={30} />
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-success">تم الدفع بنجاح</h2>
        <p className="mt-1 text-sm text-muted">جارٍ تحويلك لصفحة تتبع الطلب...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-2.5">
        {PAYMENT_METHODS.map((m) => (
          <label
            key={m.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 font-bold transition-colors duration-200 ${
              method === m.id
                ? "border-primary bg-primary-soft text-primary"
                : "border-line bg-surface hover:border-primary/40"
            }`}
          >
            <input
              type="radio"
              name="pay-method"
              value={m.id}
              checked={method === m.id}
              onChange={() => setMethod(m.id)}
              className="h-4 w-4 accent-[#7a6935]"
            />
            {m.label}
          </label>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-accent-soft px-3 py-2.5 text-xs font-semibold leading-relaxed text-accent">
        <ShieldIcon width={16} height={16} className="mt-0.5 shrink-0" />
        المتجر حاليًا في الوضع التجريبي — زر الدفع أدناه يحاكي عملية الدفع. عند ربط
        بوابة الدفع (Moyasar أو Tap) سيتحول هذا لدفع حقيقي مشفّر.
      </p>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-danger-soft px-3 py-2.5 text-sm font-bold text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="mt-5 w-full cursor-pointer rounded-xl bg-primary py-4 text-lg font-extrabold text-white transition-colors duration-200 hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? "جارٍ معالجة الدفع..." : `ادفع ${sar(amount)}`}
      </button>
    </div>
  );
}
