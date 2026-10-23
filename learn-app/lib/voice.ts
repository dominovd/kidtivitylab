"use client";

/**
 * Pre-recorded voice (ElevenLabs clips in public/audio/en, see scripts/tts).
 * A line is played from one whole clip, or stitched from text segments and number atoms
 * with the silence trimmed. Anything not covered returns null, and the caller falls back
 * to the browser's speech engine.
 */
import { numberKey, phraseKey, splitForSpeech } from "./voice-keys";

const BASE = "/learn/audio/en/";
/** Pause between stitched pieces of one line, and between lines. */
const GAP_PIECE = 0.09;
const GAP_LINE = 0.35;
/** Amplitude treated as silence when trimming clip edges. */
const SILENCE = 0.012;
const PAD = 0.025;

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

/** Clip files for one line, or null when some piece has no recording. */
export function planLine(text: string): string[] | null {
  if (!items) return null;
  const whole = items[phraseKey(text)];
  if (whole) return [whole];
  const parts = splitForSpeech(text);
  if (!parts.length) return null;
  const files: string[] = [];
  for (const [i, p] of parts.entries()) {
    let f: string | undefined;
    if (p.kind === "num") {
      const last = !parts.slice(i + 1).some((x) => x.kind === "text");
      f = items[numberKey(p.value, last ? "end" : "mid")] ?? items[numberKey(p.value, last ? "mid" : "end")];
    } else f = items[phraseKey(p.value)];
    if (!f) return null;
    files.push(f);
  }
  return files;
}

const cache = new Map<string, Promise<AudioBuffer | null>>();

function trim(ctx: AudioContext, buf: AudioBuffer): AudioBuffer {
  const data = buf.getChannelData(0);
  let a = 0;
  let b = data.length - 1;
  while (a < b && Math.abs(data[a]) < SILENCE) a++;
  while (b > a && Math.abs(data[b]) < SILENCE) b--;
  const pad = Math.round(PAD * buf.sampleRate);
  a = Math.max(0, a - pad);
  b = Math.min(data.length - 1, b + pad);
  const out = ctx.createBuffer(buf.numberOfChannels, b - a + 1, buf.sampleRate);
  for (let c = 0; c < buf.numberOfChannels; c++) out.copyToChannel(buf.getChannelData(c).subarray(a, b + 1), c);
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
export async function playLines(ctx: AudioContext, lines: string[][]): Promise<boolean> {
  stopVoice();
  const mine = turn;
  const bufs = await Promise.all(lines.map((files) => Promise.all(files.map((f) => clip(ctx, f)))));
  if (mine !== turn) return true; // replaced by a newer line meanwhile
  if (bufs.some((line) => line.some((b) => !b))) return false;
  void ctx.resume();
  let at = ctx.currentTime + 0.04;
  for (const line of bufs) {
    for (const b of line as AudioBuffer[]) {
      const src = ctx.createBufferSource();
      src.buffer = b;
      src.connect(ctx.destination);
      src.start(at);
      src.onended = () => (playing = playing.filter((x) => x !== src));
      playing.push(src);
      at += b.duration + GAP_PIECE;
    }
    at += GAP_LINE - GAP_PIECE;
  }
  return true;
}
