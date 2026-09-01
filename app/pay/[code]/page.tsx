import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { sar } from "@/lib/format";
import PaymentPanel from "@/components/PaymentPanel";
import { ShieldIcon } from "@/components/Icons";
import SaveOrderPanel from "@/components/SaveOrderPanel";

export const dynamic = "force-dynamic";

type OrderRow = {
  code: string;
  customer_name: string;
  total: number;
  status: string;
  payment_method: string;
  items_json: string;
};

type CustomRow = {
  code: string;
  customer_name: string;
  description: string;
  price: number | null;
  status: string;
};

export default async function PayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const db = getDb();

  let amount: number | null = null;
  let title = "";
  let payable = false;
  let alreadyPaid = false;
  let method = "";

  if (code.startsWith("ORD-")) {
    const order = db.prepare("SELECT * FROM orders WHERE code = ?").get(code) as OrderRow | undefined;
    if (!order) notFound();
    amount = order.total;
    title = `طلب رقم ${order.code}`;
    payable = order.status === "pending_payment";
    alreadyPaid = !payable;
    method = order.payment_method;
  } else if (code.startsWith("CST-")) {
    const req = db.prepare("SELECT * FROM custom_requests WHERE code = ?").get(code) as CustomRow | undefined;
    if (!req || req.price == null) notFound();
    amount = req.price;
    title = `طلب تصميم مخصص ${req.code}`;
    payable = req.status === "approved";
    alreadyPaid = req.status !== "approved" && req.status !== "review" && req.status !== "rejected";
  } else {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-6 flex items-center justify-center gap-2 text-success">
        <ShieldIcon width={22} height={22} />
        <span className="font-bold">صفحة دفع آمنة</span>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-6 md:p-8">
        <h1 className="text-xl font-extrabold">{title}</h1>
        <p className="mt-1 text-sm text-muted">المبلغ المستحق</p>
        <p className="mt-1 text-4xl font-extrabold text-primary tabular">{sar(amount!)}</p>

        <div className="mt-6">
          {payable ? (
            <PaymentPanel code={code} amount={amount!} initialMethod={method || undefined} />
          ) : alreadyPaid ? (
            <div className="rounded-xl bg-success-soft p-5 text-center font-bold text-success">
              تم استلام الدفع لهذا الطلب — تقدر تتابع حالته من صفحة التتبع
            </div>
          ) : (
            <div className="rounded-xl bg-accent-soft p-5 text-center font-bold text-accent">
              هذا الطلب ليس جاهزًا للدفع بعد
            </div>
          )}
        </div>

        <Link
          href={`/track?code=${code}`}
          className="mt-5 block text-center text-sm font-bold text-primary transition-colors hover:text-primary-hover"
        >
          تتبع حالة الطلب
        </Link>
      </div>

      <div className="mt-6">
        <SaveOrderPanel code={code} />
      </div>
    </div>
  );
}
