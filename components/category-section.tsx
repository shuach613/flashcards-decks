import type { ReactNode } from "react";

export function CategorySection({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <details open className="group">
      <summary className="mb-3 flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-brand-primary bg-brand-primary px-4 py-3 text-lg font-bold text-white shadow-[0_3px_10px_rgba(25,51,37,0.18)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:min-h-0 [&::-webkit-details-marker]:hidden">
        <span>{name}</span>
        <span
          className="text-2xl font-black leading-none transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          ⌄
        </span>
      </summary>
      {children}
    </details>
  );
}
