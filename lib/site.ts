/** الدومين الرسمي للمتجر — يُستخدم في روابط المشاركة وخريطة الموقع */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://m3dstoreksa.com";
export const SITE_NAME = "M3DStore";

/**
 * طلبات التصميم المخصص — معطّلة حاليًا للتركيز على المنتجات.
 * لإعادة تفعيلها: غيّر false إلى true في السطر تحت، وأعد تشغيل الخادم.
 * كل الكود وقاعدة البيانات ولوحة التحكم باقية كما هي، مخفية فقط.
 */
export const CUSTOM_ORDERS_ENABLED = false;
