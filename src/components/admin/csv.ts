/** Client-side CSV export / import-preview helpers for the admin tables. */

export interface CsvColumn<R> {
  header: string;
  value: (row: R) => string | number | null | undefined;
}

const escape = (v: string | number | null | undefined) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** RFC 4180-style CSV text with a header row (CRLF line endings, as spreadsheet apps expect). */
export const toCsv = <R>(columns: CsvColumn<R>[], rows: R[]) =>
  [columns.map((c) => escape(c.header)).join(","), ...rows.map((r) => columns.map((c) => escape(c.value(r))).join(","))].join("\r\n");

/** Trigger a browser download of `csv` as `filename` (Blob + object URL). */
export const downloadCsv = (filename: string, csv: string) => {
  // BOM so Excel opens UTF-8 (৳, Bangla names) correctly
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const exportCsv = <R>(filename: string, columns: CsvColumn<R>[], rows: R[]) => downloadCsv(filename, toCsv(columns, rows));

/** Split one CSV line into cells (handles quoted cells with commas and "" escapes). */
export const splitCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      cells.push(cur);
      cur = "";
    } else cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
};

export interface CsvPreview {
  headers: string[];
  rows: number;
  missing: string[];
}

/** Check a CSV file's header row against the required columns (case-insensitive) and count data rows. */
export const previewCsv = (text: string, required: string[]): CsvPreview => {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");
  const headers = lines[0] ? splitCsvLine(lines[0]) : [];
  const have = new Set(headers.map((h) => h.toLowerCase()));
  return { headers, rows: Math.max(0, lines.length - 1), missing: required.filter((r) => !have.has(r.toLowerCase())) };
};
