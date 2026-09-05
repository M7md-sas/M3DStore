import type { Metadata } from "next";
import Link from "next/link";
import {
  whatsappLink,
  WHATSAPP_DISPLAY,
  instagramLink,
  INSTAGRAM_HANDLE,
} from "@/lib/format";
import { CR_NUMBER, CR_LABEL } from "@/lib/site";
import { WhatsAppIcon, InstagramIcon, PackageIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description:
    "تواصل مع M3DStore عبر واتساب أو إنستقرام — للاستفسار عن طلب أو طلب لون أو مقاس غير معروض.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold md:text-4xl">تواصل معنا</h1>
      <p className="mt-3 text-muted">
        واتساب أسرع طريقة للوصول لنا، ونرد عادة خلال ساعات النهار.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href={whatsappLink("مرحبًا، عندي استفسار عن متجر M3DStore")}
          target="_blank"
          rel="noopener noreferrer"
          className="card-soft rounded-2xl border border-line bg-surface p-6 transition-transform hover:-translate-y-1"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9f8ef] text-[#0C6B39]">
            <WhatsAppIcon width={22} height={22} />
          </span>
          <h2 className="mt-3.5 font-bold">واتساب</h2>
          <p className="mt-1 text-sm text-muted tabular" dir="ltr">
            {WHATSAPP_DISPLAY}
          </p>
          <p className="mt-1.5 text-sm text-muted">
            للاستفسار عن طلب، أو طلب لون أو مقاس غير معروض.
          </p>
        </a>

        <a
          href={instagramLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="card-soft rounded-2xl border border-line bg-surface p-6 transition-transform hover:-translate-y-1"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fdeef5] text-[#C13584]">
            <InstagramIcon width={22} height={22} />
          </span>
          <h2 className="mt-3.5 font-bold">إنستقرام</h2>
          <p className="mt-1 text-sm text-muted" dir="ltr">
            @{INSTAGRAM_HANDLE}
          </p>
          <p className="mt-1.5 text-sm text-muted">
            صور القطع الجديدة أول ما تنزل.
          </p>
        </a>
      </div>

      <section className="panel-soft mt-6 rounded-2xl border border-line bg-surface p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
          <PackageIcon width={22} height={22} />
        </span>
        <h2 className="mt-3.5 font-bold">عندك طلب قائم؟</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          تقدر تشوف حالته بنفسك في{" "}
          <Link href="/track" className="font-bold text-primary hover:underline">
            صفحة التتبع
          </Link>{" "}
          — أسرع من انتظار الرد. ولو نسيت رمز طلبك، كلّمنا واتساب برقم جوالك
          ونستخرجه لك.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-surface-2 p-6">
        <h2 className="text-sm font-bold">بيانات المتجر</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          M3DStore — الرياض، المملكة العربية السعودية
          <br />
          {CR_LABEL}: <span className="tabular">{CR_NUMBER}</span>
          <br />
          متجر يديره صاحبه بصفته الشخصية بموجب وثيقة عمل حر سارية.
        </p>
      </section>
    </div>
  );
}
