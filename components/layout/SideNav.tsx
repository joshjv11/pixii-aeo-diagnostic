"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useSidebarStore } from "@/store/useSidebarStore";

const NAV_LINKS = [
  { icon: "dashboard",    label: "Dashboard",       href: "/dashboard" },
  { icon: "query_stats",  label: "Market Insights", href: "/insights" },
  { icon: "settings",     label: "Settings",        href: "/settings" },
];

function scoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  if (score > 0)   return "bg-orange-500";
  return "bg-red-500";
}

function scoreBadgeStyle(score: number): string {
  if (score >= 80) return "text-green-700 bg-green-50";
  if (score >= 50) return "text-yellow-700 bg-yellow-50";
  if (score > 0)   return "text-orange-700 bg-orange-50";
  return "text-red-700 bg-red-50";
}

export default function SideNav() {
  const pathname = usePathname();
  const history = useHistoryStore((s) => s.history);
  const { isCollapsed, toggleCollapsed, selectItem } = useSidebarStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Transition helpers — text/content fades out quickly, width slides smoothly
  const labelStyle = {
    opacity: isCollapsed ? 0 : 1,
    maxWidth: isCollapsed ? 0 : 200,
    overflow: "hidden" as const,
    whiteSpace: "nowrap" as const,
    transition: "opacity 0.18s, max-width 0.28s cubic-bezier(0.4,0,0.2,1)",
  };

  return (
    <nav
      aria-label="Main navigation"
      className="h-full flex flex-col border-r border-tertiary-fixed bg-[#F8F9FA] overflow-hidden"
    >
      {/* ── Brand ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-3 pt-5 pb-4 flex items-center gap-3">
        <div
          aria-hidden="true"
          className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-sm shrink-0"
        >
          <span
            className="material-symbols-outlined text-white text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>
        <div style={labelStyle}>
          <p className="text-h2 font-semibold text-on-background m-0 p-0 leading-tight">
            Pixii <span className="text-brand">AEO</span>
          </p>
          <p className="text-label-sm text-secondary m-0 p-0">AI Engine Optimization</p>
        </div>
      </div>

      {/* ── New Diagnostic CTA ──────────────────────────────────────────── */}
      <div className="px-3 pb-5 shrink-0">
        <Link
          href="/dashboard"
          className="w-full bg-brand hover:bg-brand-hover text-white text-label-md font-medium py-2.5 px-3 rounded-xl flex items-center gap-2 transition-colors duration-200"
          title={isCollapsed ? "New Diagnostic" : undefined}
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[18px] shrink-0"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            add
          </span>
          <span style={labelStyle}>New Diagnostic</span>
        </Link>
      </div>

      {/* ── Main nav links ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5" role="list">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  title={isCollapsed ? link.label : undefined}
                  className={
                    active
                      ? "flex items-center gap-3 px-2.5 py-2.5 rounded-lg bg-white text-on-background border-l-4 border-brand shadow-sm"
                      : "flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-secondary hover:bg-white hover:text-on-background transition-colors duration-200"
                  }
                >
                  <span
                    aria-hidden="true"
                    className={`material-symbols-outlined text-[20px] shrink-0 ${active ? "text-brand" : "text-secondary"}`}
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    {link.icon}
                  </span>
                  <span style={labelStyle} className="text-label-md font-medium">
                    {link.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── Recent Diagnostics ──────────────────────────────────────────── */}
        <div className="mt-6">
          {/* Header fades out when collapsed */}
          <div style={labelStyle}>
            <h2 className="text-label-sm font-semibold text-secondary uppercase tracking-wider px-2 mb-2">
              Recent Diagnostics
            </h2>
          </div>

          <ul className="space-y-0.5" role="list">
            {!mounted ? null : history.length === 0 ? (
              !isCollapsed && (
                <li className="px-2 py-2 text-label-sm text-tertiary-container italic">
                  No recent scans.
                </li>
              )
            ) : (
              history.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-label={`View diagnostic for ${item.brandName}, score ${item.score}%`}
                    title={isCollapsed ? `${item.brandName} — ${item.score}%` : undefined}
                    onClick={() => selectItem(item)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-secondary hover:bg-white hover:text-on-background transition-colors duration-200 group"
                  >
                    <span
                      aria-hidden="true"
                      className={`w-2 h-2 rounded-full shrink-0 ${scoreColor(item.score)}`}
                    />
                    <span
                      style={labelStyle}
                      className="text-body-md truncate flex-1 text-left"
                    >
                      {item.brandName}
                    </span>
                    <span
                      style={labelStyle}
                      className={`text-label-sm font-semibold px-1.5 py-0.5 rounded ${scoreBadgeStyle(item.score)}`}
                    >
                      {item.score}%
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* ── Collapse toggle ──────────────────────────────────────────────── */}
      <div className="shrink-0 px-3 py-3 border-t border-tertiary-fixed">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-secondary hover:bg-white hover:text-on-background transition-colors duration-200"
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[20px] shrink-0 transition-transform duration-300"
            style={{
              fontVariationSettings: "'FILL' 0",
              transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
            }}
          >
            chevron_left
          </span>
          <span style={labelStyle} className="text-label-md font-medium">
            Collapse
          </span>
        </button>
      </div>

      {/* ── User footer ─────────────────────────────────────────────────── */}
      <div className="shrink-0 px-3 pb-5">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-secondary hover:bg-white hover:text-on-background transition-colors duration-200"
          aria-label="Account menu"
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[20px] shrink-0"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            account_circle
          </span>
          <span style={labelStyle} className="text-label-md font-medium flex-1 text-left truncate">
            Team Account
          </span>
          <span
            aria-hidden="true"
            style={labelStyle}
            className="material-symbols-outlined text-[16px] shrink-0"
          >
            expand_more
          </span>
        </button>
      </div>
    </nav>
  );
}
