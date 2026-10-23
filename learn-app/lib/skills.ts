import { l, type L } from "./i18n";
import type { Age, Skill, SubjectId } from "./engine";
import { mathSkills } from "./content/math";
import { langSkills } from "./content/language";
import { englishSkills } from "./content/english";
import { logicSkills } from "./content/logic";
import { extraSkills } from "./content/extra";
import { plusSkills } from "./content/plus";

export const SUBJECTS: { id: SubjectId; title: L; short: L; icon: string; img: "math-blocks" | "reading-book" | "english-globe" | "logic-puzzle" | "idea-lightbulb"; color: string; advanced?: boolean }[] = [
  { id: "math", title: l("Математика", "Математика", "Math"), short: l("Математика", "Математика", "Math"), icon: "🔢", img: "math-blocks", color: "var(--math)" },
  { id: "lang", title: l("Мова і читання", "Язык и чтение", "Reading"), short: l("Мова", "Язык", "Reading"), icon: "📖", img: "reading-book", color: "var(--lang)" },
  { id: "english", title: l("Англійська", "Английский", "Words & sounds"), short: l("Англійська", "Английский", "Words"), icon: "💬", img: "english-globe", color: "var(--english)" },
  { id: "logic", title: l("Логіка і пам'ять", "Логика и память", "Logic & memory"), short: l("Логіка", "Логика", "Logic"), icon: "🧩", img: "logic-puzzle", color: "var(--logic)" },
  {
    id: "plus",
    title: l("Для допитливих: математика і логіка", "Для любознательных: математика и логика", "Extra challenge: math & logic"),
    short: l("Для допитливих", "Для любознательных", "Extra challenge"),
    icon: "💡",
    img: "idea-lightbulb",
    color: "var(--plus)",
    advanced: true,
  },
];

const ALL: Skill[] = [...mathSkills, ...langSkills, ...englishSkills, ...logicSkills, ...extraSkills, ...plusSkills];

/** Display order inside each island, following the school programme. */
const ORDER = [
  "count", "compare", "sequence6", "add6", "sub6", "shapes6",
  "firstLetter", "syllables6", "readWord", "missingLetter", "readSentence6", "stories6",
  "enWords6", "enListen6", "enColors6", "enNumbers6", "enLetters6",
  "patterns6", "oddOne6", "memory6", "calendar6",
  "mental", "mult", "div", "orderOps11", "equations", "fractions", "decimals11", "percent11", "units11", "problems",
  "spelling", "partsOfSpeech11", "antonyms", "reading",
  "enVocab11", "enGrammar11", "enSentence11",
  "numSeq11", "digitSpan11", "whoFaster11", "oddNumber11",
  "add2d", "sub2d", "geo6", "add100", "tensOnes", "missingNum6", "groups6", "skipCount6", "clock6", "problems6", "sudoku6", "balance6", "analogies6",
];
export const SKILLS: Skill[] = [...ALL].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));

export const skillsFor = (age: Age, subject?: SubjectId) =>
  SKILLS.filter((s) => s.age === age && (!subject || s.subject === subject));

export const getSkill = (id: string) => SKILLS.find((s) => s.id === id);

export const ROUND_SIZE: Record<Age, number> = { 6: 8, 11: 10 };

export type TrackId = SubjectId | "mix";

/** Directions a child can start with; the choice only reorders the map and Today's picks. */
export const TRACKS: { id: TrackId; title: string; about: string; examples: string[]; recommended?: boolean }[] = [
  {
    id: "mix",
    title: "A bit of everything",
    about: "Math, reading, words and puzzles mixed together, with new picks every day. Best if you're not sure.",
    examples: ["3 + 4", "c _ t", "🔴 red", "🧩"],
    recommended: true,
  },
  { id: "math", title: "Math", about: "Counting, adding and taking away, comparing numbers, shapes.", examples: ["5 apples", "3 + 4", "7 > 2", "🔺"] },
  { id: "lang", title: "Reading", about: "Letters and sounds, syllables, reading words and short sentences, little stories to retell.", examples: ["A is for 🍎", "cat", "c _ t", "📖"] },
  { id: "english", title: "Words & sounds", about: "Picture words, listening games, colors, number words and the ABC. Lots of voice help.", examples: ["🔊 dog", "🔴 red", "seven", "A B C"] },
  { id: "logic", title: "Logic & memory", about: "Patterns, odd one out, memory games, days of the week and seasons.", examples: ["🔴🔵🔴?", "odd one", "🧠", "📅"] },
  {
    id: "plus",
    title: "Extra challenge",
    about: "For kids who want more (about 1st–2nd grade): two-digit math, tens and ones, clocks, story problems, mini sudoku.",
    examples: ["34 + 25", "🕒", "10, 20, 30", "🔲"],
  },
];

/** How the content track is presented to visitors (internal age id 6). */
export const AGE_BAND: Record<Age, string> = { 6: "ages 5–8", 11: "ages 5–8" };
