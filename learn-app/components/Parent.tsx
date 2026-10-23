"use client";

import { useMemo, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { SUBJECTS, getSkill, skillsFor } from "@/lib/skills";
import { removeLearner, streak, today, useProgress, type ProfileId } from "@/lib/progress";
import { checkName, NAME_MAX } from "@/lib/names";
import Survey from "./Survey";
import { unlockedHeroes } from "@/lib/heroes";
import { FEEL_EMOJI, feelSignals } from "@/lib/feel";
import Avatar from "./Avatar";
import { speakSeq, voicesFor } from "@/lib/speech";

const AVATARS = ["🐣", "🦊", "🐼", "🐯", "🐸", "🦄", "🐙", "🐻", "🐰", "🦁", "🐧", "🐨"];

type Props = { lang: Lang; onBack: () => void; initialPid?: ProfileId; initialView?: "overview" | "survey" };

export default function Parent({ lang, onBack, initialPid, initialView = "overview" }: Props) {
  const { progress, update, replace } = useProgress();
  const learners = progress.profiles.filter((p) => p.name);
  const [gate] = useState(() => ({ a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4) }));
  const [gateInput, setGateInput] = useState("");
  const [open, setOpen] = useState(false);
  const [pid, setPid] = useState<ProfileId>(initialPid ?? learners[0]?.id ?? "kid6");
  const [view, setView] = useState<"overview" | "survey">(initialView);
  const fileRef = useRef<HTMLInputElement>(null);

  const profile = progress.profiles.find((p) => p.id === pid)!;
  const history = progress.history[pid];

  const last14 = useMemo(() => {
    const out: { d: string; label: string; n: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const d = dt.toLocaleDateString("sv-SE");
      out.push({ d, label: String(dt.getDate()), n: history.filter((h) => h.d === d).length });
    }
    return out;
  }, [history]);
  const maxN = Math.max(1, ...last14.map((x) => x.n));

  const acc = (days: number) => {
    const from = new Date();
    from.setDate(from.getDate() - days + 1);
    const f = from.toLocaleDateString("sv-SE");
    const hs = history.filter((h) => h.d >= f);
    const c = hs.reduce((s, h) => s + h.correct, 0);
    const n = hs.reduce((s, h) => s + h.total, 0);
    return n ? Math.round((c / n) * 100) + "%" : "–";
  };

  if (!open) {
    return (
      <section className="card gate">
        <h1>👨‍👩‍👧 {t("parent", lang)}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (Number(gateInput) === gate.a * gate.b) setOpen(true);
            else setGateInput("");
          }}
        >
          <p className="gate-q">
            {gate.a} × {gate.b} = ?
          </p>
          <input className="answer-input" inputMode="numeric" value={gateInput} onChange={(e) => setGateInput(e.target.value)} autoFocus />
          <div className="row">
            <button type="button" className="btn" onClick={onBack}>{t("back", lang)}</button>
            <button className="btn primary">OK</button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="parent">
      <div className="row between">
        <h1>{t("overview", lang)}</h1>
        <button className="btn" onClick={onBack}>← {t("back", lang)}</button>
      </div>
      <div className="sync-box off">
        <span>💾 {t("storageNote", lang)}</span>
      </div>

      {!profile.name ? (
        <p className="card muted">No learners yet. Add one on the start screen.</p>
      ) : (
      <>
      <div className="tabs">
        {learners.map((p) => (
          <button key={p.id} className={`tab ${p.id === pid ? "active" : ""}`} onClick={() => setPid(p.id)}>
            <Avatar value={p.avatar} size={24} /> {p.name}
          </button>
        ))}
      </div>

      <div className="tabs">
        <button className={`tab ${view === "overview" ? "active" : ""}`} onClick={() => setView("overview")}>📊 {t("overview", lang)}</button>
        <button className={`tab ${view === "survey" ? "active" : ""}`} onClick={() => setView("survey")}>
          📝 {t("survey", lang)} {progress.survey[pid].savedAt ? "✓" : "•"}
        </button>
      </div>

      {view === "survey" ? (
        <Survey key={pid} pid={pid} lang={lang} />
      ) : (
      <>
      <div className="kpis">
        <div className="card kpi"><b>🔥 {streak(progress.days[pid])}</b><span>{t("streak", lang)}</span></div>
        <div className="card kpi"><b>{history.length}</b><span>{t("rounds", lang)}</span></div>
        <div className="card kpi"><b>{acc(7)}</b><span>{t("accuracy", lang)} · 7d</span></div>
        <div className="card kpi"><b>{acc(30)}</b><span>{t("accuracy", lang)} · 30d</span></div>
      </div>

      <div className="card">
        <h2>{t("activity", lang)}</h2>
        <div className="bars">
          {last14.map((x) => (
            <div key={x.d} className="bar-col" title={`${x.d}: ${x.n}`}>
              <div className="bar" style={{ height: `${(x.n / maxN) * 100}%` }}>{x.n > 0 && <span>{x.n}</span>}</div>
              <small className={x.d === today() ? "today" : ""}>{x.label}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <table className="stats">
          <thead>
            <tr>
              <th title={t("showSkill", lang)}>👁</th>
              <th />
              <th>{t("level", lang)}</th>
              <th>★</th>
              <th>{t("accuracy", lang)}</th>
              <th>{t("rounds", lang)}</th>
              <th>{t("feelCol", lang)}</th>
              <th>{t("lastPlayed", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {SUBJECTS.filter((s) => skillsFor(profile.age, s.id).length > 0 && (!s.advanced || profile.advanced)).map((s) => (
              <SubjectRows key={s.id} title={`${s.icon} ${s.title[lang]}`}>
                {skillsFor(profile.age, s.id).map((sk) => {
                  const st = progress.stats[pid][sk.id];
                  const isHidden = !!profile.hidden?.includes(sk.id);
                  return (
                    <tr key={sk.id} className={`${st?.rounds ? "" : "muted"} ${isHidden ? "hidden-skill" : ""}`}>
                      <td>
                        <label className="show-toggle" title={t("showSkill", lang)}>
                          <input
                            type="checkbox"
                            checked={!isHidden}
                            onChange={(e) =>
                              update((p) => ({
                                ...p,
                                profiles: p.profiles.map((x) =>
                                  x.id === pid
                                    ? { ...x, hidden: e.target.checked ? (x.hidden ?? []).filter((h) => h !== sk.id) : [...(x.hidden ?? []), sk.id] }
                                    : x,
                                ),
                              }))
                            }
                          />
                        </label>
                      </td>
                      <td>{sk.icon} {sk.title[lang]}</td>
                      <td>{st ? `${st.level}/5` : "–"}</td>
                      <td>{st?.rounds ? "★".repeat(st.bestStars) || "·" : "–"}</td>
                      <td>{st?.attempts ? Math.round((st.correct / st.attempts) * 100) + "%" : t("notPlayed", lang)}</td>
                      <td>{st?.rounds ?? 0}</td>
                      <td className="feels">
                        {history
                          .filter((h) => h.skill === sk.id && h.feel)
                          .slice(0, 5)
                          .map((h) => FEEL_EMOJI[h.feel!])
                          .join("") || "–"}
                      </td>
                      <td>{st?.lastPlayed ?? "–"}</td>
                    </tr>
                  );
                })}
              </SubjectRows>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>💬 {t("kidSays", lang)}</h2>
        {(() => {
          const sig = feelSignals(history);
          if (!sig.length) return <p className="muted">{t("kidSaysEmpty", lang)}</p>;
          return (
            <ul className="signals">
              {sig.map((x) => {
                const sk = getSkill(x.skill);
                return (
                  <li key={x.skill} className={x.kind}>
                    <b>{sk ? `${sk.icon} ${sk.title[lang]}` : x.skill}</b>
                    <span>
                      {x.feels.map((f) => FEEL_EMOJI[f]).join("")} · {Math.round(x.accuracy * 100)}%
                    </span>
                    <small>{t(x.kind === "harder" ? "sigHarder" : x.kind === "support" ? "sigSupport" : "sigUnsure", lang)}</small>
                  </li>
                );
              })}
            </ul>
          );
        })()}
      </div>

      <div className="card">
        <h2>{t("recent", lang)}</h2>
        {history.length === 0 ? (
          <p className="muted">{t("noSessions", lang)}</p>
        ) : (
          <ul className="recent">
            {history.slice(0, 20).map((h, i) => {
              const sk = getSkill(h.skill);
              return (
                <li key={i}>
                  <span>{h.d}</span>
                  <span>{sk ? `${sk.icon} ${sk.title[lang]}` : h.skill}</span>
                  <b>
                    {h.correct}/{h.total} {h.feel ? FEEL_EMOJI[h.feel] : ""}
                  </b>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      </>
      )}

      <div className="card">
        <h2>{t("settings", lang)}</h2>
        <NameField
          key={pid}
          value={profile.name}
          onSave={(name) => update((p) => ({ ...p, profiles: p.profiles.map((x) => (x.id === pid ? { ...x, name } : x)) }))}
        />
        <label className="check">
          <input
            type="checkbox"
            checked={!!profile.advanced}
            onChange={(e) =>
              update((p) => ({ ...p, profiles: p.profiles.map((x) => (x.id === pid ? { ...x, advanced: e.target.checked } : x)) }))
            }
          />
          💡 {t("advancedToggle", lang)}
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={profile.voice !== false}
            onChange={(e) =>
              update((p) => ({ ...p, profiles: p.profiles.map((x) => (x.id === pid ? { ...x, voice: e.target.checked } : x)) }))
            }
          />
          🗣️ {t("voiceToggle", lang)}
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={profile.readAloud !== false}
            onChange={(e) =>
              update((p) => ({ ...p, profiles: p.profiles.map((x) => (x.id === pid ? { ...x, readAloud: e.target.checked } : x)) }))
            }
          />
          🔊 {t("readAloudToggle", lang)}
        </label>
        <SoundTest lang={lang} />
        <div className="avatars">
          {[...AVATARS, ...unlockedHeroes(progress.coins[pid] ?? 0).map((h) => `hero:${h.id}`)].map((a) => (
            <button
              key={a}
              className={`avatar ${profile.avatar === a ? "active" : ""}`}
              onClick={() => update((p) => ({ ...p, profiles: p.profiles.map((x) => (x.id === pid ? { ...x, avatar: a } : x)) }))}
            >
              <Avatar value={a} size={34} />
            </button>
          ))}
        </div>
        <div className="row wrap">
          <button
            className="btn"
            onClick={() => {
              const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `kids-learning-${today()}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            ⬇️ {t("exportData", lang)}
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>⬆️ {t("importData", lang)}</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                replace(JSON.parse(await f.text()));
              } catch {
                alert("JSON error");
              }
              e.target.value = "";
            }}
          />
          <button
            className="btn danger"
            onClick={() => {
              if (!confirm(t("resetConfirm", lang))) return;
              update((p) => ({
                ...p,
                stats: { ...p.stats, [pid]: {} },
                days: { ...p.days, [pid]: [] },
                coins: { ...p.coins, [pid]: 0 },
                history: { ...p.history, [pid]: [] },
              }));
            }}
          >
            🗑 {t("resetChild", lang)}
          </button>
          <button
            className="btn danger"
            onClick={() => {
              if (!confirm(`Remove ${profile.name} and all of their progress from this device?`)) return;
              const next = learners.find((x) => x.id !== pid);
              update((p) => removeLearner(p, pid));
              if (next) setPid(next.id);
              else onBack();
            }}
          >
            ✖ Remove learner
          </button>
        </div>
      </div>
      </>
      )}
    </section>
  );
}

function SubjectRows({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <tr className="subject-row">
        <td colSpan={8}>{title}</td>
      </tr>
      {children}
    </>
  );
}

function SoundTest({ lang }: { lang: Lang }) {
  const [voices, setVoices] = useState<string[] | null>(null);
  return (
    <div className="sound-test">
      <button
        className="btn small"
        onClick={() => {
          speakSeq([{ text: "Hello! I can talk. Apple, banana, cat.", lang: "en-US" }]);
          setVoices(voicesFor("en-US").slice(0, 3).map((v) => v.name));
        }}
      >
        🔈 {t("soundTest", lang)}
      </button>
      {voices && (
        <ul className="voices">
          <li className="muted">{t("voicesFound", lang)}:</li>
          <li>{voices.length ? `✓ English: ${voices.join(", ")}` : `✗ English: ${t("noVoice", lang)}`}</li>
        </ul>
      )}
    </div>
  );
}

function NameField({ value, onSave }: { value: string; onSave: (name: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const commit = () => {
    if (draft === value) return;
    const c = checkName(draft);
    if (!c.ok) return setError(c.reason);
    setError(null);
    setDraft(c.name);
    onSave(c.name);
  };
  return (
    <label className="field">
      Name (first name or nickname)
      <input
        value={draft}
        maxLength={NAME_MAX + 4}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => {
          setDraft(e.target.value);
          if (error) setError(null);
        }}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        aria-invalid={!!error}
      />
      {error && <span className="error" role="alert">{error}</span>}
    </label>
  );
}
