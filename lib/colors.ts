export type ProductColor = { name: string; hex: string };

/**
 * ألوان خيوط الطباعة الشائعة — يختار صاحب المتجر منها المتوفر لديه فعليًا،
 * فلا يطلب الزبون لونًا غير موجود.
 */
export const COLOR_PALETTE: ProductColor[] = [
  { name: "أبيض", hex: "#f8f8f6" },
  { name: "أسود", hex: "#1c1c1e" },
  { name: "رمادي", hex: "#8e9196" },
  { name: "فضي", hex: "#c7ccd1" },
  { name: "أحمر", hex: "#d92d20" },
  { name: "برتقالي", hex: "#f07f13" },
  { name: "أصفر", hex: "#f5c518" },
  { name: "ذهبي", hex: "#c9a227" },
  { name: "أخضر", hex: "#2f9e44" },
  { name: "أخضر فاتح", hex: "#8bc34a" },
  { name: "تركوازي", hex: "#0f9b8e" },
  { name: "أزرق", hex: "#1971c2" },
  { name: "أزرق فاتح", hex: "#66b2ff" },
  { name: "كحلي", hex: "#1e3a5f" },
  { name: "بنفسجي", hex: "#7048e8" },
  { name: "وردي", hex: "#e64980" },
  { name: "بني", hex: "#8b5e3c" },
  { name: "بيج", hex: "#e0d3bd" },
  { name: "شفاف", hex: "#dfe9ef" },
  { name: "مضيء بالظلام", hex: "#b8f2b1" },
];

const byName = new Map(COLOR_PALETTE.map((c) => [c.name, c]));

/** يقرأ عمود colors من قاعدة البيانات، ويتجاهل أي قيمة تالفة */
export function parseColors(raw: unknown): ProductColor[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((c) => byName.get(String(c?.name ?? "")))
      .filter((c): c is ProductColor => Boolean(c));
  } catch {
    return [];
  }
}

/** يحوّل اختيار اللوحة إلى JSON للتخزين، بلا تكرار وبترتيب اللوحة */
export function serializeColors(input: unknown): string {
  if (!Array.isArray(input)) return "[]";
  const names = new Set(
    input.map((c) => (typeof c === "string" ? c : String((c as ProductColor)?.name ?? "")))
  );
  return JSON.stringify(COLOR_PALETTE.filter((c) => names.has(c.name)));
}

/** يتحقق أن اللون المطلوب ضمن ألوان المنتج المتوفرة */
export function isColorAvailable(colorsRaw: unknown, colorName: unknown): boolean {
  const available = parseColors(colorsRaw);
  if (available.length === 0) return !colorName; // منتج بلا ألوان: لا يُقبل اختيار لون
  return available.some((c) => c.name === colorName);
}

export type ColorMode = "single" | "multi";

export function parseColorMode(raw: unknown): ColorMode {
  return raw === "multi" ? "multi" : "single";
}

/**
 * يتحقق من اختيار الزبون مقابل ألوان المنتج ونمط الاختيار.
 * يرجّع الأسماء الصالحة مرتّبة بترتيب اللوحة، أو رسالة خطأ.
 */
export function validateSelection(
  colorsRaw: unknown,
  modeRaw: unknown,
  selected: unknown
): { ok: true; colors: string[] } | { ok: false; error: string } {
  const available = parseColors(colorsRaw);
  const mode = parseColorMode(modeRaw);

  const names = (Array.isArray(selected) ? selected : selected ? [selected] : [])
    .map((c) => String(c ?? "").trim())
    .filter(Boolean);

  if (available.length === 0) {
    // منتج بلا ألوان: لا يُقبل أي اختيار
    return names.length === 0
      ? { ok: true, colors: [] }
      : { ok: false, error: "هذا المنتج ليس له ألوان" };
  }

  if (names.length === 0) return { ok: false, error: "اختر اللون" };

  const unknown = names.find((n) => !available.some((c) => c.name === n));
  if (unknown) return { ok: false, error: `اللون «${unknown}» لم يعد متوفرًا` };

  const unique = [...new Set(names)];
  if (mode === "single" && unique.length > 1)
    return { ok: false, error: "هذا المنتج بلون واحد فقط" };

  // الترتيب حسب اللوحة حتى يكون مفتاح السلة ثابتًا مهما كان ترتيب الضغط
  return { ok: true, colors: COLOR_PALETTE.filter((c) => unique.includes(c.name)).map((c) => c.name) };
}
