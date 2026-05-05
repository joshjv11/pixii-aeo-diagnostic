import { NextResponse } from 'next/server';
import { generateText, type LanguageModel } from 'ai';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { fuzzyMatch } from '@/lib/utils';
import { createAdminClient } from '@/utils/supabase/admin';

const isDev = process.env.NODE_ENV === 'development';
const log = isDev ? console.log.bind(console) : () => {};
const logError = isDev ? console.error.bind(console) : () => {};

export const runtime = 'edge';
export const maxDuration = 60;

const MAX_INPUT_LENGTH = 200;

type EngineResult = { success: boolean; found: boolean; list: string[] };

async function fetchRecommendations(
  modelId: string,
  model: LanguageModel,
  query: string,
  fallback?: { modelId: string; model: LanguageModel },
) {
  const start = Date.now();
  log(`[AEO] ▶ Calling ${modelId}`);
  try {
    const { text } = await generateText({
      model,
      prompt: `You are an advanced, unbiased AI product search engine with global market awareness.
A user searches: "${query}".
Analyze both global and regional markets. Do not default to legacy Western brands only — consider high-growth, D2C, and niche brands that strongly match the query intent.
Return ONLY a valid JSON array of exactly 5 brand names, like this:
["Brand1", "Brand2", "Brand3", "Brand4", "Brand5"]
No explanation. No markdown. Just the raw JSON array.`,
    });

    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error(`No JSON array in response: ${text.slice(0, 120)}`);

    const parsed: unknown = JSON.parse(match[0]);
    if (
      !Array.isArray(parsed) ||
      !parsed.every((item) => typeof item === 'string')
    ) {
      throw new Error(`Response was not a string array: ${match[0].slice(0, 120)}`);
    }

    const recommendations = parsed as string[];
    const ms = Date.now() - start;
    log(`[AEO] ✅ ${modelId} OK in ${ms}ms →`, recommendations);
    return { success: true, data: recommendations };
  } catch (error: unknown) {
    const ms = Date.now() - start;
    const msg = error instanceof Error ? error.message : String(error);
    const status =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error as { statusCode: number }).statusCode
        : 'unknown';
    logError(`[AEO] ❌ ${modelId} FAILED in ${ms}ms — HTTP ${status}: ${msg}`);

    if (fallback) {
      log(`[AEO] ↩ Falling back to ${fallback.modelId} for engine slot "${modelId}"`);
      return fetchRecommendations(fallback.modelId, fallback.model, query);
    }

    return { success: false, data: [] as string[] };
  }
}

function getRankPosition(brand: string, list: string[]): number | null {
  const idx = list.findIndex((b) => fuzzyMatch(brand, b));
  return idx >= 0 ? idx + 1 : null;
}

async function persistToSupabase(
  trimmedBrand: string,
  trimmedQuery: string,
  overallScore: number,
  engines: Record<string, EngineResult>,
): Promise<string | null> {
  try {
    const db = createAdminClient();

    const anyFound = Object.values(engines).some((e) => e.found);

    // 1. Insert the top-level diagnostic row
    const { data: diagnostic, error: diagError } = await db
      .from('diagnostics')
      .insert({
        brand_name: trimmedBrand,
        query: trimmedQuery,
        score: overallScore,
        engines,
        sentiment: anyFound ? 'positive' : 'absent',
        source: 'manual',
      })
      .select('id')
      .single();

    if (diagError || !diagnostic) {
      throw new Error(diagError?.message ?? 'No diagnostic row returned');
    }

    const diagnosticId: string = diagnostic.id;

    // 2. Insert one engine_results row per engine
    const engineInserts = Object.entries(engines).map(([engine_key, data]) => ({
      diagnostic_id: diagnosticId,
      engine_key,
      success: data.success,
      found: data.found,
      rank_position: data.found ? getRankPosition(trimmedBrand, data.list) : null,
      recommendations: data.list,
    }));

    const { data: engineRows, error: engineError } = await db
      .from('engine_results')
      .insert(engineInserts)
      .select('id, engine_key');

    if (engineError) throw new Error(engineError.message);

    // 3. Insert competitor_mentions — one row per non-brand entry per engine
    const competitorRows = (engineRows ?? []).flatMap((row) => {
      const engineData = engines[row.engine_key];
      if (!engineData?.success || engineData.list.length === 0) return [];

      return engineData.list
        .map((name, i) => ({ name, rank_position: i + 1 }))
        .filter(({ name }) => !fuzzyMatch(trimmedBrand, name))
        .map(({ name, rank_position }) => ({
          diagnostic_id: diagnosticId,
          engine_result_id: row.id,
          competitor_name: name,
          rank_position,
          was_instead_of_brand: !engineData.found,
        }));
    });

    if (competitorRows.length > 0) {
      const { error: compError } = await db
        .from('competitor_mentions')
        .insert(competitorRows);
      if (compError) throw new Error(compError.message);
    }

    log(`[AEO] 💾 Persisted diagnostic ${diagnosticId} (${competitorRows.length} competitor rows)`);
    return diagnosticId;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`[AEO] ⚠️ Supabase write failed (non-fatal): ${msg}`);
    return null;
  }
}

export async function POST(req: Request) {
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

  if (typeof body !== 'object' || body === null || !('brandName' in body) || !('query' in body)) {
    return NextResponse.json({ error: 'Missing brandName or query' }, { status: 400 });
  }

  const { brandName, query } = body as Record<string, unknown>;

  if (typeof brandName !== 'string' || typeof query !== 'string') {
    return NextResponse.json({ error: 'brandName and query must be strings' }, { status: 400 });
  }

  const trimmedBrand = brandName.trim();
  const trimmedQuery = query.trim();

  if (!trimmedBrand || !trimmedQuery) {
    return NextResponse.json({ error: 'brandName and query must not be empty' }, { status: 400 });
  }

  if (trimmedBrand.length > MAX_INPUT_LENGTH || trimmedQuery.length > MAX_INPUT_LENGTH) {
    return NextResponse.json(
      { error: `Inputs must be ${MAX_INPUT_LENGTH} characters or fewer` },
      { status: 400 },
    );
  }

  log(`\n[AEO] ═══ New diagnostic — brand: "${trimmedBrand}" | query: "${trimmedQuery}" ═══`);

  // Engine 1: Llama 4 Scout via Groq — current production model, Gemini 2.5 Flash as last-resort fallback
  // Engines 2 & 3: Groq Llama — always reliable, sub-300ms
  const [llama4Results, versatileResults, instantResults] = await Promise.all([
    fetchRecommendations('meta-llama/llama-4-scout-17b-16e-instruct', groq('meta-llama/llama-4-scout-17b-16e-instruct'), trimmedQuery, {
      modelId: 'gemini-2.5-flash',
      model: google('gemini-2.5-flash'),
    }),
    fetchRecommendations('llama-3.3-70b-versatile', groq('llama-3.3-70b-versatile'), trimmedQuery),
    fetchRecommendations('llama-3.1-8b-instant', groq('llama-3.1-8b-instant'), trimmedQuery),
  ]);

  const checkVisibility = (results: { success: boolean; data: string[] }) => {
    if (results.data.length === 0) return { found: false, list: [] as string[] };
    const found = results.data.some((b) => fuzzyMatch(trimmedBrand, b));
    return { found, list: results.data };
  };

  const llama4    = checkVisibility(llama4Results);
  const versatile = checkVisibility(versatileResults);
  const instant   = checkVisibility(instantResults);

  let scoreCount = 0;
  if (llama4.found)    scoreCount++;
  if (versatile.found) scoreCount++;
  if (instant.found)   scoreCount++;

  const overallScore = Math.floor((scoreCount / 3) * 100);

  log(`[AEO] ── Match results for "${trimmedBrand}" ──`);
  log(`  llama-4-scout-17b       : ${llama4.found    ? '✅ FOUND' : '❌ not found'} — [${llama4.list.join(', ')}]`);
  log(`  llama-3.3-70b-versatile : ${versatile.found ? '✅ FOUND' : '❌ not found'} — [${versatile.list.join(', ')}]`);
  log(`  llama-3.1-8b-instant    : ${instant.found   ? '✅ FOUND' : '❌ not found'} — [${instant.list.join(', ')}]`);
  log(`[AEO] ── Score: ${overallScore}% (${scoreCount}/3 engines) ──\n`);

  const engines: Record<string, EngineResult> = {
    gemini:    { success: llama4Results.success,    ...llama4 },
    versatile: { success: versatileResults.success, ...versatile },
    instant:   { success: instantResults.success,   ...instant },
  };

  // Persist to Supabase — failure is non-fatal; client still gets results
  const diagnosticId = await persistToSupabase(trimmedBrand, trimmedQuery, overallScore, engines);

  return NextResponse.json({ diagnosticId, score: overallScore, engines });
}
