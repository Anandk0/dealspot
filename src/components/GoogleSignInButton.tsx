"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Renders the official Google Identity Services sign-in button. On success it
 * hands the Google ID token (a credential JWT) back to the parent via
 * `onCredential`. Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be set.
 */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (resp: { credential: string }) => void;
            ux_mode?: string;
          }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

export default function GoogleSignInButton({
  onCredential,
  text = "continue_with",
}: {
  onCredential: (idToken: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Load the GSI script once.
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setReady(true);
      return;
    }
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  // Initialise + render the button once the script and client id are available.
  useEffect(() => {
    if (!ready || !clientId || !ref.current || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => resp?.credential && onCredential(resp.credential),
    });
    ref.current.innerHTML = "";
    window.google.accounts.id.renderButton(ref.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text,
      shape: "pill",
      logo_alignment: "center",
      width: 300,
    });
  }, [ready, clientId, onCredential, text]);

  if (!clientId) {
    return (
      <p className="text-center text-xs text-muted-foreground">
        Google sign-in not configured
      </p>
    );
  }

  return <div ref={ref} className="flex justify-center" />;
}
