"use client";

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { remediationSchema } from '@/lib/schemas/remediation';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  AlertTriangle,
  ImageIcon,
  RefreshCw,
  Video,
  MessageSquare,
  Clapperboard,
  Zap,
  BarChart2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import type { DeepPartial } from "ai";
import type { RemediationOutput } from "@/lib/schemas/remediation";

type RemediationPanelProps = {
  brandName: string;
  query: string;
  competitors: string[];
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const fadeSection = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/* ── Progress tracker ───────────────────────────────────────────────────── */

const STEPS = [
  {
    key: "analysis" as const,
    label: "Competitor Analysis",
    subLabel: "Identifying semantic gaps",
    icon: Sparkles,
  },
  {
    key: "ugc" as const,
    label: "UGC Video Scripts",
    subLabel: "Writing viral hooks & scripts",
    icon: Video,
  },
  {
    key: "reddit" as const,
    label: "Reddit & Quora Seeds",
    subLabel: "Crafting community authority",
    icon: MessageSquare,
  },
  {
    key: "visuals" as const,
    label: "Visual Authority",
    subLabel: "Generating Pixii prompts & listing",
    icon: ImageIcon,
  },
];

function deriveStepStatus(object: DeepPartial<RemediationOutput> | undefined) {
  return {
    analysis: !!object?.vulnerability_analysis,
    ugc: !!(object?.ugc_video_scripts && object.ugc_video_scripts.some((s) => s?.hook)),
    reddit: !!(
      object?.reddit_seeding_strategy &&
      object.reddit_seeding_strategy.some((s) => s?.question_to_ask)
    ),
    visuals: !!(object?.amazon_listing?.title),
  };
}

function StrategyProgress({
  object,
  isLoading,
}: {
  object: DeepPartial<RemediationOutput> | undefined;
  isLoading: boolean;
}) {
  const status = deriveStepStatus(object);
  const doneCount = Object.values(status).filter(Boolean).length;
  const progressPct = Math.round((doneCount / STEPS.length) * 100);
  const activeIndex = STEPS.findIndex((s) => !status[s.key]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="strategy-progress"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto", transition: { duration: 0.35, ease: EASE } }}
          exit={{ opacity: 0, height: 0, transition: { duration: 0.25, ease: EASE } }}
          className="overflow-hidden"
        >
          <div
            className="mx-6 mt-6 rounded-xl border overflow-hidden"
            style={{ borderColor: 'rgba(207,69,34,0.2)', backgroundColor: 'rgba(207,69,34,0.04)' }}
          >
            {/* Header row */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent animate-spin shrink-0"
                    style={{ borderColor: 'rgba(207,69,34,0.3)', borderTopColor: 'var(--color-brand)' }}
                    aria-hidden="true"
                  />
                  <span className="text-label-sm font-semibold text-on-background">
                    Assembling Echo Chamber Strategy…
                  </span>
                </div>
                <span className="text-label-sm font-bold tabular-nums" style={{ color: 'var(--color-brand)' }}>
                  {doneCount}/{STEPS.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-1.5 rounded-full bg-tertiary-fixed overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: 'var(--color-brand)' }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </div>
            </div>

            {/* Step list */}
            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {STEPS.map((step, i) => {
                const isDone = status[step.key];
                const isActive = !isDone && i === activeIndex;
                const isPending = !isDone && !isActive;

                return (
                  <div
                    key={step.key}
                    className="flex items-start gap-2 rounded-lg px-2.5 py-2"
                    style={{
                      backgroundColor: isDone
                        ? 'rgba(34,197,94,0.06)'
                        : isActive
                          ? 'rgba(207,69,34,0.07)'
                          : 'transparent',
                    }}
                  >
                    {/* Step icon / indicator */}
                    <div className="shrink-0 mt-0.5">
                      {isDone ? (
                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-green-600" aria-hidden="true" />
                        </div>
                      ) : isActive ? (
                        <div
                          className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                          style={{ borderColor: 'rgba(207,69,34,0.3)', borderTopColor: 'var(--color-brand)' }}
                          aria-hidden="true"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-tertiary-fixed" aria-hidden="true" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-[11px] font-semibold leading-tight truncate ${
                          isDone
                            ? 'text-green-700 dark:text-green-500'
                            : isActive
                              ? 'text-on-background'
                              : 'text-secondary'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className={`text-[10px] leading-tight mt-0.5 ${isPending ? 'text-tertiary-container' : 'text-secondary'}`}>
                        {isDone ? 'Complete' : isActive ? step.subLabel : 'Queued'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Shared sub-components ──────────────────────────────────────────────── */

function PillarLabel({
  id,
  number,
  icon: Icon,
  label,
  description,
}: {
  id: string;
  number: string;
  icon: React.ElementType;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5"
        style={{ backgroundColor: 'rgba(207,69,34,0.1)' }}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" style={{ color: 'var(--color-brand)' }} />
      </div>
      <div>
        <p className="text-label-sm font-bold uppercase tracking-widest text-brand mb-0.5">
          Pillar {number}
        </p>
        <h4 id={id} className="text-body-lg font-semibold text-on-background leading-snug">
          {label}
        </h4>
        <p className="text-label-sm text-secondary mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 my-8" aria-hidden="true">
      <div className="flex-1 h-px bg-tertiary-fixed" />
      <div className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed" />
      <div className="flex-1 h-px bg-tertiary-fixed" />
    </div>
  );
}

function CopyButton({
  text,
  label = "Copy",
  size = "sm",
}: {
  text: string;
  label?: string;
  size?: "sm" | "xs";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable in non-secure context
    }
  }, [text]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label={`Copy ${label} to clipboard`}
      className={`border-tertiary-fixed text-secondary hover:text-on-background hover:bg-surface-container-low transition-all ${size === "xs" ? "h-6 text-[11px] px-2" : "h-7 text-xs"}`}
    >
      {copied ? (
        <><Check className="h-3 w-3 mr-1 text-green-500" aria-hidden="true" />Copied!</>
      ) : (
        <><Copy className="h-3 w-3 mr-1.5" aria-hidden="true" />{label}</>
      )}
    </Button>
  );
}

function SkeletonLine({ width = "100%", height = "1rem" }: { width?: string; height?: string }) {
  return (
    <div
      className="bg-surface-container-high rounded animate-pulse"
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

function SkeletonBlock({ lines }: { lines: Array<{ width?: string }> }) {
  return (
    <div className="space-y-1.5" aria-hidden="true">
      {lines.map((l, i) => (
        <SkeletonLine key={i} width={l.width ?? "100%"} />
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */

export default function RemediationPanel({ brandName, query, competitors }: RemediationPanelProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [silentlyFailed, setSilentlyFailed] = useState(false);

  const { object, submit, isLoading, error } = useObject({
    api: '/api/remediate',
    schema: remediationSchema,
  });

  // Detect when the stream finishes but returned no usable data (e.g. 503 mid-stream)
  useEffect(() => {
    if (hasStarted && !isLoading && !error) {
      const hasAnyData = !!(
        object?.vulnerability_analysis ||
        (object?.ugc_video_scripts && object.ugc_video_scripts.some((s) => s?.hook)) ||
        (object?.reddit_seeding_strategy && object.reddit_seeding_strategy.some((s) => s?.question_to_ask)) ||
        object?.amazon_listing?.title
      );
      setSilentlyFailed(!hasAnyData);
    }
  }, [isLoading, hasStarted, error, object]);

  const handleGenerate = () => {
    setHasStarted(true);
    setSilentlyFailed(false);
    submit({ brandName, query, competitors });
  };

  const showError = error || silentlyFailed;
  const isDeployed = hasStarted && !isLoading && !showError;
  const buttonDisabled = isLoading || isDeployed;

  const errorMessage = error?.message ?? "Generation completed but returned no data. Please retry.";

  const amazonCopyText = object?.amazon_listing
    ? `TITLE:\n${object.amazon_listing.title ?? ''}\n\nBULLETS:\n${(object.amazon_listing.bullets ?? []).filter(Boolean).map((b) => `• ${b}`).join('\n')}`
    : '';

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="p-6 border-b border-tertiary-fixed">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                aria-hidden="true"
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(207,69,34,0.1)', color: 'var(--color-brand)' }}
              >
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-h2 font-semibold text-on-background">Echo Chamber Strategy</h3>
            </div>
            <p className="text-body-md text-secondary pl-[2.375rem] max-w-2xl">
              Competitors are actively capturing AI traffic for your keywords.
              Deploy this defensive strategy immediately to stop the bleed and reclaim your semantic market share from{" "}
              {competitors.length > 0
                ? competitors.slice(0, 2).join(" & ")
                : "top competitors"}
              .
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={buttonDisabled}
            className="bg-brand hover:bg-brand-hover text-white font-semibold px-5 shrink-0 disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <span
                  className="h-3.5 w-3.5 mr-2 rounded-full border-2 border-white/30 border-t-white animate-spin"
                  aria-hidden="true"
                />
                Generating…
              </>
            ) : isDeployed ? (
              <><Check className="h-4 w-4 mr-1.5" aria-hidden="true" />Strategy Deployed</>
            ) : showError ? (
              <><RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" />Retry</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-1.5" aria-hidden="true" />Generate Market Capture Strategy</>
            )}
          </Button>
        </div>
      </div>

      {/* ── Error banner ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showError && (
          <motion.div
            key="error-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-3 bg-error-container/40 border-b border-error/20 text-on-error-container text-body-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {errorMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasStarted && (
          <motion.div
            key="remediation-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.4, ease: EASE } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.25, ease: EASE } }}
            className="overflow-hidden"
            aria-busy={isLoading}
            aria-live="polite"
          >
            {/* ── Live progress tracker (visible only while streaming) ── */}
            <StrategyProgress object={object} isLoading={isLoading} />

            <div className="p-6">

              {/* ── Vulnerability Analysis ──────────────────────────────── */}
              <motion.section
                variants={fadeSection}
                initial="hidden"
                animate="visible"
                aria-labelledby="vuln-heading"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  {/* Pulsing threat indicator */}
                  <span className="relative flex h-3 w-3 shrink-0" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <h4
                    id="vuln-heading"
                    className="text-label-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-500"
                  >
                    Active Market Share Threats
                  </h4>
                </div>
                <div className="bg-surface-container-low border border-tertiary-fixed rounded-xl p-4 text-body-md text-on-background leading-relaxed min-h-[56px]">
                  {object?.vulnerability_analysis ? (
                    object.vulnerability_analysis
                  ) : isLoading ? (
                    <SkeletonBlock lines={[{ width: '95%' }, { width: '88%' }, { width: '92%' }, { width: '70%' }]} />
                  ) : null}
                </div>
              </motion.section>

              <SectionDivider />

              {/* ── PILLAR 1: UGC Video Scripts ─────────────────────────── */}
              <motion.section
                variants={fadeSection}
                initial="hidden"
                animate="visible"
                aria-labelledby="ugc-pillar-heading"
              >
                <PillarLabel
                  id="ugc-pillar-heading"
                  number="01"
                  icon={Video}
                  label="UGC Video Scripts"
                  description="Hand these to a creator — or use Pixii's UGC Video generator to produce the video instantly. These scripts embed the exact semantic keywords AI models index from YouTube and TikTok transcripts."
                />

                <div className="mb-4 flex items-center gap-3 bg-brand/5 border border-brand/10 rounded-lg px-4 py-2.5 w-fit">
                  <Sparkles className="h-4 w-4 text-brand shrink-0" aria-hidden="true" />
                  <p className="text-label-sm text-on-background">
                    Don&apos;t wait for a creator.{" "}
                    <strong className="text-brand cursor-pointer hover:underline">
                      Send to Pixii UGC Generator →
                    </strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {object?.ugc_video_scripts && object.ugc_video_scripts.length > 0
                    ? object.ugc_video_scripts.map((script, i) => (
                        <div
                          key={i}
                          className="bg-surface-container-low border border-tertiary-fixed rounded-xl overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-4 pt-4 pb-2">
                            <div className="flex items-center gap-1.5">
                              <Clapperboard className="h-3.5 w-3.5 text-brand shrink-0" aria-hidden="true" />
                              <span className="text-label-sm font-bold text-brand uppercase tracking-wider">
                                Script {String(i + 1).padStart(2, '0')}
                              </span>
                            </div>
                            {script?.script && (
                              <CopyButton
                                text={`HOOK:\n${script.hook ?? ''}\n\nSCRIPT:\n${script.script}`}
                                label="Script"
                                size="xs"
                              />
                            )}
                          </div>

                          <div
                            className="mx-4 mb-3 rounded-lg px-3 py-2.5"
                            style={{ backgroundColor: 'rgba(207,69,34,0.08)', border: '1px solid rgba(207,69,34,0.15)' }}
                          >
                            <p className="text-label-sm font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-brand)' }}>
                              Hook (3 sec)
                            </p>
                            {script?.hook ? (
                              <p className="text-body-md font-semibold text-on-background leading-snug">
                                {script.hook}
                              </p>
                            ) : isLoading ? (
                              <SkeletonLine width="80%" height="0.9rem" />
                            ) : null}
                          </div>

                          <div className="px-4 pb-4">
                            <p className="text-label-sm font-bold uppercase tracking-widest text-secondary mb-1.5">
                              Full Script (30 sec)
                            </p>
                            {script?.script ? (
                              <p className="text-body-md text-on-background leading-relaxed">
                                {script.script}
                              </p>
                            ) : isLoading ? (
                              <SkeletonBlock lines={[{}, { width: '93%' }, { width: '87%' }, { width: '60%' }]} />
                            ) : null}
                          </div>
                        </div>
                      ))
                    : isLoading
                      ? [0, 1].map((i) => (
                          <div
                            key={i}
                            className="bg-surface-container-low border border-tertiary-fixed rounded-xl p-4 min-h-[200px] space-y-3"
                            aria-hidden="true"
                          >
                            <SkeletonLine width="40%" height="0.8rem" />
                            <div
                              className="rounded-lg p-3"
                              style={{ border: '1px solid rgba(207,69,34,0.15)', backgroundColor: 'rgba(207,69,34,0.05)' }}
                            >
                              <SkeletonLine width="90%" height="0.9rem" />
                            </div>
                            <SkeletonBlock lines={[{}, { width: '88%' }, { width: '75%' }]} />
                          </div>
                        ))
                      : null}
                </div>
              </motion.section>

              <SectionDivider />

              {/* ── PILLAR 2: Reddit / Quora Seeding ────────────────────── */}
              <motion.section
                variants={fadeSection}
                initial="hidden"
                animate="visible"
                aria-labelledby="reddit-pillar-heading"
              >
                <PillarLabel
                  id="reddit-pillar-heading"
                  number="02"
                  icon={MessageSquare}
                  label="Digital PR — Reddit & Quora Seeding"
                  description="Post these on Reddit and Quora to build real-time semantic authority. Perplexity, Gemini, and ChatGPT index community discussions live — this is how you hijack what they tell customers."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {object?.reddit_seeding_strategy && object.reddit_seeding_strategy.length > 0
                    ? object.reddit_seeding_strategy.map((pair, i) => (
                        <div
                          key={i}
                          className="bg-surface-container-low border border-tertiary-fixed rounded-xl overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-4 pt-4 pb-3">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 text-brand shrink-0" aria-hidden="true" />
                              <span className="text-label-sm font-bold text-brand uppercase tracking-wider">
                                Seed {String(i + 1).padStart(2, '0')}
                              </span>
                            </div>
                            {pair?.expert_answer && (
                              <CopyButton
                                text={`POST:\n${pair.question_to_ask ?? ''}\n\nANSWER:\n${pair.expert_answer}`}
                                label="Q&A"
                                size="xs"
                              />
                            )}
                          </div>

                          <div className="mx-4 mb-3">
                            <p className="text-label-sm font-bold uppercase tracking-widest text-secondary mb-1.5">
                              Post This Question
                            </p>
                            <div className="rounded-lg px-3 py-2.5 bg-surface-container border border-tertiary-fixed">
                              {pair?.question_to_ask ? (
                                <p className="text-body-md font-medium text-on-background leading-snug">
                                  {pair.question_to_ask}
                                </p>
                              ) : isLoading ? (
                                <SkeletonLine width="90%" height="0.9rem" />
                              ) : null}
                            </div>
                          </div>

                          <div className="px-4 pb-4">
                            <p className="text-label-sm font-bold uppercase tracking-widest text-secondary mb-1.5">
                              Post This Answer
                            </p>
                            {pair?.expert_answer ? (
                              <p className="text-body-md text-on-background leading-relaxed">
                                {pair.expert_answer}
                              </p>
                            ) : isLoading ? (
                              <SkeletonBlock lines={[{}, { width: '95%' }, { width: '90%' }, { width: '85%' }, { width: '55%' }]} />
                            ) : null}
                          </div>
                        </div>
                      ))
                    : isLoading
                      ? [0, 1].map((i) => (
                          <div
                            key={i}
                            className="bg-surface-container-low border border-tertiary-fixed rounded-xl p-4 min-h-[220px] space-y-3"
                            aria-hidden="true"
                          >
                            <SkeletonLine width="35%" height="0.8rem" />
                            <div className="rounded-lg p-3 border border-tertiary-fixed bg-surface-container">
                              <SkeletonLine width="85%" height="0.9rem" />
                            </div>
                            <SkeletonBlock lines={[{}, { width: '92%' }, { width: '80%' }, { width: '65%' }]} />
                          </div>
                        ))
                      : null}
                </div>
              </motion.section>

              <SectionDivider />

              {/* ── PILLAR 3: Visual Authority ──────────────────────────── */}
              <motion.section
                variants={fadeSection}
                initial="hidden"
                animate="visible"
                aria-labelledby="visual-pillar-heading"
              >
                <PillarLabel
                  id="visual-pillar-heading"
                  number="03"
                  icon={ImageIcon}
                  label="Visual Authority — Pixii Imagery & Amazon Copy"
                  description="Feed the image prompts into Pixii.ai to generate conversion-optimized product photography. Deploy the Amazon listing immediately."
                />

                {/* Pixii Visual Prompts */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1 h-4 rounded-full bg-brand shrink-0" aria-hidden="true" />
                    <h5 className="text-label-sm font-semibold uppercase tracking-wider text-secondary">
                      Pixii Visual AI Prompts
                    </h5>
                  </div>
                  <div className="mb-4 flex items-center gap-3 bg-brand/5 border border-brand/10 rounded-lg px-4 py-2.5 w-fit">
                    <Zap className="h-4 w-4 text-brand shrink-0" aria-hidden="true" />
                    <p className="text-label-sm text-on-background">
                      Stop bleeding clicks.{" "}
                      <strong className="text-brand cursor-pointer hover:underline">
                        Generate in Pixii Studio →
                      </strong>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {object?.pixii_visual_prompts && object.pixii_visual_prompts.length > 0
                      ? object.pixii_visual_prompts.map((prompt, i) => (
                          <div
                            key={i}
                            className="bg-surface-container-low border border-tertiary-fixed rounded-xl p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <ImageIcon className="h-3.5 w-3.5 text-brand shrink-0" aria-hidden="true" />
                                <span className="text-label-sm font-bold text-brand uppercase tracking-wider">
                                  Concept {String(i + 1).padStart(2, '0')}
                                </span>
                              </div>
                              {prompt && <CopyButton text={prompt} label="Prompt" size="xs" />}
                            </div>
                            {prompt ? (
                              <p className="text-body-md text-on-background leading-snug">{prompt}</p>
                            ) : isLoading ? (
                              <SkeletonBlock lines={[{}, { width: '80%' }]} />
                            ) : null}
                          </div>
                        ))
                      : isLoading
                        ? [0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="bg-surface-container-low border border-tertiary-fixed rounded-xl p-4 h-[96px] animate-pulse"
                              aria-hidden="true"
                            />
                          ))
                        : null}
                  </div>
                </div>

                {/* Amazon Listing */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-4 rounded-full bg-brand shrink-0" aria-hidden="true" />
                      <h5 className="text-label-sm font-semibold uppercase tracking-wider text-secondary">
                        AEO-Optimized Amazon Listing
                      </h5>
                    </div>
                    {object?.amazon_listing?.title && (
                      <CopyButton text={amazonCopyText} label="Listing" />
                    )}
                  </div>

                  <div className="bg-surface-container-low border border-tertiary-fixed rounded-xl divide-y divide-tertiary-fixed">
                    <div className="p-4">
                      <p className="text-label-sm font-semibold uppercase tracking-wider text-secondary mb-1.5">
                        Product Title
                      </p>
                      {object?.amazon_listing?.title ? (
                        <p className="text-body-lg font-semibold text-on-background leading-snug">
                          {object.amazon_listing.title}
                        </p>
                      ) : isLoading ? (
                        <SkeletonLine width="92%" height="1.1rem" />
                      ) : null}
                    </div>

                    <div className="p-4">
                      <p className="text-label-sm font-semibold uppercase tracking-wider text-secondary mb-3">
                        Key Features (Bullets)
                      </p>
                      <ul className="space-y-2.5" aria-label="Amazon listing bullet points">
                        {object?.amazon_listing?.bullets && object.amazon_listing.bullets.length > 0
                          ? object.amazon_listing.bullets.map((bullet, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2.5 text-body-md text-on-background"
                              >
                                <ChevronRight className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
                                <span>{bullet}</span>
                              </li>
                            ))
                          : isLoading
                            ? [0, 1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className="h-4 bg-surface-container-high rounded animate-pulse"
                                  style={{ width: `${65 + (i % 3) * 10}%` }}
                                  aria-hidden="true"
                                />
                              ))
                            : null}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Market Insights CTA */}
              <motion.div
                variants={fadeSection}
                className="pt-6 border-t border-tertiary-fixed flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div>
                  <p className="text-body-md font-semibold text-on-background">
                    Want a deeper look at the competitive landscape?
                  </p>
                  <p className="text-body-sm text-secondary mt-0.5">
                    See category trends, brand share, and AI engine citation patterns across all your diagnostics.
                  </p>
                </div>
                <Link href="/insights" className="shrink-0">
                  <Button
                    variant="outline"
                    className="gap-2 border-brand text-brand hover:bg-brand hover:text-white transition-colors"
                  >
                    <BarChart2 className="h-4 w-4" aria-hidden="true" />
                    View Market Insights
                  </Button>
                </Link>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
