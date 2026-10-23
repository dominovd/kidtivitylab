import type { Question } from "./engine";

/** Identity of a task as the child sees it. */
export const questionKey = (q: Question) =>
  [
    q.prompt,
    q.visual ?? "",
    q.passage ?? "",
    q.answer,
    q.grid ? JSON.stringify(q.grid) : "",
    q.clock ? `${q.clock.h}:${q.clock.m}` : "",
    q.shape ?? "",
    q.fraction ? JSON.stringify(q.fraction) : "",
    q.digital ?? "",
    q.memorize?.show ?? "",
  ].join("|");

const RECENT_KEY = "kl-recent-q";
const RECENT_MAX = 40;

function loadAll(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "{}");
  } catch {
    return {};
  }
}

/** Tasks shown in earlier rounds of this skill on this device, newest first. */
export function recentQuestions(memoryKey?: string): string[] {
  if (!memoryKey || typeof window === "undefined") return [];
  return loadAll()[memoryKey] ?? [];
}

export function rememberQuestion(memoryKey: string | undefined, key: string) {
  if (!memoryKey || typeof window === "undefined") return;
  try {
    const all = loadAll();
    all[memoryKey] = [key, ...(all[memoryKey] ?? []).filter((k) => k !== key)].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(all));
  } catch {}
}

export type PickState = {
  /** Tasks already in this round. */
  keys: Set<string>;
  /** Answers in this round, in order. */
  answers: string[];
  /** Distinct answers this skill can produce (learned from candidates). */
  space: Set<string>;
  /** Tasks from earlier rounds, newest first. */
  recent: string[];
};

export const newPickState = (recent: string[] = []): PickState => ({ keys: new Set(), answers: [], space: new Set(), recent });

/**
 * Generates several candidates and keeps the least repetitive one:
 * never the same task twice in a round, no long runs of the same answer,
 * answers spread evenly, and tasks seen in recent rounds pushed back.
 */
export function pickQuestion(gen: () => Question, st: PickState, tries = 40): Question {
  let best: Question | null = null;
  let bestScore = Infinity;
  const n = st.answers.length;
  const last = st.answers[n - 1];
  const twoSame = n >= 2 && st.answers[n - 1] === st.answers[n - 2];

  for (let i = 0; i < tries; i++) {
    const q = gen();
    st.space.add(q.answer);
    const key = questionKey(q);
    const count = st.answers.reduce((c, a) => c + (a === q.answer ? 1 : 0), 0);
    let score = 0;
    if (st.keys.has(key)) score += 1000;
    if (q.answer === last) {
      // with only two possible answers, a strict no-repeat rule turns into a guessable zigzag
      if (twoSame) score += 300;
      else if (st.space.size > 2) score += 100;
    }
    // a repeated answer weighs more than a task from an earlier round
    score += 80 * count * count;
    const seenAt = st.recent.indexOf(key);
    if (seenAt >= 0) score += Math.round(60 * (1 - seenAt / Math.max(st.recent.length, 1))) + 5;

    if (score < bestScore) {
      best = q;
      bestScore = score;
      if (score === 0) break;
    }
  }
  return best!;
}

export function registerQuestion(q: Question, st: PickState) {
  st.keys.add(questionKey(q));
  st.answers.push(q.answer);
}
