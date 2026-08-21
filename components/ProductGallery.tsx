"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { XIcon, ArrowLeftIcon } from "./Icons";

/**
 * معرض صور المنتج: صورة رئيسية + مصغّرات، والضغط يفتحها بالحجم الكامل.
 * نستخدم object-contain لا object-cover حتى تظهر الصورة كاملة بلا قص.
 */
export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  const count = images.length;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  // التنقل بالكيبورد داخل العارض المكبّر
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (count > 1 && e.key === "ArrowRight") go(-1);
      if (count > 1 && e.key === "ArrowLeft") go(1);
    };
    document.addEventListener("keydown", onKey);
    // منع تمرير الصفحة خلف العارض
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, count]);

  if (count === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label="تكبير الصورة"
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-line bg-primary-soft/30"
      >
        <Image
          src={images[index]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-foreground/70 px-3 py-1.5 text-xs font-bold text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          اضغط للتكبير
        </span>
        {count > 1 && (
          <span className="absolute top-3 left-3 rounded-full bg-foreground/70 px-3 py-1 text-xs font-bold text-white tabular backdrop-blur">
            {index + 1} / {count}
          </span>
        )}
      </button>

      {count > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`صورة ${i + 1}`}
              aria-current={i === index}
              className={`relative h-20 w-20 cursor-pointer overflow-hidden rounded-xl border-2 bg-primary-soft/30 transition-colors ${
                i === index ? "border-primary" : "border-line hover:border-primary/40"
              }`}
            >
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`صور ${alt}`}
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="إغلاق"
            className="absolute top-4 left-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-surface/15 text-white transition-colors hover:bg-surface/30"
          >
            <XIcon width={22} height={22} />
          </button>

          <div
            className="relative h-[75vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[index]}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {count > 1 && (
            <div
              className="mt-4 flex items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="الصورة التالية"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-surface/15 text-white transition-colors hover:bg-surface/30"
              >
                <ArrowLeftIcon width={20} height={20} />
              </button>
              <span className="text-sm font-bold text-white tabular">
                {index + 1} / {count}
              </span>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="الصورة السابقة"
                className="flex h-11 w-11 rotate-180 cursor-pointer items-center justify-center rounded-full bg-surface/15 text-white transition-colors hover:bg-surface/30"
              >
                <ArrowLeftIcon width={20} height={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
