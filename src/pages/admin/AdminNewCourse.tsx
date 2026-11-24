import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type ReactNode } from "react";
import { Controller, useFieldArray, useForm, useWatch, type Control, type FieldPath, type UseFormRegister } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { errorMessage } from "@/api/envelope";
import { Alert, FieldError } from "@/components/auth/AuthCard";
import Icon from "@/components/common/Icon";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatTaka, plural } from "@/lib/utils";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { QueryStatus } from "@/components/common/QueryStatus";
import usePageTitle from "@/hooks/usePageTitle";
import { useAdminCourse, useSaveCourse, useUpdateCourse } from "@/queries/admin";
import { onlyDigits } from "@/schemas/checkout";
import {
  COURSE_LANGUAGES,
  courseDraftSchema,
  coursePublishSchema,
  defaultCourseDraft,
  emptyLesson,
  emptyModule,
  type CourseDraftValues,
} from "@/schemas/course";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/types/course";
import LogoMark from "@/components/common/LogoMark";
import type { AdminCourseDetail } from "@/types/admin";

type SaveState = "idle" | "draft" | "published";

const Card = ({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <div className={`card flex flex-col gap-4 p-5 sm:p-7 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3.5">
        <h2 className="m-0 font-display text-[17px] font-extrabold text-ink">{title}</h2>
        {action}
      </div>
    )}
    {children}
  </div>
);

interface ChipGroupProps<V extends string> {
  label: string;
  options: readonly V[];
  value: V;
  onChange: (v: V) => void;
}

function ChipGroup<V extends string>({ label, options, value, onChange }: ChipGroupProps<V>) {
  return (
    <div className="flex flex-col gap-1.75">
      <span className="field-label">{label}</span>
      <span className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            data-active={value === o}
            onClick={() => onChange(o)}
            className="filter-chip bg-surface2! px-3.5 py-2 text-xs data-[active=true]:bg-[linear-gradient(135deg,#1B6FD0,#0E97B0)]!"
          >
            {o}
          </button>
        ))}
      </span>
    </div>
  );
}

/** One module with its classes (nested field array). */
const ModuleEditor = ({
  index,
  control,
  register,
  onRemove,
}: {
  index: number;
  control: Control<CourseDraftValues>;
  register: UseFormRegister<CourseDraftValues>;
  onRemove: () => void;
}) => {
  const lessons = useFieldArray({ control, name: `modules.${index}.lessons` });
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="flex items-center gap-3 bg-surface2 px-4.5 py-3.5">
        <span className="font-display text-xs font-extrabold text-brand">0{index + 1}</span>
        <input
          aria-label={`Module ${index + 1} title`}
          placeholder="Module title"
          className="min-w-0 flex-1 border-0 bg-transparent font-display text-sm font-bold text-ink outline-none"
          {...register(`modules.${index}.title`)}
        />
        <button
          type="button"
          title="Add class"
          aria-label="Add class"
          onClick={() => lessons.append(emptyLesson())}
          className="icon-btn h-7.5! w-7.5! rounded-[9px]! text-muted"
        >
          <Icon name="add" size={16} />
        </button>
        <button
          type="button"
          title="Delete module"
          aria-label="Delete module"
          onClick={onRemove}
          className="icon-btn h-7.5! w-7.5! rounded-[9px]! text-muted hover:border-danger! hover:text-danger!"
        >
          <Icon name="delete" size={16} />
        </button>
      </div>
      {lessons.fields.map((l, li) => (
        <div key={l.id} className="flex items-center gap-2.75 border-t border-line px-4.5 py-2.75">
          <Icon name="smart_display" size={17} className="text-soft" />
          <input
            aria-label="Class title"
            placeholder="Class title"
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] font-semibold text-ink outline-none"
            {...register(`modules.${index}.lessons.${li}.title`)}
          />
          <input
            aria-label="Duration"
            placeholder="mm:ss"
            className="w-16 border-0 bg-transparent text-right text-[12.5px] font-bold text-soft outline-none"
            {...register(`modules.${index}.lessons.${li}.dur`)}
          />
          <button
            type="button"
            title="Remove class"
            aria-label="Remove class"
            onClick={() => lessons.fields.length > 1 && lessons.remove(li)}
            className="flex h-6.5 w-6.5 items-center justify-center rounded-lg border-0 bg-transparent text-soft hover:text-danger"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

/** The editor. `initial` is set in edit mode (/admin/courses/:id/edit). */
const CourseEditor = ({ initial }: { initial?: AdminCourseDetail }) => {
  const editing = !!initial;
  usePageTitle(initial ? `Edit · ${initial.title}` : "New course");
  const navigate = useNavigate();
  const create = useSaveCourse();
  const update = useUpdateCourse();
  const save = editing ? update : create;
  const [saved, setSaved] = useState<SaveState>(initial?.status ?? "idle");
  const [thumb, setThumb] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const backTo = initial ? `/admin/courses/${initial.id}` : "/admin/courses";
  const {
    control,
    register,
    getValues,
    setValue,
    setError,
    clearErrors,
    subscribe,
    formState: { errors, isDirty },
  } = useForm<CourseDraftValues>({ resolver: zodResolver(courseDraftSchema), defaultValues: initial?.draft ?? defaultCourseDraft });
  const unsaved = isDirty || !!thumb;
  const modules = useFieldArray({ control, name: "modules" });
  const form = useWatch({ control });

  // any edit invalidates the "saved" / "published" badge (edit mode keeps showing the course's status)
  useEffect(
    () => (editing ? undefined : subscribe({ formState: { values: true }, callback: () => setSaved("idle") })),
    [subscribe, editing]
  );

  // unsaved-changes guard for reloads / closing the tab (the back link asks with a dialog)
  useEffect(() => {
    if (!unsaved) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [unsaved]);

  // revoke object URLs for replaced thumbnails
  useEffect(() => () => void (thumb && URL.revokeObjectURL(thumb)), [thumb]);

  const isPaid = form.pricing === "paid";
  const lessonCount = (form.modules ?? []).reduce((n, m) => n + (m.lessons?.length ?? 0), 0);
  const canPublish = coursePublishSchema.safeParse(form).success;
  const published = saved === "published";
  const status = initial ? initial.status : published ? "published" : "draft";
  const level = form.level ?? "Beginner";
  const badge = isPaid ? (form.discount ? `${form.discount}% OFF` : level.toUpperCase()) : "FREE";
  const badgeCls = isPaid ? (form.discount ? "bg-[#EC3013] text-white" : "bg-white/20 text-white") : "bg-white text-brand";

  /** New course → POST, then open its detail page. */
  const createAs = (course: CourseDraftValues, as: "draft" | "published") =>
    create.mutate(
      { course, status: as },
      {
        onSuccess: ({ id }) => {
          setSaved(as);
          toast.success(as === "published" ? "Course published" : "Draft saved");
          void navigate(`/admin/courses/${id}`);
        },
      }
    );

  /** Publishing (or saving a published course) needs the full publish rules. */
  const validForPublish = () => {
    const result = coursePublishSchema.safeParse(getValues());
    if (result.success) return result.data;
    for (const issue of result.error.issues) {
      setError(issue.path.join(".") as FieldPath<CourseDraftValues>, { message: issue.message });
    }
    return null;
  };

  const saveDraft = () => {
    clearErrors();
    createAs(getValues(), "draft");
  };

  const publish = () => {
    clearErrors();
    const course = validForPublish();
    if (course) createAs(course, "published");
  };

  /** Edit mode → PATCH with the course's current status, then back to its detail page. */
  const saveChanges = () => {
    if (!initial) return;
    clearErrors();
    const course = initial.status === "published" ? validForPublish() : getValues();
    if (!course) return;
    update.mutate(
      { id: initial.id, patch: { course } },
      {
        onSuccess: () => {
          toast.success("Changes saved");
          void navigate(`/admin/courses/${initial.id}`);
        },
      }
    );
  };

  const numeric = (name: "price" | "discount", max: number) => ({
    value: form[name] ?? "",
    onChange: (e: { target: { value: string } }) => setValue(name, onlyDigits(max)(e.target.value), { shouldDirty: true }),
  });

  return (
    <div className="min-h-screen bg-page text-ink">
      <nav className="sticky top-0 z-60 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-310 items-center gap-2 px-3.5 py-3 sm:gap-3.5 sm:px-6">
          <Link
            to={backTo}
            title="Back to admin"
            aria-label="Back to admin"
            className="icon-btn h-9.5! w-9.5! text-muted"
            onClick={(e) => {
              if (!unsaved) return;
              e.preventDefault();
              setConfirmLeave(true);
            }}
          >
            <Icon name="arrow_back" size={19} />
          </Link>
          <span className="flex items-center gap-2.5 max-[379px]:hidden">
            <LogoMark size={36} className="hidden sm:block" />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-[15.5px] font-extrabold whitespace-nowrap text-ink">
                {editing ? "Edit course" : "New course"}
              </span>
              <span className="text-[10.5px] font-extrabold tracking-[0.12em] whitespace-nowrap text-soft max-[420px]:hidden">
                ADMIN · {status === "published" ? "PUBLISHED" : "DRAFT"}
                {unsaved ? " · UNSAVED" : ""}
              </span>
            </span>
          </span>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2.25">
            <ThemeToggle className="h-9.5! w-9.5! max-sm:hidden" />
            {editing ? (
              <Button variant="primary" size="none" onClick={saveChanges} disabled={save.isPending} className="px-5.5 py-3 text-[13px]">
                <Icon name="save" size={17} />
                Save changes
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={saveDraft}
                  disabled={save.isPending}
                  className="px-3.5 whitespace-nowrap sm:px-5"
                >
                  {saved === "draft" ? "Draft saved ✓" : "Save draft"}
                </Button>
                <Button
                  variant={published ? "success" : "primary"}
                  size="none"
                  onClick={publish}
                  disabled={save.isPending}
                  className={`px-4 py-3 text-[13px] whitespace-nowrap sm:px-5.5 ${canPublish || published ? "" : "opacity-55"}`}
                >
                  <Icon name={published ? "check_circle" : "rocket_launch"} size={17} className="max-[420px]:hidden" />
                  {published ? "Published!" : "Publish"}
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="mx-auto grid max-w-310 grid-cols-1 items-start gap-6 px-3.5 pt-7 pb-22 min-[1081px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] sm:px-6">
        <div className="flex min-w-0 flex-col gap-5">
          {save.isError && <Alert>{errorMessage(save.error)}</Alert>}

          <Card title="Basics">
            <div className="flex flex-col gap-1.75">
              <Label htmlFor="course-title">Course title</Label>
              <Input
                id="course-title"
                placeholder="e.g. Spring Boot — Zero to Production"
                aria-invalid={!!errors.title || undefined}
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />
            </div>
            <div className="flex flex-col gap-1.75">
              <Label htmlFor="course-blurb">Short description</Label>
              <Textarea
                id="course-blurb"
                rows={3}
                placeholder="One or two lines shown on the course card"
                aria-invalid={!!errors.blurb || undefined}
                {...register("blurb")}
              />
              <FieldError message={errors.blurb?.message} />
            </div>
            <div className="grid grid-cols-1 gap-3.5 min-[641px]:grid-cols-3">
              <Controller
                control={control}
                name="track"
                render={({ field }) => (
                  <ChipGroup label="Track" options={COURSE_CATEGORIES} value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                control={control}
                name="level"
                render={({ field }) => <ChipGroup label="Level" options={COURSE_LEVELS} value={field.value} onChange={field.onChange} />}
              />
              <Controller
                control={control}
                name="lang"
                render={({ field }) => (
                  <ChipGroup label="Language" options={COURSE_LANGUAGES} value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </Card>

          <Card title="Pricing">
            <Controller
              control={control}
              name="pricing"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2.5">
                  {(
                    [
                      {
                        key: "free",
                        icon: "volunteer_activism",
                        color: "text-success",
                        title: "Free course",
                        sub: "Open to everyone, forever",
                      },
                      { key: "paid", icon: "paid", color: "text-amber", title: "Paid course", sub: "One-time purchase + Pro access" },
                    ] as const
                  ).map((o) => {
                    const on = field.value === o.key;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        aria-pressed={on}
                        onClick={() => field.onChange(o.key)}
                        className={`flex min-w-37.5 flex-1 flex-col gap-1.25 rounded-2xl border-[1.5px] px-4.5 py-4 text-left text-ink transition-all hover:border-brand ${
                          on ? "border-brand bg-chip" : "border-line bg-surface2"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm font-extrabold">
                          <Icon name={o.icon} size={18} className={o.color} />
                          {o.title}
                        </span>
                        <span className="text-xs font-semibold text-soft">{o.sub}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {isPaid && (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.75">
                  <Label htmlFor="course-price">Price (BDT)</Label>
                  <Input
                    id="course-price"
                    inputMode="numeric"
                    placeholder="49"
                    aria-invalid={!!errors.price || undefined}
                    {...numeric("price", 6)}
                  />
                  <FieldError message={errors.price?.message} />
                </div>
                <div className="flex flex-col gap-1.75">
                  <Label htmlFor="course-discount">Launch discount %</Label>
                  <Input id="course-discount" inputMode="numeric" placeholder="e.g. 45" {...numeric("discount", 2)} />
                </div>
              </div>
            )}
          </Card>

          <Card
            title="Curriculum"
            className="gap-3.5!"
            action={
              <Button variant="outline" size="none" onClick={() => modules.append(emptyModule())} className="px-4 py-2.25 text-[12.5px]">
                <Icon name="add" size={16} />
                Add module
              </Button>
            }
          >
            {modules.fields.map((m, mi) => (
              <ModuleEditor
                key={m.id}
                index={mi}
                control={control}
                register={register}
                onRemove={() => modules.fields.length > 1 && modules.remove(mi)}
              />
            ))}
            <FieldError message={errors.modules?.message ?? errors.modules?.root?.message} />
            <span className="text-[12.5px] font-bold text-soft">
              {plural(modules.fields.length, "module")} · {plural(lessonCount, "class", "es")}
            </span>
          </Card>
        </div>

        {/* Preview column */}
        <div className="flex flex-col gap-4.5 min-[1081px]:sticky min-[1081px]:top-22">
          <Card title="Thumbnail" className="gap-3.5! p-6!">
            <label className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-[14px] border-[1.5px] border-dashed border-line bg-surface2 text-center transition-colors hover:border-brand">
              {thumb ? (
                <img src={thumb} alt="Course thumbnail preview" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 px-4 text-[13px] font-semibold text-soft">
                  <Icon name="add_photo_alternate" size={30} />
                  Drop the course thumbnail (16:9)
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setThumb(URL.createObjectURL(file));
                }}
              />
            </label>
          </Card>

          <div className="card overflow-hidden shadow-card-lg">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <span className="font-display text-[13px] font-extrabold tracking-[0.08em] text-soft">CARD PREVIEW</span>
              <span
                className={`pill px-2.5 py-1 text-[10.5px] ${status === "published" ? "bg-success/14 text-success" : "bg-amber/16 text-[#B57708]"}`}
              >
                {status === "published" ? "PUBLISHED" : "DRAFT"}
              </span>
            </div>
            <div className="p-4.5">
              <div className="overflow-hidden rounded-[18px] border border-line bg-surface">
                <div
                  className="bg-grad-brand flex h-27.5 flex-col justify-between px-4 py-3.5"
                  style={thumb ? { background: `url("${thumb}") center/cover` } : undefined}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-extrabold tracking-[0.12em] text-white/90">{(form.track ?? "").toUpperCase()}</span>
                    <span className={`pill px-2.25 py-1 text-[10px] ${badgeCls}`}>{badge}</span>
                  </div>
                  {!thumb && <Icon name="school" size={34} className="text-white/85" />}
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <span className="font-display text-[15px] leading-tight font-bold text-ink">
                    {form.title?.trim() || "Untitled course"}
                  </span>
                  <span className="text-xs leading-normal text-muted">{form.blurb?.trim() || "Short description will appear here."}</span>
                  <span className="flex gap-3 text-[11px] font-bold text-soft">
                    <span>{level}</span>
                    <span>{plural(lessonCount, "class", "es")}</span>
                    <span>{form.lang}</span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between border-t border-line pt-2.75">
                    <span className="text-[11.5px] font-bold text-muted">BrainXNext</span>
                    <span className={`font-display text-[15px] font-extrabold ${isPaid ? "text-ink" : "text-success"}`}>
                      {isPaid ? formatTaka(Number(form.price || 0)) : "Free"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-[18px] border border-line bg-surface2 px-4.5 py-4">
            <Icon name="checklist" size={17} className="mt-px text-brand" />
            <span className="text-xs leading-relaxed font-semibold text-muted">
              To publish: a title, a description, and at least one module with one class. Drafts save anytime.
            </span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Discard unsaved changes?"
        description="You have changes that haven't been saved. Leave this page and lose them?"
        confirmLabel="Discard changes"
        danger
        onConfirm={() => {
          setConfirmLeave(false);
          void navigate(backTo);
        }}
      />
    </div>
  );
};

/** /admin/courses/new, or /admin/courses/:courseId/edit (loads the course first). */
const AdminNewCourse = () => {
  const { courseId } = useParams();
  const course = useAdminCourse(courseId ?? "");
  if (!courseId) return <CourseEditor />;
  return (
    <QueryStatus query={course} className="min-h-screen bg-page">
      {(data) => <CourseEditor key={data.id} initial={data} />}
    </QueryStatus>
  );
};

export default AdminNewCourse;
