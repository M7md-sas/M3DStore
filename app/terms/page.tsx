import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الشروط والأحكام",
  description: "شروط وأحكام الاستخدام والشراء في متجر M3DStore للطباعة ثلاثية الأبعاد.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-muted">آخر تحديث: يوليو 2026</p>
      <h1 className="mt-2 text-3xl font-extrabold">الشروط والأحكام</h1>
      <p className="mt-3 leading-relaxed text-muted">
        باستخدامك متجر <strong className="text-foreground">M3DStore</strong> أو إتمام أي عملية شراء، فإنك توافق على
        الشروط والأحكام التالية. إن كنت لا توافق عليها، يُرجى عدم استخدام المتجر.
      </p>

      <div className="mt-8 space-y-6">

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">١. وصف المنتجات</h2>
          <ul className="mt-3 space-y-2">
            {[
              "جميع المنتجات مطبوعة ثلاثية الأبعاد باستخدام خامة PLA عالية الجودة.",
              "الألوان في الصور استرشادية — قد يطرأ اختلاف طفيف في الدرجة بسبب طبيعة عملية الطباعة وإعدادات الشاشة.",
              "الأبعاد المذكورة تقريبية بفارق ±2 ملم وهو معيار مقبول في الطباعة ثلاثية الأبعاد.",
              "المنتجات مخصصة للاستخدام الداخلي والزخرفي؛ لا تُستخدم في تطبيقات تتطلب تحمّل أحمال هيكلية.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">٢. الأسعار والدفع</h2>
          <ul className="mt-3 space-y-2">
            {[
              "جميع الأسعار بالريال السعودي (ر.س) وتشمل ضريبة القيمة المضافة 15%.",
              "يحق لنا تعديل الأسعار في أي وقت دون إشعار مسبق — يُطبّق السعر المعروض وقت إتمام الطلب.",
              "الدفع عبر بوابات إلكترونية معتمدة من البنك المركزي السعودي (مدى، Apple Pay، STC Pay، تابي، تمارا).",
              "لا يُبدأ بتنفيذ الطلب إلا بعد تأكيد استلام الدفع.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">٣. الشحن والتوصيل</h2>
          <ul className="mt-3 space-y-2">
            {[
              "نشحن لجميع مدن ومحافظات المملكة العربية السعودية.",
              "رسوم الشحن 25 ر.س — مجاني للطلبات التي تتجاوز 200 ر.س.",
              "مدة التوصيل 3–7 أيام عمل بعد التصنيع (لا تشمل أيام الطباعة).",
              "مدة الطباعة تتراوح بين 1–4 أيام حسب حجم وتعقيد الطلب.",
              "المواعيد تقديرية ولا تُعتبر إلزامية في حالات الظروف الاستثنائية.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">٤. طلبات التصميم المخصص</h2>
          <ul className="mt-3 space-y-2">
            {[
              "يمر الطلب المخصص بمراحل: مراجعة → قبول/رفض → دفع → طباعة → شحن.",
              "لا يُطلب منك أي دفع قبل موافقتنا على الطلب وتحديد السعر النهائي.",
              "يحق لنا رفض أي طلب لا يمكن تنفيذه تقنيًا أو يخالف الأنظمة والآداب العامة.",
              "بعد دفع طلب التصميم المخصص، لا يمكن الإلغاء إذا بدأت عملية الطباعة.",
              "الملفات التي ترفعها يجب أن تكون ملكك أو مرخّصة لك — أنت المسؤول عن حقوق الملكية الفكرية.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">٥. حقوق الملكية الفكرية</h2>
          <ul className="mt-3 space-y-2">
            {[
              "جميع تصاميم M3DStore الأصلية محمية بموجب نظام حماية الملكية الفكرية السعودي.",
              "يُحظر إعادة إنتاج أي تصميم أو بيعه دون إذن كتابي مسبق.",
              "عند شراء منتج، تحصل على حق الاستخدام الشخصي فقط — لا حق إعادة البيع التجاري.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">٦. حدود المسؤولية</h2>
          <ul className="mt-3 space-y-2">
            {[
              "مسؤوليتنا القصوى تقتصر على قيمة الطلب المدفوع.",
              "لا نتحمل أي أضرار غير مباشرة ناتجة عن تأخر الشحن أو قصور المنتج.",
              "المنتجات غير مضمونة ضد سوء الاستخدام أو التعرض المطوّل للحرارة أو الرطوبة.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">٧. القانون المطبّق والاختصاص القضائي</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            تخضع هذه الشروط لأنظمة المملكة العربية السعودية، وتختص المحاكم السعودية بالفصل في أي نزاع.
            نسعى دائمًا لحل أي خلاف وديًا عبر التواصل المباشر قبل اللجوء للقضاء.
          </p>
        </div>

      </div>

      <div className="mt-8 flex flex-wrap gap-4 border-t border-line pt-6 text-sm">
        <Link href="/privacy" className="font-semibold text-primary hover:underline">
          سياسة الخصوصية
        </Link>
        <Link href="/returns" className="font-semibold text-primary hover:underline">
          سياسة الإرجاع والاستبدال
        </Link>
        <Link href="/" className="text-muted hover:text-primary">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
