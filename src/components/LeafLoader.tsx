import { useId } from "react";

interface LeafLoaderProps {
  /** Width/height in px. Matches the lucide `size` prop so it can replace Loader2. */
  size?: number;
  className?: string;
  label?: string;
}

/**
 * Deal Spot "Orbit" loader: three leaves circling. Pure CSS animation
 * (see .dsl-orbit in globals.css), respects prefers-reduced-motion.
 */
export default function LeafLoader({ size = 24, className = "", label = "Loading" }: LeafLoaderProps) {
  // Unique ids per instance so several loaders on one page never clash.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `dslLeaf${uid}`;
  const symId = `dslLf${uid}`;

  return (
    <span
      className={`dsl dsl-orbit ${className}`}
      style={{ ["--s" as string]: `${size}px` }}
      role="status"
      aria-label={label}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="26" y1="14" x2="72" y2="86" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#AACD04" />
            <stop offset=".48" stopColor="#5E9B08" />
            <stop offset="1" stopColor="#18440A" />
          </linearGradient>
          <symbol id={symId} viewBox="0 0 100 100">
            <path fill={`url(#${gradId})`} d="M7 93C2 44 44 2 93 7 98 56 56 98 7 93Z" />
            <path fill="#fff" d="M12 89C27 73 46 52 73 26 63 49 43 69 20 92Z" />
          </symbol>
        </defs>
      </svg>
      {[0, 1, 2].map((i) => (
        <span className="arm" key={i}>
          <svg aria-hidden="true">
            <use href={`#${symId}`} />
          </svg>
        </span>
      ))}
    </span>
  );
}
