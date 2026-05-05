"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHistoryStore } from "@/store/useHistoryStore";
import InputCard from "@/components/dashboard/InputCard";
import VisibilityScoreCard from "@/components/dashboard/VisibilityScoreCard";
import MetricCard from "@/components/dashboard/MetricCard";
import EngineResultCard from "@/components/dashboard/EngineResultCard";
import RemediationPanel from "@/components/dashboard/RemediationPanel";

type EngineData = {
  success: boolean;
  found: boolean;
  list: string[];
};

type Results = {
  diagnosticId: string | null;
  score: number;
  engines: {
    gemini: EngineData;
    versatile: EngineData;
    instant: EngineData;
  };
};

const ENGINES = [
  {
    key: "gemini" as const,
    name: "AI Engine 1",
    icon: "auto_awesome",
    color: "#1a73e8",
  },
  {
    key: "versatile" as const,
    name: "AI Engine 2",
    icon: "bolt",
    color: "#f59e0b",
  },
  {
    key: "instant" as const,
    name: "AI Engine 3",
    icon: "memory",
    color: "#8b5cf6",
  },
];

/* ── Animation variants ──────────────────────────────────────────────────── */

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

const staggerGrid = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/* ── Data helpers ────────────────────────────────────────────────────────── */

function deriveSentiment(results: Results): { value: string; desc: string } {
  const found = Object.values(results.engines).some((e) => e.found);
  return found
    ? { value: "Positive", desc: "Brand is mentioned in AI-generated recommendations." }
    : { value: "Absent",   desc: "Brand was not surfaced in any engine response." };
}

function deriveCompetitorOverlap(results: Results): { value: string; desc: string } {
  const allLists = Object.values(results.engines)
    .filter((e) => e.success)
    .map((e) => e.list.map((s) => s.toLowerCase()));

  const freq: Record<string, number> = {};
  for (const list of allLists) {
    const seen = new Set<string>();
    for (const item of list) {
      if (!seen.has(item)) {
        freq[item] = (freq[item] ?? 0) + 1;
        seen.add(item);
      }
    }
  }

  const overlap = Object.values(freq).filter((n) => n >= 2).length;
  const top = Object.entries(freq)
    .filter(([, n]) => n >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([name]) => name.replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" and ");

  const level =
    overlap >= 4 ? "Very High" : overlap >= 2 ? "High" : overlap === 1 ? "Low" : "None";

  return {
    value: level,
    desc: top.length > 0
      ? `Frequently mentioned alongside ${top}.`
      : "No competitors appeared across multiple engines.",
  };
}

function deriveCompetitors(brandName: string, results: Results): string[] {
  const freq: Record<string, number> = {};
  const canonical: Record<string, string> = {};
  for (const engine of Object.values(results.engines)) {
    if (!engine.success) continue;
    const seen = new Set<string>();
    for (const item of engine.list) {
      const key = item.toLowerCase();
      if (seen.has(key) || key === brandName.toLowerCase()) continue;
      freq[key] = (freq[key] ?? 0) + 1;
      if (!canonical[key]) canonical[key] = item;
      seen.add(key);
    }
  }
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([key]) => canonical[key]);
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function Home() {
  const addDiagnostic = useHistoryStore((state) => state.addDiagnostic);
  const [brandName, setBrandName] = useState("");
  const [query, setQuery]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState<Results | null>(null);
  const [error, setError]         = useState("");

  const runDiagnostic = async () => {
    const trimmedBrand = brandName.trim();
    const trimmedQuery = query.trim();

    if (!trimmedBrand || !trimmedQuery) {
      setError("Please enter both a Brand Name and a Search Query.");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: trimmedBrand, query: trimmedQuery }),
      });

      // Parse as text first — if Vercel returns HTML on a 504/502 crash,
      // calling .json() directly would throw an unreadable SyntaxError.
      const text = await res.text();
      let data: unknown = null;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `The server took too long to respond (Error ${res.status}). Please try again in a few moments.`,
        );
      }

      if (!res.ok) {
        const msg =
          data !== null &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : `Diagnostic failed with status ${res.status}.`;
        throw new Error(msg);
      }

      const typedData = data as Results;
      setResults(typedData);
      if (typeof typedData.score === "number" && isFinite(typedData.score)) {
        addDiagnostic({
          id: typedData.diagnosticId,
          brandName: trimmedBrand,
          query: trimmedQuery,
          score: typedData.score,
          engines: typedData.engines,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Check your internet connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBrandChange = (v: string) => {
    setBrandName(v);
    if (error) setError("");
  };

  const handleQueryChange = (v: string) => {
    setQuery(v);
    if (error) setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) runDiagnostic();
  };

  const sentiment         = results ? deriveSentiment(results)              : null;
  const competitorOverlap = results ? deriveCompetitorOverlap(results)      : null;
  const scanCompetitors   = useMemo(
    () => (results ? deriveCompetitors(brandName, results) : []),
    [brandName, results],
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <motion.div
        className="mb-12 text-center md:text-left"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <h2 className="text-display font-extrabold text-[#0f172a] mb-3 tracking-tight leading-tight">
          AI Engine Optimization{" "}
          <span className="text-brand">(AEO)</span>
        </h2>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Diagnose your brand&apos;s visibility across the latent space of top LLMs.
        </p>
      </motion.div>

      {/* Input form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
      >
        <InputCard
          brandName={brandName}
          query={query}
          loading={loading}
          error={error}
          onBrandChange={handleBrandChange}
          onQueryChange={handleQueryChange}
          onSubmit={handleSubmit}
        />
      </motion.div>

      {/* Dynamic content area */}
      <AnimatePresence mode="wait">
        {/* Loading */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col items-center justify-center py-24 gap-6"
            role="status"
            aria-live="polite"
          >
            {/* Animated dots */}
            <div className="flex gap-2.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-brand block"
                  animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <p className="text-body-lg text-secondary">
              Querying AI engines&hellip; this takes 5–10 seconds.
            </p>
          </motion.div>
        )}

        {/* Results */}
        {results && !loading && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Score + metric row */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              variants={staggerGrid}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={staggerItem}>
                <VisibilityScoreCard score={results.score} />
              </motion.div>

              <motion.div
                variants={staggerItem}
                className="md:col-span-2 grid grid-cols-2 gap-6"
              >
                {sentiment && (
                  <MetricCard
                    icon="forum"
                    title="Sentiment Alignment"
                    value={sentiment.value}
                    description={sentiment.desc}
                  />
                )}
                {competitorOverlap && (
                  <MetricCard
                    icon="compare_arrows"
                    title="Competitor Overlap"
                    value={competitorOverlap.value}
                    description={competitorOverlap.desc}
                  />
                )}
              </motion.div>
            </motion.div>

            {/* Engine breakdowns */}
            <motion.h3
              className="text-h2 font-semibold text-on-background mt-12 mb-6"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              Engine Breakdowns
            </motion.h3>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerGrid}
              initial="hidden"
              animate="visible"
            >
              {ENGINES.map(({ key, name, icon, color }) => {
                const engine = results.engines[key];
                return (
                  <motion.div key={key} variants={staggerItem}>
                    <EngineResultCard
                      engineName={name}
                      engineIcon={icon}
                      engineColor={color}
                      items={engine.list}
                      brandName={brandName}
                      isFound={engine.found}
                      success={engine.success}
                    />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* TAKEDOWN PAYLOAD ENGINE */}
            <motion.div
              className="mt-12"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <RemediationPanel
                brandName={brandName}
                query={query}
                competitors={scanCompetitors}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Empty state */}
        {!results && !loading && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.15 }}
            className="flex flex-col items-center justify-center py-24 gap-3 text-center"
          >
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-tertiary-fixed-dim text-[64px] animate-float"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              manage_search
            </span>
            <p className="text-h2 font-semibold text-secondary mt-2">
              Run your first diagnostic
            </p>
            <p className="text-body-md text-tertiary-container max-w-[380px] text-pretty">
              Enter a brand name and search query above to see how visible your
              brand is across top AI engines.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
