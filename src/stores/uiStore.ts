import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Theme = "light" | "dark";

/**
 * UI state — owned by this store: the colour theme (persisted).
 * Page-local UI state (open accordions, active tabs, filters) stays in component state.
 */
interface UiState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/** Same key the pre-paint script in index.html reads, so there is no light/dark flash. */
export const THEME_STORAGE_KEY = "bx-theme";

const initialTheme = (): Theme => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: initialTheme(),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    { name: THEME_STORAGE_KEY, storage: createJSONStorage(() => localStorage) }
  )
);

const applyTheme = (theme: Theme) => document.documentElement.setAttribute("data-theme", theme);

applyTheme(useUiStore.getState().theme);
useUiStore.subscribe((s) => applyTheme(s.theme));
