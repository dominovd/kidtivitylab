/**
 * Merging progress from several devices. Pure functions, used by the browser and the server.
 *
 * Each child's data carries the time it last changed on some device (profileAt).
 * The newer copy of a child wins as a whole; rounds that exist only in the older copy
 * (the child played on two devices at once) are added on top: coins, attempts and
 * round counts grow, days and unlocked heroes are united, nothing is lost.
 */
import type { Progress, ProfileId, Session, SkillStat } from "./progress";

export const PIDS: ProfileId[] = ["kid6", "kid11"];

type Any = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const slice = (p: Any, pid: ProfileId) =>
  JSON.stringify([
    (p.profiles ?? []).find((x: Any) => x.id === pid) ?? null,
    p.stats?.[pid] ?? {},
    p.days?.[pid] ?? [],
    p.coins?.[pid] ?? 0,
    p.history?.[pid] ?? [],
    p.survey?.[pid] ?? null,
    p.placement?.[pid] ?? {},
    p.seenHeroes?.[pid] ?? [],
    p.companion?.[pid] ?? null,
  ]);

/** Marks which children changed between two states. */
export function stampChanges(prev: Progress, next: Progress, now = Date.now()): Progress {
  const at = { ...(prev.profileAt ?? {}), ...(next.profileAt ?? {}) } as Record<ProfileId, number>;
  for (const pid of PIDS) if (slice(prev, pid) !== slice(next, pid)) at[pid] = now;
  return { ...next, profileAt: at, updatedAt: now };
}

/** Stable identity of a round; old rounds without a timestamp are numbered within their list. */
function sessionKeys(list: Session[]): string[] {
  const seen = new Map<string, number>();
  return list.map((s) => {
    if (s.at) return `t${s.at}`;
    const base = `${s.d}|${s.skill}|${s.correct}|${s.total}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return `${base}#${n}`;
  });
}

export function mergeProgress(a: Any | null | undefined, b: Any | null | undefined): Any {
  if (!a) return b ?? {};
  if (!b) return a;
  const base = (a.updatedAt ?? 0) >= (b.updatedAt ?? 0) ? a : b;
  const out: Any = {
    ...base,
    profiles: [...(base.profiles ?? [])],
    stats: { ...(base.stats ?? {}) },
    days: { ...(base.days ?? {}) },
    coins: { ...(base.coins ?? {}) },
    history: { ...(base.history ?? {}) },
    survey: { ...(base.survey ?? {}) },
    placement: { ...(base.placement ?? {}) },
    seenHeroes: { ...(base.seenHeroes ?? {}) },
    companion: { ...(base.companion ?? {}) },
    profileAt: { ...(base.profileAt ?? {}) },
    updatedAt: Math.max(a.updatedAt ?? 0, b.updatedAt ?? 0),
  };

  for (const pid of PIDS) {
    const aAt = a.profileAt?.[pid] ?? 0;
    const bAt = b.profileAt?.[pid] ?? 0;
    const win = aAt >= bAt ? a : b;
    const lose = win === a ? b : a;

    // the newer copy of this child, as a whole
    const prof = (win.profiles ?? []).find((x: Any) => x.id === pid);
    if (prof) out.profiles = out.profiles.map((x: Any) => (x.id === pid ? prof : x));
    out.stats[pid] = { ...(win.stats?.[pid] ?? {}) };
    out.coins[pid] = win.coins?.[pid] ?? 0;
    out.survey[pid] = win.survey?.[pid] ?? out.survey[pid];
    out.placement[pid] = { ...(lose.placement?.[pid] ?? {}), ...(win.placement?.[pid] ?? {}) };
    out.companion[pid] = win.companion?.[pid] ?? null;
    out.days[pid] = [...new Set([...(win.days?.[pid] ?? []), ...(lose.days?.[pid] ?? [])])].sort().slice(-400);
    out.seenHeroes[pid] = [...new Set([...(win.seenHeroes?.[pid] ?? []), ...(lose.seenHeroes?.[pid] ?? [])])];
    out.profileAt[pid] = Math.max(aAt, bAt);

    // rounds played only on the other device are added on top
    const winH: Session[] = win.history?.[pid] ?? [];
    const loseH: Session[] = lose.history?.[pid] ?? [];
    const winKeys = new Set(sessionKeys(winH));
    const loseKeys = sessionKeys(loseH);
    const extra = loseH.filter((_, i) => !winKeys.has(loseKeys[i]));
    if (extra.length) {
      for (const s of extra) {
        out.coins[pid] += s.coins ?? s.correct;
        const st: SkillStat = out.stats[pid][s.skill] ?? lose.stats?.[pid]?.[s.skill] ?? { level: 1, attempts: 0, correct: 0, bestStars: 0, rounds: 0, lastPlayed: "" };
        out.stats[pid][s.skill] = {
          ...st,
          attempts: st.attempts + s.total,
          correct: st.correct + s.correct,
          rounds: st.rounds + 1,
          lastPlayed: st.lastPlayed > s.d ? st.lastPlayed : s.d,
          bestStars: Math.max(st.bestStars, lose.stats?.[pid]?.[s.skill]?.bestStars ?? 0),
        };
      }
      out.history[pid] = [...winH, ...extra]
        .sort((x, y) => (y.at ?? 0) - (x.at ?? 0) || (y.d > x.d ? 1 : y.d < x.d ? -1 : 0))
        .slice(0, 200);
    } else {
      out.history[pid] = winH;
    }
  }
  return out;
}
