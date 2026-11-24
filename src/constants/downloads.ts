/**
 * Downloadable files. The handbooks and lesson resources are placeholder PDFs for now (user
 * decision, F-002) — one real file in public/handbooks/, saved under a descriptive name.
 * Replace with real files (or backend download URLs) when they exist.
 */
export const PLACEHOLDER_PDF = "/handbooks/sample.pdf";

/** "Java" → "brainxnext-java-handbook.pdf" */
export const handbookFileName = (name: string) => `brainxnext-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-handbook.pdf`;

/** Handbook slug in URLs (?handbook=java) */
export const handbookSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
