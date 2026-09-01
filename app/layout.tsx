import type { Metadata } from "next";
import { Cairo, Alexandria, Courier_Prime } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { findLogo } from "@/lib/logo";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// صوت الملصق: غروتيسك صناعي للأسماء والأسعار
const alexandria = Alexandria({
  variable: "--font-display",
  subsets: ["arabic", "latin"],
  weight: ["500", "700", "800"],
});

// خط الآلة للأرقام والرموز — بيانات ومقاسات، لا زينة تقنية
const mono = Courier_Prime({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  // الأساس الذي تُبنى عليه روابط المشاركة والروابط الأساسية
  metadataBase: new URL(SITE_URL),
  title: {
    default: "M3DStore — متجر الطباعة ثلاثية الأبعاد",
    template: "%s | M3DStore",
  },
  description:
    "متجر سعودي لمنتجات الطباعة ثلاثية الأبعاد: ديكورات، هدايا مخصصة، قطع عملية، وطلبات تصميم خاصة. دفع آمن بمدى وApple Pay وSTC Pay وتابي وتمارا.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "M3DStore — متجر الطباعة ثلاثية الأبعاد",
    description:
      "ديكورات وهدايا مخصصة وقطع عملية مطبوعة بدقة عالية، وطلبات تصميم خاصة. شحن لكل المملكة.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logo = findLogo();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${alexandria.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          THESIS: هذا المتجر نظام ملصقات مواصفات، لا صفحة تسويق. يرفض شاشة
          البطل التي تفتح بفقرة كلام على بياض قبل أن يرى الزائر قطعة واحدة.
          OWN-WORLD: ملصق بكرة الفتيل — بطاقة بيضاء بحدود سوداء حادة، شريط
          علامة زيتوني #8B7744 أعلاها، شبكة مواصفات بخط آلة، ومربع لون ضخم
          يملك نصف البطاقة. الحيوية من رقاقات ألوان القطع لا من لوحة المصمم.
          STORY: الزائر جاي من إنستقرام لقطعة رخيصة رآها. يفهم في ثانية أنها
          تُطبع هنا بلونه، ويضغط شراء.
          FIRST VIEWPORT: جدار ملصقات فورًا بلا مقدمة — تسع قطع بأسعارها
          وألوانها المتاحة، وأول إجراء «أضف للسلة» داخل الملصق نفسه.
          FORM: ملصق بكرة الفتيل، المرتبة الأولى في قائمتي، مثبّت باختيار
          صاحب المتجر فوق قرعة seed 3d45d827.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        */}
        <CartProvider>
          <Header logo={logo} />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer logo={logo} />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
