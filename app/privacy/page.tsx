import type { Metadata } from "next";
import Link from "next/link";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "كيف يجمع متجر M3DStore بياناتك الشخصية ويستخدمها ويحميها وفق نظام حماية البيانات الشخصية السعودي.",
};

const sections = [
  {
    title: "ما البيانات التي نجمعها؟",
    items: [
      "الاسم ورقم الجوال والمدينة والعنوان — لتنفيذ الطلبات وتسليمها.",
      "ملفات التصميم التي ترفعها (STL / OBJ / صور) — لمعالجة طلبات التصميم المخصص فقط.",
      "تفاصيل الطلب (المنتجات، الأسعار، وسيلة الدفع) — لإتمام عملية الشراء.",
      "لا نجمع بيانات بطاقات البنك مباشرةً؛ تُعالج عبر بوابة الدفع المرخّصة (Moyasar / Tap) بمعزل تام عنّا.",
    ],
  },
  {
    title: "لماذا نجمع هذه البيانات؟",
    items: [
      "تنفيذ طلبك وإيصاله وإشعارك بحالته.",
      "مراجعة التصاميم المخصصة وتقديم عروض الأسعار.",
      "التواصل معك في حال وجود مشكلة أو استفسار.",
      "الامتثال للمتطلبات النظامية (الفواتير، السجلات التجارية).",
    ],
  },
  {
    title: "من يطّلع على بياناتك؟",
    items: [
      "فريقنا الداخلي فقط لأغراض تنفيذ الطلبات.",
      "شركة الشحن — الاسم والعنوان فقط لتسليم الطلب.",
      "بوابة الدفع المرخّصة — لمعالجة المدفوعات بشكل مشفّر.",
      "لا نبيع بياناتك ولا نشاركها مع أي طرف ثالث لأغراض تسويقية.",
    ],
  },
  {
    title: "كم تبقى بياناتك لدينا؟",
    items: [
      "بيانات الطلبات تُحفظ لمدة 5 سنوات وفق متطلبات الفواتير الضريبية.",
      "ملفات التصميم المرفوعة تُحذف خلال 90 يومًا من إغلاق الطلب.",
      "يحق لك طلب حذف بياناتك مبكرًا بالتواصل معنا واتساب.",
    ],
  },
  {
    title: "حقوقك وفق نظام حماية البيانات الشخصية السعودي",
    items: [
      "الاطلاع: معرفة ما لدينا من بيانات عنك.",
      "التصحيح: طلب تعديل أي بيانات غير دقيقة.",
      "الحذف: طلب مسح بياناتك في الحالات التي يجيزها النظام.",
      "للتواصل بخصوص أي من هذه الحقوق: راسلنا واتساب أو أرسل طلبك كتابيًا.",
    ],
  },
  {
    title: "الأمان",
    items: [
      "قاعدة البيانات محمية على خادم خاص ولا يمكن الوصول إليها عامّيًا.",
      "الملفات المرفوعة تُخزّن برموز عشوائية (UUID) — لا يمكن تخمين مساراتها.",
      "الاتصال بين المتصفح والخادم مشفّر بـ HTTPS.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-muted">آخر تحديث: يوليو 2026</p>
      <h1 className="mt-2 text-3xl font-extrabold">سياسة الخصوصية</h1>
      <p className="mt-3 leading-relaxed text-muted">
        يلتزم متجر <strong className="text-foreground">M3DStore</strong> بحماية خصوصيتك وفق{" "}
        <strong className="text-foreground">نظام حماية البيانات الشخصية السعودي (PDPL)</strong>. توضّح هذه
        الصفحة ما نجمعه، وكيف نستخدمه، وحقوقك كاملة.
      </p>

      <div className="mt-8 space-y-6">
        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-extrabold">{s.title}</h2>
            <ul className="mt-3 space-y-2">
              {s.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-primary-soft p-6 text-sm leading-relaxed">
        <p className="font-bold text-primary">تواصل معنا</p>
        <p className="mt-1 text-muted">
          لأي استفسار عن بياناتك أو لممارسة حقوقك، تواصل معنا مباشرةً عبر{" "}
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            واتساب
          </a>
          .
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 border-t border-line pt-6 text-sm">
        <Link href="/terms" className="font-semibold text-primary hover:underline">
          الشروط والأحكام
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
