const methods = ["مدى", "Apple Pay", "STC Pay", "تابي", "تمارا"];

export default function PaymentBadges({ size = "md" }: { size?: "sm" | "md" }) {
  const cls =
    size === "sm"
      ? "px-2.5 py-1 text-xs"
      : "px-3.5 py-1.5 text-sm";
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="وسائل الدفع المتاحة">
      {methods.map((m) => (
        <li
          key={m}
          className={`rounded-lg border border-line bg-surface font-semibold text-muted ${cls}`}
        >
          {m}
        </li>
      ))}
    </ul>
  );
}
