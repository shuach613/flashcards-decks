"use client";

import { useSyncExternalStore } from "react";
import {
  applyTheme,
  getCurrentTheme,
  subscribeToTheme,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

function getServerTheme(): Theme {
  return "light";
}

export function ThemeToggle() {
  // The server snapshot keeps hydration stable; the client snapshot then
  // reflects the saved preference without a synchronous effect state update.
  const theme = useSyncExternalStore(subscribeToTheme, getCurrentTheme, getServerTheme);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        const nextTheme = isDark ? "light" : "dark";
        applyTheme(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
      }}
      className="inline-flex size-11 items-center justify-center rounded-full border border-brand-primary/20 bg-surface text-lg text-brand-primary transition hover:bg-brand-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:size-9"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
