"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Lock, CheckCircle2 } from "lucide-react";

export default function ContactUnlockModal() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <Dialog onOpenChange={() => setUnlocked(false)}>
      <DialogTrigger render={<Button className="flex-1 bg-primary" />}>
        <Phone size={16} className="mr-2" />
        ಕಾಂಟ್ಯಾಕ್ಟ್ ನೋಡಿ (View Contact)
      </DialogTrigger>
      <DialogContent className="max-w-sm mx-auto">
        {!unlocked ? (
          <>
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
                <p className="text-xs text-gray-500">ಒಂದು ಕಾಂಟ್ಯಾಕ್ಟ್ ಅನ್‌ಲಾಕ್</p>
              </div>
              <Button
                onClick={() => setUnlocked(true)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                ಮುಂದುವರಿಸಿ (Proceed)
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">
                <CheckCircle2 className="mx-auto mb-2 text-green-500" size={40} />
                ಯಶಸ್ವಿಯಾಗಿ ಅನ್‌ಲಾಕ್ ಆಗಿದೆ!
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4 py-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <Phone className="mx-auto mb-2 text-green-600" size={24} />
                <p className="text-xl font-bold text-green-700">+91 98765 43210</p>
              </div>
              <p className="text-sm text-gray-500">ಕಾಂಟ್ಯಾಕ್ಟ್ ವಿವರ ಅನ್‌ಲಾಕ್ ಆಗಿದೆ</p>
              <Button variant="outline" className="w-full">
                <Phone size={16} className="mr-2" />
                ಕರೆ ಮಾಡಿ (Call Now)
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
