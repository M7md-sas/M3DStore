import Link from "next/link";
import Image from "next/image";
import type { ProductRow } from "@/components/ProductCard";
import { sar } from "@/lib/format";
import { ArrowLeftIcon } from "@/components/Icons";

/**
 * الاتجاه الثالث — «الطبقة»
 * خطوط الطباعة الأفقية تتراكم خلف العنوان كما تتراكم طبقات الفتيل،
 * والقطعة تظهر داخل قوس كريمي يعيد صدى زاوية حرف الشعار.
 */
export default function HeroLayers({
  product,
  displayClass,
}: {
  product: ProductRow | null;
  displayClass: string;
}) {
  return (
    <section className="hero-layers relative overflow-hidden bg-white">
      <div aria-hidden className="hero-layers-lines absolute inset-x-0 top-0 h-[60%]" />

      <div className="relative mx-auto grid max-w-6xl items-end gap-12 px-6 pb-16 pt-20 md:grid-cols-[1.1fr_0.9fr] md:pb-20 md:pt-28">
        <div>
          <h1
            className={`${displayClass} text-[clamp(2.75rem,7.5vw,5.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#2C2A22]`}
          >
            طبقة
            <span className="text-[#C39363]"> فوق </span>
            طبقة
            <span className="mt-2 block text-[#7A6935]">حتى تصير قطعة</span>
          </h1>

          <p className="mt-8 max-w-[45ch] text-lg leading-[1.85] text-[#6B6250]">
            كل قطعة عندنا تُبنى طبقة بسمك ‎0.2‎ ملم، من أول ملف التصميم إلى آخر
            لمسة تلميع. ديكورات، هدايا، وقطع عملية تنفع كل يوم.
          </p>

          <div className="mt-10 inline-flex flex-wrap items-stretch overflow-hidden rounded-2xl">
            <Link
              href="/products"
              className="group flex items-center gap-3 bg-[#7A6935] px-8 py-4 text-base font-bold text-white transition-colors duration-200 hover:bg-[#5C4E2A]"
            >
              تصفّح المنتجات
              <ArrowLeftIcon
                width={18}
                height={18}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />
            </Link>
            <Link
              href="/track"
              className="flex items-center bg-[#FCF3E4] px-7 py-4 text-base font-bold text-[#7A6935] transition-colors duration-200 hover:bg-[#F4E7CE]"
            >
              تتبّع طلبك
            </Link>
          </div>
        </div>

        {product && (
          <div className="relative">
            {/* القوس الكريمي — الفتحة التي تُعرض فيها القطعة */}
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-full rounded-b-[2rem] bg-[#FCF3E4]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 85vw, 380px"
                className="object-contain p-9"
                priority
              />
            </div>
            <Link
              href={`/products/${product.id}`}
              className="mx-auto mt-5 flex max-w-sm items-baseline justify-between gap-4 border-t-2 border-[#8B7744] pt-3 transition-colors hover:border-[#C39363]"
            >
              <span className="truncate font-bold text-[#2C2A22]">{product.name}</span>
              <span className="shrink-0 font-bold text-[#7A6935] tabular">
                {sar(product.price)}
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
