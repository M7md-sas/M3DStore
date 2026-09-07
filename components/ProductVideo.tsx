"use client";

import { useState } from "react";

/**
 * مقطع القطعة.
 *
 * لعب المفاصل لا تبيعها صورة ساكنة — الحركة هي المنتج نفسه. لذلك
 * يُشغَّل المقطع تلقائيًا وصامتًا ومكرّرًا، كما في إنستقرام: يرى الزبون
 * السمكة تتلوّى قبل أن يقرأ كلمة واحدة.
 *
 * preload="none" حتى لا نحمّل ميجابايتين على جوال أحدهم قبل أن يطلبها،
 * والملصق هو صورة المنتج نفسها فلا يظهر مربع أسود قبل التشغيل.
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
    <div className="relative overflow-hidden rounded-3xl border border-line bg-primary-soft/30">
      <video
        src={src}
        poster={poster}
        aria-label={`مقطع لـ${alt}`}
        className="block h-auto w-full"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        controls
        onError={() => setFailed(true)}
      />
    </div>
  );
}
