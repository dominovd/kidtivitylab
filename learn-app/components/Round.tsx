"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Question } from "@/lib/engine";
import { speechLang } from "@/lib/engine";
import { t, type Lang } from "@/lib/i18n";
import { onSpeechStuck, speakSeq, sfx, stopSpeech } from "@/lib/speech";
import { taskSpeech } from "@/lib/say";
import { encourage, praise } from "@/lib/praise";
import { newPickState, pickQuestion, questionKey, recentQuestions, registerQuestion, rememberQuestion, type PickState } from "@/lib/picker";
import Ico from "./Ico";

type Props = {
  /** Builds question `index`; `results` holds right/wrong for earlier questions. */
  ask: (index: number, results: boolean[]) => Question;
  size: number;
  /** Optional label above the progress dots (e.g. placement check). */
  label?: string;
  lang: Lang;
  young: boolean;
  sound: boolean;
  /** Say a praise or encouragement phrase aloud after each answer. */
  voice?: boolean;
  /** Read every task aloud when it appears. */
  readAloud?: boolean;
  /** Hero companion shown in the corner. */
  companion?: React.ReactNode;
  /** Remembers tasks between rounds under this key (e.g. child + skill) to avoid repeats. */
  memoryKey?: string;
  onFinish: (results: boolean[]) => void;
  onExit: () => void;
};

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[’`]/g, "'").replace(/(\d),(\d)/g, "$1.$2");

function isCorrect(q: Question, value: string) {
  if (q.inputMode === "decimal") {
    const v = parseFloat(norm(value));
    return !Number.isNaN(v) && Math.abs(v - parseFloat(q.answer)) < 1e-9;
  }
  return norm(value) === norm(q.answer);
}

export default function Round({ ask, size, label, lang, young, sound, voice = true, readAloud = true, companion, memoryKey, onFinish, onExit }: Props) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const correct = results.filter(Boolean).length;
  const pick = useRef<PickState | null>(null);
  if (!pick.current) pick.current = newPickState(recentQuestions(memoryKey));
  const [q, setQ] = useState<Question>(() => pickQuestion(() => ask(0, []), pick.current!));
  const [phase, setPhase] = useState<"memorize" | "answer" | "feedback">(q.memorize ? "memorize" : "answer");
  const [picked, setPicked] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<number[]>([]);
  const [combo, setCombo] = useState(0);
  const [phrase, setPhrase] = useState("");
  const [speechStuck, setSpeechStuck] = useState(false);
  useEffect(() => onSpeechStuck(setSpeechStuck), []);
  const inputRef = useRef<HTMLInputElement>(null);
  // Each shown task is counted once (React dev mode runs effects twice)
  const registered = useRef<Question | null>(null);
  useEffect(() => {
    if (registered.current === q) return;
    registered.current = q;
    registerQuestion(q, pick.current!);
    rememberQuestion(memoryKey, questionKey(q));
  }, [q, memoryKey]);

  const newQuestion = (i: number, res: boolean[]) => pickQuestion(() => ask(i, res), pick.current!);

  // Auto voice-over: prompts for young kids, listening tasks for everyone
  useEffect(() => {
    if (phase !== "answer" && phase !== "memorize") return;
    if (phase === "memorize" && !young) return;
    if (phase === "memorize") {
      if (sound && readAloud) speakSeq([{ text: q.prompt, lang: speechLang[lang] }]);
      return;
    }
    if (sound && (readAloud || young)) speakSeq(taskSpeech(q, lang, false));
    else if (q.speak?.auto) speakSeq([{ text: q.speak.text, lang: q.speak.lang }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, phase]);

  useEffect(() => {
    if (phase !== "memorize" || !q.memorize) return;
    const id = setTimeout(() => setPhase("answer"), q.memorize.ms);
    return () => clearTimeout(id);
  }, [phase, q]);

  useEffect(() => {
    if (phase === "answer" && q.kind === "input") inputRef.current?.focus();
  }, [phase, q]);

  const orderText = useMemo(() => order.map((i) => q.tokens![i]).join(" "), [order, q]);

  const submit = (value: string) => {
    if (phase !== "answer") return;
    const ok = isCorrect(q, value);
    setPicked(value);
    setPhase("feedback");
    setResults((r) => [...r, ok]);
    const newCombo = ok ? combo + 1 : 0;
    setCombo(newCombo);
    const line = ok ? praise(lang, newCombo) : encourage(lang);
    setPhrase(line);
    if (!sound) return;
    sfx(ok ? "good" : "oops");
    // the word itself first (English pronunciation), then the phrase
    const word = q.answerSpeech ?? (q.kind === "order" ? q.speak : undefined);
    speakSeq([...(word ? [word] : []), ...(voice ? [{ text: line, lang: speechLang[lang], rate: 1 }] : [])]);
  };

  const next = () => {
    if (index + 1 >= size) {
      onFinish(results);
      return;
    }
    const nq = newQuestion(index + 1, results);
    setIndex((i) => i + 1);
    setQ(nq);
    setPicked(null);
    setInput("");
    setOrder([]);
    setPhase(nq.memorize ? "memorize" : "answer");
  };

  const isRight = picked !== null && isCorrect(q, picked);
  const shownAnswer = q.inputMode === "decimal" && lang !== "en" ? q.answer.replace(".", ",") : q.answer;

  return (
    <div className={`round ${young ? "young" : ""}`}>
      {label && <p className="round-label">{label}</p>}
      {speechStuck && sound && <p className="speech-stuck">🔇 {t("speechStuck", lang)}</p>}
      {companion && <div className={`companion ${phase === "feedback" ? (isRight ? "happy" : "hug") : ""}`}>{companion}</div>}
      <div className="round-top">
        <button
          className="icon-btn"
          onClick={() => {
            stopSpeech();
            onExit();
          }}
          aria-label={t("back", lang)}
        >
          ✕
        </button>
        <div className="dots" aria-label={`${t("question", lang)} ${index + 1} ${t("of", lang)} ${size}`}>
          {Array.from({ length: size }, (_, i) => (
            <span key={i} className={results[i] === true ? "right" : results[i] === false ? "wrong" : i === index ? "now" : ""} />
          ))}
        </div>
        <div className="coins"><Ico name="reward-coin" size={24} /> {correct}</div>
      </div>

      <div className="prompt-row">
        <p className="prompt">{q.prompt}</p>
        <button
          className="repeat-btn"
          aria-label={t("repeat", lang)}
          onClick={() => speakSeq(taskSpeech(q, lang, phase === "feedback"))}
        >
          🔊 <span>{t("repeat", lang)}</span>
        </button>
      </div>

      {phase === "memorize" && q.memorize ? (
        <div className="scene memorize">
          <p className="memo-label">{t("remember", lang)}</p>
          <div className="memo">{q.memorize.show}</div>
          <button className="btn ghost" onClick={() => setPhase("answer")}>{t("ready", lang)}</button>
        </div>
      ) : (
        <>
          {q.passage && <div className="passage">{q.passage}</div>}
          {q.visual && <div className={`scene ${q.visual.length > 24 ? "small" : ""}`}>{q.visual}</div>}
          {q.digital && (
            <div className="scene">
              <span className="lcd">{q.digital}</span>
            </div>
          )}
          {q.clock && (
            <div className="scene">
              <Clock h={q.clock.h} m={q.clock.m} />
            </div>
          )}
          {q.grid && (
            <div className="scene">
              <div className="grid" style={{ gridTemplateColumns: `repeat(${q.grid.length}, 1fr)` }}>
                {q.grid.flat().map((c, i) => (
                  <span key={i} className={`cell ${c === "❓" ? "target" : c ? "" : "empty"}`}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {q.fraction && (
            <div className="scene">
              <FractionPic {...q.fraction} />
            </div>
          )}
          {q.shape && (
            <div className="scene">
              <Shape id={q.shape} />
            </div>
          )}

          {q.kind === "choice" && (
            <div className={`options ${q.emojiOptions ? "emoji" : ""} n${q.options!.length}`}>
              {q.options!.map((o) => {
                const state =
                  phase === "feedback" ? (norm(o) === norm(q.answer) ? "right" : o === picked ? "wrong" : "dim") : "";
                const [oh, om] = q.clockOptions ? o.split(":").map(Number) : [0, 0];
                const btn = (
                  <button key={o} className={`opt ${state} ${q.clockOptions ? "clock-opt" : ""}`} disabled={phase === "feedback"} onClick={() => submit(o)} aria-label={o}>
                    {q.clockOptions ? <Clock h={oh} m={om} /> : o}
                  </button>
                );
                if (!q.optionSpeech) return btn;
                return (
                  <div key={o} className="opt-wrap">
                    {btn}
                    <button
                      className="opt-say"
                      aria-label={`${t("listen", lang)}: ${o}`}
                      onClick={() => speakSeq([{ text: o, lang: q.optionSpeech! }])}
                    >
                      🔊
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {q.kind === "input" && (
            <form
              className="input-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) submit(input);
              }}
            >
              <input
                ref={inputRef}
                className={`answer-input ${phase === "feedback" ? (isRight ? "right" : "wrong") : ""}`}
                inputMode={q.inputMode === "numeric" ? "numeric" : q.inputMode === "decimal" ? "decimal" : "text"}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={t("typeAnswer", lang)}
                value={input}
                disabled={phase === "feedback"}
                onChange={(e) =>
                  setInput(
                    q.inputMode === "numeric"
                      ? e.target.value.replace(/[^\d-]/g, "")
                      : q.inputMode === "decimal"
                        ? e.target.value.replace(/[^\d.,-]/g, "")
                        : e.target.value,
                  )
                }
              />
              {phase === "answer" && (
                <button className="btn primary" type="submit" disabled={!input.trim()}>
                  {t("check", lang)}
                </button>
              )}
            </form>
          )}

          {q.kind === "order" && (
            <div className="order">
              <div className={`order-line ${phase === "feedback" ? (isRight ? "right" : "wrong") : ""}`}>
                {order.length ? (
                  order.map((i, k) => (
                    <button key={k} className="token placed" disabled={phase === "feedback"} onClick={() => setOrder(order.filter((_, j) => j !== k))}>
                      {q.tokens![i]}
                    </button>
                  ))
                ) : (
                  <span className="order-hint">…</span>
                )}
              </div>
              <div className="order-pool">
                {q.tokens!.map((tok, i) => (
                  <button key={i} className="token" disabled={order.includes(i) || phase === "feedback"} onClick={() => setOrder([...order, i])}>
                    {tok}
                  </button>
                ))}
              </div>
              {phase === "answer" && (
                <button className="btn primary" disabled={order.length !== q.tokens!.length} onClick={() => submit(orderText)}>
                  {t("check", lang)}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {phase === "feedback" && (
        <div className={`feedback ${isRight ? "good" : "oops"}`} role="status">
          <div className="feedback-text">
            {isRight ? (
              <>
                <b>✓ {phrase || t("correct", lang)}</b>
                {combo >= 3 && <span className="combo"> 🔥×{combo}</span>}
              </>
            ) : (
              <>
                <b>{phrase}</b>
                <br />
                {t("wrong", lang)} <span className="right-answer">{shownAnswer}</span>
              </>
            )}
          </div>
          <button className="btn primary" onClick={next} autoFocus>
            {index + 1 >= size ? t("finish", lang) : t("next", lang)} →
          </button>
        </div>
      )}
      {isRight && combo >= 3 && combo % 3 === 0 && <Confetti key={index} />}
    </div>
  );
}

function Confetti() {
  const bits = useMemo(
    () => Array.from({ length: 24 }, (_, i) => ({ left: Math.random() * 100, delay: Math.random() * 0.3, e: ["🎉", "⭐", "✨", "🎈"][i % 4] })),
    [],
  );
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => (
        <span key={i} style={{ left: `${b.left}%`, animationDelay: `${b.delay}s` }}>{b.e}</span>
      ))}
    </div>
  );
}

const SHAPE_PATHS: Record<NonNullable<Question["shape"]>, React.ReactNode> = {
  circle: <circle cx="60" cy="60" r="48" />,
  oval: <ellipse cx="60" cy="60" rx="54" ry="34" />,
  square: <rect x="14" y="14" width="92" height="92" rx="4" />,
  rectangle: <rect x="4" y="28" width="112" height="64" rx="4" />,
  triangle: <polygon points="60,10 112,104 8,104" />,
  rhombus: <polygon points="60,6 110,60 60,114 10,60" />,
  pentagon: <polygon points="60,8 112,46 92,108 28,108 8,46" />,
  hexagon: <polygon points="32,12 88,12 116,60 88,108 32,108 4,60" />,
};

export function Shape({ id }: { id: NonNullable<Question["shape"]> }) {
  return (
    <svg viewBox="0 0 120 120" width="140" height="140" className="shape" aria-hidden>
      {SHAPE_PATHS[id]}
    </svg>
  );
}

export function Clock({ h, m }: { h: number; m: number }) {
  const minuteAngle = m * 6;
  const hourAngle = (h % 12) * 30 + m * 0.5;
  const hand = (angle: number, len: number, width: number, cls: string) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return <line x1="60" y1="60" x2={60 + len * Math.cos(rad)} y2={60 + len * Math.sin(rad)} strokeWidth={width} strokeLinecap="round" className={cls} />;
  };
  return (
    <svg viewBox="0 0 120 120" width="180" height="180" className="clock" aria-hidden>
      <circle cx="60" cy="60" r="56" className="face" />
      {Array.from({ length: 60 }, (_, i) => {
        const rad = ((i * 6 - 90) * Math.PI) / 180;
        const r1 = i % 5 === 0 ? 47 : 51;
        return <line key={i} x1={60 + r1 * Math.cos(rad)} y1={60 + r1 * Math.sin(rad)} x2={60 + 54 * Math.cos(rad)} y2={60 + 54 * Math.sin(rad)} className={i % 5 === 0 ? "tick big" : "tick"} />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const rad = ((n * 30 - 90) * Math.PI) / 180;
        return (
          <text key={n} x={60 + 38 * Math.cos(rad)} y={60 + 38 * Math.sin(rad) + 4} textAnchor="middle" className="num">
            {n}
          </text>
        );
      })}
      {hand(hourAngle, 26, 5, "hour")}
      {hand(minuteAngle, 40, 3, "minute")}
      <circle cx="60" cy="60" r="3.5" className="pin" />
    </svg>
  );
}

/** A circle cut into sectors or a square cut into strips, the first `shaded` parts filled. */
export function FractionPic({ parts, shaded, shape, start = 0 }: { parts: number; shaded: number; shape: "circle" | "square"; start?: number }) {
  const pieces = Array.from({ length: parts }, (_, i) => {
    const on = (i - start + parts) % parts < shaded;
    if (shape === "square") {
      const w = 100 / parts;
      return <rect key={i} x={10 + i * w} y={10} width={w} height={100} className={on ? "frac-on" : "frac-off"} />;
    }
    if (parts === 1) return <circle key={i} cx="60" cy="60" r="50" className={on ? "frac-on" : "frac-off"} />;
    const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
    const [x0, y0, x1, y1] = [60 + 50 * Math.cos(a0), 60 + 50 * Math.sin(a0), 60 + 50 * Math.cos(a1), 60 + 50 * Math.sin(a1)];
    return <path key={i} d={`M60 60 L${x0} ${y0} A50 50 0 ${parts === 2 ? 0 : 0} 1 ${x1} ${y1} Z`} className={on ? "frac-on" : "frac-off"} />;
  });
  return (
    <svg viewBox="0 0 120 120" width="150" height="150" className="fraction" aria-hidden>
      {pieces}
    </svg>
  );
}
