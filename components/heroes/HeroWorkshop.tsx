import Link from "next/link";
import Image from "next/image";
import type { ProductRow } from "@/components/ProductCard";
import { sar, whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "@/components/Icons";
import MarkM from "./MarkM";

/**
 * الاتجاه الثاني — «الورشة»
 * الأبيض يحمل الكلام، ولوح كريمي ينزل من حافة الصفحة يحمل علامة الشعار
 * بحجم معماري. القطعة تعبر الحدّ بين اللوحين فتصنع العمق بلا ظلال مفتعلة.
 */
export default function HeroWorkshop({
  product,
  displayClass,
}: {
  product: ProductRow | null;
  displayClass: string;
}) {
  return (
    <section className="hero-workshop relative overflow-hidden bg-white">
      {/* اللوح الكريمي — يبدأ من المنتصف ويبلغ حافة الصفحة */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 hidden w-[46%] bg-[#FCF3E4] md:block"
      />
      <div
        aria-hidden
        className="absolute left-0 top-0 hidden h-full w-[46%] items-center justify-center overflow-hidden md:flex"
      >
        <MarkM
          className="hero-workshop-mark h-[115%] w-auto -translate-x-[18%] text-[#8B7744]/[0.13]"
          variant="outline"
        />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 md:grid-cols-[1fr_0.9fr] md:py-28">
        <div>
          <h1
            className={`${displayClass} text-[clamp(2.5rem,6.5vw,4.5rem)] leading-[1.15] text-[#2C2A22]`}
          >
            من الطابعة
            <span className="block text-[#7A6935]">إلى بيتك مباشرة</span>
          </h1>

          <p className="mt-7 max-w-[44ch] text-lg leading-[1.85] text-[#6B6250]">
            كل قطعة تُطبع بعد ما تطلبها — ما عندنا مخزون جاهز ولا وسيط. تختار
            الشكل واللون، ونبدأ الطباعة في نفس اليوم.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="rounded-xl bg-[#7A6935] px-8 py-4 text-base font-bold text-white transition-[background-color,transform] duration-200 hover:bg-[#5C4E2A] active:translate-y-px"
            >
              ابدأ الطلب
            </Link>
            <a
              href={whatsappLink("مرحبًا، عندي استفسار عن منتجات M3DStore")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#8B7744]/35 px-7 py-[0.875rem] text-base font-bold text-[#7A6935] transition-colors duration-200 hover:border-[#7A6935] hover:bg-[#FCF3E4]"
            >
              <WhatsAppIcon width={18} height={18} />
              اسأل عن قطعة
            </a>
          </div>

          <p className="mt-12 flex items-center gap-3 text-sm text-[#8A7059]">
            <MarkM className="h-5 w-5 shrink-0 text-[#8B7744]" />
            شحن مجاني للطلبات فوق 200 ر.س — لكل مدن المملكة
          </p>
        </div>

        {product && (
          <div className="relative md:-mr-10">
            <Link
              href={`/products/${product.id}`}
              className="group block overflow-hidden rounded-[1.75rem] bg-white shadow-[0_34px_70px_-36px_rgba(92,78,42,0.6)] ring-1 ring-[#8B7744]/12 transition-shadow duration-300 hover:shadow-[0_40px_80px_-34px_rgba(92,78,42,0.7)]"
            >
              <div className="relative aspect-square bg-white">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 400px"
                  className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
                  priority
                />
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-[#F0E7D5] px-6 py-4">
                <span className="truncate font-bold text-[#2C2A22]">{product.name}</span>
                <span className="shrink-0 font-bold text-[#7A6935] tabular">
                  {sar(product.price)}
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
