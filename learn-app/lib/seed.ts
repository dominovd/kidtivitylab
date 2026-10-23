/**
 * Defaults for new visitors. The public version ships no personal data:
 * every profile starts blank, and levels come from the parent survey or
 * the in-app level check.
 */

/** Extra challenge island ("Extra challenge: maths & logic") on by default. */
export const SEED_ADVANCED: Record<"kid6" | "kid11", boolean> = { kid6: true, kid11: true };

/** No skills are hidden by default; parents can hide any in the parent section. */
export const SEED_HIDDEN: Record<"kid6" | "kid11", string[]> = { kid6: [], kid11: [] };
