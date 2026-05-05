"use client";

import { motion } from "framer-motion";

import type { FormEvent } from "react";

type InputCardProps = {
  brandName: string;
  query: string;
  loading: boolean;
  error: string;
  onBrandChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export default function InputCard({
  brandName,
  query,
  loading,
  error,
  onBrandChange,
  onQueryChange,
  onSubmit,
}: InputCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed p-lg mb-12 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
      <form onSubmit={onSubmit} noValidate aria-label="AEO Diagnostic form">
        {error && (
          <p
            id="form-error"
            role="alert"
            className="text-red-600 text-body-md font-medium mb-4 flex items-center gap-2"
          >
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              error
            </span>
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          {/* Brand input */}
          <div className="md:col-span-5">
            <label
              htmlFor="brand-input"
              className="block text-label-sm font-semibold text-on-background uppercase tracking-wider mb-2"
            >
              Amazon ASIN or Brand Name
            </label>
            <div className="relative">
              <span
                aria-hidden="true"
                className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                storefront
              </span>
              <input
                id="brand-input"
                type="text"
                placeholder="e.g. B08Z5TP93H or Vitality Mag"
                value={brandName}
                onChange={(e) => onBrandChange(e.target.value)}
                disabled={loading}
                maxLength={200}
                required
                autoComplete="organization"
                aria-describedby={error ? "form-error" : undefined}
                className="w-full bg-surface-bright border border-tertiary-fixed rounded-lg py-3 pl-12 pr-4 text-body-md text-on-background placeholder:text-tertiary-container focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          {/* Query input */}
          <div className="md:col-span-5">
            <label
              htmlFor="query-input"
              className="block text-label-sm font-semibold text-on-background uppercase tracking-wider mb-2"
            >
              Target Search Query
            </label>
            <div className="relative">
              <span
                aria-hidden="true"
                className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                search
              </span>
              <input
                id="query-input"
                type="text"
                placeholder="e.g. best magnesium supplement"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                disabled={loading}
                maxLength={200}
                required
                autoComplete="off"
                aria-describedby={error ? "form-error" : undefined}
                className="w-full bg-surface-bright border border-tertiary-fixed rounded-lg py-3 pl-12 pr-4 text-body-md text-on-background placeholder:text-tertiary-container focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <motion.button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white text-label-md font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors h-[46px]"
            >
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[18px] animate-spin"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    progress_activity
                  </span>
                  <span>Running…</span>
                </>
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    play_arrow
                  </span>
                  <span>Run</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
