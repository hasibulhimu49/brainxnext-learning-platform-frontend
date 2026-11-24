import type { ComponentProps } from "react";
import type { IconName } from "@/types/course";

type IconProps = Omit<ComponentProps<"span">, "children"> & {
  name: IconName;
  size?: number;
};

/**
 * Material Symbols Rounded icon.
 * <Icon name="school" size={18} className="text-brand" />
 */
const Icon = ({ name, size, className = "", style, ...rest }: IconProps) => (
  <span aria-hidden="true" className={`icon ${className}`} style={size ? { fontSize: size, ...style } : style} {...rest}>
    {name}
  </span>
);

export default Icon;
