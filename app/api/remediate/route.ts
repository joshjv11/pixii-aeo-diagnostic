import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { remediationSchema } from '@/lib/schemas/remediation';
import { remediateRatelimit, checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';
export const maxDuration = 90;

const MAX_INPUT_LENGTH = 200;

// streamObject REQUIRES a model that supports streaming + structured JSON outputs simultaneously.
// Groq blocks this at the infrastructure level (all models). Gemini is the only viable provider.
// We cascade through multiple Gemini variants with maxRetries:1 per model for fast failover —
// if one endpoint is overloaded, we move to the next within seconds rather than waiting 3×retry.
const MODEL_CASCADE = [
  google('gemini-2.5-flash'),
  google('gemini-2.0-flash'),
  google('gemini-2.0-flash-lite'),
  google('gemini-1.5-flash'),
  google('gemini-1.5-flash-8b'),
];

function sanitize(value: string): string {
  return value.trim().replace(/["""''`]/g, "'").slice(0, MAX_INPUT_LENGTH);
}

function buildPrompt(safeBrand: string, safeQuery: string, topCompetitors: string): string {
  return `You are a ruthless Chief Marketing Officer and AI Engine Optimization (AEO) strategist. Your mission: build "${safeBrand}" a complete Echo Chamber Strategy — a multi-channel attack plan to flood the information ecosystem with the exact signals that AI models (ChatGPT, Perplexity, Gemini, Claude) use to recommend products.

The AI landscape shows ${topCompetitors} outranking "${safeBrand}" for "${safeQuery}". This costs "${safeBrand}" real revenue every day. Your job is to help them hijack the AI search ecosystem.

Generate all four components of the Echo Chamber Strategy:

---

**vulnerability_analysis**: Write 2-3 paragraphs exposing WHY ${topCompetitors} are winning the AI ranking battle for "${safeQuery}". Be forensically specific — name the exact semantic clusters, clinical/technical vocabulary, social proof patterns, and content formats their brand signals exploit across YouTube transcripts, Reddit threads, review aggregators, and structured data. Identify the exact 3-4 semantic gaps "${safeBrand}" must close immediately. Be harsh and specific.

---

**ugc_video_scripts**: Generate exactly 2 viral UGC (User Generated Content) video scripts for TikTok/YouTube Shorts for "${safeBrand}". Each must:
- Have a hook: a punchy, scroll-stopping opening line (under 15 words) that creates urgency or curiosity
- Have a script: a complete 30-second (~75-90 words) script written as a natural, authentic-sounding user review — NOT corporate marketing copy. The script must organically embed the exact semantic keywords that ${topCompetitors} are winning on for "${safeQuery}". It must sound like a real person discovered this product. End with a natural call to action.
These scripts become the training data that future AI models index from YouTube/TikTok transcripts.

---

**reddit_seeding_strategy**: Generate exactly 2 Reddit/Quora seeding pairs for "${safeQuery}". Each pair must:
- Have a question_to_ask: a realistic, conversational question a genuine user would post (not promotional, sounds completely organic, references a real pain point in the "${safeQuery}" category)
- Have an expert_answer: a 150-200 word detailed, helpful answer written in authentic Reddit voice. It should start by addressing the question seriously, include specific product comparisons showing why "${safeBrand}" is superior, mention real technical details, and naturally drop the brand name 2-3 times. No marketing language — sound like a knowledgeable community member who has genuinely used the product. These get posted to Reddit/Quora where Perplexity and ChatGPT scrape for real-time recommendations.

---

**pixii_visual_prompts**: Generate exactly 3 high-impact Pixii.ai image generation prompts for "${safeBrand}" product photography that beats ${topCompetitors} on Amazon conversion. Each prompt must be specific, production-ready, and optimized for e-commerce. Format: "Professional product photography of [specific subject and product detail], [specific lighting setup], [background and setting], [mood and tone], [technical quality specs], hero image optimized for Amazon search."

---

**amazon_listing**: Write a complete AEO-optimized Amazon listing:
- title: Under 200 characters, front-loaded with the highest-value semantic keywords that AI engines use when recommending products in the "${safeQuery}" category. Include key specifications, primary benefit, and brand name.
- bullets: Exactly 5 bullet points. Each starts with a POWER KEYWORD IN ALL CAPS (2-4 words), followed by a specific benefit statement that directly maps to what AI engines cite when recommending this product category. Avoid vague claims — use numbers, clinical terms, and specific mechanisms where applicable.

Be ruthlessly specific throughout. Every word must be weaponized for semantic search. No filler.`;
}

export async function POST(req: Request) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    const { limited, reset } = await checkRateLimit(remediateRatelimit, `remediate:${ip}`);
    if (limited) {
      const retryAfter = reset ? Math.ceil((reset - Date.now()) / 1000) : 60;
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded. Please wait ${retryAfter}s before generating another strategy.` }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) } },
      );
    }

    // ── Input validation ───────────────────────────────────────────────────
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof body !== 'object' || body === null) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { brandName, query, competitors } = body as Record<string, unknown>;

    if (typeof brandName !== 'string' || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'brandName and query must be strings' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const safeBrand = sanitize(brandName);
    const safeQuery = sanitize(query);

    if (!safeBrand || !safeQuery) {
      return new Response(JSON.stringify({ error: 'brandName and query must not be empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (safeBrand.length > MAX_INPUT_LENGTH || safeQuery.length > MAX_INPUT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Inputs must be ${MAX_INPUT_LENGTH} characters or fewer` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const competitorList = Array.isArray(competitors)
      ? competitors
          .filter((c): c is string => typeof c === 'string')
          .map((c) => sanitize(c))
          .filter(Boolean)
          .slice(0, 5)
      : [];

    const topCompetitors =
      competitorList.length > 0 ? competitorList.join(', ') : 'top market competitors';

    const prompt = buildPrompt(safeBrand, safeQuery, topCompetitors);
    const sharedOptions = { schema: remediationSchema, prompt } as const;

    // NOTE: streamObject errors that occur MID-STREAM (after the 200 is sent) cannot
    // be caught here; the client's silentlyFailed detection handles those gracefully.
    // Pre-stream errors (503 overloaded, auth failures) ARE catchable — we use maxRetries:1
    // per model so we fail fast and move to the next variant instead of hammering one endpoint.
    for (const model of MODEL_CASCADE) {
      try {
        const result = streamObject({ model, maxOutputTokens: 8192, maxRetries: 1, ...sharedOptions });
        return result.toTextStreamResponse();
      } catch (err) {
        console.warn(`[AEO] Model ${String(model)} failed, cascading...`, err);
        continue;
      }
    }

    return new Response(
      JSON.stringify({
        error: 'High Traffic Alert: All AI models are currently at capacity. Please wait 30 seconds and try again.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[AEO] Fatal Remediation Error:', error);
    return new Response(
      JSON.stringify({
        error: 'An internal server error occurred while building your strategy. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
