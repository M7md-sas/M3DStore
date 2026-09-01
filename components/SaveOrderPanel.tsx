"use client";

import { useState } from "react";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon, CheckIcon } from "@/components/Icons";

/**
 * أقوى طبقة لاسترجاع الطلب: الرمز بارز، ونسخة منه في واتساب.
 * الحفظ على الجهاز ينجو من إغلاق الصفحة، وواتساب ينجو من تبديل الجوال ومسح المتصفح.
 */
export default function SaveOrderPanel({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* المتصفح منع الحافظة — الرمز ظاهر للنسخ يدويًا */
    }
  };

  const message = `طلبي في M3DStore\nرقم الطلب: ${code}\nتتبّع الطلب: ${
    typeof window !== "undefined" ? window.location.origin : ""
  }/track?code=${code}`;

  return (
    <section className="border-2 border-line bg-surface">
      <h2 className="border-b-2 border-line bg-foreground px-4 py-2 font-display text-sm font-bold tracking-wide text-white">
        احفظ رقم طلبك
      </h2>

      <div className="p-4">
        <p className="text-sm leading-relaxed text-muted">
          هذا الرقم هو مفتاح متابعة طلبك. احفظه الآن — بدونه تحتاج تكلّمنا واتساب لنستخرجه لك.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            dir="ltr"
            className="border-2 border-line bg-background px-4 py-2.5 font-mono text-xl font-bold tabular"
          >
            {code}
          </span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex cursor-pointer items-center gap-2 border-2 border-line bg-surface px-4 py-2.5 font-display text-sm font-bold text-foreground transition-colors duration-200 hover:bg-foreground hover:text-white"
          >
            {copied ? (
              <>
                <CheckIcon width={16} height={16} /> نُسخ
              </>
            ) : (
              "نسخ الرقم"
            )}
          </button>
        </div>

        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 border-2 border-line bg-[#0C6B39] px-4 py-2.5 font-display text-sm font-bold text-white transition-colors duration-200 hover:bg-[#094B28]"
        >
          <WhatsAppIcon width={16} height={16} />
          أرسل الرقم لنفسك في واتساب
        </a>
        <p className="mt-1.5 text-xs text-muted">
          تنجو نسخة واتساب حتى لو بدّلت جوالك أو مسحت المتصفح.
        </p>
      </div>
    </section>
  );
}
