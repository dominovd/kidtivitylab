"use client";

import { useState } from "react";
import { checkName, NAME_MAX } from "@/lib/names";
import { TRACKS, SUBJECTS, type TrackId } from "@/lib/skills";
import Ico from "./Ico";

const AVATARS = ["🐣", "🦊", "🐼", "🐯", "🐸", "🦄", "🐙", "🐻", "🐰", "🦁", "🐧", "🐨"];

type Props = {
  /** "name" starts from the beginning; "track" only changes the direction of an existing learner. */
  start: "name" | "track";
  initialName?: string;
  initialAvatar: string;
  initialTrack?: TrackId;
  onDone: (v: { name: string; avatar: string; track: TrackId }) => void;
  onCancel: () => void;
};

export default function Setup({ start, initialName = "", initialAvatar, initialTrack = "mix", onDone, onCancel }: Props) {
  const [step, setStep] = useState<"name" | "track">(start);
  const [raw, setRaw] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [track, setTrack] = useState<TrackId>(initialTrack);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initialName);

  if (step === "name") {
    return (
      <section className="card setup">
        <h1>Hi! What should we call you?</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const c = checkName(raw);
            if (!c.ok) return setError(c.reason);
            setName(c.name);
            setError(null);
            setStep("track");
          }}
        >
          <label className="setup-label" htmlFor="learner-name">
            First name or nickname
          </label>
          <input
            id="learner-name"
            className={`answer-input ${error ? "wrong" : ""}`}
            value={raw}
            maxLength={NAME_MAX + 4}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            placeholder="e.g. Mia"
            aria-describedby="name-note"
            aria-invalid={!!error}
            autoFocus
            onChange={(e) => {
              setRaw(e.target.value);
              if (error) setError(null);
            }}
          />
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <p className="setup-note" id="name-note">
            🔒 The name stays in this browser on this device. It is never sent anywhere. Grown-ups: a first name or a
            nickname is enough, please no last names.
          </p>

          <p className="setup-label">Pick a buddy</p>
          <div className="avatars setup-avatars" role="radiogroup" aria-label="Avatar">
            {AVATARS.map((a) => (
              <button
                type="button"
                key={a}
                role="radio"
                aria-checked={avatar === a}
                className={`avatar ${avatar === a ? "active" : ""}`}
                onClick={() => setAvatar(a)}
              >
                <span aria-hidden>{a}</span>
              </button>
            ))}
          </div>

          <div className="row">
            <button type="button" className="btn" onClick={onCancel}>
              Back
            </button>
            <button className="btn primary" disabled={!raw.trim()}>
              Next →
            </button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="setup-tracks">
      <h1 className="home-title">
        {name ? `${name}, what` : "What"} would you like to start with?
      </h1>
      <p className="setup-sub">
        You can play everything anytime. This just picks what comes first, and you can change it later.
      </p>
      <div className="tracks" role="radiogroup" aria-label="Where to start">
        {TRACKS.map((tr) => {
          const s = SUBJECTS.find((x) => x.id === tr.id);
          return (
            <button
              key={tr.id}
              role="radio"
              aria-checked={track === tr.id}
              className={`card track ${track === tr.id ? "active" : ""}`}
              style={{ "--c": s?.color ?? "var(--primary)" } as React.CSSProperties}
              onClick={() => setTrack(tr.id)}
            >
              {tr.recommended && <span className="badge new">Recommended</span>}
              <span className="track-head">
                {s ? <Ico name={s.img} size={44} /> : <Ico name="reward-star" size={44} />}
                <b>{tr.title}</b>
              </span>
              <span className="track-about">{tr.about}</span>
              <span className="track-examples" aria-hidden>
                {tr.examples.map((x) => (
                  <i key={x}>{x}</i>
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn" onClick={() => (start === "track" ? onCancel() : setStep("name"))}>
          Back
        </button>
        <button className="btn primary" onClick={() => onDone({ name, avatar, track })}>
          {start === "track" ? "Save" : "Let's go!"}
        </button>
      </div>
    </section>
  );
}
