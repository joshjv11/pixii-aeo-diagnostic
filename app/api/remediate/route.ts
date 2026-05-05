import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { remediationSchema } from '@/lib/schemas/remediation';
import { remediateRatelimit, checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';
export const maxDuration = 90;

const MAX_INPUT_LENGTH = 200;

// generateObject is used instead of streamObject for one critical reason:
// streamObject commits an HTTP 200 before it knows if the model will succeed.
// Once that header is sent there is no way to fall back — the client receives
// a completed stream with no data and shows "returned no data". generateObject
// awaits the full validated response before any HTTP response is written, so
// the cascade below actually works: if a model throws at ANY point (auth error,
// capacity, malformed output, schema validation failure) we catch it, move to
// the next model, and only send a response once we have a guaranteed valid object.
const MODEL_CASCADE = [
  google('gemini-2.0-flash'),        // GA, fastest, most reliable for structured output
  google('gemini-2.0-flash-lite'),   // Lighter quota, good fallback
  google('gemini-1.5-flash'),        // Battle-tested GA model
  google('gemini-2.5-flash'),        // Experimental — lower quota, used last
  google('gemini-1.5-flash-8b'),     // Last resort: smallest, most available
];

function sanitize(value: string): string {
  return value.trim().replace(/["""''`]/g, "'").slice(0, MAX_INPUT_LENGTH);
}

function buildPrompt(safeBrand: string, safeQuery: string, topCompetitors: string): string {
  return `You are a ruthless Chief Marketing Officer and AI Engine Optimization (AEO) strategist. Your mission: build "${safeBrand}" a defensive Echo Chamber Strategy to stop competitors from stealing their revenue.

The AI landscape shows ${topCompetitors} actively siphoning recommended sales away from "${safeBrand}" for the query "${safeQuery}". Every day "${safeBrand}" remains unlisted in AI latent space, they are bleeding market share. Your job is to help them stop the bleed and hijack the AI search ecosystem.

Generate all four components of the strategy:

---

**vulnerability_analysis**: Write 2-3 paragraphs exposing exactly how ${topCompetitors} are exploiting semantic gaps to steal "${safeBrand}"'s customers for "${safeQuery}". Use loss-averse language (e.g., "bleeding traffic," "captured by competitors"). Name the specific gaps "${safeBrand}" must close immediately to stop losing sales. Be harsh, analytical, and specific.

---

**ugc_video_scripts**: Generate exactly 2 viral UGC video scripts. Each must:
- Have a hook: a punchy, scroll-stopping opening line (under 15 words).
- Have a script: a 30-second authentic user review that organically embeds the exact semantic keywords competitors are winning on.
(Subtly mention in the output that these hooks can be dropped into Pixii's UGC generator for instant deployment before competitors adapt).

---

**reddit_seeding_strategy**: Generate exactly 2 Reddit/Quora seeding pairs. Each pair must:
- Have a question_to_ask: a realistic, organic question about a pain point in the "${safeQuery}" category.
- Have an expert_answer: a 150-200 word authentic answer positioning "${safeBrand}" as the superior choice, dropping the brand name 2-3 times naturally to feed Perplexity and ChatGPT scrapers.

---

**pixii_visual_prompts**: Generate exactly 3 high-impact Pixii.ai image generation prompts to replace their current weak Amazon imagery. Each prompt must be specific, production-ready, and optimized to claw back conversion rates. Format: "Professional product photography of [subject], [lighting], [setting], [mood], hero image optimized for Amazon search."

---

**amazon_listing**: Write a complete AEO-optimized Amazon listing:
- title: Under 200 characters, front-loaded with high-value semantic keywords to reclaim AI search visibility.
- bullets: Exactly 5 bullet points. Each starts with a POWER KEYWORD IN ALL CAPS, followed by a specific benefit statement that maps directly to what AI engines cite.

Be ruthlessly specific. Every word must be weaponized to stop the brand's loss of market share. No filler.`;
}

export async function POST(req: Request) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    const { limited, reset } = await checkRateLimit(remediateRatelimit, `remediate:${ip}`);
    if (limited) {
      const retryAfter = reset ? Math.ceil((reset - Date.now()) / 1000) : 60;
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${retryAfter}s before generating another strategy.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      );
    }

    // ── Input validation ───────────────────────────────────────────────────
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { brandName, query, competitors } = body as Record<string, unknown>;

    if (typeof brandName !== 'string' || typeof query !== 'string') {
      return NextResponse.json({ error: 'brandName and query must be strings' }, { status: 400 });
    }

    const safeBrand = sanitize(brandName);
    const safeQuery = sanitize(query);

    if (!safeBrand || !safeQuery) {
      return NextResponse.json({ error: 'brandName and query must not be empty' }, { status: 400 });
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

    // ── Model cascade — every error is caught before any HTTP response is written ──
    const errors: string[] = [];

    for (const model of MODEL_CASCADE) {
      try {
        const { object } = await generateObject({
          model,
          schema: remediationSchema,
          prompt,
          maxRetries: 1,
        });
        // Only reached if the model succeeded AND the object passed schema validation
        return NextResponse.json(object);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[AEO] Remediate model failed, cascading — ${msg}`);
        errors.push(msg);
        continue;
      }
    }

    // All models exhausted
    console.error('[AEO] All remediate models failed:', errors);
    return NextResponse.json(
      { error: 'All AI models are currently at capacity. Please wait 30 seconds and try again.' },
      { status: 503 },
    );
  } catch (error) {
    console.error('[AEO] Fatal Remediation Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
