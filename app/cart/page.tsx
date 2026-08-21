"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, itemKey } from "@/components/cart";
import { sar } from "@/lib/format";
import { SHIPPING_FLAT, FREE_SHIPPING_OVER } from "@/lib/shipping";
import { CartIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/Icons";

export default function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary">
          <CartIcon width={36} height={36} />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold">سلتك فاضية</h1>
        <p className="mt-2 text-muted">تصفح منتجاتنا وأضف اللي يعجبك</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-xl bg-primary px-7 py-3.5 font-bold text-white transition-colors hover:bg-primary-hover"
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">سلة المشتريات</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={itemKey(item)}
              className="flex gap-4 rounded-2xl border border-line bg-surface p-4"
            >
              <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-primary-soft/40">
                <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/products/${item.id}`} className="font-bold transition-colors hover:text-primary">
                      {item.name}
                    </Link>
                    {item.color && (
                      <p className="mt-0.5 text-sm text-muted">اللون: {item.color}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`حذف ${item.name}${item.color ? ` (${item.color})` : ""} من السلة`}
                    onClick={() => remove(itemKey(item))}
                    className="cursor-pointer rounded-lg p-2 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <TrashIcon width={18} height={18} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-line">
                    <button
                      type="button"
                      aria-label="زيادة الكمية"
                      onClick={() => setQty(itemKey(item), item.qty + 1)}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center transition-colors hover:text-primary"
                    >
                      <PlusIcon width={15} height={15} />
                    </button>
                    <span className="w-8 text-center font-bold tabular">{item.qty}</span>
                    <button
                      type="button"
                      aria-label="تقليل الكمية"
                      onClick={() => setQty(itemKey(item), item.qty - 1)}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center transition-colors hover:text-primary"
                    >
                      <MinusIcon width={15} height={15} />
                    </button>
                  </div>
                  <span className="font-extrabold text-primary tabular">{sar(item.price * item.qty)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-extrabold">ملخص الطلب</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">المجموع الفرعي</dt>
              <dd className="font-bold tabular">{sar(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">الشحن</dt>
              <dd className={`font-bold tabular ${shipping === 0 ? "text-success" : ""}`}>
                {shipping === 0 ? "مجاني" : sar(shipping)}
              </dd>
            </div>
            {shipping > 0 && (
              <p className="rounded-lg bg-accent-soft px-3 py-2 text-xs font-semibold text-accent">
                أضف {sar(FREE_SHIPPING_OVER - subtotal)} للحصول على شحن مجاني
              </p>
            )}
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-extrabold">الإجمالي</dt>
              <dd className="font-extrabold text-primary tabular">{sar(total)}</dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className="mt-6 block rounded-xl bg-primary py-3.5 text-center font-bold text-white transition-colors hover:bg-primary-hover"
          >
            إتمام الطلب
          </Link>
          <Link
            href="/products"
            className="mt-3 block rounded-xl py-2.5 text-center text-sm font-bold text-primary transition-colors hover:bg-primary-soft"
          >
            مواصلة التسوق
          </Link>
        </aside>
      </div>
    </div>
  );
}
