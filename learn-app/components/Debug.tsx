"use client";

import { useEffect, useMemo, useState } from "react";
import Round, { Clock, FractionPic, Shape } from "./Round";
import { ROUND_SIZE, SKILLS, SUBJECTS } from "@/lib/skills";
import { questionKey } from "@/lib/picker";
import { taskSpeech } from "@/lib/say";
import { LANGS, type Lang } from "@/lib/i18n";
import type { Age, Question, Skill, SubjectId } from "@/lib/engine";

const KIND: Record<Question["kind"], string> = { choice: "выбор", input: "ввод", order: "порядок слов" };
const LEVELS = [1, 2, 3, 4, 5];

/** Distinct tasks for one skill and level. */
function samples(skill: Skill, level: number, lang: Lang, n: number): Question[] {
  const out: Question[] = [];
  const keys = new Set<string>();
  for (let i = 0; i < n * 30 && out.length < n; i++) {
    const q = skill.gen(level, lang);
    const k = questionKey(q);
    if (!keys.has(k)) {
      keys.add(k);
      out.push(q);
    }
  }
  return out;
}

/** How many different tasks and answers a skill can produce at a level (from 400 tries). */
function poolStats(skill: Skill, level: number, lang: Lang) {
  const tasks = new Set<string>();
  const answers = new Set<string>();
  for (let i = 0; i < 400; i++) {
    const q = skill.gen(level, lang);
    tasks.add(questionKey(q));
    answers.add(q.answer);
  }
  return { tasks: tasks.size, answers: answers.size, round: ROUND_SIZE[skill.age] };
}

/** Problems a generated task should never have. */
function problems(q: Question): string[] {
  const p: string[] = [];
  if (q.kind === "choice") {
    if (!q.options?.length) p.push("нет вариантов");
    else {
      if (!q.options.includes(q.answer)) p.push("правильного ответа нет среди вариантов");
      if (new Set(q.options).size !== q.options.length) p.push("варианты повторяются");
    }
  }
  const words = (x: string) => x.split(/\s+/).sort().join(" ");
  if (q.kind === "order" && words((q.tokens ?? []).join(" ")) !== words(q.answer)) p.push("слова не совпадают с ответом");
  if (/NaN|undefined/.test(JSON.stringify(q))) p.push("NaN или undefined в задании");
  return p;
}

export default function Debug() {
  const [age, setAge] = useState<Age>(6);
  const [lang, setLang] = useState<Lang>("en");
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const [level, setLevel] = useState(1); // 0 = all levels
  const [count, setCount] = useState(4);
  const [query, setQuery] = useState("");
  const [seed, setSeed] = useState(0);
  const [reseed, setReseed] = useState<Record<string, number>>({});
  const [play, setPlay] = useState<{ skill: Skill; level: number; key: number } | null>(null);
  const [last, setLast] = useState<string | null>(null);
  // tasks are random: generate them only in the browser, never in the server-rendered HTML
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const skills = useMemo(() => {
    const qq = query.trim().toLowerCase();
    return SKILLS.filter(
      (s) =>
        s.age === age &&
        (subject === "all" || s.subject === subject) &&
        (!qq || s.id.toLowerCase().includes(qq) || Object.values(s.title).some((x) => x.toLowerCase().includes(qq))),
    );
  }, [age, subject, query]);

  const levels = level === 0 ? LEVELS : [level];

  // generated once per filter change or 🔄 press
  const data = useMemo(
    () =>
      (mounted ? skills : []).map((s) => ({
        skill: s,
        rows: levels.map((lv) => ({ level: lv, qs: samples(s, lv, lang, count), stats: poolStats(s, lv, lang) })),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mounted, skills, level, lang, count, seed, reseed],
  );
  const totalProblems = data.reduce((n, d) => n + d.rows.reduce((m, r) => m + r.qs.filter((q) => problems(q).length).length, 0), 0);

  if (play) {
    return (
      <main className="app playing">
        <Round
          key={play.key}
          label={`🛠️ Отладка · ${play.skill.title[lang]} · уровень ${play.level} · прогресс не сохраняется`}
          ask={() => play.skill.gen(play.level, lang)}
          size={ROUND_SIZE[play.skill.age]}
          lang={lang}
          young={play.skill.age === 6}
          sound
          onExit={() => setPlay(null)}
          onFinish={(r) => {
            setLast(`${play.skill.icon} ${play.skill.title[lang]}, уровень ${play.level}: ${r.filter(Boolean).length} из ${r.length}`);
            setPlay(null);
          }}
        />
      </main>
    );
  }

  return (
    <main className="app dbg">
      <header className="dbg-bar">
        <div className="dbg-title">
          <a href="/" className="btn small">← К приложению</a>
          <h1>🛠️ Режим отладки</h1>
        </div>
        <div className="dbg-controls">
          <div className="tabs">
            {([6, 11] as Age[]).map((a) => (
              <button key={a} className={`tab ${age === a ? "active" : ""}`} onClick={() => setAge(a)}>
                {a === 6 ? "Марія, 6 лет" : "Лев, 11 лет"}
              </button>
            ))}
          </div>
          <select value={subject} onChange={(e) => setSubject(e.target.value as SubjectId | "all")} aria-label="Предмет">
            <option value="all">Все предметы</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.title.uk}
              </option>
            ))}
          </select>
          <div className="tabs" role="radiogroup" aria-label="Уровень">
            {[0, ...LEVELS].map((lv) => (
              <button key={lv} className={`tab ${level === lv ? "active" : ""}`} onClick={() => setLevel(lv)}>
                {lv === 0 ? "Все уровни" : `Ур. ${lv}`}
              </button>
            ))}
          </div>
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} aria-label="Заданий на уровень">
            {[2, 4, 8, 12].map((n) => (
              <option key={n} value={n}>
                по {n} заданий
              </option>
            ))}
          </select>
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="Язык">
            {LANGS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
          <input className="dbg-search" placeholder="Поиск навыка" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn small" onClick={() => setSeed((x) => x + 1)}>
            🔄 Новые задания
          </button>
        </div>
        <p className="muted dbg-summary">
          {skills.length} навыков · {totalProblems ? `⚠️ заданий с ошибками: ${totalProblems}` : "✓ ошибок в показанных заданиях нет"}
          {last && <> · последний пробный раунд: {last}</>}
        </p>
      </header>

      {data.map(({ skill, rows }) => {
        const subj = SUBJECTS.find((s) => s.id === skill.subject)!;
        return (
          <section key={skill.id} className="dbg-skill" style={{ "--c": subj.color } as React.CSSProperties}>
            <div className="dbg-skill-head">
              <h2>
                {skill.icon} {skill.title[lang]} <code>{skill.id}</code>
              </h2>
              <span className="muted">{subj.title[lang]}</span>
              <button className="btn small" onClick={() => setReseed((r) => ({ ...r, [skill.id]: (r[skill.id] ?? 0) + 1 }))}>
                🔄
              </button>
            </div>
            {rows.map(({ level: lv, qs, stats }) => (
              <div key={lv} className="dbg-row">
                <div className="dbg-row-head">
                  <b>Уровень {lv}</b>
                  <span className={stats.tasks < stats.round * 2 ? "warn" : "muted"}>
                    разных заданий: {stats.tasks >= 400 ? "400+" : stats.tasks} · разных ответов: {stats.answers}
                  </span>
                  <button className="btn small primary" onClick={() => setPlay({ skill, level: lv, key: Date.now() })}>
                    ▶ Пройти раунд
                  </button>
                </div>
                <div className="dbg-cards">
                  {qs.map((q, i) => (
                    <TaskCard key={i} q={q} lang={lang} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </main>
  );
}

function TaskCard({ q, lang }: { q: Question; lang: Lang }) {
  const issues = problems(q);
  const said = taskSpeech(q, lang, false)
    .map((p) => p.text)
    .join(" · ");
  return (
    <div className={`dbg-card ${issues.length ? "bad" : ""}`}>
      <div className="dbg-tags">
        <span>{KIND[q.kind]}</span>
        {q.inputMode && q.kind === "input" && <span>{q.inputMode === "numeric" ? "цифры" : q.inputMode === "decimal" ? "дробь" : "текст"}</span>}
        {q.memorize && <span>запомнить {(q.memorize.ms / 1000).toFixed(1)} с</span>}
        {q.optionSpeech && <span>🔊 на вариантах</span>}
      </div>
      <p className="dbg-prompt">{q.prompt}</p>
      {q.memorize && <div className="dbg-visual">👀 {q.memorize.show}</div>}
      {q.passage && <p className="dbg-passage">{q.passage}</p>}
      {q.visual && <div className="dbg-visual">{q.visual}</div>}
      {q.shape && (
        <div className="dbg-pic">
          <Shape id={q.shape} />
        </div>
      )}
      {q.digital && <div className="dbg-visual"><span className="lcd small">{q.digital}</span></div>}
      {q.fraction && (
        <div className="dbg-pic">
          <FractionPic {...q.fraction} />
        </div>
      )}
      {q.clock && (
        <div className="dbg-pic">
          <Clock h={q.clock.h} m={q.clock.m} />
        </div>
      )}
      {q.grid && (
        <div className="dbg-grid" style={{ gridTemplateColumns: `repeat(${q.grid.length}, 1fr)` }}>
          {q.grid.flat().map((c, i) => (
            <span key={i}>{c || "·"}</span>
          ))}
        </div>
      )}
      {q.kind === "order" && <p className="dbg-tokens">{q.tokens?.join(" / ")}</p>}
      {q.kind === "choice" ? (
        <div className="dbg-options">
          {q.options?.map((o) => (
            <span key={o} className={o === q.answer ? "right" : ""}>
              {o === q.answer ? "✓ " : ""}
              {q.clockOptions ? `🕒 ${o}` : o}
            </span>
          ))}
        </div>
      ) : (
        <p className="dbg-answer">✓ {q.answer}</p>
      )}
      <p className="dbg-say">
        🔊 {said}
        {q.answerSpeech ? ` → после ответа: ${q.answerSpeech.text}` : ""}
      </p>
      {issues.map((x) => (
        <p key={x} className="dbg-issue">
          ⚠️ {x}
        </p>
      ))}
    </div>
  );
}
