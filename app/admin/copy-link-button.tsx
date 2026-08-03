"use client";

import { useState } from "react";

function legacyCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  return ok;
}

export function CopyLinkButton({ slug }: { slug: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    const url = `${window.location.origin}/decks/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus(legacyCopy(url) ? "copied" : "error");
    }
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-evergreen/20 px-4 py-1.5 text-sm font-medium text-evergreen transition hover:bg-evergreen/5"
    >
      {status === "copied" ? "Copied!" : status === "error" ? "Couldn't copy" : "Copy link"}
    </button>
  );
}
