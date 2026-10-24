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

/** What actually gets spoken: emoji and pictographs removed ("🧶 Found the yarn" → "Found the yarn"). */
export const spokenText = (text: string) =>
  text
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

/** Spelled-out forms where the written text would be read badly. */
export const sayAs = (text: string) => text.replace(/\bmin\b/g, "minutes");
