"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ORDER_STATUS, CUSTOM_STATUS, sar, paymentLabel, customerWhatsAppLink } from "@/lib/format";
import { CheckIcon, CubeIcon, XIcon, TrashIcon, WhatsAppIcon } from "@/components/Icons";
import InstagramTab, { type ImportedProduct } from "@/components/InstagramTab";
import { CUSTOM_ORDERS_ENABLED } from "@/lib/site";
import ColorPicker from "@/components/ColorPicker";
import ImagesPicker from "@/components/ImagesPicker";
import { parseColors, parseColorMode } from "@/lib/colors";

/* ===== الأنواع ===== */
type Product = {
  id: number; name: string; description: string; price: number;
  category: string; image: string; stock: number; active: number; colors: string;
  images: string; color_mode: string; lead_days: number;
};
type Order = {
  id: number; code: string; customer_name: string; phone: string; city: string;
  address: string; items_json: string; subtotal: number; shipping: number;
  total: number; payment_method: string; status: string; created_at: string; notes: string;
  carrier: string; tracking: string;
};
type Analytics = {
  views: { today: number; week: number; month: number };
  orders: { today: number; week: number; month: number; revenue: number };
  conversion: number;
  topProducts: { id: number; name: string; views: number }[];
  daily: { day: string; views: number; orders: number }[];
};
type CustomReq = {
  id: number; code: string; customer_name: string; phone: string; description: string;
  file_name: string; file_path: string; price: number | null; status: string;
  admin_note: string; created_at: string;
};

// صور احتياطية إذا فشل جلب قائمة الصور من الخادم
const FALLBACK_IMAGES = [
  "/products/vase.svg", "/products/phone-stand.svg", "/products/keychain.svg",
  "/products/organizer.svg", "/products/moon-lamp.svg", "/products/headphone-stand.svg",
  "/products/planter.svg", "/products/wall-hook.svg",
];

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-4 py-2.5 outline-none transition-colors focus:border-primary";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  // تفتح على «الطلبات»: هذا ما يفتح صاحب المتجر لوحته من أجله.
  // كانت تفتح على إنستقرام، فيدخل ولا يرى طلبًا ينتظره.
  const [tab, setTab] = useState<"custom" | "orders" | "products" | "instagram" | "stats">(
    "orders"
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [custom, setCustom] = useState<CustomReq[]>([]);
  const [igPosts, setIgPosts] = useState<ImportedProduct[]>([]);
  const [images, setImages] = useState<string[]>(FALLBACK_IMAGES);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/data");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setProducts(data.products);
    setOrders(data.orders);
    setCustom(data.custom);
    setIgPosts(data.instagram ?? []);
    if (Array.isArray(data.images) && data.images.length) setImages(data.images);
    setAnalytics(data.analytics ?? null);
    setAuthed(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("كلمة المرور غير صحيحة");
      return;
    }
    setPassword("");
    load();
  };

  if (authed === null) {
    return <div className="py-32 text-center text-muted">جارٍ التحميل...</div>;
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <div className="rounded-3xl border border-line bg-surface p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <CubeIcon width={28} height={28} />
          </span>
          <h1 className="mt-4 text-xl font-extrabold">لوحة تحكم M3DStore</h1>
          <p className="mt-1 text-sm text-muted">هذه الصفحة خاصة بصاحب المتجر</p>
          <form onSubmit={login} className="mt-6 space-y-3">
            <label htmlFor="pw" className="sr-only">كلمة المرور</label>
            <input
              id="pw" type="password" value={password} dir="ltr"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور" className={inputCls} autoFocus
            />
            {loginError && <p role="alert" className="text-sm font-bold text-danger">{loginError}</p>}
            <button type="submit" className="w-full cursor-pointer rounded-xl bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-hover">
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingCustom = custom.filter((c) => c.status === "review").length;
  const igPending = igPosts.filter((p) => !p.active).length;
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;
  const revenue = orders
    .filter((o) => !["pending_payment", "cancelled"].includes(o.status))
    .reduce((s, o) => s + o.total, 0)
    + custom.filter((c) => ["paid", "printing", "shipped", "delivered"].includes(c.status))
      .reduce((s, c) => s + (c.price ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">لوحة التحكم</h1>
        <button
          type="button"
          onClick={async () => {
            await fetch("/api/admin/login", { method: "DELETE" });
            setAuthed(false);
          }}
          className="cursor-pointer rounded-xl border border-line px-5 py-2 text-sm font-bold text-muted transition-colors hover:border-danger hover:text-danger"
        >
          تسجيل خروج
        </button>
      </div>

      {/* إحصائيات */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CUSTOM_ORDERS_ENABLED || custom.length > 0 ? (
          <Stat label="طلبات مخصصة بانتظار مراجعتك" value={String(pendingCustom)} highlight={pendingCustom > 0} />
        ) : (
          <Stat
            label="منتجات بانتظار التسعير"
            value={String(igPending)}
            highlight={igPending > 0}
          />
        )}
        <Stat label="طلبات نشطة" value={String(activeOrders)} />
        <Stat label="إجمالي المبيعات المدفوعة" value={sar(revenue)} />
      </div>

      {/* تبويبات */}
      <div className="mt-8 flex gap-2 border-b border-line" role="tablist">
        {([
          ...(CUSTOM_ORDERS_ENABLED || custom.length > 0
            ? ([["custom", `التصاميم المخصصة${pendingCustom ? ` (${pendingCustom})` : ""}`]] as const)
            : []),
          ["orders", "الطلبات"],
          ["products", "المنتجات"],
          ["instagram", `إنستقرام${igPending ? ` (${igPending})` : ""}`],
          ["stats", "التحليلات"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`cursor-pointer border-b-2 px-5 py-3 font-bold transition-colors ${
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="py-6">
        {tab === "custom" && <CustomTab items={custom} reload={load} />}
        {tab === "orders" && <OrdersTab items={orders} reload={load} />}
        {tab === "products" && (
          <ProductsTab
            items={products}
            images={images}
            onUploaded={(p) => setImages((prev) => [p, ...prev])}
            reload={load}
          />
        )}
        {tab === "instagram" && <InstagramTab items={igPosts} reload={load} />}
        {tab === "stats" && <StatsTab data={analytics} />}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${highlight ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}>
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tabular ${highlight ? "text-accent" : "text-primary"}`}>{value}</p>
    </div>
  );
}

/* ===== تبويب التصاميم المخصصة ===== */
function CustomTab({ items, reload }: { items: CustomReq[]; reload: () => void }) {
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState("");

  const update = async (id: number, status: string, price?: number, admin_note?: string) => {
    setBusy(id);
    setErr("");
    const res = await fetch("/api/admin/custom", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, price, admin_note }),
    });
    if (!res.ok) setErr((await res.json()).error ?? "حدث خطأ");
    setBusy(null);
    reload();
  };

  if (items.length === 0)
    return <p className="py-10 text-center text-muted">لا توجد طلبات تصميم مخصصة بعد</p>;

  return (
    <div className="space-y-4">
      {err && <p role="alert" className="rounded-lg bg-danger-soft px-4 py-2.5 font-bold text-danger">{err}</p>}
      {items.map((c) => (
        <div key={c.id} className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-extrabold tabular" dir="ltr">{c.code}</p>
              <p className="mt-0.5 text-sm">
                {c.customer_name} — <span dir="ltr" className="tabular">{c.phone}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted">{c.created_at}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              c.status === "review" ? "bg-accent-soft text-accent"
              : c.status === "rejected" ? "bg-danger-soft text-danger"
              : "bg-primary-soft text-primary"
            }`}>
              {CUSTOM_STATUS[c.status] ?? c.status}
            </span>
          </div>

          <p className="mt-3 rounded-xl bg-background p-3 text-sm leading-relaxed">{c.description}</p>

          {c.file_path && (
            <a
              href={`/api/admin/file/${c.file_path}`}
              className="mt-2 inline-block text-sm font-bold text-primary transition-colors hover:text-primary-hover"
            >
              تحميل الملف المرفق: <span dir="ltr">{c.file_name}</span>
            </a>
          )}

          {c.status === "review" && (
            <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-[140px_1fr_auto_auto]">
              <div>
                <label htmlFor={`price-${c.id}`} className="mb-1 block text-xs font-bold">السعر (ر.س)</label>
                <input
                  id={`price-${c.id}`} inputMode="decimal" dir="ltr"
                  value={prices[c.id] ?? ""}
                  onChange={(e) => setPrices({ ...prices, [c.id]: e.target.value })}
                  className={`${inputCls} text-right`} placeholder="مثال: 120"
                />
              </div>
              <div>
                <label htmlFor={`note-${c.id}`} className="mb-1 block text-xs font-bold">ملاحظة للعميل (اختياري)</label>
                <input
                  id={`note-${c.id}`}
                  value={notes[c.id] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })}
                  className={inputCls} placeholder="مثال: الطباعة بلون أسود فقط"
                />
              </div>
              <button
                type="button"
                disabled={busy === c.id}
                onClick={() => update(c.id, "approved", Number(prices[c.id]), notes[c.id])}
                className="flex cursor-pointer items-center gap-1.5 self-end rounded-xl bg-success px-5 py-2.5 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <CheckIcon width={16} height={16} /> قبول
              </button>
              <button
                type="button"
                disabled={busy === c.id}
                onClick={() => update(c.id, "rejected", undefined, notes[c.id] || "التصميم غير قابل للطباعة حاليًا")}
                className="flex cursor-pointer items-center gap-1.5 self-end rounded-xl bg-danger px-5 py-2.5 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <XIcon width={16} height={16} /> رفض
              </button>
            </div>
          )}

          {["paid", "printing", "shipped"].includes(c.status) && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              {c.status === "paid" && (
                <NextStepBtn onClick={() => update(c.id, "printing")} label="ابدأ الطباعة" busy={busy === c.id} />
              )}
              {c.status === "printing" && (
                <NextStepBtn onClick={() => update(c.id, "shipped")} label="تم الشحن" busy={busy === c.id} />
              )}
              {c.status === "shipped" && (
                <NextStepBtn onClick={() => update(c.id, "delivered")} label="تم التوصيل" busy={busy === c.id} />
              )}
            </div>
          )}

          {c.status === "approved" && c.price != null && (
            <p className="mt-3 text-sm font-bold text-success">
              السعر المحدد: <span className="tabular">{sar(c.price)}</span> — بانتظار دفع العميل
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function NextStepBtn({ onClick, label, busy }: { onClick: () => void; label: string; busy: boolean }) {
  return (
    <button
      type="button" disabled={busy} onClick={onClick}
      className="cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {label}
    </button>
  );
}

/* ===== تبويب الطلبات ===== */
/** شركات الشحن الشائعة في السعودية — القائمة للاختيار السريع لا للربط الآلي */
const CARRIERS = ["سمسا", "أرامكس", "ناقل", "زاجل", "سبل", "تريوتو", "أخرى"];

function OrdersTab({ items, reload }: { items: Order[]; reload: () => void }) {
  const [busy, setBusy] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [ship, setShip] = useState<Record<number, { carrier: string; tracking: string }>>({});

  const shipOf = (o: Order) => ship[o.id] ?? { carrier: o.carrier, tracking: o.tracking };

  const saveShipment = async (o: Order) => {
    const s = shipOf(o);
    setBusy(o.id);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: o.id, carrier: s.carrier, tracking: s.tracking }),
    });
    setBusy(null);
    reload();
  };

  const setStatus = async (id: number, status: string) => {
    setBusy(id);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusy(null);
    reload();
  };

  if (items.length === 0)
    return <p className="py-10 text-center text-muted">لا توجد طلبات بعد</p>;

  // الزبون ينسى رمزه ويكلّمك واتساب — تبحث بجواله وترسله له
  const q = query.trim().toLowerCase();
  const shown = q
    ? items.filter((o) =>
        [o.code, o.phone, o.customer_name, o.tracking].some((v) =>
          String(v ?? "").toLowerCase().includes(q)
        )
      )
    : items;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="order-q" className="mb-1 block text-sm font-bold">
          ابحث في الطلبات
        </label>
        <input
          id="order-q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="رقم الجوال أو اسم الزبون أو رمز الطلب"
          className={inputCls}
        />
        <p className="mt-1 text-xs text-muted tabular">
          {q ? `${shown.length} من ${items.length} طلب` : `${items.length} طلب`}
        </p>
      </div>

      {q && shown.length === 0 && (
        <p className="py-8 text-center text-muted">ما فيه طلب يطابق البحث</p>
      )}

      {shown.map((o) => {
        const lineItems = JSON.parse(o.items_json) as {
          name: string; qty: number; price: number; colors?: string[];
        }[];
        return (
          <div key={o.id} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-extrabold tabular" dir="ltr">{o.code}</p>
                <p className="mt-0.5 text-sm">
                  {o.customer_name} —{" "}
                  <a href={`tel:${o.phone}`} dir="ltr" className="tabular underline decoration-line underline-offset-2 hover:text-primary">
                    {o.phone}
                  </a>
                </p>
                {/* الرد يتم على واتساب، فالزر يفتح المحادثة برسالة جاهزة
                    بدل نسخ الرقم وتحويله يدويًا في كل مرة */}
                <a
                  href={customerWhatsAppLink(
                    o.phone,
                    `مرحبًا ${o.customer_name}، بخصوص طلبك ${o.code} من M3DStore`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#0C6B39] px-3.5 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                >
                  <WhatsAppIcon width={14} height={14} />
                  كلّم الزبون
                </a>
                <p className="mt-0.5 text-xs text-muted">{o.city} — {o.address}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {o.created_at}{o.payment_method ? ` — ${paymentLabel(o.payment_method)}` : ""}
                </p>
              </div>
              <div className="text-left">
                <p className="text-lg font-extrabold text-primary tabular">{sar(o.total)}</p>
                <label htmlFor={`st-${o.id}`} className="sr-only">حالة الطلب</label>
                <select
                  id={`st-${o.id}`}
                  value={o.status}
                  disabled={busy === o.id}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                  className="mt-1 cursor-pointer rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-bold outline-none focus:border-primary"
                >
                  {Object.entries(ORDER_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <ul className="mt-3 space-y-1 border-t border-line pt-3 text-sm text-muted">
              {lineItems.map((li, i) => (
                <li key={i}>
                  {li.name}
                  {li.colors && li.colors.length > 0 && (
                    <span className="font-bold text-foreground"> — {li.colors.join("، ")}</span>
                  )}
                  {" "}<span className="tabular">×{li.qty}</span> — <span className="tabular">{sar(li.price * li.qty)}</span>
                </li>
              ))}
            </ul>

            {o.notes && (
              <div className="mt-3 rounded-xl bg-accent-soft p-4">
                <p className="text-xs font-bold text-accent">ملاحظة الزبون</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{o.notes}</p>
              </div>
            )}

            {/* الشحنة — تُحجز عند شركة الشحن ثم يُلصق رقمها هنا ليراه الزبون في صفحة التتبع */}
            <div className="mt-3 rounded-xl border border-line p-4">
              <p className="text-xs font-bold text-muted">الشحنة</p>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <div className="min-w-36">
                  <label htmlFor={`car-${o.id}`} className="mb-1 block text-xs font-bold">
                    شركة الشحن
                  </label>
                  <select
                    id={`car-${o.id}`}
                    value={shipOf(o).carrier}
                    onChange={(e) =>
                      setShip((s) => ({ ...s, [o.id]: { ...shipOf(o), carrier: e.target.value } }))
                    }
                    className={`${inputCls} cursor-pointer py-2`}
                  >
                    <option value="">— اختر —</option>
                    {CARRIERS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-44 flex-1">
                  <label htmlFor={`trk-${o.id}`} className="mb-1 block text-xs font-bold">
                    رقم البوليصة
                  </label>
                  <input
                    id={`trk-${o.id}`}
                    dir="ltr"
                    value={shipOf(o).tracking}
                    onChange={(e) =>
                      setShip((s) => ({ ...s, [o.id]: { ...shipOf(o), tracking: e.target.value } }))
                    }
                    placeholder="مثال: 4512389776"
                    className={`${inputCls} py-2 text-left`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => saveShipment(o)}
                  disabled={busy === o.id}
                  className="cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                >
                  حفظ
                </button>
              </div>
              {o.tracking && (
                <p className="mt-2 text-xs text-success">
                  ✓ الزبون يشوف رقم البوليصة في صفحة تتبّع الطلب
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** يقرأ عمود JSON نصيًا ويرجّع قائمة نصوص، أو فارغة إن كان تالفًا */
function safeList(json: string): string[] {
  try {
    const parsed = JSON.parse(json ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/* ===== تبويب المنتجات ===== */
function ProductsTab({
  items,
  images,
  onUploaded,
  reload,
}: {
  items: Product[];
  images: string[];
  onUploaded: (path: string) => void;
  reload: () => void;
}) {
  const empty = { name: "", description: "", price: "", category: "ديكورات وهدايا", image: images[0], stock: "10", leadDays: "3", colors: [] as string[],
    gallery: [images[0]] as string[], colorMode: "single" as "single" | "multi" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const remove = async (p: Product) => {
    if (
      !confirm(
        `حذف «${p.name}» نهائيًا؟\n\nإذا كان المنتج ضمن طلب سابق فسيُخفى بدل الحذف حتى لا ينكسر سجل الطلبات.`
      )
    )
      return;
    setErr("");
    setBusy(true);
    const res = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    const data = await res.json();
    if (!res.ok) setErr(data.error ?? "حدث خطأ");
    else if (!data.deleted)
      setErr("المنتج مرتبط بطلب سابق، فأُخفي من المتجر بدل حذفه نهائيًا.");
    else if (editingId === p.id) {
      setEditingId(null);
      setForm(empty);
    }
    setBusy(false);
    reload();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const payload = {
      id: editingId ?? undefined,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      image: form.gallery[0] ?? form.image,
      images: form.gallery,
      stock: Number(form.stock),
      lead_days: Number(form.leadDays),
      colors: form.colors,
      color_mode: form.colorMode,
    };
    const res = await fetch("/api/admin/products", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) setErr((await res.json()).error ?? "حدث خطأ");
    else {
      setForm(empty);
      setEditingId(null);
    }
    setBusy(false);
    reload();
  };

  const toggle = async (p: Product) => {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, active: p.active ? 0 : 1 }),
    });
    reload();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={save} className="h-fit space-y-4 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-lg font-extrabold">{editingId ? "تعديل منتج" : "إضافة منتج جديد"}</h2>
        <div>
          <label htmlFor="p-name" className="mb-1 block text-sm font-bold">اسم المنتج</label>
          <input id="p-name" required className={inputCls} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label htmlFor="p-desc" className="mb-1 block text-sm font-bold">الوصف</label>
          <textarea id="p-desc" rows={3} className={`${inputCls} resize-y`} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="p-price" className="mb-1 block text-sm font-bold">السعر (ر.س)</label>
            <input id="p-price" required inputMode="decimal" dir="ltr" className={`${inputCls} text-right`}
              value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label htmlFor="p-stock" className="mb-1 block text-sm font-bold">الكمية الجاهزة</label>
            <input id="p-stock" inputMode="numeric" dir="ltr" className={`${inputCls} text-right`}
              value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <p className="mt-1 text-xs text-muted">تنقص تلقائيًا مع كل طلب</p>
          </div>
        </div>

        <div>
          <label htmlFor="p-lead" className="mb-1 block text-sm font-bold">مدة التجهيز (أيام)</label>
          <input id="p-lead" inputMode="numeric" dir="ltr" className={`${inputCls} text-right`}
            value={form.leadDays} onChange={(e) => setForm({ ...form, leadDays: e.target.value })} />
          <p className="mt-1 text-xs text-muted">
            تظهر للزبون. لو نفدت الكمية الجاهزة يبقى المنتج قابلًا للطلب بهذه المدة بدل
            «نفدت الكمية» — فتقدر تشتري المواد بلا ما توقف البيع.
          </p>
        </div>
        <div>
          <label htmlFor="p-cat" className="mb-1 block text-sm font-bold">الفئة</label>
          <select id="p-cat" className={`${inputCls} cursor-pointer`} value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>ديكورات وهدايا</option>
            <option>قطع عملية وأدوات</option>
          </select>
        </div>
        <div>
          <ImagesPicker
            available={images}
            selected={form.gallery}
            onChange={(gallery) => setForm({ ...form, gallery })}
            onUploaded={onUploaded}
          />
          <p className="mt-1 text-xs text-muted">
            الصور المستوردة من إنستقرام تظهر هنا تلقائيًا، وتقدر ترفع صورة من جهازك مباشرة بالزر أعلاه.
          </p>
        </div>
        <ColorPicker
          idPrefix="p-color"
          selected={form.colors}
          onChange={(colors) => setForm({ ...form, colors })}
        />
        {form.colors.length > 1 && (
          <div>
            <span className="mb-1 block text-sm font-bold">كم لونًا يختار الزبون؟</span>
            <div className="flex gap-2">
              {(
                [
                  ["single", "لون واحد"],
                  ["multi", "أكثر من لون"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setForm({ ...form, colorMode: mode })}
                  aria-pressed={form.colorMode === mode}
                  className={`flex-1 cursor-pointer rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                    form.colorMode === mode
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-line bg-surface text-muted hover:border-primary/40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">
              {form.colorMode === "multi"
                ? "الزبون يقدر يجمع أكثر من لون في القطعة الواحدة."
                : "الزبون يختار لونًا واحدًا فقط."}
            </p>
          </div>
        )}
        {err && <p role="alert" className="text-sm font-bold text-danger">{err}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={busy}
            className="flex-1 cursor-pointer rounded-xl bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50">
            {editingId ? "حفظ التعديلات" : "إضافة المنتج"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty); }}
              className="cursor-pointer rounded-xl border border-line px-5 font-bold text-muted transition-colors hover:text-foreground">
              إلغاء
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className={`flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 ${p.active ? "" : "opacity-50"}`}>
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-primary-soft/40">
              <Image src={p.image} alt={p.name} fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{p.name}</p>
              <p className="text-sm text-muted">{p.category} — <span className="tabular">{sar(p.price)}</span> — متوفر: <span className="tabular">{p.stock}</span></p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button"
                onClick={() => {
                  setEditingId(p.id);
                  setForm({
                    name: p.name, description: p.description, price: String(p.price),
                    category: p.category, image: p.image, stock: String(p.stock),
                    leadDays: String(p.lead_days ?? 3),
                    colors: parseColors(p.colors).map((c) => c.name),
                    gallery: [p.image, ...safeList(p.images)],
                    colorMode: parseColorMode(p.color_mode),
                  });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="cursor-pointer rounded-lg border border-line px-4 py-2 text-sm font-bold transition-colors hover:border-primary hover:text-primary">
                تعديل
              </button>
              <button type="button" onClick={() => toggle(p)}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                  p.active
                    ? "border border-line text-muted hover:border-danger hover:text-danger"
                    : "bg-success text-white hover:opacity-90"
                }`}>
                {p.active ? "إخفاء" : "إظهار"}
              </button>
              <button
                type="button"
                onClick={() => remove(p)}
                disabled={busy}
                aria-label={`حذف ${p.name}`}
                title="حذف المنتج"
                className="cursor-pointer rounded-lg border border-line px-3 py-2 text-muted transition-colors hover:border-danger hover:bg-danger-soft hover:text-danger disabled:opacity-50"
              >
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== تبويب التحليلات ===== */
function StatsTab({ data }: { data: Analytics | null }) {
  if (!data) return <p className="py-8 text-center text-muted">جارٍ تحميل التحليلات...</p>;

  const peak = Math.max(1, ...data.daily.map((d) => d.views));
  const dayLabel = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${Number(d)}/${Number(m)}`;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="زيارات اليوم" value={String(data.views.today)} />
        <Stat label="زيارات آخر ٧ أيام" value={String(data.views.week)} />
        <Stat label="طلبات آخر ٣٠ يومًا" value={String(data.orders.month)} />
        <Stat
          label="نسبة التحويل (٣٠ يومًا)"
          value={`${data.conversion.toFixed(1)}%`}
          highlight={data.conversion > 0}
        />
      </div>

      {/* الرسم: الزيارات أعمدة، والطلبات نقاط ذهبية فوقها */}
      <section className="panel-soft rounded-2xl border border-line bg-surface p-5">
        <h3 className="text-base font-bold">آخر ١٤ يومًا</h3>
        <p className="mt-1 text-xs text-muted">
          العمود = زيارات، والنقطة الذهبية = طلبات ذلك اليوم
        </p>

        <div className="mt-5 flex h-40 items-end gap-1.5 overflow-x-auto">
          {data.daily.map((d) => (
            <div key={d.day} className="flex min-w-[26px] flex-1 flex-col items-center gap-1.5">
              {/* مسار باهت خلف كل يوم: بلا زيارات يبقى الرسم مقروءًا كرسم
                  بدل شرائح شبه خفية — وهذه حال الأسبوعين الأولين */}
              <div className="relative flex h-32 w-full items-end justify-center rounded-md bg-surface-2/70">
                <div
                  title={`${d.views} زيارة`}
                  className="w-full rounded-t-md bg-primary-soft transition-colors hover:bg-primary/30"
                  style={{ height: `${Math.max(3, (d.views / peak) * 100)}%` }}
                />
                {d.orders > 0 && (
                  <span
                    title={`${d.orders} طلب`}
                    className="absolute -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-white tabular"
                  >
                    {d.orders}
                  </span>
                )}
              </div>
              <span className="text-[0.6rem] text-muted tabular">{dayLabel(d.day)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-soft rounded-2xl border border-line bg-surface p-5">
        <h3 className="text-base font-bold">الأكثر مشاهدة (٣٠ يومًا)</h3>
        {data.topProducts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            ما فيه مشاهدات مسجّلة بعد. الأرقام تبدأ من أول زيارة بعد هذا التحديث.
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {data.topProducts.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
                <span className="h-2 w-24 overflow-hidden rounded-full bg-surface-2 sm:w-40">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${(p.views / data.topProducts[0].views) * 100}%` }}
                  />
                </span>
                <span className="w-10 text-left text-sm font-bold tabular text-muted">
                  {p.views}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs leading-relaxed text-muted">
        الأرقام تُحسب داخل متجرك ولا تُرسل لأي طرف خارجي، ولا تُخزَّن أي بيانات
        شخصية عن الزوار — عدد فقط لكل يوم ولكل منتج.
      </p>
    </div>
  );
}
