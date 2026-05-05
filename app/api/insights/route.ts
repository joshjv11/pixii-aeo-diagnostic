import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const runtime = 'edge';

const ENGINE_LABELS: Record<string, string> = {
  gemini:    'Llama 4 Scout',
  versatile: 'Llama 70B',
  instant:   'Llama 8B',
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandName = searchParams.get('brand')?.toLowerCase().trim();

    if (!brandName) {
      return NextResponse.json({ error: 'Brand name required' }, { status: 400 });
    }

    const db = createAdminClient();

    // 1. Fetch all diagnostics for this brand → Score Trend
    const { data: diagnostics, error: diagError } = await db
      .from('diagnostics')
      .select('id, score, created_at')
      .ilike('brand_name', `%${brandName}%`)
      .order('created_at', { ascending: true });

    if (diagError) throw new Error(diagError.message);

    const diagIds = (diagnostics ?? []).map((d: { id: string }) => d.id);

    // 2. Engine coverage stats → Radar Chart
    let engineStats: { engine: string; foundRate: number; totalScans: number }[] = [];
    if (diagIds.length > 0) {
      const { data: engines, error: engError } = await db
        .from('engine_results')
        .select('engine_key, found, success')
        .in('diagnostic_id', diagIds);

      if (!engError && engines) {
        const stats = (engines as { engine_key: string; found: boolean; success: boolean }[]).reduce(
          (acc: Record<string, { total: number; found: number }>, curr) => {
            if (!curr.success) return acc;
            if (!acc[curr.engine_key]) acc[curr.engine_key] = { total: 0, found: 0 };
            acc[curr.engine_key].total += 1;
            if (curr.found) acc[curr.engine_key].found += 1;
            return acc;
          },
          {}
        );

        engineStats = Object.keys(stats).map((key) => ({
          engine: ENGINE_LABELS[key] ?? key,
          foundRate: Math.round((stats[key].found / stats[key].total) * 100),
          totalScans: stats[key].total,
        }));
      }
    }

    // 3. Top competitors → Bar Chart
    let topCompetitors: { name: string; count: number }[] = [];
    if (diagIds.length > 0) {
      const { data: competitors, error: compError } = await db
        .from('competitor_mentions')
        .select('competitor_name')
        .in('diagnostic_id', diagIds)
        .eq('was_instead_of_brand', true);

      if (!compError && competitors) {
        const counts = (competitors as { competitor_name: string }[]).reduce(
          (acc: Record<string, number>, curr) => {
            const name = curr.competitor_name.toLowerCase();
            acc[name] = (acc[name] || 0) + 1;
            return acc;
          },
          {}
        );

        topCompetitors = Object.entries(counts)
          .map(([name, count]) => ({
            name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
            count: count as number,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }
    }

    return NextResponse.json({
      scoreTrend: (diagnostics ?? []).map((d: { score: number; created_at: string }, i: number) => ({
        scan: `Scan ${i + 1}`,
        score: d.score,
        date: d.created_at,
      })),
      engineBias: engineStats,
      topCompetitors,
      totalDiagnostics: diagIds.length,
    });
  } catch (error) {
    console.error('Insights API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch global insights' }, { status: 500 });
  }
}
