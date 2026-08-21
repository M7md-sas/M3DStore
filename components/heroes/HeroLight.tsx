import Link from "next/link";
import Image from "next/image";
import type { ProductRow } from "@/components/ProductCard";
import { sar, instagramLink } from "@/lib/format";
import { InstagramIcon } from "@/components/Icons";

/**
 * الاتجاه الأول — «الضوء»
 * أبيض صافٍ بلا منافس، والذهبي الزيتوني يدخل كخط وحرف وزر فقط.
 * القطعة معروضة داخل حاشية كريمية كما تُعرض اللوحة، لا كبطاقة متجر.
 */
export default function HeroLight({
  product,
  displayClass,
}: {
  product: ProductRow | null;
  displayClass: string;
}) {
  return (
    <section className="hero-light relative overflow-hidden bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.05fr_1fr] md:py-28">
        <div>
          <h1
            className={`${displayClass} text-[clamp(2.75rem,7vw,5rem)] leading-[0.95] tracking-[-0.02em] text-[#2C2A22]`}
          >
            نطبع القطعة
            <span className="mt-1 block text-[#7A6935]">اللي في بالك</span>
          </h1>

          <span aria-hidden className="mt-8 block h-px w-24 bg-[#8B7744]" />

          <p className="mt-7 max-w-[46ch] text-lg leading-[1.85] text-[#6B6250]">
            ديكورات وقطع عملية تُطبع عند الطلب في الرياض بخامة PLA، بدقة تصل إلى
            ‎0.2‎ ملم. تختار اللون، ونطبعها لك قطعة قطعة.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="rounded-full bg-[#7A6935] px-8 py-4 text-base font-bold text-white transition-[background-color,transform] duration-200 hover:bg-[#5C4E2A] active:translate-y-px"
            >
              تصفّح المنتجات
            </Link>
            <a
              href={instagramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-3 py-4 text-base font-bold text-[#9A6B3C] transition-colors duration-200 hover:text-[#7A6935]"
            >
              <InstagramIcon width={18} height={18} />
              <span className="border-b border-[#C39363]/50 pb-0.5 transition-colors group-hover:border-[#7A6935]">
                شوف أعمالنا
              </span>
            </a>
          </div>

          <dl className="mt-14 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
            {[
              ["الخامة", "PLA صديقة للبيئة"],
              ["الدقة", "0.2 ملم"],
              ["الشحن", "كل المملكة"],
            ].map(([label, value], i) => (
              <div key={label} className="flex items-center gap-7">
                {i > 0 && <span aria-hidden className="h-8 w-px bg-[#E8E0CE]" />}
                <div>
                  <dt className="text-[#8A7059]">{label}</dt>
                  <dd className="mt-0.5 font-bold text-[#2C2A22]">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {product && (
          <figure className="hero-light-frame relative mx-auto w-full max-w-md">
            <div className="rounded-[2rem] bg-[#FCF3E4] p-5 shadow-[0_28px_60px_-32px_rgba(92,78,42,0.55)]">
              <div className="relative aspect-square overflow-hidden rounded-[1.4rem] bg-white">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 420px"
                  className="object-contain p-3"
                  priority
                />
              </div>
            </div>
            <figcaption className="mt-5 flex items-baseline justify-between gap-4 px-2">
              <Link
                href={`/products/${product.id}`}
                className="truncate font-bold text-[#2C2A22] underline decoration-[#C39363] decoration-1 underline-offset-[6px] transition-colors hover:text-[#7A6935]"
              >
                {product.name}
              </Link>
              <span className="shrink-0 font-bold text-[#7A6935] tabular">
                {sar(product.price)}
              </span>
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
