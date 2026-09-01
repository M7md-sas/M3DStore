"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./cart";
import { CartIcon, MenuIcon, XIcon, CubeIcon } from "./Icons";
import { CUSTOM_ORDERS_ENABLED } from "@/lib/site";

const links = [
  { href: "/", label: "الرفّ" },
  { href: "/products", label: "المنتجات" },
  ...(CUSTOM_ORDERS_ENABLED ? [{ href: "/custom", label: "اطلب تصميمك" }] : []),
  { href: "/track", label: "تتبّع طلبك" },
];

/** ترويسة بلغة الملصق: شريط علامة أسود حاد، لا رأس شفاف ناعم */
export default function Header({ logo }: { logo: string | null }) {
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground"
          onClick={() => setOpen(false)}
        >
          {logo ? (
            <Image
              src={logo}
              alt=""
              width={36}
              height={36}
              priority
              className="h-9 w-9 border border-line object-cover"
            />
          ) : (
            <CubeIcon width={26} height={26} className="text-primary" />
          )}
          <span className="font-display text-lg font-extrabold tracking-[0.06em]">M3DSTORE</span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden items-center md:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`border-b-2 px-4 py-4 font-display text-sm font-bold transition-colors duration-200 ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground hover:border-line"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label={`سلة المشتريات — ${count} منتج`}
            className="relative flex h-10 items-center gap-2 border-2 border-line px-3 font-mono text-xs font-bold text-foreground transition-colors duration-200 hover:bg-foreground hover:text-white"
          >
            <CartIcon width={18} height={18} />
            <span className="tabular">{count}</span>
          </Link>
          <button
            type="button"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center border-2 border-line text-foreground transition-colors duration-200 hover:bg-foreground hover:text-white md:hidden"
          >
            {open ? <XIcon width={20} height={20} /> : <MenuIcon width={20} height={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="قائمة الجوال" className="border-t-2 border-line bg-surface md:hidden">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block border-b border-rule-soft px-4 py-3 font-display text-base font-bold transition-colors duration-200 ${
                  active ? "bg-primary text-white" : "text-foreground hover:bg-background"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
