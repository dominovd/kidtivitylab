/**
 * Facet taxonomy — labels, slugs, and predicates used by the Finder
 * and by programmatic page generation. Keep in sync with content.config.ts enums.
 */

export interface Activity {
  id: string;
  title: string;
  hook: string;
  age_min: number;
  age_max: number;
  place: string[];
  time_minutes: string;
  materials: string;
  materials_list: string[];
  goals: string[];
  involvement: string;
  situations: string[];
  seasons: string[];
  skills_developed: string[];
  safety_note?: string;
  image?: string;
  image_alt?: string;
  setup_minutes?: number;
  cleanup_minutes?: number;
  mess_level?: 'low' | 'medium' | 'high';
  energy_level?: 'calm' | 'moderate' | 'active';
  adult_help?: 'minimal' | 'nearby' | 'hands-on';
  why_kids_love_it?: string;
  before_you_start: string[];
  learning_details: { skill: string; detail: string }[];
  variations: { title: string; detail: string }[];
  common_problems: { problem: string; solution: string }[];
  faqs: { question: string; answer: string }[];
  last_updated?: string;
}

/** Age groups shown as chips. min/max in months (inclusive overlap test). */
export const AGE_GROUPS = [
  { slug: 'baby', label: 'Baby', title: 'Babies (under 1)', min: 0, max: 11 },
  { slug: '1-year-olds', label: '1', title: '1 Year Olds', min: 12, max: 23 },
  { slug: '2-year-olds', label: '2', title: '2 Year Olds', min: 24, max: 35 },
  { slug: '3-year-olds', label: '3', title: '3 Year Olds', min: 36, max: 47 },
  { slug: '4-year-olds', label: '4', title: '4 Year Olds', min: 48, max: 59 },
  { slug: '5-year-olds', label: '5', title: '5 Year Olds', min: 60, max: 71 },
  { slug: '6-7-year-olds', label: '6–7', title: '6–7 Year Olds', min: 72, max: 95 },
  { slug: '8-10-year-olds', label: '8–10', title: '8–10 Year Olds', min: 96, max: 131 },
] as const;

export const PLACES = [
  { slug: 'home', label: 'At home' },
  { slug: 'outdoors', label: 'Outside' },
  { slug: 'road', label: 'On the road' },
  { slug: 'table', label: 'At the table' },
] as const;

export const TIMES = [
  { slug: '10', label: '5–10 min' },
  { slug: '30', label: '15–30 min' },
  { slug: '45', label: '45+ min' },
] as const;

export const MATERIALS = [
  { slug: 'none', label: 'Nothing' },
  { slug: 'paper', label: 'Paper' },
  { slug: 'household', label: 'Household' },
  { slug: 'craft', label: 'Craft supplies' },
] as const;

export const GOALS = [
  { slug: 'energy', label: 'Burn energy' },
  { slug: 'calm', label: 'Calm down' },
  { slug: 'motor', label: 'Fine motor' },
  { slug: 'speech', label: 'Speech' },
  { slug: 'stem', label: 'Logic & STEM' },
  { slug: 'creative', label: 'Creativity' },
] as const;

/** Situation landing pages. Membership comes from explicit frontmatter tags. */
export const SITUATIONS = [
  {
    slug: 'rainy-day',
    title: 'Rainy Day Activities',
    intro:
      'Stuck inside while it pours? These practical ideas bring movement, imagination, and calmer moments to a long afternoon — most use what is already in your living room.',
  },
  {
    slug: 'indoor',
    title: 'Indoor Activities',
    intro:
      'Real-life indoor ideas for real-life days: quick to set up, easy to clean up, and genuinely fun for both of you.',
  },
  {
    slug: 'outdoor',
    title: 'Outdoor Activities',
    intro:
      'Fresh air, big movements, zero screens. Simple ways to make the backyard or the park feel brand new.',
  },
  {
    slug: 'road-trip',
    title: 'Road Trip & Travel Activities',
    intro:
      'Screen-free ways to survive the back seat: games that need no parts, no prep, and no "are we there yet".',
  },
  {
    slug: 'sick-day',
    title: 'Sick Day Activities',
    intro:
      'Low-energy, cozy activities for a child who is home from daycare or school — calm enough for recovery, fun enough to lift the mood.',
  },
  {
    slug: 'quiet-time',
    title: 'Quiet Time Activities',
    intro:
      'Wind-down activities for before naps, before bed, or whenever the volume needs to come down a notch.',
  },
] as const;

/** Theme landing pages. Membership comes from goals / materials. */
export const THEMES = [
  {
    slug: 'sensory',
    title: 'Sensory Play',
    match: (a: Activity) => a.goals.includes('motor') || a.skills_developed.some((s) => /sensory/i.test(s)),
    intro:
      'Hands-in, squishy, pourable play that builds fine motor skills and keeps little hands busy for ages.',
  },
  {
    slug: 'crafts',
    title: 'Crafts & Art',
    match: (a: Activity) => a.goals.includes('creative'),
    intro: 'Make something together — no Pinterest-perfect results required.',
  },
  {
    slug: 'learning',
    title: 'Learning & STEM',
    match: (a: Activity) => a.goals.includes('stem') || a.goals.includes('speech'),
    intro: 'Sneaky learning disguised as play: counting, letters, cause and effect, and big questions.',
  },
  {
    slug: 'active-games',
    title: 'Active Games',
    match: (a: Activity) => a.goals.includes('energy'),
    intro: 'For the days when the wiggles must come out. Big movement, small space, no equipment.',
  },
] as const;

export function ageGroupBySlug(slug: string) {
  return AGE_GROUPS.find((g) => g.slug === slug);
}

export function matchesAge(a: Activity, group: { min: number; max: number }): boolean {
  return a.age_min <= group.max && a.age_max >= group.min;
}
