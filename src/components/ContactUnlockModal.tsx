"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { contact?: string };
  theme?: { color?: string };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface Props {
  listingId: number;
}

export default function ContactUnlockModal({ listingId }: Props) {
  const { isLoggedIn, user } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if already unlocked on mount
  useEffect(() => {
    if (!isLoggedIn) {
      setChecking(false);
      return;
    }
    api.checkUnlock(listingId)
      .then((res) => {
        if (res.unlocked) {
          setUnlocked(true);
          setPhone(res.phone || null);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [listingId, isLoggedIn]);

  // Load Razorpay script
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleUnlock = async () => {
    if (!isLoggedIn) {
      toast.error("ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ (Please login first)");
      return;
    }

    setLoading(true);
    try {
      const order = await api.createUnlockOrder(listingId);

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Deal Spot",
        description: "ಕಾಂಟ್ಯಾಕ್ಟ್ ಅನ್‌ಲಾಕ್ (Contact Unlock)",
        order_id: order.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const result = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setUnlocked(true);
            setPhone(result.phone);
            toast.success("ಯಶಸ್ವಿಯಾಗಿ ಅನ್‌ಲಾಕ್ ಆಗಿದೆ!");
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Payment verification failed";
            toast.error(msg);
          }
        },
        prefill: { contact: user?.phone },
        theme: { color: "#16a34a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create order";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // If already unlocked, show contact directly
  if (unlocked && phone) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <CheckCircle2 className="mx-auto mb-2 text-green-500" size={28} />
        <p className="text-sm text-green-700 font-medium mb-2">ಕಾಂಟ್ಯಾಕ್ಟ್ ಅನ್‌ಲಾಕ್ ಆಗಿದೆ</p>
        <p className="text-xl font-bold text-green-800">{phone}</p>
        <a href={`tel:${phone}`} className="mt-2 inline-block">
          <Button variant="outline" size="sm" className="border-green-300 text-green-700">
            <Phone size={14} className="mr-1" /> ಕರೆ ಮಾಡಿ
          </Button>
        </a>
      </div>
    );
  }

  if (checking) {
    return (
      <Button disabled className="w-full">
        <Loader2 size={16} className="mr-2 animate-spin" /> ಲೋಡ್ ಆಗುತ್ತಿದೆ...
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button className="w-full bg-primary" />}>
        <Lock size={16} className="mr-2" />
        ಕಾಂಟ್ಯಾಕ್ಟ್ ನೋಡಿ (View Contact) - ₹50
      </DialogTrigger>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <Lock className="mx-auto mb-2 text-primary" size={32} />
            ಕಾಂಟ್ಯಾಕ್ಟ್ ಅನ್‌ಲಾಕ್ ಮಾಡಿ
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4 py-4">
          <p className="text-gray-600 text-sm">
            ಮಾಲೀಕರ ಫೋನ್ ನಂಬರ್ ನೋಡಲು ₹50 ಪಾವತಿಸಿ
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-primary">₹50</p>
            <p className="text-xs text-gray-500">ಒಂದು ಕಾಂಟ್ಯಾಕ್ಟ್ ಅನ್‌ಲಾಕ್ (UPI / Card / Net Banking)</p>
          </div>
          <Button
            onClick={handleUnlock}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> ಪ್ರಕ್ರಿಯೆ ಮಾಡಲಾಗುತ್ತಿದೆ...</>
            ) : (
              "₹50 ಪಾವತಿಸಿ (Pay ₹50)"
            )}
          </Button>
          <p className="text-[10px] text-gray-400">Powered by Razorpay • Secure Payment</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
