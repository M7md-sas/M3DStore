import Image from "next/image";
import type { CommercialRegister } from "@/lib/cr";

/**
 * كتلة توثيق المتجر: رقم وثيقة العمل الحر ورمز التحقق.
 * الرمز يفتح صفحة التحقق في منصة العمل الحر نفسها، فالزائر لا يصدّقنا بل يتحقق بنفسه.
 * شعار الوزارة يظهر بحجم تابع تحت كلمة «صادرة من» — بيان جهة الإصدار لا ادعاء رعاية.
 */
export default function VerifyBadge({ cr }: { cr: NonNullable<CommercialRegister> }) {
  return (
    <section className="panel-soft overflow-hidden rounded-2xl border border-line bg-surface">
      <h2 className="border-b border-line px-5 py-3 text-sm font-bold text-foreground">
        توثيق المتجر
      </h2>

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        {cr.qr && (
          <a
            href={cr.verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group shrink-0 self-start rounded-xl border border-line bg-white p-2 transition-colors duration-200 hover:border-primary"
          >
            <Image
              src={cr.qr}
              alt={`رمز التحقق من ${cr.label}`}
              width={96}
              height={96}
              className="h-24 w-24"
            />
            <span className="mt-1 block text-center text-[0.68rem] text-muted transition-colors group-hover:text-primary">
              امسح للتحقق
            </span>
          </a>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-muted">{cr.label}</p>
          <p
            dir="ltr"
            className="mt-1 font-display text-2xl font-extrabold text-foreground tabular sm:text-3xl"
          >
            {cr.number}
          </p>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            متجر يديره صاحبه بصفته الشخصية بموجب وثيقة عمل حر سارية. امسح الرمز أو افتح
            الرابط لتتحقق من الوثيقة في المنصة الرسمية مباشرة.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
            <a
              href={cr.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-line px-5 py-2.5 text-sm font-bold text-foreground transition-colors duration-200 hover:bg-surface-2"
            >
              تحقّق من الوثيقة
            </a>

            {cr.file && (
              <a
                href={cr.file}
                download
                className="font-display text-sm font-bold text-primary underline decoration-2 underline-offset-4 transition-colors hover:text-foreground"
              >
                تحميل الوثيقة
              </a>
            )}
          </div>

          {cr.authorityLogo && (
            <div className="mt-4 flex items-center gap-2.5 border-t border-rule-soft pt-3">
              <span className="text-[0.68rem] text-muted">صادرة من</span>
              <Image
                src={cr.authorityLogo}
                alt="وزارة الموارد البشرية والتنمية الاجتماعية"
                width={68}
                height={52}
                className="h-9 w-auto"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
