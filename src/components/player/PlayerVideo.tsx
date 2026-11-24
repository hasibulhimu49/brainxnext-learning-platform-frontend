import { useState, type ReactNode } from "react";
import javaGenericsImg from "@/assets/images/course-java-generics.jpg";
import Icon from "@/components/common/Icon";

interface PlayerVideoProps {
  duration: string;
  onPrev?: () => void;
  onNext?: () => void;
  /** replaces the play button, e.g. the paywall card for a locked lesson */
  overlay?: ReactNode;
}

// 36px hit area around the 21px icons so they are easy to tap on phones
const ctrl =
  "-m-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent p-0 text-white hover:bg-white/10 disabled:opacity-35";

/** Placeholder video frame with working play/pause and previous/next class controls. */
const PlayerVideo = ({ duration, onPrev, onNext, overlay }: PlayerVideoProps) => {
  const [playing, setPlaying] = useState(false);
  const toggle = () => setPlaying((p) => !p);
  return (
    <div className="relative aspect-video overflow-hidden rounded-[20px] bg-[#050D1A] shadow-[0_24px_60px_rgba(5,13,26,.4)] max-sm:aspect-auto max-sm:min-h-65">
      <img src={javaGenericsImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 blur-[2px]" />
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,13,26,.2)_0%,rgba(5,13,26,.75)_100%)]" />
      <span className="absolute inset-0 flex items-center justify-center">
        {overlay ?? (
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={toggle}
            className="flex h-19 w-19 items-center justify-center rounded-full border-0 bg-white/94 shadow-[0_14px_40px_rgba(0,0,0,.5)] transition-transform hover:scale-[1.08]"
          >
            <Icon name={playing ? "pause" : "play_arrow"} size={40} className="text-brand" />
          </button>
        )}
      </span>
      {!overlay && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 px-5 py-4">
          <div className="h-1.25 cursor-pointer rounded-full bg-white/25">
            <div className="h-1.25 w-[38%] rounded-full bg-[linear-gradient(90deg,#F7C948,#E9A21B)]" />
          </div>
          <div className="flex items-center justify-between text-white">
            <span className="flex items-center gap-3">
              <button type="button" onClick={onPrev} disabled={!onPrev} className={ctrl} aria-label="Previous class">
                <Icon name="skip_previous" size={21} />
              </button>
              <button type="button" onClick={toggle} className={ctrl} aria-label="Toggle play">
                <Icon name={playing ? "pause" : "play_arrow"} size={21} />
              </button>
              <button type="button" onClick={onNext} disabled={!onNext} className={ctrl} aria-label="Next class">
                <Icon name="skip_next" size={21} />
              </button>
              <Icon name="volume_up" size={20} className="hidden cursor-pointer sm:inline-block" />
              <span className="text-xs font-bold text-white/85">8:15 / {duration}</span>
            </span>
            <span className="flex items-center gap-3.5">
              <span className="cursor-pointer rounded-[7px] bg-white/16 px-2.25 py-0.75 text-[11.5px] font-extrabold">1.0×</span>
              <Icon name="subtitles" size={20} className="hidden cursor-pointer sm:inline-block" />
              <Icon name="settings" size={20} className="cursor-pointer" />
              <Icon name="fullscreen" size={20} className="cursor-pointer" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerVideo;
