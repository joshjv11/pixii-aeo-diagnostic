"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import SideNav from "./SideNav";
import TopNav from "./TopNav";
import DiagnosticDrawer from "./DiagnosticDrawer";

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 72;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
  // On mobile the sidebar slides in as an overlay — content stays at full width
  const contentOffset = isDesktop ? sidebarWidth : 0;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container — handles mobile slide-in + desktop collapse width */}
      <div
        className={[
          "fixed top-0 left-0 z-50 h-screen",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{
          width: sidebarWidth,
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.3s ease-in-out",
        }}
      >
        <SideNav />
      </div>

      {/* Diagnostic history detail drawer */}
      <DiagnosticDrawer />

      {/* Main content — shifts right to match sidebar width on desktop */}
      <div
        className="flex flex-col flex-1 min-h-screen"
        style={{
          marginLeft: contentOffset,
          transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <TopNav
          onMenuToggle={() => setMobileOpen((prev) => !prev)}
          sidebarWidth={contentOffset}
        />
        <main className="flex-1 mt-16 px-4 pt-8 pb-8 md:px-8 md:pt-12 lg:px-12 lg:pb-12 overflow-y-auto bg-slate-50 min-h-screen">
          {children}
        </main>
      </div>
    </>
  );
}
