import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Insights | Pixii AEO",
  description:
    "Visual analytics for long-term AEO tracking — Share of Voice, LLM Bias Matrix, and Semantic Proximity mapping.",
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
