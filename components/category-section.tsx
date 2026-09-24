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
      <summary className="mb-3 flex cursor-pointer list-none items-center justify-between rounded-xl border border-sand bg-white px-4 py-3 text-lg font-bold text-evergreen shadow-[0_2px_8px_rgba(25,51,37,0.06)] [&::-webkit-details-marker]:hidden">
        <span>{name}</span>
        <span
          className="text-base transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          ⌄
        </span>
      </summary>
      {children}
    </details>
  );
}
