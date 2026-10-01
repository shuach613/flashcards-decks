"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { getCurrentTheme, subscribeToTheme, type Theme } from "@/lib/theme";

function getServerTheme(): Theme {
  return "light";
}

export function ThemeLogo() {
  const theme = useSyncExternalStore(subscribeToTheme, getCurrentTheme, getServerTheme);

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
