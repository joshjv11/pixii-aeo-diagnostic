import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Pixii.ai | AI Engine Optimization (AEO). Instantly.",
  description:
    "Diagnose your brand's visibility across the latent space of top LLMs. Drop your ASIN. Get the strategy that sells.",
};

export default function Page() {
  return <LandingPage />;
}
