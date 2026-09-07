"use client";

import { useState } from "react";

/**
 * مقطع القطعة.
 *
 * لعب المفاصل لا تبيعها صورة ساكنة — الحركة هي المنتج نفسه. لذلك
 * يُشغَّل المقطع تلقائيًا وصامتًا ومكرّرًا، كما في إنستقرام: يرى الزبون
 * السمكة تتلوّى قبل أن يقرأ كلمة واحدة.
 *
 * الحاوية مربّعة والمقطع object-contain داخلها: لا نعرف نسبة كل مقطع
 * مسبقًا، وبلا حجز مساحة ينهار عنصر الفيديو إلى 300×150 الافتراضية
 * ثم تقفز الصفحة عند التحميل.
 *
 * و preload يبقى "metadata" لا "none": مع "none" لا يبدأ التشغيل
 * التلقائي أصلًا ولا يُعرف مقاس المقطع — جرّبناها فانكسر الاثنان.
 */
export default function ProductVideo({
  src,
  poster,
  alt,
}: {
  src: string;
  poster?: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-primary-soft/30">
      <video
        src={src}
        poster={poster}
        aria-label={`مقطع لـ${alt}`}
        className="absolute inset-0 h-full w-full object-contain"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        controls
        onError={() => setFailed(true)}
      />
    </div>
  );
}
