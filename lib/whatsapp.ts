import { SITE_URL } from "./site";

/**
 * تنبيه واتساب لصاحب المتجر عند وصول طلب.
 *
 * البريد وحده لا يوقظ أحدًا؛ واتساب يوقظ. ولذلك يذهب هذا التنبيه إلى
 * رقم صاحب المتجر وحده، لا إلى الزبون.
 *
 * نستخدم CallMeBot: خدمة مجانية ترسل إلى رقمك أنت بلا حساب أعمال ولا
 * قوالب معتمدة. البديل الرسمي (WhatsApp Cloud API) يشترط قالبًا
 * مُوافَقًا عليه مسبقًا لأي رسالة يبدأها المتجر — أيام انتظار مقابل
 * دقيقتين هنا.
 *
 * وهي وسيط خارجي غير رسمي، فلا يمر عبرها أي شيء يخص الزبون: لا اسم
 * ولا جوال ولا عنوان. الرسالة رمزٌ ومبلغ ورابط، والتفاصيل تُفتح من
 * اللوحة.
 */
export function whatsappReady(): boolean {
  return Boolean(process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY);
}

async function send(text: string): Promise<boolean> {
  if (!whatsappReady()) return false;

  const url =
    "https://api.callmebot.com/whatsapp.php" +
    `?phone=${encodeURIComponent(process.env.CALLMEBOT_PHONE!)}` +
    `&apikey=${encodeURIComponent(process.env.CALLMEBOT_APIKEY!)}` +
    `&text=${encodeURIComponent(text)}`;

  try {
    // مهلة قصيرة: التنبيه لا يستحق أن يعلّق طلبًا لو تعطّلت الخدمة
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false;
  }
}

/** تنبيه بطلب جديد — بلا أي بيانات تخص الزبون */
export async function sendNewOrderWhatsApp(input: {
  code: string;
  total: number;
  itemCount: number;
  city: string;
}): Promise<boolean> {
  const lines = [
    "🛒 طلب جديد في M3DStore",
    `الرمز: ${input.code}`,
    `المبلغ: ${input.total} ر.س`,
    `القطع: ${input.itemCount}`,
    `المدينة: ${input.city}`,
    "",
    `التفاصيل: ${SITE_URL}/admin`,
  ];
  return send(lines.join("\n"));
}
