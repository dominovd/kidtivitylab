import type { APIRoute } from 'astro';
import { allActivities, toActivity } from '../lib/activities';

/**
 * Static JSON index consumed by the Finder island.
 * Rebuilt on every `astro build`; stays small (~1KB per 3 activities gzipped).
 */
export const GET: APIRoute = async () => {
  const entries = await allActivities();
  const index = entries.map((e) => {
    const a = toActivity(e);
    return {
      id: a.id,
      title: a.title,
      hook: a.hook,
      age_min: a.age_min,
      age_max: a.age_max,
      place: a.place,
      time_minutes: a.time_minutes,
      materials: a.materials,
      goals: a.goals,
      situations: a.situations,
      image: a.image ?? null,
    };
  });
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
