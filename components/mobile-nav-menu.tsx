"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function MobileNavMenu({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  const blockNextClickRef = useRef(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && openRef.current) {
        event.preventDefault();
        openRef.current = false;
        setOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    const dismissOutside = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      const isInsideMenu = buttonRef.current?.contains(target) || menuRef.current?.contains(target);

      if (
        blockNextClickRef.current &&
        (event.type === "pointerup" || event.type === "click")
      ) {
        if (event.type === "click") blockNextClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }
      if (!openRef.current || isInsideMenu) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (event.type === "pointerdown") {
        blockNextClickRef.current = true;
        window.setTimeout(() => {
          blockNextClickRef.current = false;
        }, 1000);
      }
      openRef.current = false;
      setOpen(false);
    };

    document.addEventListener("pointerdown", dismissOutside, true);
    document.addEventListener("pointerup", dismissOutside, true);
    document.addEventListener("click", dismissOutside, true);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside, true);
      document.removeEventListener("pointerup", dismissOutside, true);
      document.removeEventListener("click", dismissOutside, true);
    };
  }, []);

  return (
    <div className="relative md:hidden">
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-20 cursor-default bg-transparent"
          onClick={() => {
            openRef.current = false;
            setOpen(false);
          }}
        />
      )}
      <button
        type="button"
        ref={buttonRef}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        className="relative z-30 flex size-11 cursor-pointer items-center justify-center rounded-full border border-brand-primary/20 text-xl font-bold text-brand-primary"
        onClick={() => {
          const nextOpen = !openRef.current;
          openRef.current = nextOpen;
          setOpen(nextOpen);
        }}
      >
        <span aria-hidden="true">☰</span>
        <span className="sr-only">{label}</span>
      </button>
      {open && (
        <div
          id={menuId}
          ref={menuRef}
          className="absolute right-0 top-14 z-30 w-64 rounded-2xl border border-neutral-muted bg-white p-3 shadow-[0_6px_20px_rgba(25,51,37,0.14)]"
        >
          {children}
        </div>
      )}
    </div>
  );
}
