import { useState } from "react";
import { Alert } from "@/components/common/FormFeedback";
import Icon from "@/components/common/Icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { previewCsv, type CsvPreview } from "@/lib/csv";
import { formatBytes } from "@/lib/admin";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** e.g. "courses" */
  what: string;
  requiredHeaders: string[];
}

/**
 * "Import" header action: picks a CSV and checks its header row. Preview only — nothing is
 * imported until the backend has an import endpoint.
 */
const ImportDialog = ({ open, onOpenChange, what, requiredHeaders }: ImportDialogProps) => {
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = (o: boolean) => {
    if (!o) {
      setFile(null);
      setPreview(null);
      setError(null);
    }
    onOpenChange(o);
  };

  const pick = async (f: File | undefined) => {
    setPreview(null);
    setError(null);
    if (!f) return;
    setFile({ name: f.name, size: f.size });
    if (!/\.csv$/i.test(f.name)) {
      setError("Choose a .csv file.");
      return;
    }
    try {
      setPreview(previewCsv(await f.text(), requiredHeaders));
    } catch {
      setError("The file could not be read.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-125">
        <DialogHeader>
          <DialogTitle>Preview import</DialogTitle>
          <DialogDescription>
            Check a CSV of {what} before importing. This is a preview only — nothing is saved until bulk import is available.
          </DialogDescription>
        </DialogHeader>

        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-line bg-surface2 px-4 py-6 text-center text-[13px] font-semibold text-soft transition-colors hover:border-brand">
          <Icon name="upload_file" size={28} />
          {file ? (
            <span className="text-ink">
              {file.name} · {formatBytes(file.size)}
            </span>
          ) : (
            "Choose a CSV file"
          )}
          <input
            type="file"
            accept=".csv,text/csv"
            aria-label="CSV file"
            className="sr-only"
            onChange={(e) => void pick(e.target.files?.[0])}
          />
        </label>

        <p className="m-0 text-[11.5px] font-semibold text-soft">
          Required columns: <span className="font-extrabold text-ink">{requiredHeaders.join(", ")}</span>
        </p>

        {error && <Alert>{error}</Alert>}
        {preview &&
          (preview.missing.length ? (
            <Alert>Missing columns: {preview.missing.join(", ")}</Alert>
          ) : (
            <Alert tone="success">
              Columns look good — {preview.rows} {preview.rows === 1 ? "row" : "rows"} ready to import.
            </Alert>
          ))}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="md">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
