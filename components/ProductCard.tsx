import Link from "next/link";
import Image from "next/image";
import { sar } from "@/lib/format";
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
};

/** رمز القطعة كما يُختم على ملصق البكرة — ثابت لكل منتج */
export function partCode(id: number): string {
  return `M3D-${String(id).padStart(3, "0")}`;
}

/**
 * ملصق مواصفات، لا بطاقة متجر.
 * شريط العلامة الزيتوني فوق، القطعة في نافذتها، ثم شبكة بيانات مختومة:
 * الرمز والسعر ورقاقات الألوان المتاحة. الحدّ أسود حاد لأن الملصق جسم.
 */
export default function ProductCard({ product }: { product: ProductRow }) {
  const colors = parseColors(product.colors);
  const out = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col border-2 border-line bg-surface transition-transform duration-200 hover:-translate-y-1"
    >
      {/* شريط العلامة */}
      <div className="flex items-center justify-between gap-2 bg-primary px-3 py-1.5">
        <span className="font-display text-[0.68rem] font-bold tracking-[0.16em] text-white">
          M3DSTORE
        </span>
        <span className="font-mono text-[0.68rem] font-bold text-white/85" dir="ltr">
          {partCode(product.id)}
        </span>
      </div>

      {/* نافذة القطعة */}
      <div className="relative aspect-square border-b-2 border-line bg-white">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {out && (
          <span className="absolute inset-x-0 bottom-0 bg-danger py-1 text-center font-display text-[0.7rem] font-bold tracking-wide text-white">
            نفدت الكمية
          </span>
        )}
      </div>

      {/* شبكة البيانات */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-[2.6em] font-display text-[0.95rem] font-bold leading-snug text-foreground">
          {product.name}
        </h3>

        <div className="mt-2 flex items-end justify-between gap-2 border-t border-rule-soft pt-2">
          <div>
            <span className="block font-mono text-[0.62rem] tracking-[0.12em] text-muted" dir="ltr">
              SAR
            </span>
            <span className="font-display text-2xl font-extrabold leading-none text-foreground tabular">
              {product.price}
            </span>
          </div>

          {colors.length > 0 && (
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-[0.62rem] tracking-[0.12em] text-muted" dir="ltr">
                {colors.length} COLORS
              </span>
              <div
                className="flex gap-1"
                aria-label={`الألوان المتاحة: ${colors.map((c) => c.name).join("، ")}`}
              >
                {colors.slice(0, 5).map((c) => (
                  <span
                    key={c.name}
                    title={c.name}
                    className="h-4 w-4 border border-line"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* شريط الإجراء — يُختم بالأسود عند التحويم */}
      <span className="border-t-2 border-line bg-white py-2 text-center font-display text-[0.8rem] font-bold text-foreground transition-colors duration-200 group-hover:bg-foreground group-hover:text-white">
        {sar(product.price)} — اطلبها
      </span>
    </Link>
  );
}
