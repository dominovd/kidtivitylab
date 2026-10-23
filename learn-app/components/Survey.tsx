"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { SUBJECTS, getSkill } from "@/lib/skills";
import { ANSWER_LABEL, STAGE_TITLE, levelsFromSurvey, milestonesFor, type Answer } from "@/lib/assessment";
import { setLevels, today, useProgress, type ProfileId } from "@/lib/progress";
import Ico from "./Ico";
import Avatar from "./Avatar";

const CHOICES: (Answer | "unknown")[] = [2, 1, 0, "unknown"];

export default function Survey({ pid, lang }: { pid: ProfileId; lang: Lang }) {
  const { progress, update } = useProgress();
  const profile = progress.profiles.find((p) => p.id === pid)!;
  const [answers, setAnswers] = useState<Record<string, Answer>>(() => ({ ...progress.survey[pid].answers }));
  const [keepPlayed, setKeepPlayed] = useState(true);
  const [result, setResult] = useState<Record<string, number> | null>(null);

  const set = (id: string, v: Answer | "unknown") =>
    setAnswers((a) => {
      const next = { ...a };
      if (v === "unknown") delete next[id];
      else next[id] = v;
      return next;
    });

  const save = () => {
    const levels = levelsFromSurvey(profile.age, answers);
    update((p) =>
      setLevels({ ...p, survey: { ...p.survey, [pid]: { answers, savedAt: today() } } }, pid, levels, keepPlayed),
    );
    setResult(
      Object.fromEntries(
        Object.entries(levels).filter(([id]) => !(keepPlayed && (progress.stats[pid][id]?.rounds ?? 0) > 0)),
      ),
    );
  };

  return (
    <div className="survey">
      <div className="card">
        <h2 className="with-ico">
          <Ico name="pencil" size={36} /> <Avatar value={profile.avatar} size={32} /> {profile.name} · {STAGE_TITLE[profile.age][lang]}
        </h2>
        <p className="muted">{t("surveyIntro", lang)}</p>
        {progress.survey[pid].savedAt && (
          <p className="muted">
            ✓ {t("surveyDone", lang)}: {progress.survey[pid].savedAt}
          </p>
        )}
      </div>

      {SUBJECTS.map((s) => {
        const list = milestonesFor(profile.age, s.id);
        if (!list.length) return null;
        return (
          <div key={s.id} className="card survey-block" style={{ "--c": s.color } as React.CSSProperties}>
            <h2 className="with-ico">
              <Ico name={s.img} size={40} /> {s.title[lang]}
            </h2>
            {(["expected", "next"] as const).map((stage) => (
              <div key={stage}>
                <p className="stage-label">{stage === "expected" ? t("expectedNow", lang) : t("nextStep", lang)}</p>
                {list
                  .filter((x) => x.stage === stage)
                  .map((ms) => (
                    <div key={ms.id} className="milestone">
                      <span className="milestone-text">{ms.text[lang]}</span>
                      <div className="seg" role="radiogroup" aria-label={ms.text[lang]}>
                        {CHOICES.map((c) => {
                          const active = c === "unknown" ? answers[ms.id] === undefined : answers[ms.id] === c;
                          return (
                            <button
                              key={String(c)}
                              role="radio"
                              aria-checked={active}
                              className={`seg-btn a${c} ${active ? "active" : ""}`}
                              onClick={() => set(ms.id, c)}
                            >
                              {ANSWER_LABEL[c][lang]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        );
      })}

      <div className="card">
        <label className="check">
          <input type="checkbox" checked={keepPlayed} onChange={(e) => setKeepPlayed(e.target.checked)} />
          {t("keepPlayed", lang)}
        </label>
        <button className="btn primary" onClick={save}>
          {t("saveSurvey", lang)}
        </button>
        {result && (
          <div className="survey-result">
            <h2>✓ {t("surveySaved", lang)}</h2>
            <ul>
              {Object.entries(result).map(([id, lvl]) => {
                const sk = getSkill(id);
                return sk ? (
                  <li key={id}>
                    <span>
                      {sk.icon} {sk.title[lang]}
                    </span>
                    <b>
                      {t("level", lang)} {lvl}
                    </b>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
