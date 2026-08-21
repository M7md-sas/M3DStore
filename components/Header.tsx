"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./cart";
import { CartIcon, CubeIcon, MenuIcon, XIcon } from "./Icons";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "المنتجات" },
  { href: "/custom", label: "اطلب تصميمك" },
  { href: "/track", label: "تتبع طلبك" },
];

export default function Header({ logo }: { logo: string | null }) {
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 text-primary" onClick={() => setOpen(false)}>
          {logo ? (
            <Image
              src={logo}
              alt="M3DStore"
              width={40}
              height={40}
              priority
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <CubeIcon width={28} height={28} />
          )}
          <span className="text-xl font-bold tracking-tight">M3DStore</span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-foreground hover:bg-primary-soft/60 hover:text-primary"
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
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
          >
            <CartIcon width={22} height={22} />
            {count > 0 && (
              <span className="absolute -top-0.5 -left-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-white tabular">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-primary-soft hover:text-primary md:hidden"
          >
            {open ? <MenuIconClose /> : <MenuIcon width={22} height={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="قائمة الجوال" className="border-t border-line bg-surface px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-4 py-3 text-base font-semibold transition-colors duration-200 ${
                  active ? "bg-primary-soft text-primary" : "text-foreground hover:bg-primary-soft/60"
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

function MenuIconClose() {
  return <XIcon width={22} height={22} />;
}
