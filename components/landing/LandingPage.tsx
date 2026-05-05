"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Constants ───────────────────────────────────────────────────────────── */

const BRAND = "#cf4522";
const EASE  = [0.25, 0.46, 0.45, 0.94] as const;

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/* ── Logo data ───────────────────────────────────────────────────────────── */

const LOGOS: { id: string; node: React.ReactNode }[] = [
  {
    id: "merkle",
    node: (
      <span className="font-black text-xl tracking-tighter text-gray-800">
        MERKLE<span className="text-blue-600">.</span>
      </span>
    ),
  },
  {
    id: "razor",
    node: (
      <div className="text-blue-700 font-black italic leading-tight text-center">
        RAZOR
        <br />
        <span className="text-[10px] -mt-1 block tracking-widest">GROUP</span>
      </div>
    ),
  },
  {
    id: "huel",
    node: (
      <span className="text-3xl font-black tracking-tighter text-gray-900">
        Huel<sup className="text-sm">®</sup>
      </span>
    ),
  },
  {
    id: "honeywell",
    node: (
      <span className="text-2xl font-extrabold text-[#EE3124]">Honeywell</span>
    ),
  },
  {
    id: "ghirardelli",
    node: (
      <div className="text-center border-t border-b border-blue-900 py-1 px-1">
        <span className="text-[11px] font-serif italic block text-blue-900 tracking-widest">
          GHIRARDELLI
        </span>
        <span className="text-[7px] tracking-[0.25em] text-blue-800 uppercase">
          Chocolate
        </span>
      </div>
    ),
  },
  {
    id: "7eleven",
    node: (
      <span className="font-black italic text-xl">
        <span className="text-green-700">7</span>
        <span className="text-red-600">-ELE</span>
        <span className="text-green-700">VEN</span>
      </span>
    ),
  },
  {
    id: "amazon",
    node: (
      <span className="font-black text-xl text-gray-900 tracking-tight">
        amazon
        <span className="text-[#FF9900] font-black">.</span>
      </span>
    ),
  },
  {
    id: "walmart",
    node: (
      <span className="font-black text-xl text-[#0071CE] tracking-tight">
        Walmart
      </span>
    ),
  },
];

/* ── Sub-components ──────────────────────────────────────────────────────── */

function LandingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed top-0 w-full z-50 bg-[#F9F9F8]/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: BRAND }}
          >
            Pixii.ai
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-gray-900 transition-colors">
            Pricing
          </a>
          <a href="#" className="hover:text-gray-900 transition-colors">
            API &amp; MCP
          </a>
          <a href="#" className="hover:text-gray-900 transition-colors">
            Listing Grader
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Login
          </Link>
          <motion.a
            href="/dashboard"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-md"
            style={{
              backgroundColor: BRAND,
              boxShadow: `0 4px 14px ${BRAND}44`,
            }}
          >
            Book a Demo
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
}

function LogoMarquee() {
  const [paused, setPaused] = useState(false);
  const doubled = [...LOGOS, ...LOGOS];

  return (
    <section className="bg-white py-20 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-center text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] mb-14"
        >
          Top agencies and brands use Pixii to scale their creative
        </motion.h2>

        {/* Marquee wrapper */}
        <div
          className="overflow-hidden relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />

          <div
            className="flex items-center gap-20 w-max animate-marquee"
            style={{ animationPlayState: paused ? "paused" : "running" }}
          >
            {doubled.map((logo, i) => (
              <div
                key={`${logo.id}-${i}`}
                className="h-10 flex items-center shrink-0 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default"
              >
                {logo.node}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [asin, setAsin] = useState("");
  const router = useRouter();

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      asin.trim() ? `/dashboard?asin=${encodeURIComponent(asin.trim())}` : "/dashboard"
    );
  };

  return (
    <div className="font-sans text-[#1A1A1A] antialiased">
      <LandingNav />

      {/* ── Hero ── */}
      <main
        className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center"
        style={{
          backgroundColor: "#F9F9F8",
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      >
        <motion.div
          className="max-w-4xl w-full text-center"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="flex justify-center mb-8">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border"
              style={{
                color: BRAND,
                borderColor: `${BRAND}44`,
                backgroundColor: `${BRAND}0d`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: BRAND }}
              />
              Now in Beta · Free Trial Available
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6"
          >
            AI Engine Optimization{" "}
            <span style={{ color: BRAND }}>(AEO). Instantly.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-[#666666] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Diagnose your brand&apos;s visibility across the latent space of top
            LLMs. Drop your ASIN. Get the strategy that sells.
          </motion.p>

          {/* Input pill */}
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto w-full mb-5">
            <form
              onSubmit={handleRun}
              className="bg-white p-2 rounded-2xl border border-gray-200 flex items-center gap-2"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
            >
              {/* Country selector */}
              <div className="flex items-center gap-2 pl-3 pr-3 border-r border-gray-100 shrink-0">
                <span className="text-xl" aria-hidden="true">🇺🇸</span>
                <span className="text-sm font-medium text-gray-500 hidden sm:block">US</span>
                <svg
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>

              {/* Text input */}
              <input
                type="text"
                value={asin}
                onChange={(e) => setAsin(e.target.value)}
                placeholder="Enter Amazon ASIN or brand name"
                className="flex-1 border-none outline-none bg-transparent text-base placeholder-gray-400 font-medium text-gray-800 min-w-0 px-2"
                aria-label="Amazon ASIN or brand name"
              />

              {/* CTA button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="shrink-0 px-7 py-3 rounded-xl font-bold text-sm text-white"
                style={{
                  backgroundColor: BRAND,
                  boxShadow: `0 4px 16px ${BRAND}50`,
                }}
              >
                Run Diagnostic
              </motion.button>
            </form>

            {/* Trust indicators */}
            <div className="mt-5 flex items-center justify-center gap-6 text-sm text-gray-400">
              {["Free trial", "No credit card", "Results in 2 minutes"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <svg
                      aria-hidden="true"
                      className="w-3.5 h-3.5 text-green-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                      />
                    </svg>
                    {item}
                  </span>
                )
              )}
            </div>
          </motion.div>

          {/* Sub CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full sm:w-auto px-12 py-4 rounded-xl font-bold text-white text-base"
              style={{
                backgroundColor: BRAND,
                boxShadow: `0 6px 24px ${BRAND}44`,
              }}
            >
              Get Started
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.02, borderColor: "#9ca3af" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full sm:w-auto px-12 py-4 border-2 border-gray-200 rounded-xl font-bold text-[#666666] text-base hover:border-gray-400 transition-colors"
            >
              Book a Demo
            </motion.a>
          </motion.div>
        </motion.div>
      </main>

      {/* ── Social proof / marquee ── */}
      <LogoMarquee />

      {/* ── Chat widget ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.4, ease: EASE }}
        className="fixed bottom-8 right-8 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          aria-label="Open support chat"
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
          style={{ backgroundColor: "#3E4E5A" }}
        >
          <svg
            aria-hidden="true"
            className="w-7 h-7 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z" />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
}
