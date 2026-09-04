import { getDb } from "./db";

/**
 * تكامل PayTabs — صفحة دفع مستضافة (Hosted Payment Page).
 * بيانات البطاقة لا تمر بخادمنا إطلاقًا: الزبون يدفع على صفحة PayTabs،
 * ونحن نتحقق من النتيجة بسؤال خادمهم مباشرة.
 */
const ENDPOINT = process.env.PAYTABS_ENDPOINT || "https://secure.paytabs.sa";

/** بلا مفاتيح لا يظهر خيار البطاقة أصلًا — نفس نمط قوقل والتحويل البنكي */
export function paytabsReady(): boolean {
  return Boolean(process.env.PAYTABS_PROFILE_ID && process.env.PAYTABS_SERVER_KEY);
}

async function call<T>(path: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(`${ENDPOINT}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: process.env.PAYTABS_SERVER_KEY ?? "",
      },
      body: JSON.stringify({
        profile_id: Number(process.env.PAYTABS_PROFILE_ID),
        ...body,
      }),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type CreateResponse = { tran_ref?: string; redirect_url?: string };

/** ينشئ صفحة الدفع ويعيد رابط التحويل إليها */
export async function createPaymentPage(input: {
  code: string;
  amount: number;
  description: string;
  customerName: string;
  phone: string;
  city: string;
  returnUrl: string;
  callbackUrl: string;
}): Promise<{ redirectUrl: string; tranRef: string } | null> {
  const data = await call<CreateResponse>("/payment/request", {
    tran_type: "sale",
    tran_class: "ecom",
    cart_id: input.code,
    cart_description: input.description,
    cart_currency: "SAR",
    cart_amount: Number(input.amount.toFixed(2)),
    return: input.returnUrl,
    callback: input.callbackUrl,
    hide_shipping: true,
    customer_details: {
      name: input.customerName,
      phone: input.phone,
      city: input.city,
      country: "SA",
    },
  });

  if (!data?.redirect_url || !data.tran_ref) return null;
  return { redirectUrl: data.redirect_url, tranRef: data.tran_ref };
}

type QueryResponse = {
  cart_id?: string;
  cart_amount?: string;
  payment_result?: { response_status?: string; response_message?: string };
};

/**
 * يسأل PayTabs عن حالة العملية ويعلّم الطلب مدفوعًا عند النجاح فقط.
 *
 * لا نثق برجوع المتصفح ولا بجسم إشعار البوابة — كلاهما يمر بجهاز الزبون
 * أو يمكن انتحاله. المصدر الوحيد للحقيقة هو رد خادم PayTabs على سؤالنا.
 * والدالة آمنة التكرار: الإشعار والرجوع قد يصلان معًا وبأي ترتيب.
 */
export async function settleOrder(code: string): Promise<"paid" | "pending" | "unknown"> {
  const db = getDb();
  const order = db
    .prepare("SELECT id, status, total, tran_ref FROM orders WHERE code = ?")
    .get(code) as { id: number; status: string; total: number; tran_ref: string } | undefined;

  if (!order) return "unknown";
  if (order.status !== "pending_payment") return "paid"; // عولج سابقًا
  if (!order.tran_ref) return "pending";

  const data = await call<QueryResponse>("/payment/query", { tran_ref: order.tran_ref });
  if (data?.payment_result?.response_status !== "A") return "pending";

  // حارس التلاعب: لا نقبل مبلغًا يخالف إجمالي الطلب ولا سلة طلب آخر
  const paid = Number(data.cart_amount ?? 0);
  if (data.cart_id !== code || Math.abs(paid - order.total) > 0.01) return "pending";

  db.prepare(
    "UPDATE orders SET status = 'paid', payment_method = 'card' WHERE id = ? AND status = 'pending_payment'"
  ).run(order.id);
  return "paid";
}

export function saveTranRef(code: string, tranRef: string): void {
  getDb().prepare("UPDATE orders SET tran_ref = ? WHERE code = ?").run(tranRef, code);
}
