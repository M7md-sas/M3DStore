"use client";

import { useState } from "react";
import { sar } from "@/lib/format";
import { BANK_TRANSFER } from "@/lib/site";
import { CheckIcon } from "@/components/Icons";

/**
 * التحويل البنكي — الطريقة الوحيدة التي تحصّل المبلغ فعلًا بلا بوابة دفع.
 * الزبون يحوّل ويرسل الإيصال على واتساب، وصاحب المتجر يؤكد الطلب من اللوحة.
 */
export default function BankTransferPanel({ code, amount }: { code: string; amount: number }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* المتصفح منع الحافظة — القيمة ظاهرة للنسخ يدويًا */
    }
  };

  const rows: { label: string; value: string; key: string; ltr?: boolean }[] = [
    { label: "الآيبان", value: BANK_TRANSFER.iban, key: "iban", ltr: true },
    { label: "اسم الحساب", value: BANK_TRANSFER.accountName, key: "name" },
    { label: "البنك", value: BANK_TRANSFER.bankName, key: "bank" },
  ].filter((r) => r.value.trim().length > 0);

  return (
    <section className="border-2 border-line bg-surface">
      <h2 className="border-b-2 border-line bg-foreground px-4 py-2 font-display text-sm font-bold tracking-wide text-white">
        الدفع بالتحويل البنكي
      </h2>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3 border-b-2 border-line pb-3">
          <span className="text-sm text-muted">المبلغ المطلوب</span>
          <span className="font-display text-2xl font-extrabold tabular">{sar(amount)}</span>
        </div>

        <dl className="mt-3 divide-y divide-rule-soft">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-3 py-2.5">
              <dt className="shrink-0 font-mono text-[0.62rem] tracking-[0.12em] text-muted">
                {r.label}
              </dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span
                  dir={r.ltr ? "ltr" : undefined}
                  className="truncate font-display text-sm font-bold tabular"
                >
                  {r.value}
                </span>
                <button
                  type="button"
                  onClick={() => copy(r.value, r.key)}
                  aria-label={`نسخ ${r.label}`}
                  className="shrink-0 cursor-pointer border border-line px-2 py-1 font-mono text-[0.62rem] font-bold transition-colors hover:bg-foreground hover:text-white"
                >
                  {copied === r.key ? <CheckIcon width={12} height={12} /> : "نسخ"}
                </button>
              </dd>
            </div>
          ))}
        </dl>

        <ol className="mt-4 space-y-2 border-t-2 border-line pt-3 text-sm leading-relaxed text-muted">
          <li>
            <span className="font-bold text-foreground">١.</span> حوّل {sar(amount)} على الآيبان
            أعلاه.
          </li>
          <li>
            <span className="font-bold text-foreground">٢.</span> اكتب رقم طلبك{" "}
            <span dir="ltr" className="font-mono font-bold text-foreground">
              {code}
            </span>{" "}
            في خانة الملاحظة إن وُجدت.
          </li>
          <li>
            <span className="font-bold text-foreground">٣.</span> أرسل صورة الإيصال على واتساب من
            الزر تحت — نبدأ الطباعة أول ما يوصل.
          </li>
        </ol>
      </div>
    </section>
  );
}
