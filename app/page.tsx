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

  const facts = [
    `${products.length} قطعة على الرفّ`,
    `تبدأ من ${cheapest} ر.س`,
    "شحن لكل مدن السعودية",
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 md:py-8">
      {/* الترحيب: ضوء وبياض ولون من الباستيل — لا شريط علامة داكن */}
      <section className="joy-wash panel-soft relative overflow-hidden rounded-3xl border border-line px-5 py-8 md:px-10 md:py-14">
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3.5 py-1.5 text-xs font-bold text-muted ring-1 ring-line">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
            تُطبع بعد طلبك — باللون اللي تختاره
          </span>

          <h1 className="mt-4 text-[1.75rem] font-extrabold leading-[1.3] text-foreground md:text-5xl md:leading-[1.2]">
            اختر لونك، <span className="text-primary">ونطبعها لك</span>
          </h1>

          <p className="mt-3 max-w-lg text-[0.98rem] leading-relaxed text-muted md:text-lg">
            ألعاب تتحرك بين يديك، هدايا بأسماء، وقطع صغيرة تنفعك في البيت والسيارة.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <a
              href="#shelf"
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary-hover md:text-base"
            >
              شوف الرفّ
            </a>
            <a
              href={instagramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-bold text-foreground transition-colors duration-200 hover:bg-white"
            >
              <InstagramIcon width={16} height={16} className="text-[#C13584]" />
              <span dir="ltr">@{INSTAGRAM_HANDLE}</span>
            </a>
          </div>

          <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm font-semibold text-muted">
            {facts.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* الرفّ — هذا هو المتجر */}
      <section id="shelf" className="mt-8 scroll-mt-20">
        <div className="mb-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-extrabold text-foreground md:text-2xl">كل القطع</h2>
            <Link
              href="/products"
              className="text-sm font-bold text-primary transition-colors hover:text-primary-hover"
            >
              تصفية حسب الفئة
            </Link>
          </div>

          {shelfColors.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-xs font-bold text-muted">الفتيل المتوفر</span>
              <div className="flex flex-wrap gap-1.5">
                {shelfColors.map((c) => (
                  <span
                    key={c.name}
                    title={c.name}
                    className="rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: c.hex, height: "1.05rem", width: "1.05rem" }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-12 text-center">
            <p className="text-lg font-bold">الرفّ فاضي حاليًا</p>
            <p className="mt-1 text-sm text-muted">سعّر منتجاتك من لوحة التحكم ليظهروا هنا.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* الوعد — ثلاث بطاقات فاتحة بأيقونات في دوائر ملونة */}
      <section className="mt-12">
        <h2 className="text-xl font-extrabold text-foreground md:text-2xl">كيف تشتغل الطلبية</h2>
        <div className="mt-4 grid gap-3.5 md:grid-cols-3">
          {[
            {
              icon: <PrinterIcon width={22} height={22} />,
              tint: "#eaf3ff",
              ink: "#1d4ed8",
              t: "تُطبع بعدك، مو قبلك",
              d: "القطعة ما هي موجودة على الرفّ. نطبعها بعد طلبك بخامة PLA، بلونك اللي اخترته.",
            },
            {
              icon: <TruckIcon width={22} height={22} />,
              tint: "#e9f8ef",
              ink: "#157f43",
              t: "توصل لكل مدينة",
              d: "الشحن 25 ر.س، ومجاني فوق 200 ر.س. يوصلك رمز تتبّع تشوف فيه حالة طلبك أول بأول.",
            },
            {
              icon: <WhatsAppIcon width={22} height={22} />,
              tint: "#fff1e2",
              ink: "#a85e1b",
              t: "تبي لونًا أو مقاسًا غير المعروض؟",
              d: "كلّمنا واتساب قبل الطلب، ونقول لك يصير أو ما يصير — بصراحة.",
            },
          ].map((row) => (
            <div
              key={row.t}
              className="panel-soft rounded-2xl border border-line bg-surface p-5"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: row.tint, color: row.ink }}
              >
                {row.icon}
              </span>
              <h3 className="mt-3.5 text-base font-bold text-foreground">{row.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{row.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-center">
          <a
            href={whatsappLink("مرحبًا، عندي سؤال عن قطعة في M3DStore")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-bold text-foreground transition-colors duration-200 hover:bg-surface-2"
          >
            <WhatsAppIcon width={17} height={17} className="text-[#0C6B39]" />
            اسأل قبل ما تطلب
          </a>
        </div>
      </section>
    </div>
  );
}
