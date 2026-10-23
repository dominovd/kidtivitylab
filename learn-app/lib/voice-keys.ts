/**
 * Shared by the clip generator (scripts/tts) and the player (lib/voice.ts):
 * how a spoken line maps to pre-recorded clips.
 */

/** A number or a clock time ("83", "10:30"). */
export const NUM_RE = /\d+(?::\d\d)?/;
const NUM_SPLIT = /(\d+(?::\d\d)?)/;

export type SpeechPart = { kind: "text" | "num"; value: string };

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

/** "How many ones are in 11?" → [text "How many ones are in", num "11"] (punctuation-only bits dropped). */
export function splitForSpeech(line: string): SpeechPart[] {
  return norm(line)
    .split(NUM_SPLIT)
    .map((v, i) => ({ kind: i % 2 ? "num" : "text", value: norm(v) }) as SpeechPart)
    .filter((p) => p.kind === "num" || /\p{L}/u.test(p.value));
}

export const phraseKey = (text: string) => `p:${norm(text)}`;
export const numberKey = (n: string, variant: "mid" | "end") => `n:${n}:${variant}`;

/** Spelled-out forms where the written text would be read badly. */
export const sayAs = (text: string) => text.replace(/\bmin\b/g, "minutes");
