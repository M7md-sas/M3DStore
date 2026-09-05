"use client";

/** زر الطباعة — يختفي عند الطباعة نفسها فلا يظهر في الورقة */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
    >
      طباعة / حفظ PDF
    </button>
  );
}
