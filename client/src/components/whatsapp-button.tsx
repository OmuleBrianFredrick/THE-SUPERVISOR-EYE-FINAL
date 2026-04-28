import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_URL = "https://wa.me/256702634715";

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Talk to us on WhatsApp"
      data-testid="link-whatsapp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] pl-4 pr-5 py-3 text-white font-semibold shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-300/40 hover:bg-[#1ebe57] hover:scale-105 active:scale-95 transition-all duration-200"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
        <span className="absolute inset-0 rounded-full bg-white/30 animate-ping opacity-60" />
        <SiWhatsapp className="relative h-5 w-5" />
      </span>
      <span className="text-sm whitespace-nowrap" data-testid="text-whatsapp-cta">
        Talk to us directly
      </span>
    </a>
  );
}
