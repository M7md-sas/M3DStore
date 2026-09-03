"use client";

import { sar, whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "@/components/Icons";

type Line = { name: string; qty: number; price: number; colors?: string[] };

/**
 * تأكيد الطلب عبر واتساب — الطريقة الفعلية للبيع اليوم.
 * تحل محل زر الدفع ما دامت بوابة الدفع غير مفعّلة، حتى لا يظهر
 * للزبون زر «ادفع» لا يحصّل شيئًا.
 */
export default function WhatsAppOrderPanel({
  code,
  amount,
  items,
}: {
  code: string;
  amount: number;
  items: Line[];
}) {
  const lines = items
    .map(
      (i) =>
        `• ${i.name}${i.colors?.length ? ` (${i.colors.join("، ")})` : ""} ×${i.qty} — ${sar(
          i.price * i.qty
        )}`
    )
    .join("\n");

  const message = `طلب جديد من M3DStore\nرقم الطلب: ${code}\n\n${lines}\n\nالإجمالي: ${sar(
    amount
  )}\n\nأبغى أأكد الطلب وأعرف طريقة الدفع.`;

  return (
    <div className="panel-soft overflow-hidden rounded-2xl border border-line bg-surface">
      <h2 className="border-b border-line px-5 py-3 text-sm font-bold text-foreground">
        تأكيد الطلب
      </h2>

      <div className="p-4">
        <p className="text-sm leading-relaxed text-muted">
          طلبك محفوظ برقمه. أرسل لنا رسالة واتساب لنؤكد التوفّر ونتفق على طريقة الدفع
          والتوصيل — الرسالة جاهزة بتفاصيل طلبك، تحتاج ترسلها فقط.
        </p>

        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 border border-line bg-[#0C6B39] py-3.5 font-display text-base font-bold text-white transition-colors duration-200 hover:bg-[#094B28]"
        >
          <WhatsAppIcon width={20} height={20} />
          أكّد طلبك على واتساب
        </a>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          الدفع الإلكتروني (مدى وApple Pay وSTC Pay) قيد التفعيل. إلى أن يجهز، نتفق على
          الدفع مباشرة معك.
        </p>
      </div>
    </div>
  );
}
