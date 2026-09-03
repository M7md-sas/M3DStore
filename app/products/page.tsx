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
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
        كل القطع{" "}
        <span className="text-lg font-bold text-muted tabular">({products.length})</span>
      </h1>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-200 ${
                  active
                    ? "bg-primary text-white"
                    : "border border-line bg-surface text-foreground hover:bg-surface-2"
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
            className="w-full rounded-full border border-line bg-surface py-2.5 pr-11 pl-4 text-sm outline-none transition-colors focus:border-primary md:w-64"
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted">
            <SearchIcon width={18} height={18} />
          </span>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="text-lg font-bold">ما لقينا نتائج مطابقة</p>
          <p className="mt-1 text-muted">جرب كلمة بحث ثانية أو تصفح كل المنتجات</p>
          <Link
            href="/products"
            className="mt-5 inline-block rounded-full bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-hover"
          >
            عرض كل المنتجات
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
