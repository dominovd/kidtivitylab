import type { Progress, ProfileId, RoundResult, Session } from "./progress";

export type Feel = "easy" | "ok" | "hard";
export const FEEL_EMOJI: Record<Feel, string> = { easy: "😌", ok: "🙂", hard: "😣" };

/**
 * Stores how the round felt and fine-tunes the level set by accuracy alone:
 * - "easy" with every answer right: two levels up from the start of the round;
 * - "easy" with 80%+ right: one level up if accuracy did not already raise it;
 * - "hard": cancels a level-up (unless every answer was right); with under 70% right, one level down.
 */
export function applyFeel(p: Progress, pid: ProfileId, skillId: string, feel: Feel, res: RoundResult, ratio: number): [Progress, number] {
  const hist = [...p.history[pid]];
  if (hist[0]?.skill === skillId) hist[0] = { ...hist[0], feel };
  const st = p.stats[pid][skillId];
  if (!st) return [{ ...p, history: { ...p.history, [pid]: hist } }, 0];

  let level = res.levelAfter;
  // a perfect round the child calls easy: jump two levels from where the round started
  if (feel === "easy" && ratio === 1) level = Math.max(level, Math.min(5, res.levelBefore + 2));
  else if (feel === "easy" && ratio >= 0.8 && res.levelAfter === res.levelBefore) level = Math.min(5, level + 1);
  // a perfect round still levels up, so a shy "hard" cannot block progress forever
  if (feel === "hard" && res.levelAfter > res.levelBefore && ratio < 1) level = res.levelBefore;
  else if (feel === "hard" && ratio < 0.7 && res.levelAfter === res.levelBefore) level = Math.max(1, level - 1);

  return [
    {
      ...p,
      history: { ...p.history, [pid]: hist },
      stats: { ...p.stats, [pid]: { ...p.stats[pid], [skillId]: { ...st, level } } },
    },
    level - res.levelAfter,
  ];
}

export type Signal = { skill: string; kind: "harder" | "support" | "unsure"; feels: Feel[]; accuracy: number };

/** Per-skill signals from the last 5 rated rounds (needs at least 2). */
export function feelSignals(history: Session[]): Signal[] {
  const bySkill = new Map<string, Session[]>();
  for (const s of history) {
    if (!s.feel) continue;
    const list = bySkill.get(s.skill) ?? [];
    if (list.length < 5) list.push(s);
    bySkill.set(s.skill, list);
  }
  const out: Signal[] = [];
  for (const [skill, list] of bySkill) {
    if (list.length < 2) continue;
    const feels = list.map((s) => s.feel!) as Feel[];
    const accuracy = list.reduce((a, s) => a + s.correct, 0) / list.reduce((a, s) => a + s.total, 0);
    const easyN = feels.filter((f) => f === "easy").length;
    const hardN = feels.filter((f) => f === "hard").length;
    const easy = easyN >= 2 ? easyN / feels.length : 0;
    const hard = hardN >= 2 ? hardN / feels.length : 0;
    if (easy >= 0.6 && accuracy >= 0.85) out.push({ skill, kind: "harder", feels, accuracy });
    else if (hard >= 0.5 && accuracy < 0.7) out.push({ skill, kind: "support", feels, accuracy });
    else if (hard >= 0.5 && accuracy >= 0.85) out.push({ skill, kind: "unsure", feels, accuracy });
  }
  return out;
}
