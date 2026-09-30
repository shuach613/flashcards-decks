"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "shuachcloud-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribe(callback: () => void) {
  window.addEventListener("shuachcloud-theme-change", callback);
  return () => window.removeEventListener("shuachcloud-theme-change", callback);
}

function getServerTheme(): Theme {
  return "light";
}

export function ThemeToggle() {
  // The server snapshot keeps hydration stable; the client snapshot then
  // reflects the saved preference without a synchronous effect state update.
  const theme = useSyncExternalStore(
    subscribe,
    getInitialTheme,
    getServerTheme,
  );

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        const nextTheme = isDark ? "light" : "dark";
        document.documentElement.dataset.theme = nextTheme;
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        window.dispatchEvent(new Event("shuachcloud-theme-change"));
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
