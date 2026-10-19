"use client";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/lang-context";

// Support WhatsApp numbers. `dial` is digits-only (country code + number) for
// the wa.me link; `display` is the pretty label shown to the user.
const WHATSAPP_NUMBERS: { display: string; dial: string }[] = [
  { display: "+91 87227 27151", dial: "918722727151" },
  { display: "+91 97421 91025", dial: "919742191025" },
];

/**
 * WhatsApp support button. On click it opens a popup listing both support
 * numbers, each with a Chat button that opens that number's WhatsApp chat.
 *
 * `trigger` lets callers supply their own clickable element (e.g. the footer
 * icon or the help-page contact card); the component wires the click to open
 * the popup. If omitted, a default labelled button is rendered.
 */
export default function WhatsAppButton({ trigger }: { trigger?: React.ReactNode }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  const openChat = (dial: string) => {
    window.open(`https://wa.me/${dial}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="contents">
          {trigger}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition"
          aria-label="WhatsApp"
        >
          <MessageCircle size={18} /> WhatsApp
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle size={18} className="text-green-600" />
              {t("ವಾಟ್ಸಾಪ್ ಸಂಪರ್ಕ", "WhatsApp Support")}
            </DialogTitle>
            <DialogDescription>
              {t("ಚಾಟ್ ಮಾಡಲು ಒಂದು ನಂಬರ್ ಆಯ್ಕೆಮಾಡಿ", "Choose a number to start a chat")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 py-2">
            {WHATSAPP_NUMBERS.map((n) => (
              <div
                key={n.dial}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center shrink-0">
                    <MessageCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">{n.display}</span>
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                  onClick={() => openChat(n.dial)}
                >
                  <MessageCircle size={14} className="mr-1" /> {t("ಚಾಟ್", "Chat")}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
