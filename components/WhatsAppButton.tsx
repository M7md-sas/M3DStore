import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./Icons";

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("مرحبًا، عندي استفسار عن متجر M3DStore")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105"
    >
      <WhatsAppIcon width={28} height={28} />
    </a>
  );
}
