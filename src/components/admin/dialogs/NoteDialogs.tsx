import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Icon from "@/components/common/Icon";
import { FieldError } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/input";
import { useCreateNote, useUploadNoteVersion } from "@/queries/admin";
import { NOTE_TYPES, noteFileSchema, noteSchema, type NoteValues } from "@/schemas/admin";
import type { AdminNote } from "@/types/admin";
import { formatBytes } from "../format";
import FormDialog, { Field, selectCls } from "./FormDialog";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULTS: NoteValues = { name: "", category: "", type: "PDF", pages: "", status: "draft" };

/** "+ Create note" on the Notes page. */
export const CreateNoteDialog = ({ open, onOpenChange }: DialogProps) => {
  const create = useCreateNote();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteValues>({ resolver: zodResolver(noteSchema), defaultValues: DEFAULTS });

  const close = (o: boolean) => {
    if (!o) {
      reset();
      create.reset();
    }
    onOpenChange(o);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={close}
      title="Create note"
      description="Add a handbook or study note. Upload the file from its row once it exists."
      submitLabel="Create note"
      pending={create.isPending}
      error={create.error}
      onSubmit={handleSubmit((v) =>
        create.mutate(v, {
          onSuccess: (n) => {
            toast.success(`“${n.name}” was created`);
            close(false);
          },
        })
      )}
    >
      <Field id="note-name" label="Title" error={errors.name?.message}>
        <Input id="note-name" aria-invalid={!!errors.name || undefined} {...register("name")} />
      </Field>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field id="note-category" label="Category" error={errors.category?.message}>
          <Input id="note-category" placeholder="e.g. Java" aria-invalid={!!errors.category || undefined} {...register("category")} />
        </Field>
        <Field id="note-pages" label="Pages" error={errors.pages?.message}>
          <Input id="note-pages" inputMode="numeric" aria-invalid={!!errors.pages || undefined} {...register("pages")} />
        </Field>
        <Field id="note-type" label="Format">
          <select id="note-type" className={selectCls} {...register("type")}>
            {NOTE_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field id="note-status" label="Status">
          <select id="note-status" className={selectCls} {...register("status")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
      </div>
    </FormDialog>
  );
};

/** "Upload new version" on a note row: PDF only; bumps the version and updated date (mock). */
export const UploadVersionDialog = ({ note, onOpenChange }: { note: AdminNote | null; onOpenChange: (open: boolean) => void }) => {
  const upload = useUploadNoteVersion();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>();

  const close = (o: boolean) => {
    if (!o) {
      setFile(null);
      setError(undefined);
      upload.reset();
    }
    onOpenChange(o);
  };

  return (
    <FormDialog
      open={!!note}
      onOpenChange={close}
      title="Upload new version"
      description={note ? `${note.name} · currently v${note.version}` : undefined}
      submitLabel="Upload"
      pending={upload.isPending}
      error={upload.error}
      onSubmit={(e) => {
        e.preventDefault();
        if (!note) return;
        const parsed = noteFileSchema.safeParse({ name: file?.name ?? "", size: file?.size ?? 0 });
        if (!file || !parsed.success) {
          setError(file ? parsed.error?.issues[0]?.message : "Choose a PDF file");
          return;
        }
        upload.mutate(
          { id: note.id, fileName: file.name, fileSize: file.size },
          {
            onSuccess: (n) => {
              toast.success(`Uploaded v${n.version} of “${n.name}”`);
              close(false);
            },
          }
        );
      }}
    >
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-line bg-surface2 px-4 py-6 text-center text-[13px] font-semibold text-soft transition-colors hover:border-brand">
        <Icon name="picture_as_pdf" size={28} />
        {file ? (
          <span className="text-ink">
            {file.name} · {formatBytes(file.size)}
          </span>
        ) : (
          "Choose a PDF (max 50 MB)"
        )}
        <input
          type="file"
          accept="application/pdf,.pdf"
          aria-label="PDF file"
          className="sr-only"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setError(undefined);
          }}
        />
      </label>
      <FieldError message={error} />
    </FormDialog>
  );
};
