import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PLAN_LABEL } from "@/constants/admin";
import { useAddStudent, useAdminCourses, useGrantCourse } from "@/queries/admin";
import { STUDENT_PLANS, addStudentSchema, grantCourseSchema, type AddStudentValues, type GrantCourseValues } from "@/schemas/admin";
import FormDialog, { Field, selectCls } from "./FormDialog";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** "+ Add student" on the Students page (provisional POST /admin/students). */
export const AddStudentDialog = ({ open, onOpenChange }: DialogProps) => {
  const add = useAddStudent();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddStudentValues>({ resolver: zodResolver(addStudentSchema), defaultValues: { name: "", email: "", plan: "free" } });

  const close = (o: boolean) => {
    if (!o) {
      reset();
      add.reset();
    }
    onOpenChange(o);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={close}
      title="Add student"
      description="Creates a student record. They get an email to set their password."
      submitLabel="Add student"
      pending={add.isPending}
      error={add.error}
      onSubmit={handleSubmit((v) =>
        add.mutate(v, {
          onSuccess: (s) => {
            toast.success(`${s.name} was added`);
            close(false);
          },
        })
      )}
    >
      <Field id="student-name" label="Full name" error={errors.name?.message}>
        <Input id="student-name" autoComplete="off" aria-invalid={!!errors.name || undefined} {...register("name")} />
      </Field>
      <Field id="student-email" label="Email address" error={errors.email?.message}>
        <Input id="student-email" type="email" autoComplete="off" aria-invalid={!!errors.email || undefined} {...register("email")} />
      </Field>
      <Field id="student-plan" label="Plan">
        <select id="student-plan" className={selectCls} {...register("plan")}>
          {STUDENT_PLANS.map((p) => (
            <option key={p} value={p}>
              {PLAN_LABEL[p]}
            </option>
          ))}
        </select>
      </Field>
    </FormDialog>
  );
};

/** "Grant course" on the student detail page. */
export const GrantCourseDialog = ({ open, onOpenChange, studentId, ownedIds }: DialogProps & { studentId: string; ownedIds: string[] }) => {
  const grant = useGrantCourse();
  const courses = useAdminCourses();
  const options = (courses.data?.rows ?? []).filter((c) => !ownedIds.includes(c.id));
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GrantCourseValues>({ resolver: zodResolver(grantCourseSchema), defaultValues: { courseId: "" } });

  const close = (o: boolean) => {
    if (!o) {
      reset();
      grant.reset();
    }
    onOpenChange(o);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={close}
      title="Grant a course"
      description="Gives this student free access to a course, without an order."
      submitLabel="Grant access"
      pending={grant.isPending}
      error={grant.error}
      onSubmit={handleSubmit((v) =>
        grant.mutate(
          { id: studentId, courseId: v.courseId },
          {
            onSuccess: () => {
              toast.success("Course access granted");
              close(false);
            },
          }
        )
      )}
    >
      <Field id="grant-course" label="Course" error={errors.courseId?.message}>
        <select id="grant-course" className={selectCls} aria-invalid={!!errors.courseId || undefined} {...register("courseId")}>
          <option value="">{courses.isPending ? "Loading courses…" : "Choose a course"}</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </Field>
    </FormDialog>
  );
};
