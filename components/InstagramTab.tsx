"use client";

import { useState } from "react";
import Image from "next/image";
import { arabicDate, instagramLink, INSTAGRAM_HANDLE, sar } from "@/lib/format";
import { CheckIcon, InstagramIcon, EyeOffIcon, GridIcon } from "@/components/Icons";
import ColorPicker from "@/components/ColorPicker";
import { parseColors } from "@/lib/colors";

/** منتج أُنشئ من بوست إنستقرام — الصورة والوصف من البوست، السعر يحدده صاحب المتجر */
export type ImportedProduct = {
  post_id: number;
  caption: string;
  image: string;
  extra_images: string;
  taken_at: string;
  product_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  active: number;
  colors: string;
};

type Draft = {
  name: string; price: string; category: string; stock: string; description: string; image: string;
  colors: string[];
};

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-4 py-2.5 outline-none transition-colors focus:border-primary";

function safeExtras(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function InstagramTab({
  items,
  reload,
}: {
  items: ImportedProduct[];
  reload: () => void;
}) {
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const [filter, setFilter] = useState<"pending" | "published" | "all">("pending");

  const draftOf = (item: ImportedProduct): Draft =>
    drafts[item.post_id] ?? {
      name: item.name,
      price: item.price > 0 ? String(item.price) : "",
      category: item.category,
      stock: String(item.stock),
      description: item.description,
      image: item.image,
      colors: parseColors(item.colors).map((c) => c.name),
    };

  const setField = (item: ImportedProduct, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [item.post_id]: { ...draftOf(item), ...patch } }));

  const save = async (item: ImportedProduct, publish: boolean) => {
    const draft = draftOf(item);
    setBusy(item.post_id);
    setErr("");
    setDone("");
    const res = await fetch("/api/admin/instagram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.post_id,
        name: draft.name,
        description: draft.description,
        price: Number(draft.price),
        category: draft.category,
        stock: Number(draft.stock),
        image: draft.image,
        colors: draft.colors,
        publish,
      }),
    });
    if (!res.ok) setErr((await res.json()).error ?? "حدث خطأ");
    else {
      setDrafts((d) => {
        const next = { ...d };
        delete next[item.post_id];
        return next;
      });
      setDone(publish ? "تم نشر المنتج — صار ظاهرًا في المتجر." : "تم حفظ التعديلات.");
      await reload();
    }
    setBusy(null);
  };

  const setActive = async (item: ImportedProduct, active: boolean) => {
    setBusy(item.post_id);
    setErr("");
    const res = await fetch("/api/admin/instagram", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.post_id, active: active ? 1 : 0 }),
    });
    if (!res.ok) setErr((await res.json()).error ?? "حدث خطأ");
    else await reload();
    setBusy(null);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <InstagramIcon width={28} height={28} />
        </span>
        <p className="mt-4 text-lg font-bold">ما فيه منتجات مستوردة بعد</p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">
          اطلب ملف التصدير من إنستقرام بصيغة JSON، ثم شغّل هذا الأمر من مجلد المشروع:
        </p>
        <code
          dir="ltr"
          className="mt-4 inline-block rounded-lg bg-primary-soft px-4 py-2 text-sm font-semibold text-primary"
        >
          node scripts/import-instagram.mjs &quot;instagram-export.zip&quot;
        </code>
        <p className="mt-3 text-xs text-muted">التفاصيل الكاملة في ملف INSTAGRAM.md</p>
      </div>
    );
  }

  const pending = items.filter((i) => !i.active);
  const published = items.filter((i) => i.active);
  const shown =
    filter === "pending" ? pending : filter === "published" ? published : items;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
        <div className="text-sm">
          <p className="font-bold">
            {items.length} منتج مستورد من إنستقرام
            {pending.length > 0 && (
              <span className="font-normal text-accent"> — {pending.length} بانتظار التسعير</span>
            )}
          </p>
          <p className="mt-0.5 text-muted">
            الصورة والاسم والوصف جاهزة من البوست. حدّد السعر واضغط «نشر» ليظهر المنتج في المتجر.
          </p>
        </div>
        <a
          href={instagramLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-accent"
        >
          <InstagramIcon width={16} height={16} />
          <span dir="ltr">@{INSTAGRAM_HANDLE}</span>
        </a>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="تصفية">
        {(
          [
            ["pending", `بانتظار التسعير (${pending.length})`],
            ["published", `منشورة (${published.length})`],
            ["all", `الكل (${items.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`cursor-pointer rounded-full px-5 py-2 text-sm font-bold transition-colors duration-200 ${
              filter === id
                ? "bg-primary text-white"
                : "border border-line bg-surface text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {err && (
        <p role="alert" className="text-sm font-bold text-danger">
          {err}
        </p>
      )}
      {done && <p className="text-sm font-bold text-success">{done}</p>}

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="font-bold">
            {filter === "pending" ? "كل المنتجات المستوردة مسعّرة ومنشورة 🎉" : "ما فيه منتجات هنا"}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((item) => {
            const draft = draftOf(item);
            const extras = safeExtras(item.extra_images);
            const live = item.active === 1;

            return (
              <div
                key={item.post_id}
                className={`flex flex-col overflow-hidden rounded-2xl border bg-surface ${
                  live ? "border-success/40" : "border-accent/40"
                }`}
              >
                <div className="relative aspect-square bg-primary-soft/40">
                  <Image src={draft.image} alt="" fill sizes="320px" className="object-cover" />
                  {extras.length > 0 && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-bold text-white">
                      <GridIcon width={12} height={12} />
                      <span className="tabular">{extras.length + 1}</span>
                    </span>
                  )}
                  <span
                    className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold ${
                      live ? "bg-success-soft text-success" : "bg-accent-soft text-accent"
                    }`}
                  >
                    {live ? `منشور — ${sar(item.price)}` : "بانتظار التسعير"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>منتج رقم {item.product_id}</span>
                    {item.taken_at && <span>{arabicDate(item.taken_at)}</span>}
                  </div>

                  {extras.length > 0 && (
                    <div>
                      <span className="mb-1 block text-xs font-bold">
                        صورة المنتج ({extras.length + 1} صور في هذا البوست)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[item.image, ...extras].map((img) => (
                          <button
                            key={img}
                            type="button"
                            onClick={() => setField(item, { image: img })}
                            aria-label="اختيار هذه الصورة"
                            className={`relative h-14 w-14 cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                              draft.image === img ? "border-primary" : "border-line hover:border-primary/40"
                            }`}
                          >
                            <Image src={img} alt="" fill sizes="56px" className="object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor={`ig-name-${item.post_id}`} className="mb-1 block text-xs font-bold">
                      اسم المنتج
                    </label>
                    <input
                      id={`ig-name-${item.post_id}`}
                      className={inputCls}
                      value={draft.name}
                      onChange={(e) => setField(item, { name: e.target.value })}
                      placeholder="اسم المنتج"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor={`ig-price-${item.post_id}`}
                        className="mb-1 block text-xs font-bold"
                      >
                        السعر (ر.س)
                      </label>
                      <input
                        id={`ig-price-${item.post_id}`}
                        type="number"
                        min="1"
                        step="0.5"
                        className={inputCls}
                        value={draft.price}
                        onChange={(e) => setField(item, { price: e.target.value })}
                        placeholder="45"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`ig-stock-${item.post_id}`}
                        className="mb-1 block text-xs font-bold"
                      >
                        الكمية
                      </label>
                      <input
                        id={`ig-stock-${item.post_id}`}
                        type="number"
                        min="0"
                        className={inputCls}
                        value={draft.stock}
                        onChange={(e) => setField(item, { stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`ig-cat-${item.post_id}`} className="mb-1 block text-xs font-bold">
                      الفئة
                    </label>
                    <select
                      id={`ig-cat-${item.post_id}`}
                      className={`${inputCls} cursor-pointer`}
                      value={draft.category}
                      onChange={(e) => setField(item, { category: e.target.value })}
                    >
                      <option>ديكورات وهدايا</option>
                      <option>قطع عملية وأدوات</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={`ig-desc-${item.post_id}`} className="mb-1 block text-xs font-bold">
                      الوصف (كابشن إنستقرام)
                    </label>
                    <textarea
                      id={`ig-desc-${item.post_id}`}
                      rows={4}
                      className={`${inputCls} resize-y`}
                      value={draft.description}
                      onChange={(e) => setField(item, { description: e.target.value })}
                    />
                  </div>

                  <ColorPicker
                    idPrefix={`ig-color-${item.post_id}`}
                    selected={draft.colors}
                    onChange={(colors) => setField(item, { colors })}
                  />

                  <div className="mt-auto flex flex-col gap-2 pt-1">
                    <div className="flex gap-2">
                      {/* الحفظ متاح دائمًا بلا شرط سعر — للتعديل قبل التسعير */}
                      <button
                        type="button"
                        onClick={() => save(item, false)}
                        disabled={busy === item.post_id || !draft.name.trim()}
                        className="flex-1 cursor-pointer rounded-xl border border-line py-2.5 text-sm font-bold transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy === item.post_id ? "..." : "حفظ التعديلات"}
                      </button>

                      {live ? (
                        <button
                          type="button"
                          onClick={() => setActive(item, false)}
                          disabled={busy === item.post_id}
                          title="إخفاء من المتجر"
                          className="flex cursor-pointer items-center justify-center rounded-xl border border-line px-4 py-2.5 transition-colors hover:border-danger hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                        >
                          <EyeOffIcon width={16} height={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => save(item, true)}
                          disabled={busy === item.post_id || !draft.name.trim() || !Number(draft.price)}
                          title={!Number(draft.price) ? "حدّد السعر أولًا" : "نشر في المتجر"}
                          className="flex-1 cursor-pointer rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          نشر في المتجر
                        </button>
                      )}
                    </div>

                    {!live && !Number(draft.price) && (
                      <p className="text-center text-xs text-muted">
                        تقدر تحفظ التعديلات الآن وتسعّره لاحقًا
                      </p>
                    )}
                  </div>

                  {live && (
                    <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-success">
                      <CheckIcon width={13} height={13} />
                      ظاهر الآن في صفحة المنتجات
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
