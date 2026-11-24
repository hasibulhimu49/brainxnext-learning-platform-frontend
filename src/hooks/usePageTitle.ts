import { useEffect } from "react";

export const SITE_NAME = "BrainXNext";
export const HOME_TITLE = "BrainXNext — Learn · Build · Grow";

/** "Pricing" → "Pricing · BrainXNext"; no title → the home title. */
export const formatPageTitle = (title?: string) => (title ? `${title} · ${SITE_NAME}` : HOME_TITLE);

/**
 * Sets document.title while the page is mounted and restores the previous title on unmount.
 * usePageTitle("Pricing")  ·  usePageTitle() on Home
 */
const usePageTitle = (title?: string) => {
  useEffect(() => {
    const previous = document.title;
    document.title = formatPageTitle(title);
    return () => {
      document.title = previous;
    };
  }, [title]);
};

export default usePageTitle;
