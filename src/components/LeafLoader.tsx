"use client";
import { useId } from "react";
import "./leaf-loader.css";

export type LeafLoaderVariant = "orbit" | "sprig" | "trio";

interface LeafLoaderProps {
  variant?: LeafLoaderVariant;
  /** Rendered size in px (root wrapper). Default 48. */
  size?: number;
}

/**
 * Deal Spot leaf loader. Renders the brand teardrop leaf (green vertical
 * gradient + white highlight sweep) once as an SVG symbol and reuses it via
 * `<use>` for each of the three leaves. Layout/motion switch by `variant`.
 *
 * - orbit: three leaves breathing around a faint brand-green ring that spins.
 * - sprig: three leaves unfurling from a shared stem.
 * - trio:  three leaves in a row hopping (wider than tall).
 */
export default function LeafLoader({ variant = "orbit", size = 48 }: LeafLoaderProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `dsl-grad-${uid}`;
  const highlightId = `dsl-hl-${uid}`;
  const leafId = `dsl-leaf-${uid}`;

  // trio is wider than tall; others are square.
  const width = variant === "trio" ? Math.round(size * 1.7) : size;
  const height = size;

  const leaf = (n: 1 | 2 | 3) => (
    <svg
      key={n}
      className={`dsl__leaf dsl__leaf--${n}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <use href={`#${leafId}`} />
    </svg>
  );

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`dsl dsl--${variant}`}
      style={{ width, height }}
    >
      {/* Shared leaf symbol + gradients, declared once per instance. */}
      <svg className="dsl__svg-defs" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#AACD04" />
            <stop offset="55%" stopColor="#5E9B08" />
            <stop offset="100%" stopColor="#18440A" />
          </linearGradient>
          <linearGradient id={highlightId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <symbol id={leafId} viewBox="0 0 24 24">
            {/* Rounded teardrop leaf */}
            <path
              d="M12 1.5C6.5 5 3.5 9.5 3.5 14.2c0 4.7 3.8 8.3 8.5 8.3s8.5-3.6 8.5-8.3C20.5 9.5 17.5 5 12 1.5Z"
              fill={`url(#${gradId})`}
            />
            {/* White highlight sweep */}
            <path
              d="M12 3.4c-3.3 2.6-5.4 5.9-6 9.3 1.2-3.1 3.4-6 6.6-8.4.2-.3.1-.7-.2-.9a.6.6 0 0 0-.4 0Z"
              fill={`url(#${highlightId})`}
            />
          </symbol>
        </defs>
      </svg>

      {variant === "orbit" ? (
        <>
          <span className="dsl__ring" aria-hidden="true" />
          <span className="dsl__arm" aria-hidden="true">
            <span className="dsl__spoke dsl__spoke--1">{leaf(1)}</span>
            <span className="dsl__spoke dsl__spoke--2">{leaf(2)}</span>
            <span className="dsl__spoke dsl__spoke--3">{leaf(3)}</span>
          </span>
        </>
      ) : variant === "sprig" ? (
        <>
          <span className="dsl__stem" aria-hidden="true" />
          {leaf(1)}
          {leaf(2)}
          {leaf(3)}
        </>
      ) : (
        <>
          {leaf(1)}
          {leaf(2)}
          {leaf(3)}
        </>
      )}
    </span>
  );
}
