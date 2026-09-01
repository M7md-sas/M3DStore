import type { Metadata } from "next";
import Link from "next/link";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "سياسة الإرجاع والاستبدال",
  description: "شروط وإجراءات إرجاع واستبدال المنتجات في متجر M3DStore وفق نظام التجارة الإلكترونية السعودي.",
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-muted">آخر تحديث: يوليو 2026</p>
      <h1 className="mt-2 text-3xl font-extrabold">سياسة الإرجاع والاستبدال</h1>
      <p className="mt-3 leading-relaxed text-muted">
        نلتزم بأحكام{" "}
        <strong className="text-foreground">نظام التجارة الإلكترونية السعودي</strong> ولوائحه التنفيذية الصادرة عن
        وزارة التجارة. رضاك عن منتجنا أولويتنا — تواصل معنا أولاً وسنجد حلاً.
      </p>

      {/* بطاقة ملخص سريع */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "مدة الإرجاع", value: "7 أيام", sub: "من تاريخ الاستلام" },
          { label: "الاستبدال", value: "مجاني", sub: "في حالة عيب التصنيع" },
          { label: "الاسترداد", value: "3–5 أيام عمل", sub: "بعد وصول المنتج" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-line bg-surface p-4 text-center">
            <p className="text-xs text-muted">{c.label}</p>
            <p className="mt-1 text-xl font-extrabold text-primary">{c.value}</p>
            <p className="mt-0.5 text-xs text-muted">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-6">

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">✅ حالات يُقبل فيها الإرجاع</h2>
          <ul className="mt-3 space-y-2">
            {[
              "المنتج وصل معيبًا أو مكسورًا بسبب الشحن.",
              "المنتج المُسلَّم مختلف عن المنتج الذي طلبته (خطأ من طرفنا).",
              "عيب في جودة الطباعة يؤثر على شكل أو وظيفة المنتج بشكل واضح.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">❌ حالات لا يُقبل فيها الإرجاع</h2>
          <ul className="mt-3 space-y-2">
            {[
              "المنتجات المخصصة (اسم، تصميم شخصي، طلب مخصص) — لا يمكن إرجاعها بعد بدء الطباعة.",
              "تغيير الرأي بعد استلام المنتج السليم.",
              "الاختلاف الطفيف في درجة اللون (متوقع بطبيعة الطباعة ثلاثية الأبعاد).",
              "الضرر الناتج عن سوء الاستخدام أو التعرض للحرارة أو الرطوبة.",
              "المنتجات المستخدمة أو التي تبيّن آثار الاستخدام عليها.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent">
            ⚠️ المنتجات المخصصة (طلبات CST-) تُعتبر غير قابلة للإرجاع بمجرد بدء الطباعة — تأكد من تفاصيل طلبك قبل الدفع.
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">كيف تطلب الإرجاع؟</h2>
          <ol className="mt-3 space-y-3">
            {[
              "تواصل معنا واتساب خلال 7 أيام من استلام الطلب.",
              "أرسل رمز الطلب (ORD-XXXXXX) وصور واضحة للمنتج توضح المشكلة.",
              "سنؤكد قبول الإرجاع خلال 24 ساعة ونرسل لك تعليمات الإعادة.",
              "أعد المنتج بتغليفه الأصلي أو تغليف مناسب لتجنب التلف أثناء الشحن.",
              "بعد وصول المنتج والتحقق منه، نُرسل الاستبدال أو نُعيد المبلغ خلال 3–5 أيام عمل.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">الاسترداد المالي</h2>
          <ul className="mt-3 space-y-2">
            {[
              "يُعاد المبلغ إلى نفس وسيلة الدفع المستخدمة عند الشراء.",
              "رسوم الشحن لا تُسترد إلا إذا كان السبب خطأً من طرفنا.",
              "مدة الاسترداد 3–5 أيام عمل بعد تأكيدنا استلام المنتج وفحصه.",
              "في حالة الاستبدال، نتحمل رسوم شحن المنتج الجديد.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>

      <a
        href={whatsappLink("طلب إرجاع — رمز الطلب:")}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-[#0C6B39] py-4 text-base font-bold text-white transition-colors hover:bg-[#094B28]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.524 5.845L.057 23.617a.75.75 0 0 0 .918.919l5.86-1.479A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.703 9.703 0 0 1-4.96-1.36l-.355-.213-3.68.928.961-3.585-.232-.368A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
        ابدأ طلب إرجاع واتساب
      </a>

      <div className="mt-8 flex flex-wrap gap-4 border-t border-line pt-6 text-sm">
        <Link href="/privacy" className="font-semibold text-primary hover:underline">
          سياسة الخصوصية
        </Link>
        <Link href="/terms" className="font-semibold text-primary hover:underline">
          الشروط والأحكام
        </Link>
        <Link href="/" className="text-muted hover:text-primary">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
