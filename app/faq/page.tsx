import type { Metadata } from "next";
import Link from "next/link";
import { whatsappLink } from "@/lib/format";
import { SHIPPING_FLAT, FREE_SHIPPING_OVER } from "@/lib/shipping";
import { WhatsAppIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description:
    "إجابات عن الشحن والتوصيل والألوان ومدة التجهيز وطرق الدفع والإرجاع في متجر M3DStore.",
};

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "متى يوصلني طلبي؟",
    a: (
      <>
        القطعة تُطبع بعد طلبك، ومدة التجهيز مكتوبة على صفحة كل منتج (غالبًا
        يومان إلى أربعة). يُضاف لها وقت الشحن حسب مدينتك. ويصلك رمز تتبّع تشوف
        فيه حالة طلبك أول بأول من{" "}
        <Link href="/track" className="font-bold text-primary hover:underline">
          صفحة التتبع
        </Link>
        .
      </>
    ),
  },
  {
    q: "كم الشحن؟",
    a: (
      <>
        {SHIPPING_FLAT} ر.س لكل مدن المملكة، و<strong>مجاني</strong> للطلبات فوق{" "}
        {FREE_SHIPPING_OVER} ر.س.
      </>
    ),
  },
  {
    q: "أقدر أختار لون القطعة؟",
    a: (
      <>
        نعم، وهذا أساس المتجر. كل منتج تحته الألوان المتوفرة له، تختار منها عند
        الطلب. وبعض القطع تقبل أكثر من لون. لو أردت لونًا غير المعروض، كلّمنا
        واتساب قبل الطلب.
      </>
    ),
  },
  {
    q: "المنتج مكتوب عليه «نفدت الكمية» — هل أقدر أطلبه؟",
    a: (
      <>
        غالبًا نعم. قطعنا تُطبع عند الطلب، فنفاد الكمية الجاهزة لا يعني توقف
        البيع — يظهر لك بدلها «يجهز خلال كذا يوم» وتقدر تطلب عادي.
      </>
    ),
  },
  {
    q: "كيف أدفع؟",
    a: (
      <>
        بالتحويل البنكي على حساب المتجر (الراجحي)، ويتأكد طلبك عبر واتساب بعد
        التحويل. ونضيف الدفع بالبطاقة قريبًا.
      </>
    ),
  },
  {
    q: "أحتاج حساب عشان أشتري؟",
    a: (
      <>
        لا. الشراء يتم بلا حساب إطلاقًا. والحساب اختياري فقط لو أردت أن تتبعك
        طلباتك بين أجهزتك — تسجّل بقوقل بضغطة إن أحببت.
      </>
    ),
  },
  {
    q: "نسيت رمز طلبي، وش أسوي؟",
    a: (
      <>
        افتح{" "}
        <Link href="/track" className="font-bold text-primary hover:underline">
          صفحة التتبع
        </Link>{" "}
        من نفس الجهاز الذي طلبت منه — تلقى طلباتك محفوظة تلقائيًا. ولو بدّلت
        جوالك، كلّمنا واتساب برقم جوالك ونستخرج لك الرمز.
      </>
    ),
  },
  {
    q: "أقدر أرجّع القطعة؟",
    a: (
      <>
        نعم وفق{" "}
        <Link href="/returns" className="font-bold text-primary hover:underline">
          سياسة الإرجاع
        </Link>
        : سبعة أيام من الاستلام، والاستبدال مجاني في حالة عيب التصنيع.
      </>
    ),
  },
  {
    q: "القطع متينة؟ من أي خامة؟",
    a: (
      <>
        نطبع بخامة PLA، وهي متينة ومناسبة للاستخدام اليومي داخل البيت والمكتب.
        لكن لا تتركها في سيارة مغلقة تحت شمس الصيف — الحرارة العالية تليّنها.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold md:text-4xl">الأسئلة الشائعة</h1>
      <p className="mt-3 text-muted">
        ما لقيت جوابك؟ كلّمنا واتساب — نرد بصراحة حتى لو كان الجواب «ما يصير».
      </p>

      <div className="mt-8 space-y-3">
        {FAQ.map((item, i) => (
          <details
            key={item.q}
            open={i === 0}
            className="panel-soft group rounded-2xl border border-line bg-surface p-5"
          >
            <summary className="cursor-pointer list-none font-bold marker:hidden">
              <span className="flex items-center justify-between gap-3">
                {item.q}
                <span
                  aria-hidden
                  className="shrink-0 text-xl leading-none text-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>

      <a
        href={whatsappLink("مرحبًا، عندي سؤال ما لقيت جوابه في الأسئلة الشائعة")}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
      >
        <WhatsAppIcon width={17} height={17} />
        اسأل واتساب
      </a>
    </div>
  );
}
