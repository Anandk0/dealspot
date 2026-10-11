"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

/**
 * Listing image gallery: a large main image with clickable thumbnails that
 * swap it, prev/next arrows, and a full-screen lightbox (click the main image
 * to enlarge) with slide navigation via arrows / keyboard.
 *
 * `overlay` is rendered on top of the main image (e.g. the distance badge).
 * `fallback` is shown when there are no images.
 */
export default function ImageGallery({
  images,
  alt,
  overlay,
  fallback,
}: {
  images: string[];
  alt: string;
  overlay?: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const has = images && images.length > 0;
  const count = has ? images.length : 0;

  const go = useCallback(
    (dir: number) => {
      if (count === 0) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count]
  );

  // Keyboard navigation while the lightbox is open.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, go]);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full h-80 bg-muted rounded-2xl overflow-hidden flex items-center justify-center group">
        {has ? (
          <>
            <img
              src={images[index]}
              alt={alt}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setLightbox(true)}
            />
            {/* Zoom hint */}
            <button
              onClick={() => setLightbox(true)}
              className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-black/55 text-white text-xs px-2.5 py-1.5 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition"
              aria-label="Enlarge image"
            >
              <ZoomIn size={13} /> Tap to enlarge
            </button>
            {/* Prev / next arrows (only with >1 image) */}
            {count > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => go(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
                {/* Counter */}
                <span className="absolute bottom-3 right-3 bg-black/55 text-white text-[11px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {index + 1} / {count}
                </span>
              </>
            )}
          </>
        ) : (
          <div className="text-8xl">{fallback}</div>
        )}
        {overlay}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition ${
                i === index ? "border-primary ring-2 ring-primary/30" : "border-border opacity-80 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && has && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X size={22} />
          </button>

          <img
            src={images[index]}
            alt={alt}
            className="max-w-[92vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {count > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                aria-label="Previous image"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); go(1); }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                aria-label="Next image"
              >
                <ChevronRight size={26} />
              </button>

              {/* Lightbox thumbnails strip */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[92vw] overflow-x-auto px-2"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition ${
                      i === index ? "border-primary" : "border-white/30 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/90 text-sm">
                {index + 1} / {count}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
