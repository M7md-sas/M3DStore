"use client";

import { useState } from "react";
import { sar } from "@/lib/format";
import { ShieldIcon } from "./Icons";

/**
 * الدفع بالبطاقة عبر PayTabs. الضغط ينشئ صفحة دفع مستضافة ويحوّل
 * الزبون إليها — بيانات بطاقته لا تلمس خادمنا أبدًا.
 */
export default function CardPayPanel({ code, amount }: { code: string; amount: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pay/paytabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.redirect_url) throw new Error(data.error || "تعذّر فتح صفحة الدفع");
      window.location.href = data.redirect_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر فتح صفحة الدفع");
      setLoading(false);
    }
  };

  return (
    <div className="panel-soft rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-base font-bold">الدفع بالبطاقة</h2>
      <p className="mt-1 text-sm text-muted">
        مدى، فيزا، أو ماستركارد — تحويل آمن إلى صفحة الدفع.
      </p>

      <button
        type="button"
        onClick={start}
        disabled={loading}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? "جارٍ التحويل..." : `ادفع ${sar(amount)}`}
      </button>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-danger-soft px-4 py-2.5 text-sm font-bold text-danger">
          {error}
        </p>
      )}

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <ShieldIcon width={14} height={14} className="text-success" />
        بياناتك تُدخل على صفحة PayTabs، ولا تمر بمتجرنا
      </p>
    </div>
  );
}
