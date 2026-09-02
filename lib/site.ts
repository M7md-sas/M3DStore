/** الدومين الرسمي للمتجر — يُستخدم في روابط المشاركة وخريطة الموقع */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://m3dstoreksa.com";
export const SITE_NAME = "M3DStore";

/**
 * طلبات التصميم المخصص — معطّلة حاليًا للتركيز على المنتجات.
 * لإعادة تفعيلها: غيّر false إلى true في السطر تحت، وأعد تشغيل الخادم.
 * كل الكود وقاعدة البيانات ولوحة التحكم باقية كما هي، مخفية فقط.
 */
export const CUSTOM_ORDERS_ENABLED = false;

/**
 * وثيقة العمل الحر — نظام التجارة الإلكترونية يلزم بعرض رقم السجل التجاري
 * «أو ما يقوم مقامه»، ووثيقة العمل الحر تقوم مقامه لمن يعمل بصفته الشخصية.
 * السطر لا يظهر في الموقع ما لم يُملأ الرقم.
 */
export const CR_NUMBER = "FL-287796864";
export const CR_LABEL = "وثيقة العمل الحر";

/**
 * رابط التحقق الرسمي في منصة العمل الحر. الجزء الأخير هو رقم الوثيقة
 * بترميز base64 — فحصناه: لا يحمل رقم هوية ولا اسمًا، ولذلك يُنشر بأمان.
 */
export const CR_VERIFY_URL =
  "https://freelance.sa/certificate-validation/certificate-validation-details/" +
  Buffer.from(CR_NUMBER).toString("base64");

export const CR_AUTHORITY = "وزارة الموارد البشرية والتنمية الاجتماعية";
export const CR_EXPIRES = "12 نوفمبر 2026";

/**
 * ملف الوثيقة (public/cr.pdf) لا يُنشر افتراضيًا: وثيقة العمل الحر تحمل
 * رقم الهوية الوطنية والاسم الكامل، ونشرها على موقع عام يكشفهما للجميع.
 * الرقم وحده يكفي نظامًا. فعّلها فقط بنسخة محجوبة الهوية.
 */
export const CR_FILE_PUBLIC = false;

/**
 * بوابة الدفع الحقيقية. ما دامت false:
 * - لا يظهر زر دفع، ولا تُقبل أي عملية دفع على الخادم.
 * - الطلب يُسجَّل ويُؤكَّد عبر واتساب — وهي طريقة البيع الفعلية اليوم.
 * تُرفع إلى true فقط بعد ربط مفاتيح ميسر الحقيقية في .env.local.
 */
export const PAYMENT_LIVE = false;

/**
 * التحويل البنكي — يعمل بلا بوابة دفع وبلا سجل تجاري.
 * املأ الحقول ليظهر الخيار للزبون؛ يبقى مخفيًا ما دام الآيبان فارغًا.
 */
export const BANK_TRANSFER = {
  iban: "",              // مثال: SA0000000000000000000000
  accountName: "",       // الاسم كما هو في الحساب البنكي
  bankName: "",          // مثال: مصرف الراجحي
};

export const bankTransferReady = () => BANK_TRANSFER.iban.trim().length > 0;
