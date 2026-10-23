"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Age } from "./engine";
import type { Lang } from "./i18n";
import type { Answer } from "./assessment";
import { SEED_ADVANCED, SEED_HIDDEN } from "./seed";
import { PIDS, stampChanges } from "./merge";

export type ProfileId = "kid6" | "kid11";
export type Profile = { id: ProfileId; age: Age; name: string; avatar: string; advanced?: boolean; voice?: boolean; readAloud?: boolean; /** skill ids the parent turned off */ hidden?: string[] };
export type SkillStat = { level: number; attempts: number; correct: number; bestStars: number; rounds: number; lastPlayed: string };
export type Session = { d: string; skill: string; correct: number; total: number; feel?: "easy" | "ok" | "hard"; /** ms timestamp, identity across devices */ at?: number; /** coins earned, when not equal to correct (bonus rounds) */ coins?: number };

export type Progress = {
  version: 1;
  updatedAt: number;
  lang: Lang;
  profiles: Profile[];
  stats: Record<ProfileId, Record<string, SkillStat>>;
  days: Record<ProfileId, string[]>;
  coins: Record<ProfileId, number>;
  history: Record<ProfileId, Session[]>;
  /** Parent survey answers by milestone id, and when it was saved. */
  survey: Record<ProfileId, { answers: Record<string, Answer>; savedAt: string | null }>;
  /** Placement check date per subject. */
  placement: Record<ProfileId, Record<string, string>>;
  /** Heroes the child has already seen unlock, and the chosen companion. */
  seenHeroes: Record<ProfileId, string[]>;
  companion: Record<ProfileId, string | null>;
  migrations?: string[];
  /** When each child's data last changed (kept for backup files moved between devices). */
  profileAt?: Record<ProfileId, number>;
};

const STORAGE_KEY = "kids-learning-progress-v1";

export const today = () => new Date().toLocaleDateString("sv-SE");

export function emptyProgress(): Progress {
  return {
    version: 1,
    updatedAt: 0,
    lang: "en",
    // Both slots use the ages 5–8 track; two slots so siblings can keep separate progress.
    profiles: [
      { id: "kid6", age: 6, name: "Explorer", avatar: "🐣", advanced: SEED_ADVANCED.kid6, hidden: SEED_HIDDEN.kid6 },
      { id: "kid11", age: 6, name: "Adventurer", avatar: "🦊", advanced: SEED_ADVANCED.kid11, hidden: SEED_HIDDEN.kid11 },
    ],
    stats: { kid6: {}, kid11: {} },
    days: { kid6: [], kid11: [] },
    coins: { kid6: 0, kid11: 0 },
    history: { kid6: [], kid11: [] },
    survey: { kid6: { answers: {}, savedAt: null }, kid11: { answers: {}, savedAt: null } },
    placement: { kid6: {}, kid11: {} },
    seenHeroes: { kid6: [], kid11: [] },
    companion: { kid6: null, kid11: null },
    migrations: [],
  };
}

function normalize(p: Partial<Progress> | null | undefined): Progress {
  const base = emptyProgress();
  if (!p || typeof p !== "object") return base;
  return {
    ...base,
    ...p,
    lang: "en",
    profiles: p.profiles?.length
      ? p.profiles.map((x) => ({ ...x, age: 6 as Age, advanced: x.advanced ?? SEED_ADVANCED[x.id], hidden: x.hidden ?? SEED_HIDDEN[x.id] }))
      : base.profiles,
    stats: { ...base.stats, ...(p.stats ?? {}) },
    days: { ...base.days, ...(p.days ?? {}) },
    coins: { ...base.coins, ...(p.coins ?? {}) },
    history: { ...base.history, ...(p.history ?? {}) },
    survey: { ...base.survey, ...(p.survey ?? {}) },
    placement: { ...base.placement, ...(p.placement ?? {}) },
    seenHeroes: { ...base.seenHeroes, ...(p.seenHeroes ?? {}) },
    companion: { ...base.companion, ...(p.companion ?? {}) },
    migrations: [],
  };
}

const blankStat = (): SkillStat => ({ level: 1, attempts: 0, correct: 0, bestStars: 0, rounds: 0, lastPlayed: "" });

/** Sets start levels. With `keepPlayed`, skills the child already played keep their adaptive level. */
export function setLevels(p: Progress, pid: ProfileId, levels: Record<string, number>, keepPlayed: boolean): Progress {
  const stats = { ...p.stats[pid] };
  for (const [skill, level] of Object.entries(levels)) {
    const prev = stats[skill] ?? blankStat();
    if (keepPlayed && prev.rounds > 0) continue;
    stats[skill] = { ...prev, level };
  }
  return { ...p, stats: { ...p.stats, [pid]: stats } };
}

export const starsFor = (correct: number, total: number) => {
  const r = total ? correct / total : 0;
  return r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0;
};

export function streak(days: string[]): number {
  if (!days.length) return 0;
  const set = new Set(days);
  const d = new Date();
  // today not played yet: the streak still counts from yesterday
  if (!set.has(d.toLocaleDateString("sv-SE"))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(d.toLocaleDateString("sv-SE"))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export type RoundResult = { stars: number; levelBefore: number; levelAfter: number; coins: number };

/** `coinMult` doubles the coins for recommended rounds. */
export function applyRound(p: Progress, pid: ProfileId, skillId: string, correct: number, total: number, coinMult = 1): [Progress, RoundResult] {
  const coins = correct * coinMult;
  const prev: SkillStat = p.stats[pid][skillId] ?? blankStat();
  const ratio = correct / total;
  const levelAfter = ratio >= 0.9 ? Math.min(5, prev.level + 1) : ratio < 0.5 ? Math.max(1, prev.level - 1) : prev.level;
  const stars = starsFor(correct, total);
  const d = today();
  const next: Progress = {
    ...p,
    updatedAt: Date.now(),
    stats: {
      ...p.stats,
      [pid]: {
        ...p.stats[pid],
        [skillId]: {
          level: levelAfter,
          attempts: prev.attempts + total,
          correct: prev.correct + correct,
          bestStars: Math.max(prev.bestStars, stars),
          rounds: prev.rounds + 1,
          lastPlayed: d,
        },
      },
    },
    days: { ...p.days, [pid]: p.days[pid].includes(d) ? p.days[pid] : [...p.days[pid], d].slice(-400) },
    coins: { ...p.coins, [pid]: (p.coins[pid] ?? 0) + coins },
    history: { ...p.history, [pid]: [{ d, skill: skillId, correct, total, at: Date.now(), ...(coinMult !== 1 ? { coins } : {}) }, ...p.history[pid]].slice(0, 200) },
  };
  return [next, { stars, levelBefore: prev.level, levelAfter, coins }];
}

type Ctx = {
  progress: Progress;
  ready: boolean;
  update: (fn: (p: Progress) => Progress) => void;
  replace: (p: Progress) => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);

  const commit = useCallback((p: Progress) => {
    setProgress(p);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProgress(normalize(JSON.parse(raw)));
    } catch {}
    setReady(true);
  }, []);

  const update = useCallback(
    (fn: (p: Progress) => Progress) => commit(stampChanges(progress, fn(progress))),
    [commit, progress],
  );

  /** Restoring a backup file. */
  const replace = useCallback(
    (p: Progress) => {
      const now = Date.now();
      commit({ ...normalize(p), updatedAt: now, profileAt: Object.fromEntries(PIDS.map((id) => [id, now])) as Record<ProfileId, number> });
    },
    [commit],
  );

  const value = useMemo(() => ({ progress, ready, update, replace }), [progress, ready, update, replace]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress outside provider");
  return ctx;
}
