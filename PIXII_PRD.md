# Product Requirements Document (PRD): AEO Diagnostic Tool
**Prepared by:** Joshua Vaz (Applicant: Founding Engineer)
**Target:** Pixii.ai Engineering Assessment

## 1. Executive Summary
As search shifts from traditional SEO (Google) to LLM-driven answers (ChatGPT, Claude, Gemini), consumer brands face a critical threat: becoming invisible in the latent space. 
The AEO (AI Engine Optimization) Diagnostic tool provides immediate, actionable business intelligence for brand owners. It queries the top 3 foundational models concurrently to provide a definitive "Visibility Score" against competitors.

## 2. Strategic Alignment (The "Why")
*   **Pixii's Objective:** To find a high-velocity, 0-to-1 operator who can build systems independently, understand the end-user's pain points, and scale an army of AI agents.
*   **My Objective:** To prove my capability as an AI Systems Architect capable of parallel API orchestration, deterministic schema enforcement, and rapid UI deployment, thereby securing the Founding Engineer role.

## 3. The User Persona
**The User:** E-commerce Brand Owner / Marketing Director.
**The Problem:** They are spending $10k/month on Google Ads, but don't know if ChatGPT recommends their product when a user asks for it.
**The "Aha!" Moment:** Seeing their brand absent from Gemini and Claude, immediately highlighting a massive market vulnerability.

## 4. Current Architecture (V1 MVP)
Built and deployed in under 6 hours to demonstrate execution velocity.
*   **Frontend:** Next.js (App Router), Tailwind CSS (v4), Shadcn UI.
*   **Backend:** Vercel Edge Functions (API Routes).
*   **AI Orchestration:** Vercel AI SDK mapping to `gpt-4o-mini`, `claude-3-haiku`, and `gemini-1.5-flash` for high-speed, cost-efficient inference.
*   **Data Enforcement:** `Zod` schemas enforce strict JSON array returns, preventing LLM formatting hallucinations and ensuring safe frontend rendering.
*   **Scoring Logic:** Custom fuzzy-matching algorithm to calculate a cross-engine visibility percentage.

## 5. The "Perfect Product" Roadmap (V2 Vision)
If given the runway to scale this into a fully monetizable feature within the Pixii ecosystem, the architecture would evolve into the following:
1.  **The Remediation Agent:** Instead of just diagnosing the problem, the app dispatches an agent to scrape the user's landing page, compare it against the semantic gaps missing in the LLM's training data, and automatically generate optimized copy.
2.  **Historical Tracking (Cron Jobs):** Integrate Supabase (PostgreSQL) and trigger nightly cron jobs to track brand visibility over time. 
3.  **Competitor Matrix:** Allow the user to input 3 competitor URLs. The agent maps the "Share of Voice" across all major LLMs, providing a definitive market-share report.
4.  **Asynchronous Webhooks:** For large-scale batch reporting, transition the Edge function to a background job queue (e.g., Inngest or Upstash) to prevent browser timeouts on massive queries.

## 6. Conclusion
This MVP demonstrates the core mechanic of AI Engine Optimization. It was built with a bias for action, prioritizing user value, deterministic fallback logic, and clean UI/UX over unnecessary complexity.
