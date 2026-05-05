import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HistoryItem } from "./useHistoryStore";

interface SidebarState {
  isCollapsed: boolean;
  selectedItem: HistoryItem | null;
  toggleCollapsed: () => void;
  setCollapsed: (v: boolean) => void;
  selectItem: (item: HistoryItem | null) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      selectedItem: null,
      toggleCollapsed: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      setCollapsed: (v) => set({ isCollapsed: v }),
      selectItem: (item) => set({ selectedItem: item }),
    }),
    {
      name: "aeo-sidebar-state",
      // Only persist the collapse preference, not the ephemeral selection
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);
