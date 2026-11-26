import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import Icon from "@/components/common/Icon";
import { emptyLesson, type CourseDraftValues } from "@/schemas/course";

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

export default ModuleEditor;
