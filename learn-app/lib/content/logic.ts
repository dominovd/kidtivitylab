import { l, type Lang } from "../i18n";
import { type Skill, pick, rand, options, sample, shuffle } from "../engine";
import { CATEGORIES } from "./words";

const P = {
  next: l("Що буде далі?", "Что будет дальше?", "What comes next?"),
  odd: l("Що тут зайве?", "Что здесь лишнее?", "Which one doesn't belong?"),
  wasShown: l("Що було на картинці?", "Что было на картинке?", "Which one was in the picture?"),
  seq: l("Продовж ряд чисел", "Продолжи ряд чисел", "Continue the sequence"),
  digits: l("Впиши цифри в тому ж порядку", "Впиши цифры в том же порядке", "Type the digits in the same order"),
  digitsRev: l("Впиши цифри у зворотному порядку", "Впиши цифры в обратном порядке", "Type the digits in reverse order"),
  oddNum: l("Яке число зайве?", "Какое число лишнее?", "Which number doesn't belong?"),
};

const NAMES: Record<Lang, string[]> = {
  uk: ["Оля", "Петро", "Іра", "Максим", "Настя", "Богдан", "Марта", "Тарас"],
  ru: ["Оля", "Петя", "Ира", "Максим", "Настя", "Богдан", "Марта", "Лёва"],
  en: ["Olivia", "Peter", "Emma", "Max", "Anna", "Ben", "Mia", "Leo"],
};

const PATTERNS = [
  ["AB"],
  ["AAB", "ABB"],
  ["ABC", "AABB"],
  ["ABCC", "AABC", "ABBC"],
  ["ABCD", "AABBC", "ABCBA"],
];

export const logicSkills: Skill[] = [
  // ---------- 6 years ----------
  {
    id: "patterns6",
    subject: "logic",
    age: 6,
    icon: "🔁",
    title: l("Візерунки", "Узоры", "Patterns"),
    gen: (level, lang) => {
      const pattern = pick(PATTERNS[level - 1]);
      const letters = [...new Set(pattern.split(""))];
      const cat = pick(CATEGORIES);
      const items = sample(cat.items, letters.length);
      const map = Object.fromEntries(letters.map((c, i) => [c, items[i]]));
      const full: string[] = [];
      const total = Math.max(pattern.length * 2 + 1, 7);
      for (let i = 0; i < total; i++) full.push(map[pattern[i % pattern.length]]);
      const shown = full.slice(0, total - 1);
      const ans = full[total - 1];
      return {
        kind: "choice",
        prompt: P.next[lang],
        visual: `${shown.join(" ")} ❓`,
        options: options(ans, cat.items, Math.min(4, Math.max(3, letters.length + 1))),
        answer: ans,
        emojiOptions: true,
      };
    },
  },
  {
    id: "oddOne6",
    subject: "logic",
    age: 6,
    icon: "🕵️",
    title: l("Що зайве?", "Что лишнее?", "Odd one out"),
    gen: (level, lang) => {
      const [a, b] = sample(CATEGORIES, 2);
      const same = sample(a.items, level <= 2 ? 2 : 3);
      const odd = pick(b.items);
      return {
        kind: "choice",
        prompt: P.odd[lang],
        options: shuffle([...same, odd]),
        answer: odd,
        emojiOptions: true,
      };
    },
  },
  {
    id: "memory6",
    subject: "logic",
    age: 6,
    icon: "🧠",
    title: l("Пам'ять", "Память", "Memory"),
    gen: (level, lang) => {
      const n = [2, 3, 4, 5, 6][level - 1];
      const all = CATEGORIES.flatMap((c) => c.items);
      const picked = sample(all, n + 3);
      const shown = picked.slice(0, n);
      const hidden = picked.slice(n);
      const ans = pick(shown);
      return {
        kind: "choice",
        prompt: P.wasShown[lang],
        memorize: { show: shown.join(" "), ms: 1500 + n * 900 },
        options: shuffle([ans, ...hidden]),
        answer: ans,
        emojiOptions: true,
      };
    },
  },

  // ---------- 11 years ----------
  {
    id: "numSeq11",
    subject: "logic",
    age: 11,
    icon: "📈",
    title: l("Числові закономірності", "Числовые закономерности", "Number patterns"),
    gen: (level, lang) => {
      const t = level <= 1 ? 0 : level === 2 ? rand(0, 1) : level === 3 ? rand(1, 2) : level === 4 ? rand(2, 3) : rand(3, 4);
      let seq: number[] = [];
      if (t === 0) {
        const s = rand(1, 20), d = rand(2, 9);
        seq = Array.from({ length: 6 }, (_, i) => s + i * d);
      } else if (t === 1) {
        const d = -rand(2, 9), s = rand(-6 * d + 1, -6 * d + 40);
        seq = Array.from({ length: 6 }, (_, i) => s + i * d);
      } else if (t === 2) {
        const s = rand(1, 5), r = pick([2, 3]);
        seq = Array.from({ length: 6 }, (_, i) => s * r ** i);
      } else if (t === 3) {
        const a = rand(2, 6), b = rand(1, 5), s = rand(3 * b + 1, 3 * b + 12);
        seq = [s];
        for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 ? a : -b));
        if (Math.random() < 0.5) {
          const k = rand(1, 3);
          seq = Array.from({ length: 6 }, (_, i) => (i + k) ** 2);
        }
      } else {
        if (Math.random() < 0.5) {
          seq = [rand(1, 3), rand(2, 5)];
          for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]);
        } else {
          const s = rand(1, 10);
          seq = [s];
          for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + i);
        }
      }
      const ans = seq[5];
      return { kind: "input", inputMode: "numeric", prompt: P.seq[lang], visual: `${seq.slice(0, 5).join(", ")}, ?`, answer: String(ans) };
    },
  },
  {
    id: "digitSpan11",
    subject: "logic",
    age: 11,
    icon: "🧠",
    title: l("Пам'ять на цифри", "Память на цифры", "Digit memory"),
    gen: (level, lang) => {
      const reverse = level === 5;
      const n = [4, 5, 6, 7, 5][level - 1];
      const digits = Array.from({ length: n }, () => rand(0, 9)).join("");
      return {
        kind: "input",
        inputMode: "numeric",
        prompt: reverse ? P.digitsRev[lang] : P.digits[lang],
        memorize: { show: digits.split("").join(" "), ms: 800 * n },
        answer: reverse ? digits.split("").reverse().join("") : digits,
      };
    },
  },
  {
    id: "whoFaster11",
    subject: "logic",
    age: 11,
    icon: "🏃",
    title: l("Логічні задачі", "Логические задачи", "Logic puzzles"),
    gen: (level, lang) => {
      const n = level <= 3 ? 3 : 4;
      const order = sample(NAMES[lang], n); // fastest → slowest
      const facts: string[] = [];
      for (let i = 0; i < n - 1; i++) {
        const [a, b] = [order[i], order[i + 1]];
        const slowerForm = level >= 2 && Math.random() < 0.5;
        facts.push(
          slowerForm
            ? { uk: `${b} бігає повільніше, ніж ${a}.`, ru: `${b} бегает медленнее, чем ${a}.`, en: `${b} is slower than ${a}.` }[lang]
            : { uk: `${a} бігає швидше, ніж ${b}.`, ru: `${a} бегает быстрее, чем ${b}.`, en: `${a} is faster than ${b}.` }[lang],
        );
      }
      const askSlowest = Math.random() < 0.5;
      const q = askSlowest
        ? { uk: "Хто бігає найповільніше?", ru: "Кто бегает медленнее всех?", en: "Who is the slowest?" }[lang]
        : { uk: "Хто бігає найшвидше?", ru: "Кто бегает быстрее всех?", en: "Who is the fastest?" }[lang];
      return {
        kind: "choice",
        prompt: q,
        passage: shuffle(facts).join(" "),
        options: shuffle(order),
        answer: askSlowest ? order[n - 1] : order[0],
      };
    },
  },
  {
    id: "oddNumber11",
    subject: "logic",
    age: 11,
    icon: "🔎",
    title: l("Зайве число", "Лишнее число", "Odd number out"),
    gen: (level, lang) => {
      const props: { has: (x: number) => boolean; gen: () => number; other: () => number }[] = [
        { has: (x) => x % 2 === 0, gen: () => rand(5, 49) * 2, other: () => rand(5, 49) * 2 + 1 },
        { has: (x) => x % 5 === 0, gen: () => rand(3, 30) * 5, other: () => rand(3, 30) * 5 + rand(1, 4) },
        { has: (x) => Number.isInteger(Math.sqrt(x)), gen: () => rand(2, 12) ** 2, other: () => rand(2, 12) ** 2 + rand(1, 3) },
        { has: (x) => x % 9 === 0, gen: () => rand(2, 15) * 9, other: () => rand(2, 15) * 9 + rand(1, 8) },
        { has: (x) => x % 7 === 0, gen: () => rand(2, 14) * 7, other: () => rand(2, 14) * 7 + rand(1, 6) },
      ];
      const p = pick(props.slice(0, Math.min(props.length, level + 1)));
      const set = new Set<number>();
      while (set.size < 3) set.add(p.gen());
      let odd = p.other();
      while (p.has(odd) || set.has(odd)) odd = p.other();
      return { kind: "choice", prompt: P.oddNum[lang], options: shuffle([...set, odd].map(String)), answer: String(odd) };
    },
  },
];
