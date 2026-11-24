import { useUiStore } from "@/stores/uiStore";

/** Current theme + toggle, read from the UI store. */
const useTheme = () => {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  return { theme, toggleTheme };
};

export default useTheme;
