import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Activity schema — single source of truth.
 * Maps 1:1 to a future Postgres/Supabase table (see docs/requirements-v1.md §6).
 */
const activities = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/activities' }),
  schema: z
    .object({
      title: z.string(),
      hook: z.string().max(120),
      age_min: z.number().int().min(0), // months
      age_max: z.number().int().max(216), // months
      place: z.array(z.enum(['home', 'outdoors', 'road', 'table'])).min(1),
      time_minutes: z.enum(['10', '30', '45']), // 5–10 / 15–30 / 45+
      materials: z.enum(['none', 'paper', 'household', 'craft']),
      materials_list: z.array(z.string()).default([]),
      goals: z
        .array(z.enum(['energy', 'calm', 'motor', 'speech', 'stem', 'creative']))
        .min(1),
      involvement: z.enum(['together', 'independent']),
      situations: z
        .array(
          z.enum(['rainy-day', 'indoor', 'outdoor', 'road-trip', 'sick-day', 'quiet-time'])
        )
        .default([]),
      seasons: z
        .array(z.enum(['spring', 'summer', 'fall', 'winter', 'christmas', 'easter', 'halloween']))
        .default([]),
      skills_developed: z.array(z.string()).default([]),
      safety_note: z.string().optional(),
      tips: z.string().optional(),
      image: z.string().optional(), // path under /public/images/activities/
      image_alt: z.string().optional(),
      setup_minutes: z.number().int().min(0).optional(),
      cleanup_minutes: z.number().int().min(0).optional(),
      mess_level: z.enum(['low', 'medium', 'high']).optional(),
      energy_level: z.enum(['calm', 'moderate', 'active']).optional(),
      adult_help: z.enum(['minimal', 'nearby', 'hands-on']).optional(),
      why_kids_love_it: z.string().optional(),
      before_you_start: z.array(z.string()).default([]),
      learning_details: z
        .array(z.object({ skill: z.string(), detail: z.string() }))
        .default([]),
      variations: z
        .array(z.object({ title: z.string(), detail: z.string() }))
        .default([]),
      common_problems: z
        .array(z.object({ problem: z.string(), solution: z.string() }))
        .default([]),
      faqs: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .default([]),
      last_updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      affiliate_products: z
        .array(z.object({ name: z.string(), url: z.string().url() }))
        .default([]),
    })
    .refine(
      (a) => a.age_max > a.age_min,
      { message: 'age_max must be greater than age_min' }
    )
    .refine(
      // Safety rule: any activity reachable by under-3s that uses physical materials
      // must carry a safety note (choking hazards etc.).
      (a) => !(a.age_min < 36 && a.materials !== 'none' && !a.safety_note),
      { message: 'Activities for under-3s that use materials require a safety_note' }
    ),
});

export const collections = { activities };
