"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar,
} from "recharts";
import { Globe, AlertTriangle } from "lucide-react";
import { useHistoryStore, type HistoryItem } from "@/store/useHistoryStore";

/* ── Shared animation variants ───────────────────────────────────────────── */

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/* ── Animated section wrapper ────────────────────────────────────────────── */

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Animated progress bar ───────────────────────────────────────────────── */

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  return (
    <div ref={ref} className="flex-1 h-2.5 rounded-full bg-surface-dim overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: inView ? `${pct}%` : 0 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </div>
  );
}

/* ── Animated engine coverage bar ────────────────────────────────────────── */

function AnimatedCoverageBar({ rate, color }: { rate: number | null; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const barColor = (rate ?? 0) >= 50 ? "#22c55e" : (rate ?? 0) > 0 ? "#f59e0b" : "#ef4444";
  return (
    <div ref={ref} className="w-full h-2 rounded-full bg-surface-dim overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: barColor }}
        initial={{ width: 0 }}
        animate={{ width: inView ? `${rate ?? 0}%` : 0 }}
        transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </div>
  );
}

/* ── Animated counter ────────────────────────────────────────────────────── */

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const duration = 900;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return <span ref={ref}>{displayed}</span>;
}

/* ── Engine metadata ─────────────────────────────────────────────────────── */

const ENGINE_KEYS = ["gemini", "versatile", "instant"] as const;
type EngineKey = (typeof ENGINE_KEYS)[number];

const ENGINE_META: Record<EngineKey, { label: string; shortLabel: string; icon: string; color: string }> = {
  gemini:    { label: "Gemini 2.5 Flash",  shortLabel: "Gemini",    icon: "auto_awesome", color: "#1a73e8" },
  versatile: { label: "Llama 3.3 70B",     shortLabel: "Llama 70B", icon: "bolt",         color: "#f59e0b" },
  instant:   { label: "Llama 3.1 8B",      shortLabel: "Llama 8B",  icon: "memory",       color: "#8b5cf6" },
};

const BRAND_COLOR = "#cf4522";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function fmtDate(ts: number) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(ts));
}

function fmtDateFull(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(ts));
}

function rankLabel(rank: number | null) {
  if (rank === null) return "—";
  if (rank === 1) return "Top pick!";
  if (rank <= 2) return "Strong";
  if (rank <= 3) return "Good";
  return "Needs work";
}

function rankBadgeClass(rank: number | null) {
  if (rank === null) return "bg-slate-100 text-slate-400";
  if (rank === 1) return "bg-green-100 text-green-800";
  if (rank <= 2) return "bg-blue-50 text-blue-700";
  if (rank <= 3) return "bg-yellow-50 text-yellow-700";
  return "bg-slate-100 text-slate-600";
}

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  if (score > 0) return "text-orange-500";
  return "text-red-500";
}

function scoreDotClass(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  if (score > 0) return "bg-orange-500";
  return "bg-red-500";
}

/* ── Derived stats computation ───────────────────────────────────────────── */

function computeInsights(history: HistoryItem[], brand: string) {
  const brandLower = brand.toLowerCase();
  const brandItems = history.filter((h) => h.brandName.toLowerCase() === brandLower);

  const scoreTrend = [...brandItems].reverse().map((item, i) => ({
    label: brandItems.length > 1 ? fmtDate(item.timestamp) : `Scan ${i + 1}`,
    score: item.score,
    query: item.query,
    id: item.id,
  }));

  const engineStats = ENGINE_KEYS.map((key) => {
    const withData = brandItems.filter((h) => h.engines?.[key] !== undefined);
    const found = withData.filter((h) => h.engines?.[key]?.found).length;
    const foundRate = withData.length > 0 ? Math.round((found / withData.length) * 100) : null;

    const ranks = brandItems
      .map((item) => {
        const list = item.engines?.[key]?.list ?? [];
        const idx = list.findIndex((b) => b.toLowerCase().includes(brandLower));
        return item.engines?.[key]?.found && idx >= 0 ? idx + 1 : null;
      })
      .filter((r): r is number => r !== null);
    const avgRank = ranks.length > 0
      ? Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length)
      : null;

    return { key, foundRate, avgRank, foundCount: found, totalScans: withData.length };
  });

  const compFreq: Record<string, number> = {};
  brandItems.forEach((item) => {
    if (!item.engines) return;
    Object.values(item.engines).forEach((eng) => {
      if (!eng.found && eng.success) {
        eng.list.forEach((name) => {
          const k = name.toLowerCase();
          compFreq[k] = (compFreq[k] ?? 0) + 1;
        });
      }
    });
  });
  const topCompetitors = Object.entries(compFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name: name.replace(/\b\w/g, (c) => c.toUpperCase()), count, maxCount: 1 }));
  if (topCompetitors.length > 0) {
    const max = topCompetitors[0].count;
    topCompetitors.forEach((c) => (c.maxCount = max));
  }

  const blindSpot = engineStats
    .filter((e) => e.totalScans >= 1 && e.foundRate !== null)
    .sort((a, b) => (a.foundRate ?? 100) - (b.foundRate ?? 100))[0] ?? null;

  return { brandItems, scoreTrend, engineStats, topCompetitors, blindSpot };
}

/* ── Empty state ─────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <span
        aria-hidden="true"
        className="material-symbols-outlined text-[64px] text-tertiary-fixed-dim"
        style={{ fontVariationSettings: "'FILL' 0" }}
      >
        query_stats
      </span>
      <p className="text-h2 font-semibold text-secondary">No diagnostics yet</p>
      <p className="text-body-md text-tertiary-container max-w-sm">
        Run your first AEO diagnostic and your real engine-by-engine insights will appear here automatically.
      </p>
      <Link
        href="/"
        className="mt-2 bg-brand hover:bg-brand-hover text-white text-label-md font-medium py-2.5 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>
          add
        </span>
        Run a Diagnostic
      </Link>
    </div>
  );
}

/* ── Custom tooltip for the trend chart ──────────────────────────────────── */

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-tertiary-fixed rounded-lg px-3 py-2 shadow-md text-body-md">
      <p className="font-semibold text-on-background">{label}</p>
      <p className="text-brand font-bold">{payload[0].value}% visibility</p>
    </div>
  );
}

/* ── Confirm modal ───────────────────────────────────────────────────────── */

function ConfirmModal({ onConfirm, onCancel, count }: { onConfirm: () => void; onCancel: () => void; count: number }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-tertiary-fixed p-6 max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-[24px] text-red-500" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
            delete_forever
          </span>
          <h3 className="text-h2 font-semibold text-on-background">Clear all history?</h3>
        </div>
        <p className="text-body-md text-secondary mb-6">
          This will permanently delete all {count} saved search{count !== 1 ? "es" : ""}. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-label-md font-medium text-secondary bg-surface-container hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-label-md font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Global insights types ───────────────────────────────────────────────── */

interface GlobalInsights {
  scoreTrend: { scan: string; score: number; date: string }[];
  engineBias: { engine: string; foundRate: number; totalScans: number }[];
  topCompetitors: { name: string; count: number }[];
  totalDiagnostics: number;
}

/* ── Global insights section ─────────────────────────────────────────────── */

function GlobalInsightsPanel({ brand }: { brand: string }) {
  const [data, setData] = useState<GlobalInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setData(null);
    setFetchError(false);

    fetch(`/api/insights?brand=${encodeURIComponent(brand)}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: GlobalInsights) => setData(d))
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setFetchError(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [brand]);

  return (
    <AnimatedSection className="mb-8">
      {/* Panel header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-h2 font-semibold text-on-background">🌐 Global Platform Intelligence</h3>
        <motion.span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-semibold bg-brand/10 text-brand border border-brand/20"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Globe className="h-3 w-3" /> Live Supabase Data
        </motion.span>
      </div>
      <p className="text-body-md text-secondary mb-5">
        Aggregated across every scan ever run for <strong>{brand}</strong> on this platform
        {data?.totalDiagnostics ? ` — ${data.totalDiagnostics} total diagnostic${data.totalDiagnostics !== 1 ? "s" : ""}` : ""}.
      </p>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-surface-container-low rounded-xl border border-tertiary-fixed" />
            ))}
          </motion.div>
        ) : fetchError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-3 text-body-md text-red-700"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>Could not load global intelligence data. Check your connection and try refreshing.</span>
          </motion.div>
        ) : !data || data.totalDiagnostics === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-low rounded-xl border border-tertiary-fixed px-5 py-4 text-body-md text-secondary italic"
          >
            No global data found for <strong>{brand}</strong> yet. Run a scan to start building the intelligence moat.
          </motion.div>
        ) : (
          <motion.div
            key="data"
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* Score trend */}
            <motion.div variants={staggerItem} className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-sm p-5">
              <p className="text-label-md font-semibold text-on-background mb-1">📈 Global Visibility Trend</p>
              <p className="text-label-sm text-secondary mb-4">Historical AEO score across all platform scans.</p>
              {data.scoreTrend.length >= 2 ? (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.scoreTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" vertical={false} />
                      <XAxis dataKey="scan" tick={{ fill: "#575e70", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: "#575e70", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", borderColor: "#e1e3e4" }}
                        formatter={(v) => [`${v}% visibility`, "Score"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#cf4522"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#cf4522", strokeWidth: 0 }}
                        activeDot={{ r: 7, strokeWidth: 2, stroke: "#cf4522", fill: "#fff" }}
                        isAnimationActive
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-secondary italic text-body-md py-6 text-center">
                  Only {data.scoreTrend.length} scan recorded globally — need at least 2 for a trend line.
                  {data.scoreTrend[0] && <> Current global score: <strong className="text-brand">{data.scoreTrend[0].score}%</strong></>}
                </p>
              )}
            </motion.div>

            <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Engine bias radar */}
              <div className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-sm p-5">
                <p className="text-label-md font-semibold text-on-background mb-1">🤖 LLM Engine Bias Matrix</p>
                <p className="text-label-sm text-secondary mb-4">% of global scans each engine recognised the brand.</p>
                {data.engineBias.length > 0 ? (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.engineBias}>
                        <PolarGrid stroke="#e1e3e4" />
                        <PolarAngleAxis dataKey="engine" tick={{ fill: "#575e70", fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Visibility %"
                          dataKey="foundRate"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.35}
                          isAnimationActive
                          animationDuration={1000}
                          animationEasing="ease-out"
                        />
                        <RechartsTooltip formatter={(v) => [`${v}%`, "Found rate"]} contentStyle={{ borderRadius: "8px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-secondary italic text-body-md py-8 text-center">No engine data available yet.</p>
                )}
              </div>

              {/* Competitor threat bar */}
              <div className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-sm p-5">
                <p className="text-label-md font-semibold text-red-600 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Top Semantic Threats
                </p>
                <p className="text-label-sm text-secondary mb-4">Competitors stealing recommendations globally.</p>
                {data.topCompetitors.length > 0 ? (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.topCompetitors} layout="vertical" margin={{ left: 40, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e1e3e4" />
                        <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="name" type="category" stroke="#151c27" fontSize={11} fontWeight="bold" tick={{ fill: "#151c27" }} />
                        <RechartsTooltip cursor={{ fill: "#fff4f0" }} formatter={(v) => [v, "Times recommended"]} contentStyle={{ borderRadius: "8px" }} />
                        <Bar
                          dataKey="count"
                          name="Times Recommended"
                          fill="#cf4522"
                          radius={[0, 4, 4, 0]}
                          isAnimationActive
                          animationDuration={900}
                          animationEasing="ease-out"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-secondary italic text-body-md py-8 text-center">No competitor threats detected yet.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedSection>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */

export default function MarketInsights() {
  const history = useHistoryStore((s) => s.history);
  const removeHistoryItem = useHistoryStore((s) => s.removeHistoryItem);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => setMounted(true), []);

  // Keep selectedId in sync: default to first item, or reset if the selected item was removed
  useEffect(() => {
    if (history.length === 0) {
      setSelectedId(null);
      return;
    }
    const stillExists = history.some((h) => h.id === selectedId);
    if (!stillExists) {
      setSelectedId(history[0].id);
    }
  }, [history, selectedId]);

  /* ── Loading skeleton ───────────────────────────────────────────────── */
  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto pb-12" aria-hidden="true">
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-56 bg-surface-container-high rounded-lg mb-2" />
          <div className="h-5 w-80 bg-surface-container rounded-lg" />
        </div>
        <motion.div
          className="space-y-6"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed h-48 animate-pulse"
            />
          ))}
        </motion.div>
      </div>
    );
  }

  /* ── Empty state ────────────────────────────────────────────────────── */
  if (history.length === 0) {
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <div className="mb-8">
          <h2 className="text-display font-bold text-on-background mb-1 tracking-tight">Market Insights</h2>
          <p className="text-body-lg text-secondary">Real engine-by-engine analysis from your actual searches.</p>
        </div>
        <EmptyState />
      </div>
    );
  }

  const selectedItem = history.find((h) => h.id === selectedId) ?? history[0];
  const activeBrand = selectedItem.brandName;
  const { brandItems, scoreTrend, engineStats, topCompetitors, blindSpot } = computeInsights(history, activeBrand);
  const totalScans = brandItems.length;

  /* ── Per-selected-scan competitor list ─────────────────────────────── */
  const scanCompetitors: string[] = selectedItem.engines
    ? [...new Set(
        Object.values(selectedItem.engines)
          .filter((e) => !e.found && e.success)
          .flatMap((e) => e.list)
      )]
    : [];

  const handleRemoveSelected = () => {
    removeHistoryItem(selectedItem.id);
  };

  const handleClearAll = () => {
    setShowClearConfirm(false);
    clearHistory();
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <h2 className="text-display font-bold text-on-background mb-1 tracking-tight">Market Insights</h2>
        <p className="text-body-lg text-secondary">Real engine-by-engine analysis from your actual searches.</p>
      </motion.div>

      {/* ── Global platform intelligence (live Supabase) ─────────────────── */}
      <GlobalInsightsPanel brand={activeBrand} />

      {/* ── Search history selector ──────────────────────────────────────── */}
      <div className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 0" }}>
              history
            </span>
            <label htmlFor="search-history-select" className="text-label-md font-medium text-on-background whitespace-nowrap">
              Search history
            </label>
          </div>

          {/* Dropdown */}
          <div className="relative flex-1">
            <select
              id="search-history-select"
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full appearance-none bg-surface-container border border-tertiary-fixed rounded-lg pl-4 pr-10 py-2.5 text-body-md text-on-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            >
              {history.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.brandName} — &quot;{item.query}&quot; · {fmtDate(item.timestamp)}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-secondary"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              expand_more
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRemoveSelected}
              title="Remove this search from history"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-label-sm font-medium text-secondary bg-surface-container hover:bg-red-50 hover:text-red-600 border border-tertiary-fixed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 0" }}>
                delete
              </span>
              <span className="hidden sm:inline">Remove</span>
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              title="Clear all search history"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-label-sm font-medium text-secondary bg-surface-container hover:bg-red-50 hover:text-red-600 border border-tertiary-fixed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                delete_sweep
              </span>
              <span className="hidden sm:inline">Clear all</span>
            </button>
          </div>
        </div>

        {/* Selected scan meta */}
        <div className="mt-3 pt-3 border-t border-tertiary-fixed flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${scoreDotClass(selectedItem.score)}`} />
            <span className="text-label-sm text-secondary">Brand:</span>
            <span className="text-label-sm font-semibold text-on-background">{selectedItem.brandName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-secondary" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
            <span className="text-label-sm text-secondary">Query:</span>
            <span className="text-label-sm font-medium text-on-background">&ldquo;{selectedItem.query}&rdquo;</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-secondary" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
            <span className="text-label-sm text-secondary">{fmtDateFull(selectedItem.timestamp)}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-label-sm text-secondary">Score:</span>
            <span className={`text-label-md font-bold ${scoreColor(selectedItem.score)}`}>{selectedItem.score}%</span>
          </div>
        </div>
      </div>

      {showClearConfirm && (
        <ConfirmModal onConfirm={handleClearAll} onCancel={() => setShowClearConfirm(false)} count={history.length} />
      )}

      {/* ── Selected scan engine breakdown ───────────────────────────────── */}
      {selectedItem.engines && (
        <div className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-sm p-6 mb-6">
          <h3 className="text-h2 font-semibold text-on-background mb-1">
            🔬 This Scan&apos;s Engine Results
          </h3>
          <p className="text-body-md text-secondary mb-5">
            What each AI engine said when asked <strong>&ldquo;{selectedItem.query}&rdquo;</strong> for <strong>{selectedItem.brandName}</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ENGINE_KEYS.map((key) => {
              const eng = selectedItem.engines?.[key];
              const meta = ENGINE_META[key];
              if (!eng) return null;

              const brandLower = selectedItem.brandName.toLowerCase();
              const rankIdx = eng.list.findIndex((b) => b.toLowerCase().includes(brandLower));
              const rank = eng.found && rankIdx >= 0 ? rankIdx + 1 : null;

              return (
                <div key={key} className="rounded-xl border border-tertiary-fixed bg-surface-container-low p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                      >
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {meta.icon}
                        </span>
                      </div>
                      <span className="text-label-md font-semibold text-on-background">{meta.shortLabel}</span>
                    </div>
                    {eng.success ? (
                      <span className={`text-label-sm font-semibold px-2 py-0.5 rounded-full ${eng.found ? "bg-green-100 text-green-800" : "bg-red-50 text-red-600"}`}>
                        {eng.found ? "Found" : "Not found"}
                      </span>
                    ) : (
                      <span className="text-label-sm font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Error</span>
                    )}
                  </div>

                  {eng.found && rank !== null && (
                    <p className="text-label-sm text-secondary">
                      Ranked <strong className="text-on-background">#{rank}</strong> in response
                    </p>
                  )}

                  {eng.list.length > 0 && (
                    <div>
                      <p className="text-label-sm text-tertiary-container mb-1.5">Brands mentioned:</p>
                      <div className="flex flex-wrap gap-1">
                        {eng.list.map((name, i) => {
                          const isOurs = name.toLowerCase().includes(brandLower);
                          return (
                            <span
                              key={i}
                              className={`text-label-sm px-2 py-0.5 rounded-full font-medium ${
                                isOurs
                                  ? "bg-brand/10 text-brand border border-brand/20"
                                  : "bg-surface-dim text-secondary"
                              }`}
                            >
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!eng.success && (
                    <p className="text-label-sm text-tertiary-container italic">Engine did not respond.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-6">

        {/* ── 1. Score trend ─────────────────────────────────────────────── */}
        <AnimatedSection className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-sm p-6">
          <h3 className="text-h2 font-semibold text-on-background mb-1">
            📈 Visibility Score History
          </h3>
          <p className="text-body-md text-secondary mb-6">
            Aggregate AEO score across every diagnostic run for{" "}
            <strong>{activeBrand}</strong> — {totalScans} scan{totalScans !== 1 ? "s" : ""} total.
          </p>

          {scoreTrend.length < 2 ? (
            <div className="flex items-center gap-3 py-4 px-4 rounded-lg bg-surface-container-low text-secondary">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 0" }}>info</span>
              <span className="text-body-md">
                Run at least 2 diagnostics for <strong>{activeBrand}</strong> to see a trend line.
                Current score: <strong className="text-brand">{scoreTrend[0]?.score ?? 0}%</strong>
              </span>
            </div>
          ) : (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#575e70", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fill: "#575e70", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <RechartsTooltip content={<TrendTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={BRAND_COLOR}
                    strokeWidth={3}
                    dot={{ r: 5, fill: BRAND_COLOR, strokeWidth: 0 }}
                    activeDot={{ r: 8, strokeWidth: 2, stroke: BRAND_COLOR, fill: "#fff" }}
                    isAnimationActive
                    animationDuration={1400}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnimatedSection>

        {/* ── 2. Engine found rate ────────────────────────────────────────── */}
        <AnimatedSection className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-sm p-6">
          <h3 className="text-h2 font-semibold text-on-background mb-1">
            🤖 Engine-by-Engine Coverage
          </h3>
          <p className="text-body-md text-secondary mb-6">
            Across all scans for <strong>{activeBrand}</strong>, how often did each AI engine mention it?
          </p>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {engineStats.map((eng) => {
              const meta = ENGINE_META[eng.key];
              const rate = eng.foundRate;
              const hasData = eng.totalScans > 0;
              return (
                <motion.div
                  key={eng.key}
                  variants={staggerItem}
                  className="rounded-xl border border-tertiary-fixed bg-surface-container-low p-5 flex flex-col gap-3"
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                    >
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {meta.icon}
                      </span>
                    </div>
                    <span className="text-label-md font-semibold text-on-background">{meta.shortLabel}</span>
                  </div>

                  {!hasData ? (
                    <p className="text-label-sm text-tertiary-container">No engine data yet</p>
                  ) : (
                    <>
                      <div className="flex items-end gap-1.5">
                        <span className="text-[32px] font-extrabold leading-none text-on-background">
                          <AnimatedNumber value={rate ?? 0} />
                        </span>
                        <span className="text-h2 text-secondary mb-1">%</span>
                      </div>
                      <AnimatedCoverageBar rate={rate} color={meta.color} />
                      <p className="text-label-sm text-secondary">
                        Found in {eng.foundCount}/{eng.totalScans} scan{eng.totalScans !== 1 ? "s" : ""}
                      </p>
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatedSection>

        {/* ── 3. Rank when found ─────────────────────────────────────────── */}
        {engineStats.some((e) => e.avgRank !== null) && (
          <AnimatedSection className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-sm p-6">
            <h3 className="text-h2 font-semibold text-on-background mb-1">
              🏆 Your Position When Mentioned
            </h3>
            <p className="text-body-md text-secondary mb-6">
              When an AI engine did find <strong>{activeBrand}</strong>, what rank position did it appear at?
              Lower is better — #1 means the engine listed you first.
            </p>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {engineStats.map((eng) => {
                const meta = ENGINE_META[eng.key];
                return (
                  <motion.div
                    key={eng.key}
                    variants={staggerItem}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-low border border-tertiary-fixed"
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1", color: meta.color }}>
                        {meta.icon}
                      </span>
                      <span className="text-label-md font-semibold text-secondary">{meta.shortLabel}</span>
                    </div>

                    {eng.avgRank !== null ? (
                      <>
                        <motion.span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${rankBadgeClass(eng.avgRank)}`}
                          initial={{ scale: 0.5, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                        >
                          #{eng.avgRank}
                        </motion.span>
                        <p className="text-label-sm text-tertiary-container text-center">{rankLabel(eng.avgRank)}</p>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-400">—</span>
                        <p className="text-label-sm text-tertiary-container text-center">Not found yet</p>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            <p className="mt-4 text-label-sm text-secondary bg-surface-container px-4 py-3 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 0" }}>info</span>
              Rank #1 = your brand was the engine&apos;s first recommendation. Rank #5 = you appeared but were buried.
            </p>
          </AnimatedSection>
        )}

        {/* ── 4. Competitors from this scan ──────────────────────────────── */}
        {scanCompetitors.length > 0 && (
          <AnimatedSection className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-sm p-6">
            <h3 className="text-h2 font-semibold text-on-background mb-1">
              🔍 Brands Appearing Instead of You
            </h3>
            <p className="text-body-md text-secondary mb-6">
              In <strong>this scan</strong>, when engines didn&apos;t mention <strong>{activeBrand}</strong>, these brands appeared instead.
            </p>

            <motion.div
              className="flex flex-wrap gap-2"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {scanCompetitors.map((name, i) => (
                <motion.span
                  key={i}
                  variants={staggerItem}
                  className="px-3 py-1.5 rounded-full text-label-sm font-medium bg-surface-container-low border border-tertiary-fixed text-on-background"
                  whileHover={{ scale: 1.05 }}
                >
                  {name}
                </motion.span>
              ))}
            </motion.div>

            {/* All-time competitor frequency */}
            {topCompetitors.length > 0 && (
              <div className="mt-5">
                <p className="text-label-sm font-semibold text-secondary mb-3 uppercase tracking-wide">
                  All-time competitor frequency (all scans)
                </p>
                <div className="space-y-2.5">
                  {topCompetitors.map((comp) => {
                    const pct = Math.round((comp.count / comp.maxCount) * 100);
                    return (
                      <div key={comp.name} className="flex items-center gap-3">
                        <span className="text-body-md font-medium text-on-background w-36 shrink-0 truncate">{comp.name}</span>
                        <AnimatedBar pct={pct} color="#64748b" />
                        <span className="text-label-sm text-tertiary-container w-20 text-right shrink-0">
                          {comp.count} mention{comp.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </AnimatedSection>
        )}

        {/* Fallback: top competitors when no selected-scan competitors */}
        {scanCompetitors.length === 0 && topCompetitors.length > 0 && (
          <AnimatedSection className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-sm p-6">
            <h3 className="text-h2 font-semibold text-on-background mb-1">
              🔍 Brands Appearing Instead of You
            </h3>
            <p className="text-body-md text-secondary mb-6">
              Across all scans for <strong>{activeBrand}</strong>, when engines didn&apos;t mention it, these brands appeared most.
            </p>

            <div className="space-y-2.5">
              {topCompetitors.map((comp) => {
                const pct = Math.round((comp.count / comp.maxCount) * 100);
                return (
                  <div key={comp.name} className="flex items-center gap-3">
                    <span className="text-body-md font-medium text-on-background w-36 shrink-0 truncate">{comp.name}</span>
                    <AnimatedBar pct={pct} color="#64748b" />
                    <span className="text-label-sm text-tertiary-container w-20 text-right shrink-0">
                      {comp.count} mention{comp.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        )}

        {/* ── 5. Blind spot callout ──────────────────────────────────────── */}
        {blindSpot && blindSpot.foundRate !== null && blindSpot.foundRate < 50 && (
          <AnimatedSection className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
            <motion.span
              className="material-symbols-outlined text-[28px] text-amber-500 shrink-0 mt-0.5"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
            >
              warning
            </motion.span>
            <div>
              <p className="text-h2 font-semibold text-amber-900 mb-1">
                Blind Spot: {ENGINE_META[blindSpot.key].label} rarely mentions you
              </p>
              <p className="text-body-md text-amber-800">
                Across your scans, <strong>{ENGINE_META[blindSpot.key].shortLabel}</strong> only found{" "}
                <strong>{activeBrand}</strong> {blindSpot.foundRate}% of the time.{" "}
                {blindSpot.key === "gemini"
                  ? "Gemini powers Google's AI Overviews — closing this gap should be your highest priority."
                  : "Consider publishing more content that directly addresses your target queries to improve coverage."}
              </p>
            </div>
          </AnimatedSection>
        )}

        {/* ── 6. Other brands in history ─────────────────────────────────── */}
        {(() => {
          const otherBrands = [...new Set(
            history
              .map((h) => h.brandName)
              .filter((b) => b.toLowerCase() !== activeBrand.toLowerCase())
          )].slice(0, 5);

          if (otherBrands.length === 0) return null;

          return (
            <AnimatedSection className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-sm p-6">
              <h3 className="text-h2 font-semibold text-on-background mb-1">Other Brands You&apos;ve Scanned</h3>
              <p className="text-body-md text-secondary mb-4">
                Select a different search from the dropdown above to switch brands.
              </p>
              <motion.div
                className="flex flex-wrap gap-2"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {otherBrands.map((brand) => {
                  const latestForBrand = history.find((h) => h.brandName.toLowerCase() === brand.toLowerCase());
                  return (
                    <motion.button
                      key={brand}
                      variants={staggerItem}
                      onClick={() => {
                        const item = history.find((h) => h.brandName.toLowerCase() === brand.toLowerCase());
                        if (item) setSelectedId(item.id);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low border border-tertiary-fixed hover:border-brand/40 hover:bg-brand/5 transition-colors"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${scoreDotClass(latestForBrand?.score ?? 0)}`}
                      />
                      <span className="text-body-md text-on-background">{brand}</span>
                      <span className="text-label-sm text-tertiary-container">{latestForBrand?.score ?? 0}%</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatedSection>
          );
        })()}

      </div>
    </div>
  );
}
