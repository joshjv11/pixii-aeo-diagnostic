import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EngineResult = {
  found: boolean;
  success: boolean;
  list: string[];
};

export type HistoryItem = {
  id: string;
  brandName: string;
  query: string;
  score: number;
  timestamp: number;
  // Optional so old localStorage entries remain compatible.
  // Keyed by whatever engine keys the API returns (gemini, versatile, instant, etc.)
  engines?: Record<string, EngineResult>;
};

// id is optional on input — if the API returned a DB-generated UUID we use
// that so the local record stays in sync with Supabase. Falls back to a
// client-side UUID when the DB write failed or is unavailable.
type AddDiagnosticInput = Omit<HistoryItem, "id" | "timestamp"> & { id?: string | null };

interface HistoryState {
  history: HistoryItem[];
  addDiagnostic: (item: AddDiagnosticInput) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      addDiagnostic: (item) =>
        set((state) => ({
          history: [
            {
              ...item,
              id: item.id ?? crypto.randomUUID(),
              timestamp: Date.now(),
            },
            ...state.history,
          ].slice(0, 50),
        })),
      removeHistoryItem: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "aeo-diagnostic-history",
    }
  )
);
