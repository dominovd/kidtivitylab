import type { L, Lang } from "./i18n";

export type Age = 6 | 11;
export type SubjectId = "math" | "lang" | "english" | "logic" | "plus";

export type Question = {
  /** Instruction for the child, already in the UI language. */
  prompt: string;
  /** Big central display: emoji, expression, text. */
  visual?: string;
  /** Long text (reading comprehension). */
  passage?: string;
  /** Text read aloud by the 🔊 button (defaults to prompt). */
  speak?: { text: string; lang: string; auto?: boolean };
  kind: "choice" | "input" | "order";
  options?: string[];
  /** For "order": tokens to arrange. */
  tokens?: string[];
  answer: string;
  inputMode?: "numeric" | "decimal" | "text";
  /** Shown first for `ms`, then hidden before the question. */
  memorize?: { show: string; ms: number };
  /** A geometric shape drawn as SVG in the scene. */
  shape?: "circle" | "square" | "triangle" | "rectangle" | "rhombus" | "oval" | "pentagon" | "hexagon";
  /** Pronounced after the answer (e.g. the English word). */
  answerSpeech?: { text: string; lang: string };
  /** Speech language for a 🔊 button on each option (young kids who cannot read English yet). */
  optionSpeech?: string;
  /** Read the passage aloud before the question (listening tasks for kids who don't read yet). */
  readPassage?: boolean;
  /** Speech language for saying an "order" token aloud when it is tapped. */
  tokenSpeech?: string;
  /** A circle or square cut into equal parts, some of them shaded. */
  fraction?: { parts: number; shaded: number; shape: "circle" | "square"; /** first shaded part */ start?: number };
  /** Electronic clock display, e.g. "08:30" or "15:00". */
  digital?: string;
  /** Options are times ("h:mm") drawn as analogue clocks. */
  clockOptions?: boolean;
  /** Analogue clock face. */
  clock?: { h: number; m: number };
  /** Grid of cells (mini sudoku); "" is an empty cell. */
  grid?: string[][];
  /** Bigger option buttons with emoji. */
  emojiOptions?: boolean;
};

export type Generator = (level: number, lang: Lang) => Question;

export type Skill = {
  id: string;
  subject: SubjectId;
  age: Age;
  icon: string;
  title: L;
  gen: Generator;
};

// ---------- helpers ----------
export const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** Builds shuffled options: the answer plus unique distractors. */
export function options(answer: string | number, distractors: (string | number)[], count = 4): string[] {
  const ans = String(answer);
  const set = new Set<string>([ans]);
  for (const d of shuffle(distractors.map(String))) {
    if (set.size >= count) break;
    if (d !== ans) set.add(d);
  }
  return shuffle([...set]);
}

/** Numeric options near the answer. */
export function numOptions(answer: number, spread = 3, count = 4, min = 0): string[] {
  const d: number[] = [];
  for (let k = 1; k <= spread + count; k++) {
    d.push(answer + k, answer - k);
  }
  return options(answer, d.filter((x) => x >= min), count);
}

/** Slavic plural form: [1, 2-4, 5+] */
export function plural(n: number, forms: [string, string, string]): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
  return forms[2];
}

export const speechLang: Record<Lang, string> = { uk: "uk-UA", ru: "ru-RU", en: "en-US" };
