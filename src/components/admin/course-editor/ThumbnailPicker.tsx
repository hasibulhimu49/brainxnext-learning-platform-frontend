import Icon from "@/components/common/Icon";

/** 16:9 thumbnail drop zone; reports the picked file, shows `thumb` (an object URL) when set. */
const ThumbnailPicker = ({ thumb, onPick }: { thumb: string | null; onPick: (file: File) => void }) => (
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
        if (file) onPick(file);
      }}
    />
  </label>
);

export default ThumbnailPicker;
