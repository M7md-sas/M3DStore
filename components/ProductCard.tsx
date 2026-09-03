import Link from "next/link";
import Image from "next/image";
import { leadTimeText } from "@/lib/format";
import { parseColors } from "@/lib/colors";

export type ProductRow = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  colors?: string;
  images?: string;
  color_mode?: string;
  lead_days?: number;
};

/** رمز القطعة — يُستخدم في اللوحة والطلبات، لا في وجه الزبون */
export function partCode(id: number): string {
  return `M3D-${String(id).padStart(3, "0")}`;
}

/**
 * أحواض باستيل تدور على القطع. هذا مصدر البهجة في الرفّ:
 * القطعة الملوّنة على خلفية فاتحة تبان، والشبكة كلها تقرأ كرفّ حلويات
 * بدل صفوف من العلب السوداء. ثابتة لكل منتج لأنها مربوطة برقمه.
 */
const TINTS = ["#eaf3ff", "#fff1e2", "#e9f8ef", "#f5efff", "#fffbe0", "#ffeef2"];

export default function ProductCard({ product }: { product: ProductRow }) {
  const colors = parseColors(product.colors);
  // مخزون صفر لا يعني التوقف: القطعة تُطبع عند الطلب بمدة تجهيزها
  const madeToOrder = product.stock <= 0;
  const tint = TINTS[product.id % TINTS.length];

  return (
    <Link
      href={`/products/${product.id}`}
      className="card-soft group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-transform duration-200 hover:-translate-y-1"
    >
      {/* نافذة القطعة — الصورة تملأ الحوض ولها هامش تتنفس فيه */}
      <div className="relative aspect-square" style={{ backgroundColor: tint }}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.06]"
        />
        {madeToOrder && (
          <span className="absolute top-2.5 right-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[0.66rem] font-bold text-foreground shadow-sm backdrop-blur-sm">
            {leadTimeText(product.lead_days ?? 3)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 min-h-[2.6em] text-[0.95rem] font-bold leading-snug text-foreground">
          {product.name}
        </h3>

        {colors.length > 0 && (
          <div
            className="flex items-center gap-1.5"
            aria-label={`متوفرة بـ${colors.length} ألوان: ${colors.map((c) => c.name).join("، ")}`}
          >
            {colors.slice(0, 5).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {colors.length > 5 && (
              <span className="text-[0.7rem] font-bold text-muted tabular">
                +{colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* السعر بذهبي الشعار — أحد الأماكن القليلة التي تستحقه */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <span className="flex items-baseline gap-1 text-primary">
            <span className="text-xl font-extrabold leading-none tabular">{product.price}</span>
            <span className="text-[0.7rem] font-bold">ر.س</span>
          </span>
          <span className="rounded-full bg-primary-soft px-3.5 py-1.5 text-[0.75rem] font-bold text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
            اطلبها
          </span>
        </div>
      </div>
    </Link>
  );
}
