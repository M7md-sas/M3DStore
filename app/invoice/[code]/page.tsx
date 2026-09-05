import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { sar, paymentLabel, ORDER_STATUS } from "@/lib/format";
import { CR_NUMBER, CR_LABEL, BANK_TRANSFER, bankTransferReady, SITE_URL } from "@/lib/site";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "فاتورة", robots: { index: false, follow: false } };

type Row = {
  code: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  items_json: string;
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
};

type Line = { name: string; qty: number; price: number; colors?: string[] };

/**
 * فاتورة الطلب. الرمز نفسه هو مفتاح الوصول — كما في صفحة التتبع تمامًا،
 * فمن يملك رمز طلبه يرى فاتورته بلا حساب ولا تسجيل دخول.
 *
 * ليست «فاتورة ضريبية»: المتجر يعمل بوثيقة عمل حر وغير مسجّل في ضريبة
 * القيمة المضافة، وإظهار ضريبة بلا تسجيل مخالفة نظامية.
 */
export default async function InvoicePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = getDb()
    .prepare("SELECT * FROM orders WHERE code = ?")
    .get(decodeURIComponent(code)) as Row | undefined;

  if (!order) notFound();

  let items: Line[] = [];
  try {
    items = JSON.parse(order.items_json);
  } catch {
    items = [];
  }

  const issued = order.created_at.slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
      <div className="mb-5 flex items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-muted">فاتورة الطلب — احفظها أو اطبعها PDF</p>
        <PrintButton />
      </div>

      <article className="rounded-2xl border border-line bg-surface p-6 md:p-10 print:rounded-none print:border-0 print:p-0">
        {/* الترويسة */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="font-display text-xl font-extrabold tracking-[0.08em]">M3DSTORE</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              قطع مطبوعة ثلاثية الأبعاد
              <br />
              {CR_LABEL}: <span className="tabular">{CR_NUMBER}</span>
              <br />
              {SITE_URL.replace("https://", "")}
            </p>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-extrabold">فاتورة</h1>
            <p className="mt-1 text-sm text-muted">
              رقم الطلب: <span className="font-bold text-foreground tabular" dir="ltr">{order.code}</span>
            </p>
            <p className="text-sm text-muted">
              التاريخ: <span className="tabular" dir="ltr">{issued}</span>
            </p>
            <p className="mt-1 text-xs font-bold text-primary">
              {ORDER_STATUS[order.status] ?? order.status}
            </p>
          </div>
        </header>

        {/* الزبون */}
        <section className="grid gap-4 border-b border-line py-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold text-muted">فاتورة إلى</p>
            <p className="mt-1 font-bold">{order.customer_name}</p>
            <p className="text-sm text-muted tabular" dir="ltr">{order.phone}</p>
            <p className="text-sm text-muted">
              {order.city}
              {order.address ? ` — ${order.address}` : ""}
            </p>
          </div>
          <div className="sm:text-left">
            <p className="text-xs font-bold text-muted">طريقة الدفع</p>
            <p className="mt-1 font-bold">
              {order.payment_method ? paymentLabel(order.payment_method) : "غير محدد"}
            </p>
          </div>
        </section>

        {/* البنود */}
        <section className="py-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-right text-xs text-muted">
                  <th className="pb-2 font-bold">الصنف</th>
                  <th className="pb-2 text-center font-bold">الكمية</th>
                  <th className="pb-2 text-left font-bold">السعر</th>
                  <th className="pb-2 text-left font-bold">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {items.map((li, i) => (
                  <tr key={i} className="border-b border-rule-soft">
                    <td className="py-2.5">
                      {li.name}
                      {li.colors && li.colors.length > 0 && (
                        <span className="block text-xs text-muted">
                          اللون: {li.colors.join("، ")}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-center tabular">{li.qty}</td>
                    <td className="py-2.5 text-left tabular">{sar(li.price)}</td>
                    <td className="py-2.5 text-left font-bold tabular">
                      {sar(li.price * li.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* المجاميع */}
          <div className="mt-5 flex justify-start">
            <dl className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">المجموع الفرعي</dt>
                <dd className="tabular">{sar(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">الشحن</dt>
                <dd className="tabular">
                  {order.shipping === 0 ? "مجاني" : sar(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold">
                <dt>الإجمالي</dt>
                <dd className="text-primary tabular">{sar(order.total)}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* الدفع والتذييل */}
        <footer className="border-t border-line pt-5 text-xs leading-relaxed text-muted">
          {bankTransferReady() && (
            <p className="mb-2">
              التحويل البنكي: {BANK_TRANSFER.bankName} — {BANK_TRANSFER.accountName} —{" "}
              <span className="tabular" dir="ltr">{BANK_TRANSFER.iban}</span>
            </p>
          )}
          <p>
            هذه فاتورة غير خاضعة لضريبة القيمة المضافة — المتجر يعمل بموجب{" "}
            {CR_LABEL} رقم <span className="tabular">{CR_NUMBER}</span> وغير مسجّل في
            ضريبة القيمة المضافة.
          </p>
          <p className="mt-2">شكرًا لطلبك من M3DStore.</p>
        </footer>
      </article>
    </div>
  );
}
