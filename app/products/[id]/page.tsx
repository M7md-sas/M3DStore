import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { sar, whatsappLink } from "@/lib/format";
import type { ProductRow } from "@/components/ProductCard";
import ProductCard, { partCode } from "@/components/ProductCard";
import AddToCart from "@/components/AddToCart";
import { parseColors, parseColorMode } from "@/lib/colors";
import { productImages } from "@/lib/images";
import ProductGallery from "@/components/ProductGallery";
import { ArrowLeftIcon, ShieldIcon, TruckIcon, WhatsAppIcon } from "@/components/Icons";

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/products" className="transition-colors hover:text-primary">المنتجات</Link>
        <ArrowLeftIcon width={14} height={14} />
        <span className="font-semibold text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={productImages(product)} alt={product.name} />

        <div className="border-2 border-line bg-surface">
          <div className="flex items-center justify-between gap-2 border-b-2 border-line bg-primary px-4 py-2">
            <span className="font-display text-xs font-bold tracking-[0.16em] text-white">
              {product.category}
            </span>
            <span className="font-mono text-xs font-bold text-white/85" dir="ltr">
              {partCode(product.id)}
            </span>
          </div>

          <div className="p-5">
          <h1 className="font-display text-2xl font-extrabold leading-tight md:text-3xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-end gap-2 border-y-2 border-line py-3">
            <span className="font-mono text-xs text-muted" dir="ltr">SAR</span>
            <span className="font-display text-5xl font-extrabold leading-none text-foreground tabular">
              {product.price}
            </span>
          </div>

          <p className="mt-4 whitespace-pre-line leading-relaxed text-muted">{product.description}</p>

          <div className="mt-8">
            <AddToCart
              product={product}
              colors={parseColors(product.colors)}
              colorMode={parseColorMode(product.color_mode)}
            />
          </div>

          <div className="mt-6 space-y-3 border-2 border-line bg-background p-4 text-sm">
            <div className="flex items-center gap-3">
              <TruckIcon width={20} height={20} className="shrink-0 text-primary" />
              <span>شحن لجميع مدن المملكة — مجاني للطلبات فوق 200 ر.س</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldIcon width={20} height={20} className="shrink-0 text-success" />
              <span>دفع آمن: مدى، Apple Pay، STC Pay، تابي، تمارا</span>
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
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-extrabold">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
