import { getCollection, type CollectionEntry } from 'astro:content';
import type { Activity } from './taxonomy';

/**
 * Minimum activities required for a programmatic page to be generated.
 * Thin-content guard (docs/requirements-v1.md §4).
 * NOTE: set to 3 while the database is small — raise to 8 before production launch.
 */
export const MIN_ACTIVITIES_PER_PAGE = 3;

export async function allActivities(): Promise<CollectionEntry<'activities'>[]> {
  return getCollection('activities');
}

/** Flatten a collection entry into the plain Activity shape used by the Finder & filters. */
export function toActivity(entry: CollectionEntry<'activities'>): Activity {
  return { id: entry.id, ...entry.data } as Activity;
}

export function timeLabel(t: string): string {
  return t === '10' ? '10 min' : t === '30' ? '30 min' : '45+ min';
}

export function materialsLabel(m: string): string {
  return m === 'none'
    ? 'Nothing needed'
    : m === 'paper'
      ? 'Paper & pencils'
      : m === 'household'
        ? 'Household items'
        : 'Craft supplies';
}

export function ageLabel(ageMinMonths: number, ageMaxMonths: number): string {
  if (ageMaxMonths < 24) {
    return ageMinMonths < 12
      ? `${ageMinMonths}–${ageMaxMonths} months`
      : `Ages 1–2`;
  }
  const lo = Math.floor(ageMinMonths / 12);
  const hi = Math.floor(ageMaxMonths / 12);
  return lo === hi ? `Age ${lo}` : `Ages ${lo}–${hi}`;
}
