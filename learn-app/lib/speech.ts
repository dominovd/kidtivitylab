"use client";

/**
 * Speech via the browser's speechSynthesis, hardened against the usual Chrome issues:
 * - cancel() followed immediately by speak() is often silent, so we wait a moment after cancelling;
 * - voices load asynchronously, so we pick the voice at speak time;
 * - utterances can be garbage-collected mid-speech, so we keep references;
 * - repeated identical requests within a short window (React dev double effects) are ignored.
 */

type Part = { text: string; lang: string; rate?: number };

const supported = () => typeof window !== "undefined" && "speechSynthesis" in window;
const alive = new Set<SpeechSynthesisUtterance>();
let lastKey = "";
let lastAt = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

export function voicesFor(lang: string): SpeechSynthesisVoice[] {
  if (!supported()) return [];
  const want = lang.toLowerCase();
  const short = want.slice(0, 2);
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(short))
    .sort((a, b) => score(b, want) - score(a, want));
}

function score(v: SpeechSynthesisVoice, want: string) {
  let s = 0;
  if (v.lang.replace("_", "-").toLowerCase() === want) s += 4;
  if (/google|premium|enhanced|natural/i.test(v.name)) s += 2;
  if (v.localService) s += 1;
  return s;
}

function utter({ text, lang, rate }: Part) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate ?? 0.9;
  const v = voicesFor(lang)[0];
  if (v) u.voice = v;
  alive.add(u);
  u.onend = () => alive.delete(u);
  u.onerror = (e) => {
    alive.delete(u);
    if (e.error !== "canceled" && e.error !== "interrupted") console.warn("speech error:", e.error, lang);
  };
  return u;
}

/** Speaks the parts in order, replacing whatever is being said now. */
export function speakSeq(parts: Part[]) {
  if (!supported()) return;
  const list = parts.filter((p) => p.text && p.text.trim());
  if (!list.length) return;
  const key = list.map((p) => p.lang + p.text).join("|");
  const now = Date.now();
  if (key === lastKey && now - lastAt < 400) return;
  lastKey = key;
  lastAt = now;

  const synth = window.speechSynthesis;
  if (timer) clearTimeout(timer);
  const run = () => {
    timer = null;
    synth.resume();
    const utts = list.map(utter);
    // watchdog: if the browser never starts speaking, its speech engine is stuck
    let started = false;
    utts[0].addEventListener("start", () => {
      started = true;
      if (stuck) {
        stuck = false;
        stuckListeners.forEach((f) => f(false));
      }
    });
    setTimeout(() => {
      if (!started && alive.has(utts[0]) && !stuck) {
        stuck = true;
        stuckListeners.forEach((f) => f(true));
      }
    }, 3500);
    for (const u of utts) synth.speak(u);
  };
  if (synth.speaking || synth.pending) {
    synth.cancel();
    timer = setTimeout(run, 120);
  } else {
    run();
  }
}

let stuck = false;
const stuckListeners = new Set<(v: boolean) => void>();
/** Notifies when the browser's speech engine does not start speaking (a known Chrome/macOS hang). */
export function onSpeechStuck(f: (v: boolean) => void) {
  stuckListeners.add(f);
  return () => {
    stuckListeners.delete(f);
  };
}

export function speak(text: string, lang: string, opts: { rate?: number } = {}) {
  speakSeq([{ text, lang, rate: opts.rate }]);
}

export function stopSpeech() {
  if (!supported()) return;
  if (timer) clearTimeout(timer);
  window.speechSynthesis.cancel();
}

/** Browsers only allow audio after a user gesture: prime speech and audio on the first tap. */
export function primeAudioOnFirstGesture() {
  if (typeof window === "undefined") return;
  const prime = () => {
    try {
      ctx ??= new AudioContext();
      void ctx.resume();
    } catch {}
    window.removeEventListener("pointerdown", prime);
    window.removeEventListener("keydown", prime);
  };
  window.addEventListener("pointerdown", prime, { once: true });
  window.addEventListener("keydown", prime, { once: true });
  if (supported()) window.speechSynthesis.getVoices();
}

let ctx: AudioContext | null = null;

/** Short synthesized sound effects, no audio files. */
export function sfx(kind: "good" | "oops" | "win") {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
    const notes = kind === "good" ? [660, 880] : kind === "oops" ? [300, 240] : [523, 659, 784, 1046];
    notes.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = kind === "oops" ? "triangle" : "sine";
      o.frequency.value = f;
      const t = ctx!.currentTime + i * 0.11;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g).connect(ctx!.destination);
      o.start(t);
      o.stop(t + 0.2);
    });
  } catch {}
}
