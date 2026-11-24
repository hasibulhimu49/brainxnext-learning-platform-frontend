import type { ReactNode } from "react";

interface HeroBandProps {
  children: ReactNode;
  image?: string;
  credit?: { name: string; href: string };
  className?: string;
  innerClassName?: string;
}

/**
 * Dark navy page header with coloured glows and an optional blurred photo.
 * <HeroBand image={img} credit={{ name: "Ilya Pavlov", href: "…" }}>…</HeroBand>
 */
const HeroBand = ({
  children,
  image,
  credit,
  className = "py-14",
  innerClassName = "max-w-190 text-center items-center",
}: HeroBandProps) => (
  <section className={`hero-band px-4.5 sm:px-6 ${className}`}>
    {image && (
      <>
        <div className="absolute -inset-6 z-0 scale-[1.04] blur-[7px]">
          <img src={image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(180deg,rgba(8,21,39,.88)_0%,rgba(10,27,51,.78)_55%,rgba(10,27,51,.92)_100%)]" />
      </>
    )}
    <div className="hero-glow z-1" />
    {credit && (
      <a
        href={credit.href}
        target="_blank"
        rel="noreferrer"
        className="absolute right-3.5 bottom-2.5 z-2 text-[10.5px] font-semibold text-white/55 hover:text-white/85"
      >
        Photo by {credit.name} on Unsplash
      </a>
    )}
    <div className={`relative z-2 mx-auto flex flex-col gap-4.5 ${innerClassName}`}>{children}</div>
  </section>
);

export default HeroBand;
