import Link from "next/link";
import Image from "next/image";
import PaymentBadges from "./PaymentBadges";
import { WHATSAPP_DISPLAY, whatsappLink, instagramLink, INSTAGRAM_HANDLE } from "@/lib/format";
import { CUSTOM_ORDERS_ENABLED } from "@/lib/site";
import { CubeIcon, InstagramIcon, ShieldIcon, TruckIcon, WhatsAppIcon } from "./Icons";

export default function Footer({ logo }: { logo: string | null }) {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-primary">
            {logo ? (
              <Image
                src={logo}
                alt="M3DStore"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-cover"
              />
            ) : (
              <CubeIcon width={26} height={26} />
            )}
            <span className="text-lg font-bold">M3DStore</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            متجر سعودي متخصص في منتجات الطباعة ثلاثية الأبعاد — ديكورات، هدايا، قطع
            عملية، وتصاميم مخصصة حسب طلبك.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold">روابط سريعة</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-muted transition-colors hover:text-primary" href="/products">جميع المنتجات</Link></li>
            {CUSTOM_ORDERS_ENABLED && (
              <li><Link className="text-muted transition-colors hover:text-primary" href="/custom">اطلب تصميمك الخاص</Link></li>
            )}
            <li><Link className="text-muted transition-colors hover:text-primary" href="/track">تتبع طلبك</Link></li>
            <li><Link className="text-muted transition-colors hover:text-primary" href="/cart">سلة المشتريات</Link></li>
          </ul>
          <h3 className="mb-3 mt-5 text-sm font-bold">قانوني</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-muted transition-colors hover:text-primary" href="/privacy">سياسة الخصوصية</Link></li>
            <li><Link className="text-muted transition-colors hover:text-primary" href="/terms">الشروط والأحكام</Link></li>
            <li><Link className="text-muted transition-colors hover:text-primary" href="/returns">الإرجاع والاستبدال</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-3 text-sm font-bold">الدفع الآمن</h3>
            <PaymentBadges size="sm" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <ShieldIcon width={18} height={18} className="text-success" />
            دفع آمن ومشفّر عبر بوابات معتمدة في السعودية
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <TruckIcon width={18} height={18} className="text-primary" />
            شحن لجميع مدن المملكة
          </div>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#128C4B] transition-colors hover:text-[#0c6b39]"
          >
            <WhatsAppIcon width={18} height={18} />
            واتساب: <span dir="ltr" className="tabular">{WHATSAPP_DISPLAY}</span>
          </a>
          <a
            href={instagramLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-[#C13584] transition-colors hover:text-[#94266a]"
          >
            <InstagramIcon width={18} height={18} />
            إنستقرام: <span dir="ltr">@{INSTAGRAM_HANDLE}</span>
          </a>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} M3DStore — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
