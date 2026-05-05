"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSidebarStore } from "@/store/useSidebarStore";
import { fuzzyMatch } from "@/lib/utils";

const ENGINE_META: Record<string, { name: string; icon: string; color: string }> = {
  gemini:    { name: "AI Engine 1", icon: "auto_awesome", color: "#1a73e8" },
  versatile: { name: "AI Engine 2", icon: "bolt",         color: "#f59e0b" },
  instant:   { name: "AI Engine 3", icon: "memory",       color: "#8b5cf6" },
};

function scoreRing(score: number) {
  if (score >= 80) return { stroke: "#22c55e", label: "Strong", bg: "bg-green-50",  text: "text-green-700"  };
  if (score >= 50) return { stroke: "#f59e0b", label: "Moderate", bg: "bg-yellow-50", text: "text-yellow-700" };
  if (score > 0)   return { stroke: "#f97316", label: "Limited", bg: "bg-orange-50", text: "text-orange-700" };
  return              { stroke: "#ef4444", label: "Absent",   bg: "bg-red-50",    text: "text-red-700"    };
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(ts));
}

const RADIUS = 36;
const CIRC = 2 * Math.PI * RADIUS;

export default function DiagnosticDrawer() {
  const { selectedItem, selectItem } = useSidebarStore();

  return (
    <AnimatePresence>
      {selectedItem && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/25 backdrop-blur-[2px]"
            aria-hidden="true"
            onClick={() => selectItem(null)}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Diagnostic details for ${selectedItem.brandName}`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320, mass: 0.8 }}
            className="fixed right-0 top-0 h-screen w-full max-w-[440px] z-[70] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-tertiary-fixed shrink-0">
              <div>
                <h2 className="text-h1 font-bold text-on-background leading-tight">
                  {selectedItem.brandName}
                </h2>
                <p className="text-body-md text-secondary mt-0.5">
                  &ldquo;{selectedItem.query}&rdquo;
                </p>
                {selectedItem.timestamp && (
                  <p className="text-label-sm text-tertiary-container mt-1">
                    {formatDate(selectedItem.timestamp)}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Close diagnostic details"
                onClick={() => selectItem(null)}
                className="ml-4 mt-0.5 text-secondary hover:text-on-background hover:bg-surface-container-low rounded-full p-1.5 transition-colors shrink-0"
              >
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  close
                </span>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Score gauge */}
              {(() => {
                const ring = scoreRing(selectedItem.score);
                const offset = CIRC * (1 - selectedItem.score / 100);
                return (
                  <div className={`rounded-xl border border-tertiary-fixed p-5 ${ring.bg} flex items-center gap-5`}>
                    {/* SVG ring */}
                    <div className="relative w-20 h-20 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90" aria-hidden="true">
                        <circle cx="45" cy="45" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="7" />
                        <circle
                          cx="45" cy="45" r={RADIUS} fill="none"
                          stroke={ring.stroke} strokeWidth="7"
                          strokeDasharray={CIRC}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          className="transition-[stroke-dashoffset] duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-[22px] font-extrabold leading-none ${ring.text}`}>
                          {selectedItem.score}
                          <span className="text-[12px]">%</span>
                        </span>
                      </div>
                    </div>

                    {/* Label */}
                    <div>
                      <p className={`text-h2 font-bold ${ring.text}`}>{ring.label} Visibility</p>
                      <p className="text-body-md text-secondary mt-0.5">
                        Aggregate AEO score across 3 AI engines
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Engine breakdown */}
              {selectedItem.engines ? (
                <div className="space-y-3">
                  <h3 className="text-label-sm font-semibold text-secondary uppercase tracking-wider">
                    Engine Breakdown
                  </h3>
                  {Object.entries(selectedItem.engines).map(([key, engine]) => {
                    const meta = ENGINE_META[key] ?? { name: key, icon: "smart_toy", color: "#6b7280" };
                    return (
                      <div
                        key={key}
                        className="rounded-xl border border-tertiary-fixed bg-surface-container-lowest p-4"
                      >
                        {/* Engine header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                            >
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-[16px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                {meta.icon}
                              </span>
                            </div>
                            <span className="text-label-md font-semibold text-on-background">
                              {meta.name}
                            </span>
                          </div>

                          {!engine.success ? (
                            <span className="text-label-sm text-tertiary-container">Failed</span>
                          ) : engine.found ? (
                            <span className="inline-flex items-center gap-1 text-label-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              <span aria-hidden="true" className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              Found
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-label-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                              <span aria-hidden="true" className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                              Not Listed
                            </span>
                          )}
                        </div>

                        {/* Recommendation list */}
                        {engine.success && engine.list.length > 0 && (
                          <ol className="space-y-1" aria-label={`${meta.name} recommendations`}>
                            {engine.list.map((item, i) => {
                              const isMatch = fuzzyMatch(selectedItem.brandName, item);
                              return (
                                <li
                                  key={`${item}-${i}`}
                                  className={`flex items-center gap-2 text-body-md px-2 py-1 rounded-md ${
                                    isMatch
                                      ? "bg-green-50 text-green-900 font-medium"
                                      : "text-secondary"
                                  }`}
                                >
                                  <span className={`text-label-sm w-4 shrink-0 ${isMatch ? "text-green-700" : "text-tertiary-container"}`}>
                                    {i + 1}.
                                  </span>
                                  <span className="flex-1">{item}</span>
                                  {isMatch && (
                                    <span aria-hidden="true" className="material-symbols-outlined text-green-600 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                      star
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ol>
                        )}

                        {engine.success && engine.list.length === 0 && (
                          <p className="text-body-md text-tertiary-container italic">No results returned.</p>
                        )}

                        {!engine.success && (
                          <p className="text-body-md text-tertiary-container italic">Engine failed to respond. Check your API keys.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Old items without stored engines */
                <div className="rounded-xl border border-dashed border-tertiary-fixed p-5 text-center">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[32px] text-tertiary-fixed-dim mb-2 block"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    history
                  </span>
                  <p className="text-body-md text-secondary">
                    Engine breakdown is available for diagnostics run after this session.
                  </p>
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="shrink-0 px-6 py-4 border-t border-tertiary-fixed">
              <a
                href="/"
                className="w-full bg-brand hover:bg-brand-hover text-white text-label-md font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                onClick={() => selectItem(null)}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                  replay
                </span>
                Run Again
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
