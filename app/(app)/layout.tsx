"use client";

import { useSidebarStore } from "@/store/useSidebarStore";
import SideNav from "@/components/layout/SideNav";
import TopNav from "@/components/layout/TopNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, toggleCollapsed } = useSidebarStore();
  const sidebarWidth = isCollapsed ? 64 : 260;

  return (
    <div className="bg-background text-on-background flex h-screen overflow-hidden">
      {/* Sidebar — width controlled by store to match SideNav's internal transition */}
      <div
        className="shrink-0 h-full"
        style={{
          width: sidebarWidth,
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <SideNav />
      </div>

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
        <TopNav onMenuToggle={toggleCollapsed} sidebarWidth={sidebarWidth} />
        <main className="flex-1 overflow-y-auto px-8 pt-12 pb-8 lg:px-12 lg:pt-16 lg:pb-12 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
