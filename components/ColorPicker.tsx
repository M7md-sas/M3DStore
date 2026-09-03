"use client";

import { COLOR_PALETTE } from "@/lib/colors";
import { CheckIcon } from "@/components/Icons";

/**
 * اختيار الألوان المتوفرة فعليًا لدى صاحب المتجر.
 * ما يُختار هنا هو وحده ما يظهر للزبون في صفحة المنتج.
 */
export default function ColorPicker({
  selected,
  onChange,
  idPrefix,
}: {
  selected: string[];
  onChange: (names: string[]) => void;
  idPrefix: string;
}) {
  const toggle = (name: string) =>
    onChange(
      selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]
    );

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-bold">الألوان المتوفرة</span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="cursor-pointer text-xs font-bold text-muted transition-colors hover:text-danger"
          >
            مسح الكل
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {COLOR_PALETTE.map((c) => {
          const on = selected.includes(c.name);
          return (
            <button
              key={c.name}
              id={`${idPrefix}-${c.name}`}
              type="button"
              onClick={() => toggle(c.name)}
              aria-pressed={on}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-colors duration-200 ${
                on
                  ? "border-primary bg-primary text-white"
                  : "border-line/25 bg-surface text-muted hover:border-foreground"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  on ? "border-white/60" : "border-line/40"
                }`}
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
              {on && <CheckIcon width={12} height={12} className="shrink-0" />}
            </button>
          );
        })}
      </div>

      {selected.length === 0 ? (
        <p className="mt-2 text-xs text-muted">
          بدون تحديد لون، لن يُطلب من الزبون اختيار لون إطلاقًا.
        </p>
      ) : (
        <p className="mt-2 text-xs">
          <span className="font-bold text-foreground">المختار ({selected.length}):</span>{" "}
          <span className="text-muted">
            {COLOR_PALETTE.filter((c) => selected.includes(c.name)).map((c) => c.name).join("، ")}
          </span>
        </p>
      )}
    </div>
  );
}
