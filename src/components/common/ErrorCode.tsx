import Icon from "./Icon";

/** The big gradient error number with two floating icons, shared by the 404 / 403 / 500 pages. */
const ErrorCode = ({ code, topIcon, bottomIcon }: { code: string; topIcon: string; bottomIcon: string }) => (
  <div className="relative">
    <span className="bg-clip-text font-display text-[clamp(110px,20vw,180px)] leading-none font-extrabold tracking-tighter text-transparent [background:linear-gradient(135deg,#1B6FD0,#0E97B0_55%,#F7C948)]">
      {code}
    </span>
    <Icon name={topIcon} size={44} className="absolute -top-1.5 -right-7.5 animate-[bx-float_4s_ease-in-out_infinite] text-gold" />
    <Icon name={bottomIcon} size={34} className="absolute bottom-1.5 -left-9.5 animate-[bx-float_5.5s_ease-in-out_infinite] text-cyan" />
  </div>
);

export default ErrorCode;
