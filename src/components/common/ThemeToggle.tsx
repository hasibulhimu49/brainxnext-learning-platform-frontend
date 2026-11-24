import useTheme from "@/hooks/useTheme";
import Icon from "./Icon";

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const next = theme === "light" ? "dark" : "light";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${next} mode`}
      aria-label={`Switch to ${next} mode`}
      className={`icon-btn ${className}`}
    >
      <Icon name={theme === "light" ? "dark_mode" : "light_mode"} size={20} />
    </button>
  );
};

export default ThemeToggle;
