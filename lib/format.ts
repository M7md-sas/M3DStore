export function sar(amount: number): string {
  const n = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  return `${n} ر.س`;
}

export const ORDER_STATUS: Record<string, string> = {
  pending_payment: "بانتظار الدفع",
  paid: "تم الدفع",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

export const CUSTOM_STATUS: Record<string, string> = {
  review: "قيد المراجعة",
  approved: "مقبول — بانتظار الدفع",
  paid: "تم الدفع",
  printing: "قيد الطباعة",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  rejected: "معتذرين — غير مقبول",
};

export const PAYMENT_METHODS: { id: string; label: string }[] = [
  { id: "mada", label: "مدى" },
  { id: "applepay", label: "Apple Pay" },
  { id: "stcpay", label: "STC Pay" },
  { id: "tabby", label: "تابي — قسّمها على 4" },
  { id: "tamara", label: "تمارا — قسّمها على 4" },
];

export function paymentLabel(id: string): string {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;
}

export const WHATSAPP_NUMBER = "966566123883";
export const WHATSAPP_DISPLAY = "0566123883";

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const INSTAGRAM_HANDLE = "m3dstore2026";

export function instagramLink(): string {
  return `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;
}

/** أول سطر من كابشن إنستقرام كاسم مقترح للمنتج */
export function captionTitle(caption: string, max = 60): string {
  const line = caption
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!line) return "";
  const clean = line.replace(/#[^\s#]+/g, "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

/** تاريخ ميلادي عربي مختصر */
export function arabicDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ar-SA-u-ca-gregory", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** نص مدة التجهيز كما يقرأه الزبون — بلا وعد بتاريخ محدد */
export function leadTimeText(days: number): string {
  const d = Math.max(0, Math.floor(days || 0));
  if (d <= 0) return "يجهز في نفس اليوم";
  if (d === 1) return "يجهز خلال يوم";
  if (d === 2) return "يجهز خلال يومين";
  if (d <= 10) return `يجهز خلال ${d} أيام`;
  return `يجهز خلال ${d} يومًا`;
}

/**
 * رابط محادثة زبون على واتساب من رقمه السعودي.
 * أرقام الزبائن تُحفظ بصيغة 05xxxxxxxx، وواتساب يطلب الصيغة الدولية
 * بلا صفر ولا رمز +، فنحوّلها هنا بدل أن ينسخ صاحب المتجر الرقم يدويًا.
 */
export function customerWhatsAppLink(phone: string, message?: string): string {
  const digits = String(phone ?? "").replace(/\D/g, "");
  const intl = digits.startsWith("966")
    ? digits
    : digits.startsWith("0")
      ? `966${digits.slice(1)}`
      : `966${digits}`;
  const base = `https://wa.me/${intl}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
