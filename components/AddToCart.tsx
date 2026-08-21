"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart";
import { CartIcon, CheckIcon, MinusIcon, PlusIcon } from "./Icons";
import type { ProductColor } from "@/lib/colors";

export default function AddToCart({
  product,
  colors,
}: {
  product: { id: number; name: string; price: number; image: string; stock: number };
  colors: ProductColor[];
}) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQtyState] = useState(1);
  const [added, setAdded] = useState(false);
  // لون واحد فقط؟ نختاره تلقائيًا فلا نضيّع خطوة على الزبون
  const [color, setColor] = useState<string>(colors.length === 1 ? colors[0].name : "");
  const [error, setError] = useState("");

  if (product.stock <= 0) {
    return (
      <div className="rounded-xl bg-danger-soft px-5 py-4 font-bold text-danger">
        نفدت الكمية حاليًا — تواصل معنا واتساب وراح نوفرها لك
      </div>
    );
  }

  const needsColor = colors.length > 0;

  const addNow = (): boolean => {
    if (needsColor && !color) {
      setError("اختر اللون أولًا");
      return false;
    }
    setError("");
    add(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        ...(needsColor ? { color } : {}),
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    return true;
  };

  return (
    <div className="flex flex-col gap-4">
      {needsColor && (
        <fieldset>
          <legend className="mb-2 text-sm font-bold">
            اللون
            {color ? (
              <span className="font-normal text-muted"> — {color}</span>
            ) : (
              <span className="font-normal text-accent"> — مطلوب</span>
            )}
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const selected = color === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setColor(c.name);
                    setError("");
                  }}
                  aria-pressed={selected}
                  title={c.name}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                    selected
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-line bg-surface hover:border-primary/40"
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-5 w-5 shrink-0 rounded-full border border-line"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                </button>
              );
            })}
          </div>
          {error && (
            <p role="alert" className="mt-2 text-sm font-bold text-danger">
              {error}
            </p>
          )}
        </fieldset>
      )}

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
          <span className="w-10 text-center text-lg font-bold tabular" aria-live="polite">
            {qty}
          </span>
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
            if (addNow()) router.push("/cart");
          }}
          className="h-12 cursor-pointer rounded-xl border-2 border-primary px-6 font-bold text-primary transition-colors duration-200 hover:bg-primary-soft"
        >
          اشترِ الآن
        </button>
      </div>
    </div>
  );
}
