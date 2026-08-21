import Link from "next/link";
import { getDb } from "@/lib/db";
import ProductCard, { type ProductRow } from "@/components/ProductCard";
import PaymentBadges from "@/components/PaymentBadges";
import {
  CheckIcon,
  CubeIcon,
  PrinterIcon,
  ShieldIcon,
  SparklesIcon,
  TruckIcon,
  UploadIcon,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = getDb();
  const featured = db
    .prepare("SELECT * FROM products WHERE active = 1 ORDER BY id LIMIT 4")
    .all() as ProductRow[];

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-bold text-primary">
            <SparklesIcon width={16} height={16} />
            صناعة سعودية بطابعات ثلاثية الأبعاد
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl">
            أفكارك تتحول إلى
            <span className="text-primary"> قطع حقيقية</span>
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            ديكورات وهدايا مخصصة وقطع عملية مطبوعة بدقة عالية — وإذا عندك فكرة
            خاصة، ارفعها لنا ونطبعها لك.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-xl bg-primary px-7 py-3.5 font-bold text-white transition-colors duration-200 hover:bg-primary-hover"
            >
              تصفح المنتجات
            </Link>
            <Link
              href="/custom"
              className="rounded-xl border-2 border-primary px-7 py-3.5 font-bold text-primary transition-colors duration-200 hover:bg-primary-soft"
            >
              اطلب تصميمك الخاص
            </Link>
          </div>
          <div className="mt-8">
            <PaymentBadges size="sm" />
          </div>
        </div>
        <div className="relative hidden justify-center md:flex">
          <div className="flex h-72 w-72 items-center justify-center rounded-[2.5rem] bg-primary-soft text-primary">
            <CubeIcon width={130} height={130} strokeWidth={1.2} />
          </div>
          <div className="absolute -bottom-4 -right-2 flex items-center gap-2 rounded-2xl border border-line bg-surface px-5 py-3 shadow-md">
            <PrinterIcon width={22} height={22} className="text-accent" />
            <span className="text-sm font-bold">طباعة بدقة تصل إلى 0.2 ملم</span>
          </div>
        </div>
      </section>

      {/* مزايا */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: <TruckIcon width={24} height={24} />,
            title: "شحن لكل المملكة",
            desc: "توصيل سريع لجميع المدن، ومجاني للطلبات فوق 200 ر.س",
          },
          {
            icon: <ShieldIcon width={24} height={24} />,
            title: "دفع آمن 100%",
            desc: "مدى، Apple Pay، STC Pay، تابي وتمارا عبر بوابات معتمدة",
          },
          {
            icon: <UploadIcon width={24} height={24} />,
            title: "تصميمك الخاص",
            desc: "ارفع ملفك أو اشرح فكرتك، نراجعها ونرد عليك قبل أي دفع",
          },
        ].map((f) => (
          <div key={f.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              {f.icon}
            </span>
            <div>
              <h2 className="font-bold">{f.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* منتجات مميزة */}
      <section className="py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">منتجات مميزة</h2>
            <p className="mt-1 text-muted">الأكثر طلبًا من عملائنا</p>
          </div>
          <Link
            href="/products"
            className="rounded-lg px-4 py-2 text-sm font-bold text-primary transition-colors duration-200 hover:bg-primary-soft"
          >
            عرض الكل
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* كيف يعمل الطلب المخصص */}
      <section className="rounded-3xl bg-primary-soft/60 p-8 md:p-12">
        <h2 className="text-center text-2xl font-extrabold">
          عندك فكرة؟ نطبعها لك في 4 خطوات
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-4">
          {[
            { n: "1", t: "أرسل فكرتك", d: "ارفع ملف التصميم أو صورة واشرح طلبك" },
            { n: "2", t: "نراجع الطلب", d: "نتأكد أن التصميم قابل للطباعة ونحدد السعر" },
            { n: "3", t: "توافق وتدفع", d: "بعد قبول الطلب يصلك رابط دفع آمن" },
            { n: "4", t: "نطبع ونشحن", d: "نبدأ الطباعة فورًا ويوصلك المنتج لباب البيت" },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-white tabular">
                {s.n}
              </span>
              <h3 className="mt-4 font-bold">{s.t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/custom"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-bold text-white transition-colors duration-200 hover:bg-primary-hover"
          >
            <CheckIcon width={18} height={18} />
            ابدأ طلبك المخصص الآن
          </Link>
        </div>
      </section>
    </div>
  );
}
