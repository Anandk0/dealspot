"use client";
import { useEffect, useId, useState } from "react";
import "./splash-reveal.css";

const SEEN_KEY = "dealspot_splash_seen";

interface SplashRevealProps {
  onDone?: () => void;
}

/**
 * One-time brand reveal splash. Plays a ~4.4s pure-CSS build-up on the first
 * load of a session (gated by sessionStorage), then fades out and unmounts.
 * It is a fixed overlay that releases pointer-events while hiding, so it never
 * blocks navigation. Honors prefers-reduced-motion by showing a brief static
 * badge instead of the long reveal.
 */
export default function SplashReveal({ onDone }: SplashRevealProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `splr-grad-${uid}`;
  const ringId = `splr-ring-${uid}`;

  // Start hidden; decide on mount so SSR renders nothing and we never flash.
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // sessionStorage may be unavailable (private mode); fall through.
    }
    if (alreadySeen) {
      onDone?.();
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduce);
    setMounted(true);

    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // ignore
    }

    // Reduced motion: brief static badge; otherwise the full timeline.
    const revealMs = reduce ? 600 : 4400;
    const fadeMs = 600;

    const fadeTimer = setTimeout(() => setHiding(true), revealMs);
    const doneTimer = setTimeout(() => {
      setMounted(false);
      onDone?.();
    }, revealMs + fadeMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  if (!mounted) return null;

  const leafPaths = (
    <>
      <path
        d="M12 1.5C6.5 5 3.5 9.5 3.5 14.2c0 4.7 3.8 8.3 8.5 8.3s8.5-3.6 8.5-8.3C20.5 9.5 17.5 5 12 1.5Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M12 3.4c-3.3 2.6-5.4 5.9-6 9.3 1.2-3.1 3.4-6 6.6-8.4.2-.3.1-.7-.2-.9a.6.6 0 0 0-.4 0Z"
        fill="#ffffff"
        fillOpacity="0.5"
      />
    </>
  );

  return (
    <div
      className={`splr${hiding ? " splr--hiding" : ""}${reducedMotion ? " splr--static" : ""}`}
      role="status"
      aria-label="Loading Deal Spot Connect"
      aria-live="polite"
    >
      <div className="splr__disc">
        <svg className="splr__ring" viewBox="0 0 160 160" aria-hidden="true">
          <defs>
            <linearGradient id={ringId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#AACD04" />
              <stop offset="100%" stopColor="#18440A" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r="70" stroke={`url(#${ringId})`} pathLength={220} />
          <circle cx="80" cy="80" r="70" stroke={`url(#${ringId})`} pathLength={220} />
        </svg>

        <div className="splr__leaves">
          <svg className="splr__leaf splr__leaf--1" viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#AACD04" />
                <stop offset="55%" stopColor="#5E9B08" />
                <stop offset="100%" stopColor="#18440A" />
              </linearGradient>
            </defs>
            {leafPaths}
          </svg>
          <svg className="splr__leaf splr__leaf--2" viewBox="0 0 24 24" aria-hidden="true">
            {leafPaths}
          </svg>
          <svg className="splr__leaf splr__leaf--3" viewBox="0 0 24 24" aria-hidden="true">
            {leafPaths}
          </svg>
        </div>
      </div>

      <div className="splr__wordmark">Deal Spot Connect</div>
      <div className="splr__tagline">
        <span>ಗ್ರಾಮೀಣ ಮಾರುಕಟ್ಟೆ</span>
        <span>Rural Marketplace</span>
      </div>
    </div>
  );
}
