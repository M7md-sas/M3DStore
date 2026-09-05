import type { Metadata } from "next";
import Link from "next/link";
import { whatsappLink, instagramLink, INSTAGRAM_HANDLE } from "@/lib/format";
import { CR_NUMBER, CR_LABEL, CR_AUTHORITY } from "@/lib/site";
import { PrinterIcon, TruckIcon, WhatsAppIcon, InstagramIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "M3DStore متجر سعودي للطباعة ثلاثية الأبعاد — قطع تُطبع بعد طلبك باللون الذي تختاره، يديره صاحبه بموجب وثيقة عمل حر سارية.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold md:text-4xl">من نحن</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        M3DStore متجر سعودي صغير للطباعة ثلاثية الأبعاد. لا مستودع ولا رفوف
        مليانة — القطعة تُطبع بعد طلبك أنت، باللون الذي تختاره، ثم تُشحن لك.
      </p>

      <section className="panel-soft mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-extrabold">كيف تُصنع قطعتك</h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              icon: <PrinterIcon width={20} height={20} />,
              t: "تختار القطعة ولونها",
              d: "عندنا عشرون لون فتيل. تختار لونك عند الطلب، فتصلك القطعة كما تخيّلتها لا كما توفّر.",
            },
            {
              icon: <PrinterIcon width={20} height={20} />,
              t: "نطبعها بخامة PLA",
              d: "طباعة طبقة فوق طبقة بدقة عالية. مدة التجهيز مكتوبة على كل منتج قبل أن تدفع، لا بعده.",
            },
            {
              icon: <TruckIcon width={20} height={20} />,
              t: "نشحنها لبابك",
              d: "لكل مدن المملكة، مع رمز تتبّع تشوف فيه حالة طلبك أول بأول.",
            },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                {s.icon}
              </span>
              <div>
                <h3 className="font-bold">
                  <span className="text-muted tabular">{i + 1}.</span> {s.t}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel-soft mt-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-extrabold">ما الذي نعد به فعلًا</h2>
        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
          <li>
            <strong className="text-foreground">تاريخ صادق لا وعد جميل.</strong> إن
            تأخر طلبك نقول لك ولماذا، ولا نقول «جاهز» وهو لم يُطبع بعد.
          </li>
          <li>
            <strong className="text-foreground">لون تختاره أنت.</strong> وإن أردت
            لونًا أو مقاسًا غير المعروض، كلّمنا قبل الطلب ونقول لك يصير أو ما يصير.
          </li>
          <li>
            <strong className="text-foreground">إرجاع واضح.</strong> راجع{" "}
            <Link href="/returns" className="font-bold text-primary hover:underline">
              سياسة الإرجاع
            </Link>{" "}
            — مكتوبة بلا ألغاز.
          </li>
        </ul>
      </section>

      <section className="panel-soft mt-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-extrabold">توثيق المتجر</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          متجر يديره صاحبه بصفته الشخصية بموجب {CR_LABEL} سارية، صادرة من{" "}
          {CR_AUTHORITY}، رقمها{" "}
          <strong className="text-foreground tabular">{CR_NUMBER}</strong>. تقدر
          تتحقق منها بنفسك من المنصة الرسمية — الرابط في أسفل كل صفحة.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={whatsappLink("مرحبًا، عندي سؤال عن M3DStore")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
        >
          <WhatsAppIcon width={17} height={17} />
          كلّمنا واتساب
        </a>
        <a
          href={instagramLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-surface-2"
        >
          <InstagramIcon width={17} height={17} className="text-[#C13584]" />
          <span dir="ltr">@{INSTAGRAM_HANDLE}</span>
        </a>
      </div>
    </div>
  );
}
