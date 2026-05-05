"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[AEO] Unhandled client error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <span
        aria-hidden="true"
        className="material-symbols-outlined text-[64px] text-error"
        style={{ fontVariationSettings: "'FILL' 0" }}
      >
        error
      </span>

      <div className="space-y-2 max-w-sm">
        <p className="text-h2 font-semibold text-on-background">
          Something went wrong
        </p>
        <p className="text-body-md text-secondary">
          {error.digest
            ? `An unexpected error occurred (ref: ${error.digest}).`
            : "An unexpected error occurred. Try refreshing the page."}
        </p>
      </div>

      <button
        type="button"
        onClick={unstable_retry}
        className="bg-brand hover:bg-brand-hover text-white text-label-md font-medium py-2.5 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          refresh
        </span>
        Try again
      </button>
    </div>
  );
}
