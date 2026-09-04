import { NextResponse } from "next/server";
import { settleOrder } from "@/lib/paytabs";
import { originOf } from "@/lib/auth";

/**
 * رجوع الزبون من صفحة PayTabs. قد يصل قبل الإشعار أو بعده، وقد يصل
 * كـ GET أو POST حسب إعداد البوابة — فنعالج الاثنين بنفس المنطق،
 * ونتحقق من الخادم قبل أن نقول للزبون إن الدفع تم.
 */
async function finish(request: Request, code: string) {
  const origin = originOf(request);
  if (!code.startsWith("ORD-")) return NextResponse.redirect(`${origin}/track`);

  const state = await settleOrder(code);
  const url = new URL(`/track`, origin);
  url.searchParams.set("code", code);
  if (state === "paid") url.searchParams.set("paid", "1");
  else url.searchParams.set("pay_pending", "1");

  // 303 حتى يتحوّل POST القادم من البوابة إلى GET عادي في المتصفح
  return NextResponse.redirect(url.toString(), 303);
}

export async function GET(request: Request) {
  return finish(request, new URL(request.url).searchParams.get("code") ?? "");
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let code = url.searchParams.get("code") ?? "";
  if (!code) {
    const form = await request.formData().catch(() => null);
    code = String(form?.get("cart_id") ?? "");
  }
  return finish(request, code);
}
