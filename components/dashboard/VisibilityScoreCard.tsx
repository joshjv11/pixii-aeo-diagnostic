"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

const RADIUS        = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong presence across top 3 LLMs.";
  if (score >= 50) return "Moderate presence across top 3 LLMs.";
  if (score > 0)   return "Limited presence across top 3 LLMs.";
  return "No presence detected across top 3 LLMs.";
}

function strokeColor(score: number): string {
  if (score === 0)  return "#ef4444";
  if (score >= 80)  return "#22c55e";
  if (score >= 50)  return "#cf4522";
  return "#f59e0b";
}

type VisibilityScoreCardProps = { score: number };

export default function VisibilityScoreCard({ score }: VisibilityScoreCardProps) {
  const [animatedOffset, setAnimatedOffset] = useState(CIRCUMFERENCE);
  const [displayScore,   setDisplayScore]   = useState(0);
  const prevScore = useRef(0);

  useEffect(() => {
    const from = prevScore.current;
    prevScore.current = score;

    /* Ring fill */
    const toOffset = CIRCUMFERENCE * (1 - score / 100);
    const fromOffset = CIRCUMFERENCE * (1 - from / 100);
    const ringCtrl = animate(fromOffset, toOffset, {
      duration: 1.2,
      ease: "easeOut",
      delay: 0.2,
      onUpdate: setAnimatedOffset,
    });

    /* Counter */
    const countCtrl = animate(from, score, {
      duration: 1.2,
      ease: "easeOut",
      delay: 0.2,
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    });

    return () => { ringCtrl.stop(); countCtrl.stop(); };
  }, [score]);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed p-lg shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center relative overflow-hidden">
      <h3 className="text-label-sm font-semibold text-secondary uppercase tracking-wider mb-6 w-full text-center">
        Aggregate Visibility Score
      </h3>

      <div
        role="img"
        aria-label={`Visibility score: ${score} percent. ${scoreLabel(score)}`}
        className="relative w-32 h-32 flex items-center justify-center mb-2"
      >
        <svg
          aria-hidden="true"
          className="w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#f0f0f0" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke={strokeColor(score)}
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
          />
        </svg>
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-[40px] leading-none text-on-background font-bold tracking-tighter tabular-nums">
            {displayScore}
            <span className="text-h1">%</span>
          </span>
        </div>
      </div>

      <p className="text-body-md text-secondary mt-2 text-center" aria-hidden="true">
        {scoreLabel(score)}
      </p>
    </div>
  );
}
