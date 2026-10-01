"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

export function MobileNavMenu({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <div className="relative md:hidden">
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-20 cursor-default bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        className="relative z-30 flex size-11 cursor-pointer items-center justify-center rounded-full border border-brand-primary/20 text-xl font-bold text-brand-primary"
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">☰</span>
        <span className="sr-only">{label}</span>
      </button>
      {open && (
        <div
          id={menuId}
          className="absolute right-0 top-14 z-30 w-64 rounded-2xl border border-neutral-muted bg-white p-3 shadow-[0_6px_20px_rgba(25,51,37,0.14)]"
        >
          {children}
        </div>
      )}
    </div>
  );
}
