"use client";

/**
 * Pre-recorded voice (ElevenLabs clips in public/audio/en, see scripts/tts).
 * A line is played from one whole clip, or stitched from text segments and number atoms
 * with the silence trimmed. Anything not covered returns null, and the caller falls back
 * to the browser's speech engine.
 */
import { numberKey, numberVariant, phraseKey, splitForSpeech } from "./voice-keys";

const BASE = "/learn/audio/en/";
/** Pauses after a piece: inside a sentence ("There are | 4 | apples"), inside math ("4 | plus | 6"), after a sentence, between lines. */
const GAP_WORD = 0.06;
const GAP_MATH = 0.14;
const GAP_SENTENCE = 0.38;
const GAP_LINE = 0.5;
/** Amplitude treated as silence when trimming clip edges (low, so soft endings like "-s" and "-t" survive). */
const SILENCE = 0.006;
const PAD = 0.03;
/** Loudness every clip is brought to, so stitched pieces don't jump in volume. */
const TARGET_RMS = 0.085;

export type Piece = { file: string; gap: number };

let items: Record<string, string> | null = null;
let loading: Promise<void> | null = null;

export function loadVoice() {
  if (typeof window === "undefined") return Promise.resolve();
  loading ??= fetch(`${BASE}manifest.json`)
    .then((r) => (r.ok ? r.json() : null))
    .then((m) => {
      items = m?.items ?? null;
    })
    .catch(() => {});
  return loading;
}

/** Clips for one line with the pause after each, or null when some piece has no recording. */
export function planLine(text: string): Piece[] | null {
  if (!items) return null;
  const whole = items[phraseKey(text)];
  if (whole) return [{ file: whole, gap: 0 }];
  const parts = splitForSpeech(text);
  if (!parts.length) return null;
  const out: Piece[] = [];
  for (const [i, p] of parts.entries()) {
    let f: string | undefined;
    let gap: number;
    if (p.kind === "num") {
      const v = numberVariant(parts, i);
      f = items[numberKey(p.value, v)] ?? items[numberKey(p.value, v === "end" ? "mid" : "end")] ?? items[numberKey(p.value, "mid")];
      gap = p.sentenceEnd ? GAP_SENTENCE : v === "word" ? GAP_WORD : GAP_MATH;
    } else {
      f = items[phraseKey(p.value)];
      const nextNum = parts[i + 1]?.kind === "num" ? numberVariant(parts, i + 1) : null;
      gap = p.sentenceEnd ? GAP_SENTENCE : nextNum === "word" ? GAP_WORD : GAP_MATH;
    }
    if (!f) return null;
    out.push({ file: f, gap });
  }
  out[out.length - 1].gap = 0;
  return out;
}

const cache = new Map<string, Promise<AudioBuffer | null>>();

/** Cuts silence at both ends, evens out loudness and adds 5 ms fades so joins don't click. */
function trim(ctx: AudioContext, buf: AudioBuffer): AudioBuffer {
  const data = buf.getChannelData(0);
  let a = 0;
  let b = data.length - 1;
  while (a < b && Math.abs(data[a]) < SILENCE) a++;
  while (b > a && Math.abs(data[b]) < SILENCE) b--;
  const pad = Math.round(PAD * buf.sampleRate);
  a = Math.max(0, a - pad);
  b = Math.min(data.length - 1, b + pad);
  const len = b - a + 1;
  let sum = 0;
  for (let i = a; i <= b; i++) sum += data[i] * data[i];
  const rms = Math.sqrt(sum / Math.max(1, len));
  const gain = rms > 0 ? Math.min(1.6, Math.max(0.6, TARGET_RMS / rms)) : 1;
  const fade = Math.min(Math.round(0.005 * buf.sampleRate), Math.floor(len / 4));
  const out = ctx.createBuffer(buf.numberOfChannels, len, buf.sampleRate);
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const src = buf.getChannelData(c).subarray(a, b + 1);
    const dst = out.getChannelData(c);
    for (let i = 0; i < len; i++) {
      const env = i < fade ? i / fade : i > len - 1 - fade ? (len - 1 - i) / fade : 1;
      dst[i] = Math.max(-1, Math.min(1, src[i] * gain * env));
    }
  }
  return out;
}

function clip(ctx: AudioContext, file: string) {
  let p = cache.get(file);
  if (!p) {
    p = fetch(BASE + file)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((data) => ctx.decodeAudioData(data))
      .then((buf) => trim(ctx, buf))
      .catch(() => null);
    cache.set(file, p);
  }
  return p;
}

let playing: AudioBufferSourceNode[] = [];
let turn = 0;

export function stopVoice() {
  turn++;
  for (const s of playing) {
    try {
      s.stop();
    } catch {}
  }
  playing = [];
}

/** Plays the lines one after another. Resolves false if a clip failed to load (nothing was played). */
export async function playLines(ctx: AudioContext, lines: Piece[][]): Promise<boolean> {
  stopVoice();
  const mine = turn;
  const bufs = await Promise.all(lines.map((line) => Promise.all(line.map((p) => clip(ctx, p.file)))));
  if (mine !== turn) return true; // replaced by a newer line meanwhile
  if (bufs.some((line) => line.some((b) => !b))) return false;
  void ctx.resume();
  let at = ctx.currentTime + 0.04;
  bufs.forEach((line, li) => {
    line.forEach((b, pi) => {
      const src = ctx.createBufferSource();
      src.buffer = b!;
      src.connect(ctx.destination);
      src.start(at);
      src.onended = () => (playing = playing.filter((x) => x !== src));
      playing.push(src);
      at += b!.duration + lines[li][pi].gap;
    });
    at += GAP_LINE;
  });
  return true;
}
