"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "shuachcloud-theme";

function getTheme(): Theme {
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

export function ThemeLogo() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  return (
    <Image
      src={theme === "dark" ? "/shuachcloud-logo-dark.png" : "/shuachcloud-logo.png"}
      alt="ShuachCloud"
      width={64}
      height={64}
      className="size-12 rounded-xl object-cover sm:size-14"
      priority
    />
  );
}
