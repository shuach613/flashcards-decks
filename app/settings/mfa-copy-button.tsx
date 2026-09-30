"use client";

import { useState } from "react";

export function MfaCopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="mt-2 min-h-11 w-full rounded-full border border-brand-primary/20 px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/5 sm:w-auto"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
