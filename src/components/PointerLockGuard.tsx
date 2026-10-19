"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Safety net for a Base UI scroll-lock leak.
 *
 * Base UI's dialog/sheet lock scroll by writing inline styles to <html> and
 * <body> and tagging <html> with `data-base-ui-scroll-locked`, then restoring
 * them on close via a deferred (setTimeout) release on a shared singleton
 * locker. If the user navigates away (e.g. browser back) while a dialog is
 * still open, the owning component unmounts mid-flight and that restore can
 * fail to run — leaving <body> stuck with `overflow:hidden; position:relative;`
 * and a fixed height/width. The page then looks normal but is dead to clicks
 * and scroll.
 *
 * On every route change, if the lock marker is still present we clear exactly
 * the inline styles Base UI sets, so a leaked lock can never outlive the page
 * that opened it. A dialog that is genuinely open on the destination route
 * re-acquires the lock on mount, so this does not fight a legitimate lock.
 */
export default function PointerLockGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    // Only intervene when a lock was left behind.
    if (!html.hasAttribute("data-base-ui-scroll-locked")) return;

    // If a dialog/popup is actually open on this route, the lock is legitimate
    // — leave it alone (clearing it would break the open dialog).
    const hasOpenPopup = document.querySelector(
      '[data-slot="dialog-content"],[role="dialog"][data-open],[data-base-ui-popup][data-open]'
    );
    if (hasOpenPopup) return;

    const body = document.body;
    html.removeAttribute("data-base-ui-scroll-locked");

    // Clear the inline styles Base UI's scroll lock applies to <html>.
    html.style.overflowX = "";
    html.style.overflowY = "";
    html.style.scrollbarGutter = "";
    html.style.scrollBehavior = "";

    // Clear the inline styles it applies to <body>.
    body.style.position = "";
    body.style.height = "";
    body.style.width = "";
    body.style.boxSizing = "";
    body.style.overflow = "";
    body.style.overflowX = "";
    body.style.overflowY = "";
    body.style.scrollBehavior = "";

    // Belt-and-braces: some older dialog libs use pointer-events on body.
    if (body.style.pointerEvents === "none") body.style.pointerEvents = "";
  }, [pathname]);

  return null;
}
