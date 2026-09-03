"use client";

import { useRef, useState } from "react";
import Image from "next/image";

/**
 * اختيار صور المنتج: الأولى هي الرئيسية (تظهر في بطاقة المنتج والسلة)،
 * والبقية تظهر كمعرض داخل صفحة المنتج.
 */
export default function ImagesPicker({
  available,
  selected,
  onChange,
  onUploaded,
}: {
  available: string[];
  selected: string[];
  onChange: (images: string[]) => void;
  /** يُستدعى بعد رفع صورة جديدة بنجاح، لإضافتها إلى قائمة الصور المتاحة في الصفحة */
  onUploaded?: (path: string) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const toggle = (img: string) =>
    onChange(selected.includes(img) ? selected.filter((i) => i !== img) : [...selected, img]);

  const makeMain = (img: string) => onChange([img, ...selected.filter((i) => i !== img)]);

  const upload = async (file: File) => {
    setUploadErr("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setUploadErr(data.error ?? "تعذّر رفع الصورة");
        return;
      }
      onUploaded?.(data.path);
      onChange([...selected, data.path]);
    } catch {
      setUploadErr("تعذّر رفع الصورة — تحقق من الاتصال");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-bold">صور المنتج</span>
        {selected.length > 0 && (
          <span className="text-xs text-muted tabular">{selected.length} مختارة</span>
        )}
      </div>

      <div className="mb-2 flex items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
          className="cursor-pointer rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          {uploading ? "جارٍ الرفع..." : "+ رفع صورة من جهازي"}
        </button>
        {uploadErr && <span className="text-xs font-semibold text-danger">{uploadErr}</span>}
      </div>

      {selected.length > 0 && (
        <div className="mb-3 rounded-xl border border-line bg-primary-soft/20 p-2">
          <p className="mb-2 text-xs font-bold text-muted">
            المختارة بالترتيب — اضغط «رئيسية» لتقديم صورة
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((img, i) => (
              <div key={img} className="relative">
                <div
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    i === 0 ? "border-primary" : "border-line"
                  }`}
                >
                  <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                </div>
                {i === 0 ? (
                  <span className="mt-1 block text-center text-[10px] font-bold text-primary">
                    رئيسية
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeMain(img)}
                    className="mt-1 block w-full cursor-pointer text-center text-[10px] font-bold text-muted transition-colors hover:text-primary"
                  >
                    رئيسية
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid max-h-56 grid-cols-5 gap-2 overflow-y-auto rounded-xl border border-line p-2">
        {available.map((img) => {
          const on = selected.includes(img);
          const order = selected.indexOf(img);
          return (
            <button
              key={img}
              type="button"
              onClick={() => toggle(img)}
              aria-pressed={on}
              aria-label={`اختيار صورة ${img}`}
              className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                on ? "border-primary" : "border-line hover:border-primary/40"
              }`}
            >
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              {on && (
                <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white tabular">
                  {order + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-1 text-xs text-muted">
        {selected.length === 0
          ? "اختر صورة واحدة على الأقل."
          : selected.length === 1
            ? "صورة واحدة — أضف صورًا ثانية ليظهر معرض في صفحة المنتج."
            : `${selected.length} صور — الزبون يقدر يتنقل بينها ويكبّرها.`}
      </p>
    </div>
  );
}
