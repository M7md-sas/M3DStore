import Link from "next/link";
import { getDb } from "@/lib/db";
import ProductCard, { type ProductRow } from "@/components/ProductCard";
import { instagramLink, INSTAGRAM_HANDLE, whatsappLink } from "@/lib/format";
import { InstagramIcon, WhatsAppIcon, PrinterIcon, TruckIcon } from "@/components/Icons";
import { parseColors } from "@/lib/colors";
import { COLOR_PALETTE } from "@/lib/colors";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = getDb();
  const products = db
    .prepare("SELECT * FROM products WHERE active = 1 ORDER BY price")
    .all() as ProductRow[];

  // ألوان الرفّ كله — الحيوية تجي من ألوان القطع لا من لوحة المصمم
  const stocked = new Set<string>();
  for (const p of products) for (const c of parseColors(p.colors)) stocked.add(c.name);
  const shelfColors = COLOR_PALETTE.filter((c) => stocked.has(c.name));

  const cheapest = products.length ? Math.min(...products.map((p) => p.price)) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      {/* لوح المخزون — سطر واحد يقول كل شيء، ثم القطع فورًا */}
      <section className="border-2 border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b-2 border-line bg-primary px-4 py-3">
          <h1 className="font-display text-lg font-bold tracking-wide text-white md:text-xl">
            قطع مطبوعة عند الطلب — تختار اللون ونطبعها لك
          </h1>
          <a
            href={instagramLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white/40 px-3 py-1.5 font-mono text-xs font-bold text-white transition-colors hover:bg-white hover:text-primary"
          >
            <InstagramIcon width={15} height={15} />
            <span dir="ltr">@{INSTAGRAM_HANDLE}</span>
          </a>
        </div>

        {/* الفواصل بـgap على أرضية سوداء — أنظف من حدود لكل خلية تتضاعف عند التلاصق */}
        <dl className="grid grid-cols-2 gap-px bg-line text-center md:grid-cols-4">
          {[
            ["قطعة معروضة", String(products.length)],
            ["تبدأ من", `${cheapest} ر.س`],
            ["دقة الطبقة", "0.2 مم"],
            ["لون متوفر", String(shelfColors.length)],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface px-3 py-3">
              <dt className="font-mono text-[0.62rem] tracking-[0.12em] text-muted">{label}</dt>
              <dd className="mt-0.5 font-display text-xl font-extrabold text-foreground tabular">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {shelfColors.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t-2 border-line px-4 py-3">
            <span className="font-mono text-[0.62rem] tracking-[0.12em] text-muted">
              الفتيل المتوفر
            </span>
            <div className="flex flex-wrap gap-1.5">
              {shelfColors.map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="h-5 w-5 border border-line"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* الرفّ — هذا هو المتجر */}
      <section className="mt-6">
        <div className="mb-3 flex items-baseline justify-between gap-4 border-b-2 border-line pb-2">
          <h2 className="font-display text-base font-bold tracking-wide text-foreground">
            كل القطع
          </h2>
          <Link
            href="/products"
            className="font-mono text-xs font-bold text-primary underline decoration-2 underline-offset-4 transition-colors hover:text-foreground"
          >
            تصفية حسب الفئة
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="border-2 border-dashed border-line bg-surface p-12 text-center">
            <p className="font-display text-lg font-bold">الرفّ فاضي حاليًا</p>
            <p className="mt-1 text-sm text-muted">سعّر منتجاتك من لوحة التحكم ليظهروا هنا.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* الإثبات — ثلاثة أسطر بيانات، لا بطاقات أيقونات */}
      <section className="mt-6 border-2 border-line bg-surface">
        <h2 className="border-b-2 border-line bg-foreground px-4 py-2 font-display text-sm font-bold tracking-wide text-white">
          كيف تشتغل الطلبية
        </h2>
        <div className="divide-y divide-rule-soft">
          {[
            {
              icon: <PrinterIcon width={20} height={20} />,
              t: "ما فيه مخزون جاهز",
              d: "القطعة ما هي موجودة قبل طلبك. تُطبع بعده بخامة PLA، طبقة بسمك 0.2 مم.",
            },
            {
              icon: <TruckIcon width={20} height={20} />,
              t: "الشحن 25 ر.س، ومجاني فوق 200",
              d: "لكل مدن المملكة، ويوصلك رمز تتبّع تشوف فيه حالة الطلب أول بأول.",
            },
            {
              icon: <WhatsAppIcon width={20} height={20} />,
              t: "تبي لونًا أو مقاسًا غير المعروض؟",
              d: "كلّمنا واتساب قبل الطلب ونقول لك يصير أو ما يصير، بصراحة.",
            },
          ].map((row) => (
            <div key={row.t} className="flex gap-3 px-4 py-3">
              <span className="mt-0.5 shrink-0 text-primary">{row.icon}</span>
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">{row.t}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{row.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-line px-4 py-3">
          <a
            href={whatsappLink("مرحبًا، عندي سؤال عن قطعة في M3DStore")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-line px-4 py-2 font-display text-sm font-bold text-foreground transition-colors hover:bg-foreground hover:text-white"
          >
            <WhatsAppIcon width={16} height={16} />
            اسأل قبل ما تطلب
          </a>
        </div>
      </section>
    </div>
  );
}
