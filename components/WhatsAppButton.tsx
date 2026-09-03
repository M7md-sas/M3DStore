import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./Icons";

/**
 * شارة واتساب بلغة الملصق: مستطيل محدود بخط أسود لا فقاعة عائمة،
 * ومكانها أسفل اليسار بحيث لا تغطي شبكة القطع.
 */
export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("مرحبًا، عندي استفسار عن متجر M3DStore")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="اسأل عبر واتساب"
      className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 card-soft rounded-full border border-line bg-surface p-3 text-sm font-bold text-foreground transition-transform duration-200 hover:-translate-y-0.5 md:px-4 md:py-3"
    >
      <WhatsAppIcon width={18} height={18} className="text-[#0C6B39]" />
      <span className="hidden md:inline">اسأل واتساب</span>
    </a>
  );
}
