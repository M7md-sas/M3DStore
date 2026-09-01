import Link from "next/link";
import Image from "next/image";
import PaymentBadges from "./PaymentBadges";
import { WHATSAPP_DISPLAY, whatsappLink, instagramLink, INSTAGRAM_HANDLE } from "@/lib/format";
import { CUSTOM_ORDERS_ENABLED } from "@/lib/site";
import { commercialRegister } from "@/lib/cr";
import { CubeIcon, InstagramIcon, WhatsAppIcon } from "./Icons";

/** تذييل بلغة الملصق: كتل محدودة بخطوط سوداء، وبيانات لا فقرات */
export default function Footer({ logo }: { logo: string | null }) {
  const cr = commercialRegister();
  const quickLinks = [
    { href: "/products", label: "جميع المنتجات" },
    ...(CUSTOM_ORDERS_ENABLED ? [{ href: "/custom", label: "اطلب تصميمك الخاص" }] : []),
    { href: "/track", label: "تتبّع طلبك" },
    { href: "/cart", label: "سلة المشتريات" },
  ];

  return (
    <footer className="mt-10 border-t-2 border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-0 border-x-2 border-line md:grid-cols-3">
          {/* العلامة */}
          <div className="border-b-2 border-line p-5 md:border-b-0 md:border-l-2">
            <div className="flex items-center gap-2.5">
              {logo ? (
                <Image
                  src={logo}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 border border-line object-cover"
                />
              ) : (
                <CubeIcon width={26} height={26} className="text-primary" />
              )}
              <span className="font-display text-lg font-extrabold tracking-[0.06em]">
                M3DSTORE
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              قطع مطبوعة ثلاثية الأبعاد تُصنع بعد الطلب — ديكورات، هدايا، وقطع عملية.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 font-mono text-sm font-bold text-[#0C6B39] transition-colors hover:text-[#094B28]"
              >
                <WhatsAppIcon width={16} height={16} />
                <span dir="ltr">{WHATSAPP_DISPLAY}</span>
              </a>
              <a
                href={instagramLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 font-mono text-sm font-bold text-[#C13584] transition-colors hover:text-[#94266a]"
              >
                <InstagramIcon width={16} height={16} />
                <span dir="ltr">@{INSTAGRAM_HANDLE}</span>
              </a>
            </div>
          </div>

          {/* الروابط */}
          <div className="border-b-2 border-line p-5 md:border-b-0 md:border-l-2">
            <h3 className="font-mono text-[0.62rem] tracking-[0.12em] text-muted">روابط</h3>
            <ul className="mt-3 space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    className="font-display text-sm font-bold text-foreground transition-colors hover:text-primary"
                    href={l.href}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-5 font-mono text-[0.62rem] tracking-[0.12em] text-muted">قانوني</h3>
            <ul className="mt-3 space-y-2">
              {[
                { href: "/privacy", label: "سياسة الخصوصية" },
                { href: "/terms", label: "الشروط والأحكام" },
                { href: "/returns", label: "الإرجاع والاستبدال" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    className="text-sm text-muted transition-colors hover:text-primary"
                    href={l.href}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* الشحن والدفع */}
          <div className="p-5">
            <h3 className="font-mono text-[0.62rem] tracking-[0.12em] text-muted">الشحن</h3>
            <p className="mt-2 font-display text-sm font-bold">
              25 ر.س لكل المملكة — مجاني فوق 200 ر.س
            </p>

            <h3 className="mt-5 font-mono text-[0.62rem] tracking-[0.12em] text-muted">الدفع</h3>
            <div className="mt-2">
              <PaymentBadges size="sm" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-x-2 border-t-2 border-line px-5 py-3">
          <p className="font-mono text-[0.68rem] text-muted">
            © {new Date().getFullYear()} M3DSTORE — الرياض، السعودية
          </p>
          {cr && (
            <p className="font-mono text-[0.68rem] text-muted">
              السجل التجاري:{" "}
              {cr.file ? (
                <a
                  href={cr.file}
                  download
                  className="font-bold text-foreground underline decoration-2 underline-offset-4 transition-colors hover:text-primary"
                  dir="ltr"
                >
                  {cr.number}
                </a>
              ) : (
                <span className="font-bold text-foreground" dir="ltr">
                  {cr.number}
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
