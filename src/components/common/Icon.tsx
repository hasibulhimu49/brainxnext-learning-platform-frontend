import type { ComponentProps } from "react";
import type { IconName } from "@/types/course";

type IconProps = Omit<ComponentProps<"span">, "children"> & {
  name: IconName;
  size?: number;
  /** solid variant (Material Symbols FILL axis), e.g. a saved heart or a given star */
  filled?: boolean;
};

/**
 * Material Symbols Rounded icon.
 * <Icon name="school" size={18} className="text-brand" />
 */
const Icon = ({ name, size, filled = false, className = "", style, ...rest }: IconProps) => (
  <span
    aria-hidden="true"
    className={`icon ${className}`}
    style={{ ...(size ? { fontSize: size } : {}), ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}), ...style }}
    {...rest}
  >
    {name}
  </span>
);

export default Icon;
