"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Round from "./Round";
import Parent from "./Parent";
import Ico from "./Ico";
import HeroPic from "./HeroPic";
import Avatar from "./Avatar";
import Setup from "./Setup";
import { HEROES, RARITY, nextHero, unlockedHeroes } from "@/lib/heroes";
import { t } from "@/lib/i18n";
import type { SubjectId } from "@/lib/engine";
import { SUBJECTS, ROUND_SIZE, TRACKS, getSkill, skillsFor } from "@/lib/skills";
import { focusSkills } from "@/lib/assessment";
import { applyRound, setLevels, streak, today, useProgress, type ProfileId, type RoundResult } from "@/lib/progress";
import { primeAudioOnFirstGesture, sfx, speak } from "@/lib/speech";
import { applyFeel, FEEL_EMOJI, type Feel } from "@/lib/feel";
import { speechLang } from "@/lib/engine";

type Screen =
  | { name: "home" }
  | { name: "map"; pid: ProfileId }
  | { name: "round"; pid: ProfileId; skillId: string; level: number; key: number; bonus?: boolean }
  | { name: "result"; pid: ProfileId; skillId: string; correct: number; total: number; res: RoundResult; newHeroes: string[] }
  | { name: "heroes"; pid: ProfileId }
  | { name: "placement"; pid: ProfileId; subject: SubjectId; key: number }
  | { name: "placementResult"; pid: ProfileId; subject: SubjectId; levels: Record<string, number> }
  | { name: "parent"; pid?: ProfileId; view?: "overview" | "survey" }
  | { name: "setup"; pid: ProfileId; start: "name" | "track" };

/** Two questions per skill: level 3, then level 5 after a right answer or level 1 after a wrong one. */
const placementLevel = (first: boolean, second: boolean) => (first ? (second ? 5 : 3) : second ? 2 : 1);
/** Big islands get one question per skill so the check stays short. */
const perSkill = (n: number) => (n > 6 ? 1 : 2);

export default function App() {
  const { progress, ready, update } = useProgress();
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [sound, setSound] = useState(true);
  const [unlockIdx, setUnlockIdx] = useState(0);
  const [feelDone, setFeelDone] = useState<{ feel: Feel; delta: number } | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navLock = useRef(0);

  // quick navigation: highlight the section on screen
  useEffect(() => {
    if (screen.name !== "map") return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".nav-target"));
    const io = new IntersectionObserver(
      (entries) => {
        const visibleNow = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        // right after a tap the tapped section stays highlighted, even when the page cannot scroll that far
        if (visibleNow[0] && Date.now() > navLock.current) setActiveSection(visibleNow[0].target.id);
      },
      { rootMargin: "-90px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [screen]);

  const jump = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    navLock.current = Date.now() + 1200;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  // keep the highlighted chip visible in the scrolling nav row
  useEffect(() => {
    if (activeSection) document.querySelector(`.quick-nav a[href="#${activeSection}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeSection]);
  const lang = progress.lang;

  useEffect(() => {
    try {
      setSound(localStorage.getItem("kl-sound") !== "off");
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    primeAudioOnFirstGesture();
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen.name]);

  const toggleSound = () => {
    setSound((s) => {
      try {
        localStorage.setItem("kl-sound", s ? "off" : "on");
      } catch {}
      return !s;
    });
  };

  const focusByKid = useMemo(
    () => ({
      kid6: new Set(focusSkills(6, progress.survey.kid6.answers, progress.stats.kid6)),
      kid11: new Set(focusSkills(11, progress.survey.kid11.answers, progress.stats.kid11)),
    }),
    [progress.survey, progress.stats],
  );

  if (!ready) return <div className="loading">⏳</div>;

  const profile = (pid: ProfileId) => progress.profiles.find((p) => p.id === pid)!;
  const setAvatar = (pid: ProfileId, heroId: string) =>
    update((pr) => ({ ...pr, profiles: pr.profiles.map((x) => (x.id === pid ? { ...x, avatar: `hero:${heroId}` } : x)) }));
  const companionOf = (pid: ProfileId) => HEROES.find((x) => x.id === progress.companion[pid]) ?? null;
  const nextHeroBar = (pid: ProfileId) => {
    const coins = progress.coins[pid] ?? 0;
    const nh = nextHero(coins);
    if (!nh) return <p className="muted">🏆 {t("allHeroes", lang)}</p>;
    const prevCost = [...HEROES].reverse().find((x) => x.cost <= coins)?.cost ?? 0;
    const pct = Math.round(((coins - prevCost) / (nh.cost - prevCost)) * 100);
    return (
      <button className="next-hero card" onClick={() => setScreen({ name: "heroes", pid })}>
        <HeroPic hero={nh} size={44} locked />
        <span style={{ flex: 1, textAlign: "left" }}>
          <small>
            {t("toNextHero", lang)}: {nh.cost - coins} {t("coinsWord", lang)}
          </small>
          <span className="bar-track" style={{ display: "block", marginTop: 6 }}>
            <span className="bar-fill" style={{ width: `${pct}%`, display: "block" }} />
          </span>
        </span>
      </button>
    );
  };
  const levelOf = (pid: ProfileId, skillId: string) => progress.stats[pid][skillId]?.level ?? 1;
  const startRound = (pid: ProfileId, skillId: string, bonus = false) =>
    setScreen({ name: "round", pid, skillId, level: levelOf(pid, skillId), key: Date.now(), bonus });

  const header = (
    <header className="topbar">
      <button className="brand" onClick={() => setScreen({ name: "home" })}>
        <span>🌈</span> {t("appName", lang)}
      </button>
      <div className="topbar-right">
        <button className="icon-btn" onClick={toggleSound} aria-label="sound">{sound ? "🔊" : "🔇"}</button>
      </div>
    </header>
  );

  if (screen.name === "round") {
    const skill = getSkill(screen.skillId)!;
    const p = profile(screen.pid);
    return (
      <main className="app playing">
        <Round
          key={screen.key}
          ask={() => skill.gen(screen.level, lang)}
          memoryKey={`${screen.pid}:${screen.skillId}`}
          size={ROUND_SIZE[p.age]}
          lang={lang}
          young={p.age === 6}
          sound={sound}
          voice={p.voice !== false}
          readAloud={p.readAloud !== false}
          companion={companionOf(p.id) ? <HeroPic hero={companionOf(p.id)!} size={84} /> : undefined}
          label={screen.bonus ? `⭐ ${t("todayPlan", lang)} · 🪙 ${t("doubleCoins", lang)}` : undefined}
          onExit={() => setScreen({ name: "map", pid: screen.pid })}
          onFinish={(results) => {
            const correct = results.filter(Boolean).length;
            const total = results.length;
            const pid = screen.pid;
            let [next, res] = applyRound(progress, pid, screen.skillId, correct, total, screen.bonus ? 2 : 1);
            const seen = next.seenHeroes[pid] ?? [];
            const fresh = unlockedHeroes(next.coins[pid] ?? 0).filter((x) => !seen.includes(x.id));
            if (fresh.length) {
              next = {
                ...next,
                seenHeroes: { ...next.seenHeroes, [pid]: [...seen, ...fresh.map((x) => x.id)] },
                companion: { ...next.companion, [pid]: next.companion[pid] ?? fresh[0].id },
              };
            }
            update(() => next);
            if (sound && (correct / total >= 0.7 || fresh.length)) sfx("win");
            if (sound && fresh.length) speak(`${t("newHeroSay", lang)}: ${fresh[0].name[lang]}!`, speechLang[lang], { rate: 1 });
            else if (sound && p.readAloud !== false) speak(t("howWasIt", lang), speechLang[lang], { rate: 1 });
            setUnlockIdx(0);
            setFeelDone(null);
            setScreen({ name: "result", pid, skillId: screen.skillId, correct, total, res, newHeroes: fresh.map((x) => x.id) });
          }}
        />
      </main>
    );
  }

  if (screen.name === "placement") {
    const p = profile(screen.pid);
    const skills = skillsFor(p.age, screen.subject).filter((sk) => !p.hidden?.includes(sk.id));
    const subject = SUBJECTS.find((s) => s.id === screen.subject)!;
    const k = perSkill(skills.length);
    return (
      <main className="app playing">
        <Round
          key={screen.key}
          label={`${subject.icon} ${t("placement", lang)} · ${subject.title[lang]}`}
          ask={(i, results) => {
            const skill = skills[Math.floor(i / k)];
            const level = i % k === 0 ? 3 : results[i - 1] ? 5 : 1;
            return skill.gen(level, lang);
          }}
          size={skills.length * k}
          lang={lang}
          young={p.age === 6}
          sound={sound}
          voice={p.voice !== false}
          readAloud={p.readAloud !== false}
          companion={companionOf(p.id) ? <HeroPic hero={companionOf(p.id)!} size={84} /> : undefined}
          onExit={() => setScreen({ name: "map", pid: screen.pid })}
          onFinish={(results) => {
            const levels: Record<string, number> = {};
            skills.forEach((sk, j) =>
              (levels[sk.id] = k === 2 ? placementLevel(results[2 * j], results[2 * j + 1]) : results[j] ? 3 : 1),
            );
            update((prev) => {
              const next = setLevels(prev, screen.pid, levels, false);
              return { ...next, placement: { ...next.placement, [screen.pid]: { ...next.placement[screen.pid], [screen.subject]: today() } } };
            });
            if (sound) sfx("win");
            setScreen({ name: "placementResult", pid: screen.pid, subject: screen.subject, levels });
          }}
        />
      </main>
    );
  }

  if (screen.name === "placementResult") {
    const subject = SUBJECTS.find((s) => s.id === screen.subject)!;
    return (
      <main className="app">
        {header}
        <section className="result card">
          <Ico name="idea-lightbulb" size={96} className="result-ico" />
          <h1>{t("placementDone", lang)}</h1>
          <ul className="level-list" style={{ "--c": subject.color } as React.CSSProperties}>
            {Object.entries(screen.levels).map(([id, lvl]) => {
              const sk = getSkill(id)!;
              return (
                <li key={id}>
                  <span>
                    {sk.icon} {sk.title[lang]}
                  </span>
                  <span className="level">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <i key={i} className={i <= lvl ? "on" : ""} />
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
          <button className="btn primary" onClick={() => setScreen({ name: "map", pid: screen.pid })}>
            {t("toSkills", lang)} →
          </button>
        </section>
      </main>
    );
  }

  if (screen.name === "result") {
    const skill = getSkill(screen.skillId)!;
    const { res } = screen;
    const msg = res.stars === 3 ? t("greatJob", lang) : res.stars >= 1 ? t("goodJob", lang) : t("keepTrying", lang);
    return (
      <main className="app">
        {header}
        <section className="result card">
          <div className="result-icon">{skill.icon}</div>
          <h1>{msg}</h1>
          <div className="big-stars" aria-label={`${res.stars} ${t("stars", lang)}`}>
            {[1, 2, 3].map((i) => (
              <span key={i} className={i <= res.stars ? "on" : ""} style={{ animationDelay: `${i * 0.15}s` }}>
                <Ico name="reward-star" size={72} />
              </span>
            ))}
          </div>
          <p className="score">
            {screen.correct} / {screen.total} · <Ico name="reward-coin" size={26} /> +{res.coins}
          </p>
          {res.levelAfter > res.levelBefore && <p className="level-up">🎉 {t("levelUp", lang)} {t("level", lang)} {res.levelAfter}</p>}
          <div className="feel">
            {!feelDone ? (
              <>
                <p className="feel-q">{t("howWasIt", lang)}</p>
                <div className="feel-options">
                  {(["easy", "ok", "hard"] as Feel[]).map((f) => (
                    <button
                      key={f}
                      className={`feel-btn ${f}`}
                      onClick={() => {
                        const [next, delta] = applyFeel(progress, screen.pid, screen.skillId, f, res, screen.correct / screen.total);
                        update(() => next);
                        setFeelDone({ feel: f, delta });
                        const say = delta > 0 ? t("feelUp", lang) : delta < 0 ? t("feelDown", lang) : f === "hard" ? t("feelKeep", lang) : t("feelThanks", lang);
                        if (sound) speak(say, speechLang[lang], { rate: 1 });
                      }}
                    >
                      <span className="feel-emoji">{FEEL_EMOJI[f]}</span>
                      {t(f === "easy" ? "feelEasy" : f === "ok" ? "feelOk" : "feelHard", lang)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="feel-done">
                {FEEL_EMOJI[feelDone.feel]}{" "}
                {feelDone.delta > 0
                  ? t("feelUp", lang)
                  : feelDone.delta < 0
                    ? t("feelDown", lang)
                    : feelDone.feel === "hard"
                      ? t("feelKeep", lang)
                      : t("feelThanks", lang)}
              </p>
            )}
          </div>
          <div className="row">
            <button className="btn" onClick={() => setScreen({ name: "map", pid: screen.pid })}>{t("toSkills", lang)}</button>
            <button className="btn primary" onClick={() => startRound(screen.pid, screen.skillId)}>
              {t("again", lang)}
            </button>
          </div>
        </section>
        {unlockIdx < screen.newHeroes.length &&
          (() => {
            const hero = HEROES.find((x) => x.id === screen.newHeroes[unlockIdx])!;
            return (
              <div className="overlay" role="dialog" aria-modal="true" aria-label={t("newHero", lang)}>
                <div className="card unlock">
                  <h1>🎉 {t("newHero", lang)}</h1>
                  <HeroPic hero={hero} size={180} />
                  <p className="hero-name">{hero.name[lang]}</p>
                  <span className="rarity" style={{ "--r": RARITY[hero.rarity].color } as React.CSSProperties}>{RARITY[hero.rarity].name[lang]}</span>
                  <div className="row wrap" style={{ justifyContent: "center" }}>
                    <button
                      className="btn"
                      onClick={() => {
                        setAvatar(screen.pid, hero.id);
                        setUnlockIdx((i) => i + 1);
                      }}
                    >
                      👤 {t("setAvatar", lang)}
                    </button>
                    <button className="btn primary" autoFocus onClick={() => setUnlockIdx((i) => i + 1)}>
                      {t("hooray", lang)}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
      </main>
    );
  }

  if (screen.name === "setup") {
    const p = profile(screen.pid);
    return (
      <main className="app">
        {header}
        <Setup
          start={screen.start}
          initialName={p.name}
          initialAvatar={p.avatar}
          initialTrack={p.track}
          onCancel={() => setScreen(p.name ? { name: "map", pid: p.id } : { name: "home" })}
          onDone={({ name, avatar, track }) => {
            update((pr) => ({
              ...pr,
              profiles: pr.profiles.map((x) =>
                x.id === p.id ? { ...x, name, avatar, track, advanced: track === "plus" ? true : x.advanced } : x,
              ),
            }));
            setScreen({ name: "map", pid: p.id });
          }}
        />
      </main>
    );
  }

  if (screen.name === "parent") {
    return (
      <main className="app">
        {header}
        <Parent lang={lang} initialPid={screen.pid} initialView={screen.view} onBack={() => setScreen({ name: "home" })} />
      </main>
    );
  }

  if (screen.name === "heroes") {
    const p = profile(screen.pid);
    const coins = progress.coins[p.id] ?? 0;
    return (
      <main className={`app ${p.age === 6 ? "young" : ""}`}>
        {header}
        <div className="kid-bar">
          <button className="icon-btn" onClick={() => setScreen({ name: "map", pid: p.id })} aria-label={t("back", lang)}>←</button>
          <b>
            🦸 {t("heroes", lang)} {unlockedHeroes(coins).length}/{HEROES.length}
          </b>
          <span className="pill"><Ico name="reward-coin" size={18} /> {coins}</span>
        </div>
        {nextHeroBar(p.id)}
        <div className="heroes-grid">
          {HEROES.map((hero) => {
            const open = coins >= hero.cost;
            const mine = progress.companion[p.id] === hero.id;
            return (
              <div
                key={hero.id}
                className={`card hero-card ${open ? "" : "locked"} ${mine ? "mine" : ""}`}
                style={{ "--r": RARITY[hero.rarity].color } as React.CSSProperties}
              >
                <HeroPic hero={hero} size={110} locked={!open} />
                {open ? (
                  <>
                    <span className="hero-name">{hero.name[lang]}</span>
                    <span className="rarity" style={{ "--r": RARITY[hero.rarity].color } as React.CSSProperties}>{RARITY[hero.rarity].name[lang]}</span>
                    <button
                      className={`btn small ${mine ? "ghost" : "primary"}`}
                      disabled={mine}
                      onClick={() => update((pr) => ({ ...pr, companion: { ...pr.companion, [p.id]: hero.id } }))}
                    >
                      {mine ? `✓ ${t("isCompanion", lang)}` : t("takeCompanion", lang)}
                    </button>
                    <button
                      className={`btn small ${p.avatar === `hero:${hero.id}` ? "ghost" : ""}`}
                      disabled={p.avatar === `hero:${hero.id}`}
                      onClick={() => setAvatar(p.id, hero.id)}
                    >
                      {p.avatar === `hero:${hero.id}` ? `✓ ${t("isAvatar", lang)}` : `👤 ${t("setAvatar", lang)}`}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="rarity" style={{ "--r": RARITY[hero.rarity].color } as React.CSSProperties}>{RARITY[hero.rarity].name[lang]}</span>
                    <span className="hero-cost">
                      🔒 <Ico name="reward-coin" size={16} /> {hero.cost}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  if (screen.name === "map") {
    const p = profile(screen.pid);
    const stats = progress.stats[p.id];
    const focus = focusByKid[p.id];
    const surveyDone = !!progress.survey[p.id].savedAt;
    // the chosen direction goes first; the extra-challenge island goes last otherwise
    const shown = (sk: { id: string }) => !p.hidden?.includes(sk.id);
    const order = (s: { id: string; advanced?: boolean }) => (s.id === p.track ? 0 : s.advanced ? 2 : 1);
    const visibleSubjects = SUBJECTS.filter((s) => (!s.advanced || p.advanced) && skillsFor(p.age, s.id).some(shown)).sort(
      (a, b) => order(a) - order(b),
    );
    const visible = new Set(visibleSubjects.map((s) => s.id));
    const untouched = (id: string) => !(stats[id]?.rounds ?? 0);
    // Today's picks: untouched focus skills, other untouched skills, focus skills, then the least recently played
    const base = (id: string) => (focus.has(id) ? (untouched(id) ? 0 : 2) : untouched(id) ? 1 : 3);
    // a chosen direction fills Today's picks first, keeping the same order inside it
    const inTrack = (sk: { subject: string }) => !p.track || p.track === "mix" || sk.subject === p.track;
    const rank = (sk: { id: string; subject: string }) => base(sk.id) + (inTrack(sk) ? 0 : 10);
    const picks = skillsFor(p.age)
      .filter((sk) => visible.has(sk.subject) && shown(sk))
      .map((sk) => ({ sk, r: rank(sk), last: stats[sk.id]?.lastPlayed || "", today: stats[sk.id]?.lastPlayed === today() }))
      .filter((x) => !x.today)
      .sort((a, b) => a.r - b.r || a.last.localeCompare(b.last))
      .slice(0, 3)
      .map((x) => x.sk);

    return (
      <main className={`app map ${p.age === 6 ? "young" : ""}`}>
        {header}
        <div className="kid-bar">
          <button className="icon-btn" onClick={() => setScreen({ name: "home" })} aria-label={t("back", lang)}>←</button>
          <Avatar value={p.avatar} size={44} className="kid-avatar" />
          <b>{p.name}</b>
          <span className="pill">🔥 {streak(progress.days[p.id])}</span>
          <span className="pill"><Ico name="reward-coin" size={18} /> {progress.coins[p.id] ?? 0}</span>
          <button className="btn small track-btn" onClick={() => setScreen({ name: "setup", pid: p.id, start: "track" })} title="Change where to start">
            🧭 {TRACKS.find((x) => x.id === (p.track ?? "mix"))!.title}
          </button>
          <button className="btn small heroes-btn" onClick={() => setScreen({ name: "heroes", pid: p.id })}>
            {companionOf(p.id) ? <HeroPic hero={companionOf(p.id)!} size={26} /> : "🦸"} {t("heroes", lang)}{" "}
            {unlockedHeroes(progress.coins[p.id] ?? 0).length}/{HEROES.length}
          </button>
        </div>

        {nextHeroBar(p.id)}

        {!surveyDone && (
          <div className="banner">
            <span className="banner-text">
              <Ico name="pencil" size={36} /> {t("surveyMissing", lang)}
            </span>
            <button className="btn" onClick={() => setScreen({ name: "parent", pid: p.id, view: "survey" })}>
              {t("fillSurvey", lang)}
            </button>
          </div>
        )}

        <nav className="quick-nav" aria-label="Sections">
          {picks.length > 0 && (
            <a href="#sec-today" className={activeSection === "sec-today" ? "active" : ""} onClick={(e) => jump(e, "sec-today")}>
              <Ico name="reward-star" size={22} /> {t("navToday", lang)}
            </a>
          )}
          {visibleSubjects.map((s) => (
            <a
              key={s.id}
              href={`#sec-${s.id}`}
              className={activeSection === `sec-${s.id}` ? "active" : ""}
              style={{ "--c": s.color } as React.CSSProperties}
              onClick={(e) => jump(e, `sec-${s.id}`)}
            >
              <Ico name={s.img} size={22} /> {s.short[lang]}
            </a>
          ))}
          <button onClick={() => setScreen({ name: "heroes", pid: p.id })}>🦸 {t("heroes", lang)}</button>
        </nav>

        {picks.length > 0 && (
          <section className="picks nav-target" id="sec-today">
            <h2 className="with-ico">
              <Ico name="reward-star" size={32} /> {t("todayPlan", lang)}
              <span className="pill bonus-pill">
                <Ico name="reward-coin" size={16} /> {t("doubleCoins", lang)}
              </span>
            </h2>
            <div className="skills">
              {picks.map((sk) => {
                const subject = SUBJECTS.find((s) => s.id === sk.subject)!;
                return (
                  <button
                    key={sk.id}
                    className="skill pick"
                    style={{ "--c": subject.color } as React.CSSProperties}
                    onClick={() => startRound(p.id, sk.id, true)}
                  >
                    <span className="badge bonus">
                      <Ico name="reward-coin" size={14} /> ×2
                    </span>
                    {untouched(sk.id) && <span className="badge new">{t("newBadge", lang)}</span>}
                    <Ico name={subject.img} size={44} className="skill-ico" />
                    <span className="skill-title">{sk.icon} {sk.title[lang]}</span>
                    <span className="skill-sub">{subject.title[lang]}</span>
                    <span className="play">▶</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {visibleSubjects.map((s) => {
          const placed = progress.placement[p.id][s.id];
          return (
            <section key={s.id} id={`sec-${s.id}`} className="island nav-target" style={{ "--c": s.color } as React.CSSProperties}>
              <div className="island-head">
                <h2>
                  <Ico name={s.img} size={48} className="island-ico" /> {s.title[lang]}
                </h2>
                <button
                  className={`btn small ${placed ? "ghost" : "accent"}`}
                  title={t("placementHint", lang)}
                  onClick={() => setScreen({ name: "placement", pid: p.id, subject: s.id, key: Date.now() })}
                >
                  <Ico name="idea-lightbulb" size={20} /> {t("placement", lang)}
                  {placed ? " ✓" : ""}
                </button>
              </div>
              <div className="skills">
                {skillsFor(p.age, s.id).filter(shown).map((sk) => {
                  const st = stats[sk.id];
                  const level = st?.level ?? 1;
                  return (
                    <button key={sk.id} className="skill" onClick={() => startRound(p.id, sk.id)}>
                      {focus.has(sk.id) && <span className="badge">🎯 {t("focus", lang)}</span>}
                      {untouched(sk.id) && <span className="badge new">{t("newBadge", lang)}</span>}
                      <span className="skill-icon">{sk.icon}</span>
                      <span className="skill-title">{sk.title[lang]}</span>
                      <span className="stars">
                        {[1, 2, 3].map((i) => (
                          <span key={i} className={i <= (st?.bestStars ?? 0) ? "on" : ""}>★</span>
                        ))}
                      </span>
                      <span className="level" aria-label={`${t("level", lang)} ${level}`}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <i key={i} className={i <= level ? "on" : ""} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    );
  }

  // home
  const learners = progress.profiles.filter((p) => p.name);
  const freeSlot = progress.profiles.find((p) => !p.name);
  return (
    <main className="app">
      {header}
      <div className="hero">
        <picture>
          <source media="(max-width: 700px)" srcSet="/learn/images/hero-800.webp" />
          <img src="/learn/images/hero-1600.webp" alt="" width={1600} height={900} fetchPriority="high" />
        </picture>
      </div>
      {learners.length === 0 ? (
        <section className="card welcome">
          <h1>Learning games for kids 5–8</h1>
          <p>
            Short rounds of math, reading, words and puzzles. The games get easier or harder as your child plays, and every
            right answer earns coins for new hero friends.
          </p>
          <button className="btn primary big" onClick={() => setScreen({ name: "setup", pid: "kid6", start: "name" })}>
            Let&apos;s start →
          </button>
          <p className="setup-note">🔒 No account, no ads. Progress stays in this browser.</p>
        </section>
      ) : (
        <>
          <h1 className="home-title">{t("whoIsPlaying", lang)}</h1>
          <div className="profiles">
            {learners.map((p) => (
              <button key={p.id} className="profile card" onClick={() => setScreen({ name: "map", pid: p.id })}>
                <Avatar value={p.avatar} size={120} className="profile-avatar" />
                <span className="profile-name">{p.name}</span>
                <span className="profile-age">🧭 {TRACKS.find((x) => x.id === (p.track ?? "mix"))!.title}</span>
                <span className="row small">
                  <span className="pill">🔥 {streak(progress.days[p.id])}</span>
                  <span className="pill"><Ico name="reward-coin" size={18} /> {progress.coins[p.id] ?? 0}</span>
                </span>
              </button>
            ))}
            {freeSlot && (
              <button className="profile card add-learner" onClick={() => setScreen({ name: "setup", pid: freeSlot.id, start: "name" })}>
                <span className="add-plus" aria-hidden>＋</span>
                <span className="profile-name">Add a learner</span>
                <span className="profile-age">for a brother or sister</span>
              </button>
            )}
          </div>
        </>
      )}
      <button className="parent-link" onClick={() => setScreen({ name: "parent" })}>
        👨‍👩‍👧 {t("parent", lang)}
      </button>
      <footer className="app-footer">
        <a href="/learn/how-it-works/">How it works</a>
        <span aria-hidden="true">·</span>
        <a href="/">Kidtivity Lab: activities for kids</a>
      </footer>
    </main>
  );
}
