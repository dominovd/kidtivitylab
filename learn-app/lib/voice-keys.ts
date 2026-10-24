/**
 * Shared by the clip generator (scripts/tts) and the player (lib/voice.ts):
 * how a spoken line maps to pre-recorded clips.
 */

/** A number or a clock time ("83", "10:30"). */
export const NUM_RE = /\d+(?::\d\d)?/;
const NUM_SPLIT = /(\d+(?::\d\d)?)/;

export type SpeechPart = { kind: "text" | "num"; value: string; /** ends a sentence (. ! ?): a longer pause follows */ sentenceEnd?: boolean };

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

/** Sentence breaks inside a text piece; "a.m. or p.m." is not a break (needs two letters before the dot). */
const SENTENCE_BREAK = /(?<=\p{L}{2}[.!?])\s+/u;
const ENDS_SENTENCE = /[.!?]["”]?$/;

/**
 * "There are 4 apples in the basket. Mom puts in 1 more." →
 * [text "There are", num "4", text "apples in the basket." (sentence end), text "Mom puts in", num "1" (sentence end)]
 * Punctuation-only bits are dropped; a dropped "." or "?" marks the piece before it as a sentence end.
 */
export function splitForSpeech(line: string): SpeechPart[] {
  const out: SpeechPart[] = [];
  norm(line)
    .split(NUM_SPLIT)
    .forEach((v, i) => {
      if (i % 2) {
        out.push({ kind: "num", value: v });
        return;
      }
      let text = norm(v);
      // ". Is that a.m. or p.m.?" right after a number: the number ends the sentence
      const lead = text.match(/^[.!?]+\s+/);
      if (lead && out.length) {
        out[out.length - 1].sentenceEnd = true;
        text = text.slice(lead[0].length);
      }
      for (const piece of text.split(SENTENCE_BREAK)) {
        const value = norm(piece);
        if (!value) continue;
        if (!/\p{L}/u.test(value)) {
          if (/[.!?]/.test(value) && out.length) out[out.length - 1].sentenceEnd = true;
          continue;
        }
        out.push({ kind: "text", value, sentenceEnd: ENDS_SENTENCE.test(value) || undefined });
      }
    });
  return out;
}

const MATH_WORDS = /^(?:plus|minus|times|equals|what\??|box|and|divided|by|open|close|bracket|x|\s)+$/i;
/** Which recording of a number fits here: inside a sentence ("4 apples"), inside math ("4 plus"), or last. */
export function numberVariant(parts: SpeechPart[], i: number): "word" | "mid" | "end" {
  const after = parts.slice(i + 1).some((x) => x.kind === "text");
  if (!after || parts[i].sentenceEnd) return "end";
  const near = [parts[i - 1], parts[i + 1]].filter((x) => x?.kind === "text").map((x) => x!.value);
  return near.some((t) => !MATH_WORDS.test(t)) ? "word" : "mid";
}

export const phraseKey = (text: string) => `p:${norm(text)}`;
export const numberKey = (n: string, variant: "mid" | "end" | "word") => `n:${n}:${variant}`;

/** What actually gets spoken: emoji and pictographs removed ("🧶 Found the yarn" → "Found the yarn"). */
export const spokenText = (text: string) =>
  text
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

/** Spelled-out forms where the written text would be read badly. */
export const sayAs = (text: string) => text.replace(/\bmin\b/g, "minutes");
