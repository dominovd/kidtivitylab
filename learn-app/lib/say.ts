import type { Question } from "./engine";
import { speechLang } from "./engine";
import type { Lang } from "./i18n";

const WORDS: Record<Lang, Record<string, string>> = {
  uk: { "+": "плюс", "−": "мінус", "-": "мінус", "×": "помножити на", "·": "помножити на", ":": "поділити на", "=": "дорівнює", "?": "скільки", "❓": "скільки", "☐": "віконце", "⬜": "і", "(": "відкрити дужку", ")": "закрити дужку", x: "ікс" },
  ru: { "+": "плюс", "−": "минус", "-": "минус", "×": "умножить на", "·": "умножить на", ":": "разделить на", "=": "равно", "?": "сколько", "❓": "сколько", "☐": "окошко", "⬜": "и", "(": "открыть скобку", ")": "закрыть скобку", x: "икс" },
  en: { "+": "plus", "−": "minus", "-": "minus", "×": "times", "·": "times", ":": "divided by", "=": "equals", "?": "what", "❓": "what", "☐": "box", "⬜": "and", "(": "open bracket", ")": "close bracket", x: "x" },
};

const MATH_LINE = /^[\d\s+−×·:=?☐❓⬜().,x-]+$/;

/** "3 + ☐ = 8" → "3 плюс віконце дорівнює 8". Returns "" for anything that is not a pure expression. */
export function verbalize(line: string, lang: Lang): string {
  const s = line.trim();
  if (!s || !MATH_LINE.test(s) || !/\d/.test(s)) return "";
  return s
    .replace(/(\d)\s*([+−×·:=()-])/g, "$1 $2")
    .replace(/([+−×·:=()-])\s*(\d)/g, "$1 $2")
    .split(/\s+/)
    .map((tok) => WORDS[lang][tok] ?? tok)
    .join(" ");
}

/** What to read aloud for a task: the instruction, the expression in words, and the listening word. */
export function taskSpeech(q: Question, lang: Lang, answered: boolean) {
  const ui = speechLang[lang];
  const parts: { text: string; lang: string }[] = [{ text: q.prompt, lang: ui }];
  const first = q.visual?.split("\n")[0] ?? "";
  const expr = verbalize(first, lang);
  if (expr) parts.push({ text: expr, lang: ui });
  // for "order" tasks the sentence is the answer, so it is only read after answering
  if (q.speak && (q.kind !== "order" || answered)) parts.push({ text: q.speak.text, lang: q.speak.lang });
  return parts;
}
