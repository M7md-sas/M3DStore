import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { whatsappLink, leadTimeText } from "@/lib/format";
import type { ProductRow } from "@/components/ProductCard";
import ProductCard from "@/components/ProductCard";
import AddToCart from "@/components/AddToCart";
import { parseColors, parseColorMode } from "@/lib/colors";
import { productImages } from "@/lib/images";
import ProductGallery from "@/components/ProductGallery";
import { ArrowLeftIcon, ShieldIcon, TruckIcon, WhatsAppIcon, PrinterIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  const product = db
    .prepare("SELECT * FROM products WHERE id = ? AND active = 1")
    .get(Number(id)) as ProductRow | undefined;

  if (!product) notFound();

  const related = db
    .prepare("SELECT * FROM products WHERE active = 1 AND category = ? AND id != ? LIMIT 4")
    .all(product.category, product.id) as ProductRow[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/products" className="transition-colors hover:text-primary">المنتجات</Link>
        <ArrowLeftIcon width={14} height={14} />
        <span className="font-semibold text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery images={productImages(product)} alt={product.name} />

        <div>
          <span className="inline-block rounded-full bg-surface-2 px-3.5 py-1.5 text-xs font-bold text-muted">
            {product.category}
          </span>

          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-foreground md:text-4xl">
            {product.name}
          </h1>

          {/* السعر بذهبي الشعار — المكان الذي يستحقه */}
          <div className="mt-4 flex items-baseline gap-1.5 text-primary">
            <span className="text-4xl font-extrabold leading-none tabular md:text-5xl">
              {product.price}
            </span>
            <span className="text-base font-bold">ر.س</span>
          </div>

          <p className="mt-5 whitespace-pre-line leading-relaxed text-muted">
            {product.description}
          </p>

          <div className="mt-7">
            <AddToCart
              product={product}
              colors={parseColors(product.colors)}
              colorMode={parseColorMode(product.color_mode)}
            />
          </div>

          <div className="panel-soft mt-7 space-y-3.5 rounded-2xl border border-line bg-surface p-5 text-sm">
            <div className="flex items-center gap-3">
              <PrinterIcon width={20} height={20} className="shrink-0 text-primary" />
              <span>{leadTimeText(product.lead_days ?? 3)} — تُطبع بعد طلبك بخامة PLA</span>
            </div>
            <div className="flex items-center gap-3">
              <TruckIcon width={20} height={20} className="shrink-0 text-primary" />
              <span>شحن لجميع مدن المملكة — مجاني للطلبات فوق 200 ر.س</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldIcon width={20} height={20} className="shrink-0 text-success" />
              <span>الدفع بالتحويل البنكي، وتأكيد الطلب على واتساب</span>
            </div>
            <a
              href={whatsappLink(`استفسار عن المنتج: ${product.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 font-semibold text-[#0C6B39] transition-colors hover:text-[#094B28]"
            >
              <WhatsAppIcon width={20} height={20} className="shrink-0" />
              عندك سؤال عن المنتج؟ كلمنا واتساب
            </a>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-xl font-extrabold md:text-2xl">قطع تعجبك كمان</h2>
          <div className="grid grid-cols-2 gap-3.5 md:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
