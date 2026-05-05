"use client";

import { motion } from "framer-motion";

type MetricCardProps = {
  icon: string;
  title: string;
  value: string;
  description: string;
};

export default function MetricCard({ icon, title, value, description }: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed p-lg shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.07)] transition-shadow duration-200 flex flex-col justify-between cursor-default"
    >
      <div className="flex items-center gap-3 text-secondary mb-4">
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          {icon}
        </span>
        <h4 className="text-label-sm font-semibold uppercase tracking-wider">{title}</h4>
      </div>
      <div>
        <div className="text-h1 font-bold text-on-background mb-1">{value}</div>
        <p className="text-body-md text-secondary">{description}</p>
      </div>
    </motion.div>
  );
}
