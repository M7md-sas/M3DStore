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

/** ترويسة فاتحة: خط فاصل ناعم، وأشكال دائرية بدل المربعات المحدودة بالأسود */
export default function Header({ logo }: { logo: string | null }) {
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground"
          onClick={() => setOpen(false)}
        >
          {logo ? (
            <Image
              src={logo}
              alt=""
              width={38}
              height={38}
              priority
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-line"
            />
          ) : (
            <CubeIcon width={26} height={26} className="text-primary" />
          )}
          <span className="font-display text-lg font-extrabold tracking-[0.06em]">M3DSTORE</span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200 ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-foreground hover:bg-surface-2"
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
            className="relative flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm font-bold text-foreground transition-colors duration-200 hover:bg-surface-2"
          >
            <CartIcon width={18} height={18} />
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.7rem] font-bold tabular ${
                count > 0 ? "bg-primary text-white" : "bg-surface-2 text-muted"
              }`}
            >
              {count}
            </span>
          </Link>
          <button
            type="button"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-foreground transition-colors duration-200 hover:bg-surface-2 md:hidden"
          >
            {open ? <XIcon width={20} height={20} /> : <MenuIcon width={20} height={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="قائمة الجوال" className="border-t border-line bg-surface p-2 md:hidden">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-4 py-3 text-base font-bold transition-colors duration-200 ${
                  active ? "bg-primary-soft text-primary" : "text-foreground hover:bg-surface-2"
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
