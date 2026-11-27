import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch, type FieldPath } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { errorMessage } from "@/api/envelope";
import ChipGroup from "@/components/admin/course-editor/ChipGroup";
import CoursePreviewCard from "@/components/admin/course-editor/CoursePreviewCard";
import EditorCard from "@/components/admin/course-editor/EditorCard";
import ModuleEditor from "@/components/admin/course-editor/ModuleEditor";
import PricingOptions from "@/components/admin/course-editor/PricingOptions";
import ThumbnailPicker from "@/components/admin/course-editor/ThumbnailPicker";
import { Alert, FieldError } from "@/components/common/FormFeedback";
import Icon from "@/components/common/Icon";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { plural } from "@/lib/utils";
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
  emptyModule,
  type CourseDraftValues,
} from "@/schemas/course";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/types/course";
import LogoMark from "@/components/common/LogoMark";
import type { AdminCourseDetail } from "@/types/admin";

type SaveState = "idle" | "draft" | "published";

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
      {/* standalone page (no layout), so it renders its own skip link */}
      <a href="#main" className="skip-link">
        Skip to content
      </a>
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
          {/* under 380px the title is visually hidden but stays the page's <h1> */}
          <div className="flex items-center gap-2.5 max-[379px]:sr-only">
            <LogoMark size={36} className="hidden sm:block" />
            <div className="flex flex-col leading-tight">
              <h1 className="m-0 font-display text-[15.5px] font-extrabold whitespace-nowrap text-ink">
                {editing ? "Edit course" : "New course"}
              </h1>
              <span className="text-[10.5px] font-extrabold tracking-[0.12em] whitespace-nowrap text-soft max-[420px]:hidden">
                ADMIN · {status === "published" ? "PUBLISHED" : "DRAFT"}
                {unsaved ? " · UNSAVED" : ""}
              </span>
            </div>
          </div>
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

      <main
        id="main"
        className="mx-auto grid max-w-310 grid-cols-1 items-start gap-6 px-3.5 pt-7 pb-22 min-[1081px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] sm:px-6"
      >
        <div className="flex min-w-0 flex-col gap-5">
          {save.isError && <Alert>{errorMessage(save.error)}</Alert>}

          <EditorCard title="Basics">
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
          </EditorCard>

          <EditorCard title="Pricing">
            <Controller
              control={control}
              name="pricing"
              render={({ field }) => <PricingOptions value={field.value} onChange={field.onChange} />}
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
          </EditorCard>

          <EditorCard
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
          </EditorCard>
        </div>

        {/* Preview column */}
        <div className="flex flex-col gap-4.5 min-[1081px]:sticky min-[1081px]:top-22">
          <EditorCard title="Thumbnail" className="gap-3.5! p-6!">
            <ThumbnailPicker thumb={thumb} onPick={(file) => setThumb(URL.createObjectURL(file))} />
          </EditorCard>

          <CoursePreviewCard
            status={status}
            thumb={thumb}
            track={form.track}
            title={form.title}
            blurb={form.blurb}
            level={level}
            lang={form.lang}
            lessonCount={lessonCount}
            isPaid={isPaid}
            price={form.price}
            discount={form.discount}
          />

          <div className="flex items-start gap-2.5 rounded-[18px] border border-line bg-surface2 px-4.5 py-4">
            <Icon name="checklist" size={17} className="mt-px text-brand" />
            <span className="text-xs leading-relaxed font-semibold text-muted">
              To publish: a title, a description, and at least one module with one class. Drafts save anytime.
            </span>
          </div>
        </div>
      </main>

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
