import type { SVGProps } from "react";

/**
 * علامة الـ M من الشعار، مرسومة مسارًا نظيفًا بدل صورة JPG
 * حتى تقبل أي لون وأي حجم وتُرسم حدودها عند الحاجة.
 */
export default function MarkM({
  variant = "solid",
  ...props
}: SVGProps<SVGSVGElement> & { variant?: "solid" | "outline" }) {
  const d =
    "M12 14 L12 70 L28 78 L28 40 L44 56 L44 88 L50 92 L56 88 L56 56 L72 40 L72 78 L88 70 L88 14 L50 48 Z";

  return (
    <svg viewBox="0 0 100 106" aria-hidden focusable="false" {...props}>
      <path
        d={d}
        fill={variant === "solid" ? "currentColor" : "none"}
        stroke={variant === "outline" ? "currentColor" : "none"}
        strokeWidth={variant === "outline" ? 1.5 : undefined}
        strokeLinejoin="round"
      />
    </svg>
  );
}
