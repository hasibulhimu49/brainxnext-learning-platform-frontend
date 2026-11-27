import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Focusable elements inside `root` that are actually rendered (skips `hidden`/display:none ones). */
const focusablesIn = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.checkVisibility?.() ?? true);

/**
 * While `active`, keeps Tab / Shift+Tab inside `containerRef` (wrapping at both ends) and closes on
 * Escape: `onClose` runs and focus goes back to `returnFocusRef` (the control that opened it).
 * Used by the mobile menu (Navbar) and the Next AI chat panel.
 */
const useFocusTrap = (
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
  returnFocusRef?: RefObject<HTMLElement | null>
) => {
  // keep the latest callback without re-binding the listener on every render
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e: KeyboardEvent) => {
      const root = containerRef.current;
      if (!root) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        returnFocusRef?.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusablesIn(root);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      const current = document.activeElement;
      const inside = current instanceof Node && root.contains(current);
      if (e.shiftKey && (!inside || current === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || current === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, containerRef, returnFocusRef]);
};

export default useFocusTrap;
