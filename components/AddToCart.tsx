"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart";
import { CartIcon, CheckIcon, MinusIcon, PlusIcon } from "./Icons";

export default function AddToCart({
  product,
}: {
  product: { id: number; name: string; price: number; image: string; stock: number };
}) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQtyState] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) {
    return (
      <div className="rounded-xl bg-danger-soft px-5 py-4 font-bold text-danger">
        نفدت الكمية حاليًا — تواصل معنا واتساب وراح نوفرها لك
      </div>
    );
  }

  const addNow = () => {
    add({ id: product.id, name: product.name, price: product.price, image: product.image }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-xl border border-line bg-surface">
        <button
          type="button"
          aria-label="زيادة الكمية"
          onClick={() => setQtyState((v) => Math.min(v + 1, 99))}
          className="flex h-12 w-12 cursor-pointer items-center justify-center text-foreground transition-colors hover:text-primary"
        >
          <PlusIcon width={18} height={18} />
        </button>
        <span className="w-10 text-center text-lg font-bold tabular" aria-live="polite">{qty}</span>
        <button
          type="button"
          aria-label="تقليل الكمية"
          onClick={() => setQtyState((v) => Math.max(v - 1, 1))}
          className="flex h-12 w-12 cursor-pointer items-center justify-center text-foreground transition-colors hover:text-primary"
        >
          <MinusIcon width={18} height={18} />
        </button>
      </div>

      <button
        type="button"
        onClick={addNow}
        className={`flex h-12 cursor-pointer items-center gap-2 rounded-xl px-6 font-bold text-white transition-colors duration-200 ${
          added ? "bg-success" : "bg-primary hover:bg-primary-hover"
        }`}
      >
        {added ? (
          <>
            <CheckIcon width={18} height={18} /> أُضيف للسلة
          </>
        ) : (
          <>
            <CartIcon width={18} height={18} /> أضف للسلة
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          addNow();
          router.push("/cart");
        }}
        className="h-12 cursor-pointer rounded-xl border-2 border-primary px-6 font-bold text-primary transition-colors duration-200 hover:bg-primary-soft"
      >
        اشترِ الآن
      </button>
    </div>
  );
}
