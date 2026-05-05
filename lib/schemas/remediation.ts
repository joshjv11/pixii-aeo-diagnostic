import { z } from 'zod';

export const remediationSchema = z.object({
  vulnerability_analysis: z.string().describe(
    'A harsh, 2-3 paragraph analysis of WHY the named competitors are winning AI rankings. Be specific — identify the exact semantic signals, keywords, clinical/technical language, positioning angles, and content patterns they exploit. Name the specific gaps the target brand must close immediately.',
  ),

  // Pillar 1: UGC Video Scripts
  ugc_video_scripts: z
    .array(
      z.object({
        hook: z
          .string()
          .describe(
            'The opening 3-second hook line to stop the scroll. Under 15 words, punchy and provocative.',
          ),
        script: z
          .string()
          .describe(
            'A complete 30-second UGC script (~75-90 words) that organically weaves in the exact semantic keywords competitors are winning on. Written as an authentic, natural-sounding user review — not marketing copy.',
          ),
      }),
    )
    .min(1)
    .max(3)
    .describe(
      '2 viral TikTok/YouTube Shorts UGC scripts that embed the semantic keywords competitors dominate, written as authentic user reviews.',
    ),

  // Pillar 2: Reddit/Quora Seeding
  reddit_seeding_strategy: z
    .array(
      z.object({
        question_to_ask: z
          .string()
          .describe(
            'A realistic, organic-sounding question a real user might post on Reddit or Quora about this product category. Conversational, specific, not promotional.',
          ),
        expert_answer: z
          .string()
          .describe(
            'A detailed, genuinely helpful answer (150-200 words) that naturally positions the brand as the superior choice, written in authentic Reddit voice — no corporate marketing language. Include specific product details and comparisons.',
          ),
      }),
    )
    .min(1)
    .max(3)
    .describe(
      '2 Reddit/Quora seeding pairs to build real-time semantic authority with models like Perplexity and ChatGPT that index community content.',
    ),

  // Pillar 3: Pixii Visuals + Amazon Copy
  pixii_visual_prompts: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe(
      '3 high-converting product image prompts for Pixii.ai. Each specific and production-ready, optimized for Amazon hero images.',
    ),

  amazon_listing: z.object({
    title: z
      .string()
      .describe(
        'AEO-optimized Amazon product title under 200 characters, front-loaded with the highest-value semantic keywords for the category.',
      ),
    bullets: z
      .array(z.string())
      .min(3)
      .max(7)
      .describe(
        '5 Amazon bullet points. Each starts with a power keyword in ALL CAPS followed by a plain-language benefit mapped to AI engine citation patterns.',
      ),
  }),
});

export type RemediationOutput = z.infer<typeof remediationSchema>;
