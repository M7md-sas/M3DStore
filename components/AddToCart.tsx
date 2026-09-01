"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart";
import { CartIcon, CheckIcon, MinusIcon, PlusIcon, ClockIcon } from "./Icons";
import { leadTimeText } from "@/lib/format";
import type { ProductColor, ColorMode } from "@/lib/colors";

export default function AddToCart({
  product,
  colors,
  colorMode,
}: {
  product: { id: number; name: string; price: number; image: string; stock: number; lead_days?: number };
  colors: ProductColor[];
  colorMode: ColorMode;
}) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQtyState] = useState(1);
  const [added, setAdded] = useState(false);
  // لون واحد متاح في وضع الاختيار المفرد؟ نختاره تلقائيًا فلا نضيّع خطوة
  const [selected, setSelected] = useState<string[]>(
    colorMode === "single" && colors.length === 1 ? [colors[0].name] : []
  );
  const [error, setError] = useState("");

  const needsColor = colors.length > 0;
  const multi = colorMode === "multi";

  const toggle = (name: string) => {
    setError("");
    setSelected((prev) =>
      multi
        ? prev.includes(name)
          ? prev.filter((n) => n !== name)
          : [...prev, name]
        : [name]
    );
  };

  const addNow = (): boolean => {
    if (needsColor && selected.length === 0) {
      setError(multi ? "اختر لونًا واحدًا على الأقل" : "اختر اللون أولًا");
      return false;
    }
    setError("");
    // الترتيب حسب اللوحة حتى لا يتغير مفتاح السلة بتغيّر ترتيب الضغط
    const ordered = colors.filter((c) => selected.includes(c.name)).map((c) => c.name);
    add(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        ...(needsColor ? { colors: ordered } : {}),
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
            {multi ? "الألوان" : "اللون"}
            {selected.length > 0 ? (
              <span className="font-normal text-muted"> — {selected.join("، ")}</span>
            ) : (
              <span className="font-normal text-accent">
                {multi ? " — اختر لونًا أو أكثر" : " — مطلوب"}
              </span>
            )}
          </legend>

          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const on = selected.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggle(c.name)}
                  aria-pressed={on}
                  title={c.name}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                    on
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-line bg-surface hover:border-primary/40"
                  }`}
                >
                  <span
                    aria-hidden
                    className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line"
                    style={{ backgroundColor: c.hex }}
                  >
                    {on && multi && <CheckIcon width={12} height={12} className="text-white drop-shadow" />}
                  </span>
                  {c.name}
                </button>
              );
            })}
          </div>

          {multi && (
            <p className="mt-1.5 text-xs text-muted">
              تقدر تختار أكثر من لون — نطبع القطعة بالألوان اللي تختارها.
            </p>
          )}

          {error && (
            <p role="alert" className="mt-2 text-sm font-bold text-danger">
              {error}
            </p>
          )}
        </fieldset>
      )}

      {product.stock <= 0 && (
        <p className="inline-flex w-fit items-center gap-2 border-2 border-line bg-background px-3 py-2 text-sm font-bold">
          <ClockIcon width={16} height={16} className="text-primary" />
          تُطبع عند الطلب — {leadTimeText(product.lead_days ?? 3)}
        </p>
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
