import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { sar, whatsappLink } from "@/lib/format";
import type { ProductRow } from "@/components/ProductCard";
import ProductCard from "@/components/ProductCard";
import AddToCart from "@/components/AddToCart";
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
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-primary-soft/40">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        <div>
          <span className="text-sm font-semibold text-muted">{product.category}</span>
          <h1 className="mt-1 text-3xl font-extrabold">{product.name}</h1>
          <p className="mt-3 text-3xl font-extrabold text-primary tabular">{sar(product.price)}</p>
          <p className="mt-5 leading-relaxed text-muted">{product.description}</p>

          <div className="mt-8">
            <AddToCart product={product} />
          </div>

          <div className="mt-8 space-y-3 rounded-2xl border border-line bg-surface p-5 text-sm">
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
              className="flex items-center gap-3 font-semibold text-[#128C4B] transition-colors hover:text-[#0c6b39]"
            >
              <WhatsAppIcon width={20} height={20} className="shrink-0" />
              عندك سؤال عن المنتج؟ كلمنا واتساب
            </a>
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
