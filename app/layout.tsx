import type { Metadata } from "next";
import { Cairo } from "next/font/google";
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
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Header logo={logo} />
          <main className="flex-1">{children}</main>
          <Footer logo={logo} />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
