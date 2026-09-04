import { sar } from "./format";
import { SITE_URL } from "./site";

/**
 * إشعارات البريد عبر Resend — بلا مكتبة، طلب HTTP واحد.
 *
 * قاعدة صارمة: فشل البريد لا يُفشل طلبًا أبدًا. كل دالة هنا تبتلع
 * أخطاءها، لأن الزبون الذي دفع يجب أن ينجح طلبه حتى لو تعطّل مزوّد
 * البريد. ولذلك تُستدعى هذه الدوال بلا await على مسار الطلب.
 */
const FROM = process.env.EMAIL_FROM || "M3DStore <onboarding@resend.dev>";

export function emailReady(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** بريد صاحب المتجر لتنبيهات الطلبات الجديدة */
export function ownerEmail(): string {
  return process.env.ORDER_ALERT_EMAIL || "";
}

async function send(to: string, subject: string, html: string): Promise<boolean> {
  if (!emailReady() || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

type Line = { name: string; qty: number; price: number; colors?: string[] };

/** قالب واحد لكل الرسائل — عربي، يمين إلى يسار، ويقرأ في بريد الجوال */
function layout(title: string, body: string): string {
  return `<!doctype html><html dir="rtl" lang="ar"><body style="margin:0;background:#fcfbf9;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#1b1a17">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="text-align:center;padding-bottom:16px">
    <span style="font-size:20px;font-weight:800;letter-spacing:.08em">M3DSTORE</span>
  </div>
  <div style="background:#fff;border:1px solid #ece8df;border-radius:16px;padding:24px">
    <h1 style="margin:0 0 12px;font-size:19px;line-height:1.5">${title}</h1>
    ${body}
  </div>
  <p style="text-align:center;color:#6d675c;font-size:12px;margin-top:16px">
    M3DStore — قطع مطبوعة ثلاثية الأبعاد<br>
    <a href="${SITE_URL}" style="color:#8f6b1d">m3dstoreksa.com</a>
  </p>
</div></body></html>`;
}

function itemsTable(items: Line[]): string {
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3f0e9">
          ${i.name}${i.colors?.length ? ` <span style="color:#6d675c">(${i.colors.join("، ")})</span>` : ""}
          <span style="color:#6d675c">×${i.qty}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f0e9;text-align:left;white-space:nowrap">${sar(i.price * i.qty)}</td>
      </tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0">${rows}</table>`;
}

function button(href: string, label: string): string {
  return `<div style="text-align:center;margin-top:20px">
    <a href="${href}" style="display:inline-block;background:#8f6b1d;color:#fff;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:999px;font-size:14px">${label}</a>
  </div>`;
}

export type OrderEmail = {
  code: string;
  customer_name: string;
  email: string;
  total: number;
  phone: string;
  city: string;
  items: Line[];
};

/** تأكيد للزبون: يحمل رمز طلبه — وهذا يحلّ ضياع الرمز من أصله */
export async function sendOrderConfirmation(order: OrderEmail): Promise<boolean> {
  const track = `${SITE_URL}/track?code=${encodeURIComponent(order.code)}`;
  return send(
    order.email,
    `استلمنا طلبك ${order.code} — M3DStore`,
    layout(
      `شكرًا ${order.customer_name}، استلمنا طلبك`,
      `<p style="margin:0;color:#6d675c;font-size:14px;line-height:1.7">
         رمز طلبك هو
         <strong style="color:#8f6b1d;font-size:16px" dir="ltr">${order.code}</strong>.
         احتفظ به لتتبّع طلبك في أي وقت.
       </p>
       ${itemsTable(order.items)}
       <div style="display:flex;justify-content:space-between;font-weight:800;border-top:1px solid #ece8df;padding-top:10px">
         <span>الإجمالي</span><span style="color:#8f6b1d">${sar(order.total)}</span>
       </div>
       <p style="color:#6d675c;font-size:13px;line-height:1.7;margin-top:14px">
         قطعك تُطبع بعد طلبك، ونحدّثك بحالتها أولًا بأول. لأي استفسار راسلنا واتساب.
       </p>
       ${button(track, "تتبّع طلبك")}`
    )
  );
}

/** تنبيه لصاحب المتجر — لئلا ينام طلب في الليل بلا أن يراه أحد */
export async function sendNewOrderAlert(order: OrderEmail): Promise<boolean> {
  return send(
    ownerEmail(),
    `طلب جديد ${order.code} — ${sar(order.total)}`,
    layout(
      `طلب جديد: ${order.code}`,
      `<p style="margin:0;font-size:14px;line-height:1.9">
         <strong>الزبون:</strong> ${order.customer_name}<br>
         <strong>الجوال:</strong> <span dir="ltr">${order.phone}</span><br>
         <strong>المدينة:</strong> ${order.city}
       </p>
       ${itemsTable(order.items)}
       <div style="display:flex;justify-content:space-between;font-weight:800;border-top:1px solid #ece8df;padding-top:10px">
         <span>الإجمالي</span><span style="color:#8f6b1d">${sar(order.total)}</span>
       </div>
       ${button(`${SITE_URL}/admin`, "افتح لوحة التحكم")}`
    )
  );
}

/** إشعار الشحن — يُرسل عند إدخال رقم البوليصة، لا قبله */
export async function sendShippedNotice(input: {
  code: string;
  email: string;
  customer_name: string;
  carrier: string;
  tracking: string;
}): Promise<boolean> {
  return send(
    input.email,
    `طلبك ${input.code} في الطريق — M3DStore`,
    layout(
      `طلبك في الطريق يا ${input.customer_name}`,
      `<p style="margin:0;color:#6d675c;font-size:14px;line-height:1.8">
         شحنّا طلبك <strong dir="ltr">${input.code}</strong>${input.carrier ? ` مع <strong>${input.carrier}</strong>` : ""}.
       </p>
       ${
         input.tracking
           ? `<p style="margin:12px 0 0;font-size:14px">رقم البوليصة:
              <strong dir="ltr" style="color:#8f6b1d">${input.tracking}</strong></p>`
           : ""
       }
       ${button(`${SITE_URL}/track?code=${encodeURIComponent(input.code)}`, "تتبّع الشحنة")}`
    )
  );
}
