import logo from "@/assets/images/logo.jpg";

interface LogoMarkProps {
  /** Rendered width and height in px */
  size?: number;
  className?: string;
}

/**
 * The round BrainXNext emblem (neon X + brain).
 * The 256px source is cropped to the glowing ring; it is clipped round and scaled up a touch so no dark corner shows.
 */
const LogoMark = ({ size = 36, className = "" }: LogoMarkProps) => (
  <span
    className={`block flex-none overflow-hidden rounded-full bg-[#050b1a] shadow-[0_6px_18px_rgba(27,111,208,.35)] ${className}`}
    style={{ width: size, height: size }}
  >
    <img src={logo} alt="" width={size} height={size} className="h-full w-full scale-[1.06] object-cover" />
  </span>
);

export default LogoMark;
