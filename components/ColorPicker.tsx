"use client";

import { COLOR_PALETTE } from "@/lib/colors";

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
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-2 px-2 py-1 text-xs font-semibold transition-colors duration-200 ${
                on
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-line bg-surface text-muted hover:border-primary/40"
              }`}
            >
              <span
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-line"
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
            </button>
          );
        })}
      </div>

      <p className="mt-1.5 text-xs text-muted">
        {selected.length === 0
          ? "بدون تحديد لون، لن يُطلب من الزبون اختيار لون إطلاقًا."
          : `${selected.length} لون — الزبون يختار من بينها فقط.`}
      </p>
    </div>
  );
}
