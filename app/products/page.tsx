import Link from "next/link";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import ProductCard, { type ProductRow } from "@/components/ProductCard";
import { SearchIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "المنتجات" };
export const dynamic = "force-dynamic";

const CATEGORIES = ["الكل", "ديكورات وهدايا", "قطع عملية وأدوات"];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const { cat = "الكل", q = "" } = await searchParams;
  const db = getDb();

  let sql = "SELECT * FROM products WHERE active = 1";
  const args: string[] = [];
  if (cat !== "الكل") {
    sql += " AND category = ?";
    args.push(cat);
  }
  if (q.trim()) {
    sql += " AND (name LIKE ? OR description LIKE ?)";
    args.push(`%${q.trim()}%`, `%${q.trim()}%`);
  }
  sql += " ORDER BY id DESC";
  const products = db.prepare(sql).all(...args) as ProductRow[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="border-2 border-line bg-surface">
        <h1 className="border-b-2 border-line bg-primary px-4 py-2.5 font-display text-lg font-bold tracking-wide text-white">
          كل القطع — {products.length} معروضة
        </h1>
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="تصفية حسب الفئة">
          {CATEGORIES.map((c) => {
            const href =
              c === "الكل"
                ? q ? `/products?q=${encodeURIComponent(q)}` : "/products"
                : `/products?cat=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
            const active = cat === c;
            return (
              <Link
                key={c}
                href={href}
                className={`border-2 px-5 py-2 font-display text-sm font-bold transition-colors duration-200 ${
                  active
                    ? "border-line bg-foreground text-white"
                    : "border-line bg-surface text-foreground hover:bg-background"
                }`}
              >
                {c}
              </Link>
            );
          })}
        </div>

        <form action="/products" className="relative">
          {cat !== "الكل" && <input type="hidden" name="cat" value={cat} />}
          <label htmlFor="q" className="sr-only">ابحث عن منتج</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="ابحث عن منتج..."
            className="w-full border-2 border-line bg-surface py-2.5 pr-11 pl-4 font-display text-sm outline-none transition-colors focus:bg-background md:w-64"
          />
          <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted">
            <SearchIcon width={18} height={18} />
          </span>
        </form>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="mt-6 border-2 border-dashed border-line bg-surface p-12 text-center">
          <p className="font-display text-lg font-bold">ما لقينا نتائج مطابقة</p>
          <p className="mt-1 text-muted">جرب كلمة بحث ثانية أو تصفح كل المنتجات</p>
          <Link
            href="/products"
            className="mt-5 inline-block border-2 border-line bg-foreground px-6 py-3 font-display font-bold text-white transition-colors hover:bg-primary"
          >
            عرض كل المنتجات
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
