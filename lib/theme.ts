export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "shuachcloud-theme";
export const THEME_CHANGE_EVENT = "shuachcloud-theme-change";

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "dark" || saved === "light" ? saved : null;
  } catch {
    return null;
  }
}

export function getCurrentTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function subscribeToTheme(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemChange = () => {
    if (!getStoredTheme()) {
      applyTheme(getSystemTheme());
      callback();
    }
  };
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    const nextTheme = event.newValue === "dark" || event.newValue === "light"
      ? event.newValue
      : getSystemTheme();
    applyTheme(nextTheme);
    callback();
  };

  mediaQuery.addEventListener("change", handleSystemChange);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    mediaQuery.removeEventListener("change", handleSystemChange);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", handleStorageChange);
  };
}
