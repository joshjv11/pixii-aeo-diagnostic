"use client";

import { motion } from "framer-motion";
import { fuzzyMatch } from "@/lib/utils";

type EngineResultCardProps = {
  engineName: string;
  engineIcon: string;
  engineColor: string;
  items: string[];
  brandName: string;
  isFound: boolean;
  success: boolean;
};

export default function EngineResultCard({
  engineName,
  engineIcon,
  engineColor,
  items,
  brandName,
  isFound,
  success,
}: EngineResultCardProps) {
  const rankIndex = items.findIndex((item) => fuzzyMatch(brandName, item));
  const rank      = rankIndex >= 0 ? rankIndex + 1 : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.07)] transition-shadow duration-200 relative overflow-hidden cursor-default"
    >
      {/* "Not Listed" corner ribbon */}
      {success && !isFound && (
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 w-16 h-16 pointer-events-none overflow-hidden"
        >
          <div className="absolute rotate-45 bg-surface-variant text-secondary text-[10px] font-bold py-1 right-[-35px] top-[32px] w-[170px] text-center uppercase tracking-wider shadow-sm">
            Not Listed
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-tertiary-fixed">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${engineColor}1a`, color: engineColor }}
          >
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {engineIcon}
            </span>
          </div>
          <h3 className="text-h2 font-semibold text-on-background">{engineName}</h3>
        </div>

        {!success ? (
          <span className="text-label-md text-amber-500/80">Unavailable</span>
        ) : rank !== null ? (
          <span className="text-label-md text-secondary" aria-label={`Ranked number ${rank}`}>
            Rank: {rank}
          </span>
        ) : (
          <span className="text-label-md text-tertiary-container">Unranked</span>
        )}
      </div>

      {/* Ranked list */}
      {!success ? (
        <div className="flex flex-col gap-2">
          <p className="text-body-md text-secondary">
            This engine is temporarily unavailable due to high demand.
          </p>
          <p className="text-label-sm text-tertiary-container">
            Run a new diagnostic to retry — the other engines&apos; results are still valid.
          </p>
        </div>
      ) : items.length === 0 ? (
        <p className="text-body-md text-secondary italic">No recommendations returned.</p>
      ) : (
        <ol className="space-y-3 text-body-md" aria-label={`${engineName} recommendations`}>
          {items.map((item, i) => {
            const isMatch = fuzzyMatch(brandName, item);
            return isMatch ? (
              <li
                key={`${item}-${i}`}
                className="flex items-start gap-3 p-2 rounded-lg bg-green-50/50 border border-green-200"
              >
                <span aria-hidden="true" className="text-green-800 font-medium w-4 pt-0.5 shrink-0">
                  {i + 1}.
                </span>
                <div className="flex-1 flex items-center justify-between gap-2">
                  <span className="text-green-900 font-medium">{item}</span>
                  <span
                    aria-label="Brand is visible"
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-wide shrink-0"
                  >
                    Visible
                  </span>
                </div>
              </li>
            ) : (
              <li
                key={`${item}-${i}`}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-bright transition-colors"
              >
                <span aria-hidden="true" className="text-tertiary-container font-medium w-4 pt-0.5 shrink-0">
                  {i + 1}.
                </span>
                <span className="text-secondary flex-1">{item}</span>
              </li>
            );
          })}
        </ol>
      )}

      {/* Optimization nudge */}
      {success && !isFound && (
        <div className="mt-6 pt-4 border-t border-dashed border-tertiary-fixed flex items-center gap-2 text-brand">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            warning
          </span>
          <span className="text-label-sm font-semibold">Requires Content Optimization</span>
        </div>
      )}
    </motion.div>
  );
}
