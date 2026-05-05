import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

export function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Fuzzy-matches a brand name against a candidate string using substring
 * containment plus a Levenshtein tolerance of ~25% of the brand length.
 * Shared between the API route and client-side result cards so match logic
 * is always in sync.
 */
export function fuzzyMatch(brand: string, candidate: string): boolean {
  const b = normalize(brand);
  const c = normalize(candidate);
  if (!b) return false;
  if (c === b) return true;
  if (b.length >= 3 && (c.includes(b) || b.includes(c))) return true;
  const threshold = Math.max(1, Math.floor(b.length * 0.25));
  return levenshtein(b, c) <= threshold;
}
