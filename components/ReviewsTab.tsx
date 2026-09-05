"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckIcon, TrashIcon, XIcon } from "./Icons";

type AdminReview = {
  id: number;
  product_id: number;
  product_name: string | null;
  order_code: string;
  name: string;
  rating: number;
  body: string;
  approved: number;
  created_at: string;
};

/** مراجعة التقييمات قبل نشرها — لا يظهر شيء على المتجر قبل موافقتك */
export default function ReviewsTab() {
  const [items, setItems] = useState<AdminReview[] | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await fetch("/api/admin/reviews").then((r) => r.json());
      setItems(d.reviews ?? []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setApproved = async (id: number, approved: boolean) => {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved: approved ? 1 : 0 }),
    });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("حذف هذا التقييم نهائيًا؟")) return;
    await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  if (items === null)
    return <p className="py-10 text-center text-muted">جارٍ التحميل...</p>;

  if (items.length === 0)
    return (
      <p className="py-10 text-center text-muted">
        ما فيه تقييمات بعد. التقييم متاح لمن اشترى فقط، ولا يظهر قبل موافقتك.
      </p>
    );

  const pending = items.filter((r) => !r.approved).length;

  return (
    <div className="space-y-4">
      {pending > 0 && (
        <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm font-bold text-accent">
          {pending} تقييم بانتظار مراجعتك
        </p>
      )}

      {items.map((r) => (
        <div key={r.id} className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold">
                {r.product_name ?? `منتج #${r.product_id}`}
                <span className="mr-2 text-sm font-normal text-muted tabular">
                  {r.rating}/5
                </span>
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {r.name || "بلا اسم"} — طلب{" "}
                <span dir="ltr" className="tabular">{r.order_code}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted tabular" dir="ltr">
                {r.created_at}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {r.approved ? (
                <button
                  type="button"
                  onClick={() => setApproved(r.id, false)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full bg-success-soft px-4 py-1.5 text-xs font-bold text-success transition-colors hover:bg-surface-2 hover:text-muted"
                >
                  <CheckIcon width={14} height={14} />
                  منشور
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setApproved(r.id, true)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover"
                >
                  <CheckIcon width={14} height={14} />
                  انشر
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(r.id)}
                aria-label="حذف التقييم"
                className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          </div>

          {r.body ? (
            <p className="mt-3 whitespace-pre-line border-t border-rule-soft pt-3 text-sm leading-relaxed">
              {r.body}
            </p>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 border-t border-rule-soft pt-3 text-xs text-muted">
              <XIcon width={13} height={13} />
              نجوم بلا نص
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
