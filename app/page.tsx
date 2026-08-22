import Link from "next/link";
import { Amiri } from "next/font/google";
import { getDb } from "@/lib/db";
import ProductCard, { type ProductRow } from "@/components/ProductCard";
import { CheckIcon, PrinterIcon, ShieldIcon, TruckIcon, UploadIcon } from "@/components/Icons";
import { CUSTOM_ORDERS_ENABLED } from "@/lib/site";
import HeroWorkshop from "@/components/heroes/HeroWorkshop";

// الصوت الطباعي للعناوين — خط عربي كلاسيكي بحروف مذنّبة يعيد صدى كلمة الشعار
const display = Amiri({ subsets: ["arabic"], weight: ["700"] });

export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = getDb();
  const featured = db
    .prepare("SELECT * FROM products WHERE active = 1 ORDER BY id LIMIT 4")
    .all() as ProductRow[];

  return (
    <>
      <HeroWorkshop product={featured[0] ?? null} displayClass={display.className} />

      <div className="mx-auto max-w-6xl px-4">

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
          CUSTOM_ORDERS_ENABLED
            ? {
                icon: <UploadIcon width={24} height={24} />,
                title: "تصميمك الخاص",
                desc: "ارفع ملفك أو اشرح فكرتك، نراجعها ونرد عليك قبل أي دفع",
              }
            : {
                icon: <PrinterIcon width={24} height={24} />,
                title: "طباعة بدقة 0.2 ملم",
                desc: "كل قطعة مطبوعة عند الطلب بخامات متينة وجودة عالية",
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

      {/* كيف يعمل الطلب المخصص — يظهر فقط عند تفعيل طلبات التصميم */}
      {CUSTOM_ORDERS_ENABLED && (
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
      )}

      </div>
    </>
  );
}
