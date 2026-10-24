import { l, type Lang } from "../i18n";
import { type Skill, pick, rand, sample, shuffle, options, numOptions, plural } from "../engine";
import { CATEGORIES } from "./words";

/**
 * "Для допитливих": stretch programme in maths and logic for a 6-year-old
 * who is ahead of the age norm (grade 1 to grade 2 material).
 */

const P = {
  solve: l("Скільки буде?", "Сколько будет?", "What is the answer?"),
  missing: l("Яке число сховалося у віконці?", "Какое число спряталось в окошке?", "Which number is hiding in the box?"),
  groups: l("Скільки всього? Рахуй групами", "Сколько всего? Считай группами", "How many in total? Count in groups"),
  skip: l("Яке число далі?", "Какое число дальше?", "Which number comes next?"),
  skipMid: l("Яке число пропущене?", "Какое число пропущено?", "Which number is missing?"),
  clock: l("Котра година?", "Который час?", "What time is it?"),
  sudoku: l(
    "У кожному рядку і стовпчику кожна картинка є один раз. Що замість знака питання?",
    "В каждой строке и столбце каждая картинка встречается один раз. Что вместо знака вопроса?",
    "Each picture appears once in every row and column. What goes in place of the question mark?",
  ),
  balance: l("Подивись на терези. Скільки треба, щоб було порівну?", "Посмотри на весы. Сколько нужно, чтобы было поровну?", "Look at the scales. How many are needed to balance?"),
  analogy: l("Що пасує так само?", "Что подходит так же?", "What goes with it in the same way?"),
};

const TENS: Record<Lang, [string, string, string]> = { uk: ["десяток", "десятки", "десятків"], ru: ["десяток", "десятка", "десятков"], en: ["ten", "tens", "tens"] };
const ONES: Record<Lang, [string, string, string]> = { uk: ["одиниця", "одиниці", "одиниць"], ru: ["единица", "единицы", "единиц"], en: ["one", "ones", "ones"] };
const w = (n: number, forms: Record<Lang, [string, string, string]>, lang: Lang) =>
  lang === "en" ? (n === 1 ? forms.en[0] : forms.en[1]) : plural(n, forms[lang]);

const EMOJI = ["🍎", "⭐", "🐟", "🎈", "🌸", "🍓", "🐞", "🍪"];

// ---------- word problems ----------
type Story = (level: number, lang: Lang) => { text: string; answer: number };
const cap = (level: number) => [10, 10, 20, 20, 50][level - 1];

const STORIES: Story[] = [
  (lvl, lang) => {
    const a = rand(2, cap(lvl) - 2), b = rand(1, cap(lvl) - a);
    const text = {
      uk: `У кошику ${a} ${plural(a, ["яблуко", "яблука", "яблук"])}. Мама поклала ще ${b}. Скільки яблук стало в кошику?`,
      ru: `В корзине ${a} ${plural(a, ["яблоко", "яблока", "яблок"])}. Мама положила ещё ${b}. Сколько яблок стало в корзине?`,
      en: `There ${a === 1 ? "is 1 apple" : `are ${a} apples`} in the basket. Mom puts in ${b} more. How many apples are in the basket now?`,
    }[lang];
    return { text, answer: a + b };
  },
  (lvl, lang) => {
    const a = rand(4, cap(lvl)), b = rand(2, a - 1);
    const text = {
      uk: `На гілці сиділо ${a} ${plural(a, ["пташка", "пташки", "пташок"])}. Згодом ${b} з них відлетіли. Скільки пташок залишилося?`,
      ru: `На ветке сидело ${a} ${plural(a, ["птичка", "птички", "птичек"])}. Потом ${b} из них улетели. Сколько птичек осталось?`,
      en: `${a} birds were sitting on a branch. Then ${b} of them flew away. How many birds are left?`,
    }[lang];
    return { text, answer: a - b };
  },
  (lvl, lang) => {
    const a = rand(2, cap(lvl) - 3), b = rand(1, Math.min(9, cap(lvl) - a));
    const text = {
      uk: `У Марії ${a} ${plural(a, ["кулька", "кульки", "кульок"])}, а в Лева на ${b} більше. Скільки кульок у Лева?`,
      ru: `У Саши ${a} ${plural(a, ["шарик", "шарика", "шариков"])}, а у Лева на ${b} больше. Сколько шариков у Лева?`,
      en: `Mia has ${a} balloons. Leo has ${b} more. How many balloons does Leo have?`,
    }[lang];
    return { text, answer: a + b };
  },
  (lvl, lang) => {
    const b = rand(2, cap(lvl) - 4), a = rand(b + 1, cap(lvl));
    const text = {
      uk: `У Лева ${a} ${plural(a, ["машинка", "машинки", "машинок"])}, а в Марії ${b}. На скільки більше машинок у Лева?`,
      ru: `У Лева ${a} ${plural(a, ["машинка", "машинки", "машинок"])}, а у Саши ${b}. На сколько больше машинок у Лева?`,
      en: `Leo has ${a} toy cars and Mia has ${b}. How many more toy cars does Leo have?`,
    }[lang];
    return { text, answer: a - b };
  },
  (lvl, lang) => {
    const n = rand(2, lvl >= 5 ? 6 : 4);
    const [legs, animal] = pick([
      [4, { uk: "котів", ru: "кошек", en: "cats" }],
      [2, { uk: "курчат", ru: "цыплят", en: "chicks" }],
      [4, { uk: "собак", ru: "собак", en: "dogs" }],
    ] as const);
    const text = {
      uk: `Скільки лап у ${n} ${animal.uk}?`,
      ru: `Сколько лап у ${n} ${animal.ru}?`,
      en: `How many legs do ${n} ${animal.en} have?`,
    }[lang];
    return { text, answer: legs * n };
  },
];

// ---------- analogies ----------
/** Pairs grouped by the kind of link, so both pairs in a question share it. */
const PAIR_GROUPS: { lvl: number; pairs: [string, string][] }[] = [
  { lvl: 1, pairs: [["🐶", "🦴"], ["🐱", "🐟"], ["🐰", "🥕"], ["🐒", "🍌"], ["🐿️", "🌰"]] }, // who eats what
  { lvl: 1, pairs: [["🐝", "🍯"], ["🐄", "🥛"], ["🐔", "🥚"], ["🐑", "🧶"]] }, // who gives what
  { lvl: 3, pairs: [["🌧️", "☂️"], ["☀️", "🕶️"], ["❄️", "🧤"]] }, // weather and what you need
  { lvl: 4, pairs: [["🐟", "🌊"], ["🐫", "🏜️"], ["🐧", "🧊"], ["🐿️", "🌳"]] }, // where it lives
  { lvl: 4, pairs: [["🔑", "🔒"], ["🦷", "🪥"], ["✉️", "📮"], ["🚗", "⛽"], ["🔥", "🧯"], ["🌱", "💧"]] }, // what goes together
];

// ---------- mini sudoku ----------
function latin(n: number): number[][] {
  const base = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r + c) % n));
  const rows = shuffle(base);
  const colOrder = shuffle(Array.from({ length: n }, (_, i) => i));
  const sym = shuffle(Array.from({ length: n }, (_, i) => i));
  return rows.map((row) => colOrder.map((c) => sym[row[c]]));
}


// ---------- two-digit addition and subtraction ----------
/** Tens as blue blocks, ones as small diamonds: a picture of the number for the first level. */
const blocks = (n: number) => `${"🟦".repeat(Math.floor(n / 10))}${n % 10 ? " " + "🔹".repeat(n % 10) : ""}`;
const swapDigits = (n: number) => (n >= 10 && n % 10 ? (n % 10) * 10 + Math.floor(n / 10) : n + 10);
/** Wrong options built from typical mistakes: lost carry or borrow, swapped digits, off by one. */
const mistakeOptions = (ans: number, carryMiss: number) =>
  options(ans, [carryMiss, swapDigits(ans), ans + 1, ans - 1, ans + 10, ans - 10].filter((x) => x >= 0 && x <= 100 && x !== ans));

type Pair = { a: number; b: number };
function addPair(level: number): Pair {
  for (;;) {
    let a: number, b: number;
    if (level === 1) [a, b] = [rand(2, 8) * 10 + rand(0, 5), rand(1, 4)]; // 34 + 5
    else if (level === 2) [a, b] = [rand(1, 6) * 10 + rand(0, 4), rand(1, 3) * 10 + rand(0, 5)]; // 34 + 25
    else if (level === 3) [a, b] = [rand(1, 8) * 10 + rand(5, 9), rand(3, 9)]; // 38 + 7
    else [a, b] = [rand(1, 6) * 10 + rand(3, 9), rand(1, 3) * 10 + rand(3, 9)]; // 38 + 27
    const carry = (a % 10) + (b % 10) >= 10;
    if (a + b > 100) continue;
    if (level <= 2 && carry) continue;
    if (level >= 3 && !carry) continue;
    return { a, b };
  }
}
function subPair(level: number): Pair {
  for (;;) {
    let a: number, b: number;
    if (level === 1) [a, b] = [rand(2, 9) * 10 + rand(3, 9), rand(1, 3)]; // 47 - 3
    else if (level === 2) [a, b] = [rand(4, 9) * 10 + rand(3, 9), rand(1, 3) * 10 + rand(0, 3)]; // 58 - 23
    else if (level === 3) [a, b] = [rand(2, 9) * 10 + rand(0, 4), rand(5, 9)]; // 42 - 7
    else if (level === 4) [a, b] = [rand(4, 9) * 10 + rand(0, 5), rand(1, 3) * 10 + rand(6, 9)]; // 63 - 28
    else [a, b] = [rand(4, 9) * 10, rand(1, 3) * 10 + rand(1, 9)]; // 70 - 34
    const borrow = a % 10 < b % 10;
    if (b >= a) continue;
    if (level <= 2 && borrow) continue;
    if (level >= 3 && !borrow) continue;
    return { a, b };
  }
}


// ---------- geometry for the curious ----------
type Flat = "circle" | "square" | "triangle" | "rhombus";
const FLAT_EMOJI: Record<Flat, string[]> = {
  circle: ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣"],
  square: ["🟥", "🟧", "🟨", "🟩", "🟦", "🟪"],
  triangle: ["🔺", "🔻"],
  rhombus: ["🔶", "🔷"],
};
const FLAT_MANY: Record<Flat, Record<Lang, string>> = {
  circle: { uk: "кругів", ru: "кругов", en: "circles" },
  square: { uk: "квадратів", ru: "квадратов", en: "squares" },
  triangle: { uk: "трикутників", ru: "треугольников", en: "triangles" },
  rhombus: { uk: "ромбів", ru: "ромбов", en: "rhombuses" },
};
/** Colour pairs for "how many blue circles": [circle, square] emoji. */
const COLOURED: { name: Record<Lang, string>; circle: string; square: string }[] = [
  { name: { uk: "червоних", ru: "красных", en: "red" }, circle: "🔴", square: "🟥" },
  { name: { uk: "синіх", ru: "синих", en: "blue" }, circle: "🔵", square: "🟦" },
  { name: { uk: "зелених", ru: "зелёных", en: "green" }, circle: "🟢", square: "🟩" },
  { name: { uk: "жовтих", ru: "жёлтых", en: "yellow" }, circle: "🟡", square: "🟨" },
];
type Solid = "sphere" | "cube" | "cylinder" | "cone" | "cuboid" | "pyramid";
const SOLID_NAME: Record<Solid, Record<Lang, string>> = {
  sphere: { uk: "куля", ru: "шар", en: "sphere" },
  cube: { uk: "куб", ru: "куб", en: "cube" },
  cylinder: { uk: "циліндр", ru: "цилиндр", en: "cylinder" },
  cone: { uk: "конус", ru: "конус", en: "cone" },
  cuboid: { uk: "паралелепіпед", ru: "параллелепипед", en: "cuboid" },
  pyramid: { uk: "піраміда", ru: "пирамида", en: "pyramid" },
};
const SOLID_OBJECTS: [string, Solid][] = [
  ["⚽", "sphere"], ["🏀", "sphere"], ["🌍", "sphere"], ["🔮", "sphere"],
  ["🎲", "cube"], ["🧊", "cube"],
  ["🥫", "cylinder"], ["🔋", "cylinder"], ["🪵", "cylinder"],
  ["🍦", "cone"], ["🎉", "cone"],
  ["📦", "cuboid"], ["🧱", "cuboid"], ["📚", "cuboid"],
];
/** Faces and vertices: [solid, picture, faces, vertices]. */
const SOLID_FACTS: [Solid, string, number, number][] = [
  ["cube", "🎲", 6, 8],
  ["cuboid", "📦", 6, 8],
  ["pyramid", "🔺", 5, 5],
];
const FRACTION_NAME: Record<string, Record<Lang, string>> = {
  "1/2": { uk: "половина", ru: "половина", en: "a half" },
  "1/3": { uk: "третина", ru: "треть", en: "a third" },
  "1/4": { uk: "чверть", ru: "четверть", en: "a quarter" },
  "3/4": { uk: "три чверті", ru: "три четверти", en: "three quarters" },
  "2/3": { uk: "дві третини", ru: "две трети", en: "two thirds" },
};
const T = {
  toAnalog: l("Знайди годинник зі стрілками, який показує той самий час", "Найди часы со стрелками, которые показывают то же время", "Find the clock with hands that shows the same time"),
  h24: l("Електронний годинник показує денний час. Що покаже годинник зі стрілками?", "Электронные часы показывают дневное время. Что покажут часы со стрелками?", "The electronic clock shows afternoon time. What will the clock with hands show?"),
  events: [l("Мультик", "Мультик", "The cartoon"), l("Урок", "Урок", "The lesson"), l("Футбольний матч", "Футбольный матч", "The soccer game")],
};
/** Everyday moments for a.m./p.m. questions: [sentence start, hour, minutes, is p.m.]. */
const AMPM: [string, number, number, boolean][] = [
  ["We wake up", 7, 0, false],
  ["We eat breakfast", 7, 30, false],
  ["School starts", 8, 0, false],
  ["The sun comes up", 6, 30, false],
  ["Recess is", 10, 30, false],
  ["We have a snack after school", 3, 30, true],
  ["We eat dinner", 6, 0, true],
  ["We take a bath", 7, 0, true],
  ["It is bedtime", 8, 0, true],
  ["The soccer game starts", 4, 0, true],
  ["We go to the park", 4, 30, true],
  ["We read a bedtime story", 8, 30, true],
];


const G = {
  howManyOf: l("Скільки тут", "Сколько здесь", "How many"),
  solid: l("На яке тіло це схоже?", "На какое тело это похоже?", "Which solid does it look like?"),
  part: l("Яку частину зафарбовано?", "Какая часть закрашена?", "How much is shaded?"),
  faces: l("Скільки граней у цього тіла?", "Сколько граней у этого тела?", "How many faces does it have?"),
  vertices: l("Скільки вершин у цього тіла?", "Сколько вершин у этого тела?", "How many corners (vertices) does it have?"),
};
/** A heap of shapes, five to a line. */
const heap = (items: string[]) => items.map((e, i) => e + ((i + 1) % 5 === 0 && i !== items.length - 1 ? "\n" : " ")).join("").trim();

export const plusSkills: Skill[] = [
  {
    id: "add2d",
    subject: "plus",
    age: 6,
    icon: "➕",
    title: l("Додавання двоцифрових", "Сложение двузначных", "Adding two-digit numbers"),
    gen: (level, lang) => {
      if (level === 5) {
        // the missing addend, or three numbers
        if (Math.random() < 0.5) {
          const { a, b } = addPair(4);
          return { kind: "input", inputMode: "numeric", prompt: P.missing[lang], visual: `☐ + ${b} = ${a + b}`, answer: String(a) };
        }
        const x = rand(11, 39), y = rand(11, 29), z = rand(5, 100 - x - y > 5 ? Math.min(29, 100 - x - y) : 5);
        return { kind: "input", inputMode: "numeric", prompt: P.solve[lang], visual: `${x} + ${y} + ${z} = ?`, answer: String(x + y + z) };
      }
      const { a, b } = addPair(level);
      const ans = a + b;
      const visual = `${a} + ${b} = ?${level === 1 ? `\n${blocks(a)} + ${"🔹".repeat(b)}` : ""}`;
      if (level === 4) return { kind: "input", inputMode: "numeric", prompt: P.solve[lang], visual, answer: String(ans) };
      return { kind: "choice", prompt: P.solve[lang], visual, options: mistakeOptions(ans, ans - 10), answer: String(ans) };
    },
  },
  {
    id: "sub2d",
    subject: "plus",
    age: 6,
    icon: "➖",
    title: l("Віднімання двоцифрових", "Вычитание двузначных", "Subtracting two-digit numbers"),
    gen: (level, lang) => {
      if (level === 5 && Math.random() < 0.4) {
        // the missing minuend: ☐ − 25 = 38
        const { a, b } = subPair(4);
        return { kind: "input", inputMode: "numeric", prompt: P.missing[lang], visual: `☐ − ${b} = ${a - b}`, answer: String(a) };
      }
      const { a, b } = subPair(level);
      const ans = a - b;
      const visual = `${a} − ${b} = ?${level === 1 ? `\n${blocks(a)}` : ""}`;
      if (level >= 4) return { kind: "input", inputMode: "numeric", prompt: P.solve[lang], visual, answer: String(ans) };
      // forgetting to borrow gives an answer ten too big
      return { kind: "choice", prompt: P.solve[lang], visual, options: mistakeOptions(ans, ans + 10), answer: String(ans) };
    },
  },
  {
    id: "geo6",
    subject: "plus",
    age: 6,
    icon: "📐",
    title: l("Геометрія для допитливих", "Геометрия для любознательных", "Geometry challenge"),
    gen: (level, lang) => {
      const kind =
        level === 1 ? "count" : level === 2 ? pick(["count", "colour"]) : level === 3 ? pick(["solid", "solid", "colour"]) : level === 4 ? pick(["part", "part", "solid"]) : pick(["part", "fact", "fact", "solid"]);
      if (kind === "count") {
        const types = sample(["circle", "square", "triangle", "rhombus"] as Flat[], 3);
        const target = types[0];
        const n = rand(2, level === 1 ? 5 : 7);
        const total = level === 1 ? rand(n + 3, 9) : rand(n + 5, 13);
        const items = [
          ...Array.from({ length: n }, () => pick(FLAT_EMOJI[target])),
          ...Array.from({ length: total - n }, () => pick(FLAT_EMOJI[pick(types.slice(1))])),
        ];
        return { kind: "choice", prompt: `${G.howManyOf[lang]} ${FLAT_MANY[target][lang]}?`, visual: heap(shuffle(items)), options: numOptions(n, 2, 4, 1), answer: String(n) };
      }
      if (kind === "colour") {
        // two features at once: shape and color
        const shape = pick(["circle", "square"] as const);
        const col = pick(COLOURED);
        const n = rand(2, 5);
        const others = COLOURED.filter((c) => c !== col);
        const items = [
          ...Array.from({ length: n }, () => col[shape]),
          ...Array.from({ length: rand(2, 3) }, () => col[shape === "circle" ? "square" : "circle"]),
          ...Array.from({ length: rand(3, 5) }, () => pick(others)[shape]),
        ];
        const what = lang === "en" ? `${col.name.en} ${FLAT_MANY[shape].en}` : `${col.name[lang]} ${FLAT_MANY[shape][lang]}`;
        return { kind: "choice", prompt: `${G.howManyOf[lang]} ${what}?`, visual: heap(shuffle(items)), options: numOptions(n, 2, 4, 1), answer: String(n) };
      }
      if (kind === "solid") {
        const [e, solid] = pick(SOLID_OBJECTS);
        const pool: Solid[] = ["sphere", "cube", "cylinder", "cone", "cuboid"];
        return {
          kind: "choice",
          prompt: G.solid[lang],
          visual: e,
          options: options(SOLID_NAME[solid][lang], pool.map((x) => SOLID_NAME[x][lang]), level <= 3 ? 3 : 4),
          answer: SOLID_NAME[solid][lang],
        };
      }
      if (kind === "part") {
        const fracs = level === 4 ? ["1/2", "1/3", "1/4"] : ["1/2", "1/3", "1/4", "3/4", "2/3"];
        const f = pick(fracs);
        const [shaded, parts] = f.split("/").map(Number);
        return {
          kind: "choice",
          prompt: G.part[lang],
          fraction: { parts, shaded, shape: pick(["circle", "square"]), start: rand(0, parts - 1) },
          options: options(FRACTION_NAME[f][lang], fracs.map((x) => FRACTION_NAME[x][lang]), Math.min(4, fracs.length)),
          answer: FRACTION_NAME[f][lang],
        };
      }
      const [solid, e, faces, vertices] = pick(SOLID_FACTS);
      const askFaces = Math.random() < 0.5;
      const ans = askFaces ? faces : vertices;
      return {
        kind: "choice",
        prompt: askFaces ? G.faces[lang] : G.vertices[lang],
        visual: `${e}\n${SOLID_NAME[solid][lang]}`,
        options: options(ans, [4, 5, 6, 8, 10, 12].filter((x) => x !== ans), 4),
        answer: String(ans),
      };
    },
  },
  // ---------- maths ----------
  {
    id: "add100",
    subject: "plus",
    age: 6,
    icon: "💯",
    title: l("Рахуємо до 100", "Считаем до 100", "Adding to 100"),
    gen: (level, lang) => {
      let a: number, b: number, op: "+" | "−" = "+";
      if (level === 1) {
        a = rand(1, 8) * 10;
        b = rand(1, 9 - a / 10) * 10;
      } else if (level === 2) {
        a = rand(2, 9) * 10 + rand(0, 5);
        b = rand(1, 9 - (a % 10));
      } else if (level === 3) {
        a = rand(1, 5) * 10 + rand(0, 5);
        b = rand(1, 4) * 10 + rand(0, 4);
        if (Math.random() < 0.5) { op = "−"; a = a + b; }
      } else {
        // with carrying: the ones add up to 10 or more
        const at = rand(1, 6), ao = rand(5, 9);
        a = at * 10 + ao;
        b = rand(0, 8 - at) * 10 + rand(10 - ao, 9);
        if (level === 5 && Math.random() < 0.5) { op = "−"; a = a + b; }
      }
      const ans = op === "+" ? a + b : a - b;
      const near = [ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2].filter((x) => x >= 0 && x <= 100);
      return { kind: "choice", prompt: P.solve[lang], visual: `${a} ${op} ${b} = ?`, options: options(ans, near), answer: String(ans) };
    },
  },
  {
    id: "tensOnes",
    subject: "plus",
    age: 6,
    icon: "🧱",
    title: l("Десятки й одиниці", "Десятки и единицы", "Tens and ones"),
    gen: (level, lang) => {
      const t = rand(1, 9), o = rand(1, 9);
      if (level === 1 && Math.random() < 0.5) {
        const n = t * 10;
        const q = { uk: `Скільки десятків у числі ${n}?`, ru: `Сколько десятков в числе ${n}?`, en: `How many tens are in ${n}?` }[lang];
        return { kind: "choice", prompt: q, visual: `${n}`, options: options(t, [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => Math.abs(x - t) <= 3), 3), answer: String(t) };
      }
      if (level <= 2) {
        const ones = level === 1 ? 0 : o;
        const ans = t * 10 + ones;
        const text = ones ? `${t} ${w(t, TENS, lang)} + ${ones} ${w(ones, ONES, lang)} = ?` : `${t} ${w(t, TENS, lang)} = ?`;
        return { kind: "choice", prompt: P.solve[lang], visual: `${"🟦".repeat(t)}${ones ? "\n" + "🔹".repeat(ones) : ""}\n${text}`, options: options(ans, [ones * 10 + t, ans + 10, ans - 10, ans + 1].filter((x) => x > 0)), answer: String(ans) };
      }
      const n = t * 10 + o;
      if (level === 3 || level === 4) {
        const askTens = level === 3 || Math.random() < 0.5;
        const q = askTens
          ? { uk: `Скільки десятків у числі ${n}?`, ru: `Сколько десятков в числе ${n}?`, en: `How many tens are in ${n}?` }[lang]
          : { uk: `Скільки одиниць у числі ${n}?`, ru: `Сколько единиц в числе ${n}?`, en: `How many ones are in ${n}?` }[lang];
        const ans = askTens ? t : o;
        return { kind: "choice", prompt: q, visual: String(n), options: options(ans, [t, o, n, (ans + 1) % 10 || 1, ans + 2].filter((x) => x !== 0)), answer: String(ans) };
      }
      // level 5: regrouping, e.g. 4 tens + 12 ones
      const extra = rand(10, 19);
      const ans = t * 10 + extra;
      if (ans > 100) return { kind: "choice", prompt: P.solve[lang], visual: `${t} ${w(t, TENS, lang)} + ${o} ${w(o, ONES, lang)} = ?`, options: options(n, [n + 10, n - 10, o * 10 + t]), answer: String(n) };
      return { kind: "choice", prompt: P.solve[lang], visual: `${t} ${w(t, TENS, lang)} + ${extra} ${w(extra, ONES, lang)} = ?`, options: options(ans, [t * 10 + (extra % 10), ans + 10, ans - 1, t + extra]), answer: String(ans) };
    },
  },
  {
    id: "missingNum6",
    subject: "plus",
    age: 6,
    icon: "🪟",
    title: l("Число у віконці", "Число в окошке", "Missing number"),
    gen: (level, lang) => {
      const max = [10, 10, 20, 20, 50][level - 1];
      const a = rand(1, max - 1), b = rand(1, max - a);
      const s = a + b;
      const forms = level === 1 ? [0] : level === 2 ? [0, 1] : [0, 1, 2];
      const f = pick(forms);
      const visual = f === 0 ? `${a} + ☐ = ${s}` : f === 1 ? `☐ − ${a} = ${b}` : `${s} − ☐ = ${a}`;
      const ans = f === 0 ? b : f === 1 ? s : b;
      return { kind: "choice", prompt: P.missing[lang], visual, options: numOptions(ans, 2, 4, 0), answer: String(ans) };
    },
  },
  {
    id: "groups6",
    subject: "plus",
    age: 6,
    icon: "🍱",
    title: l("Множення групами", "Умножение группами", "Groups (times)"),
    gen: (level, lang) => {
      const size = level <= 2 ? pick([2, 3]) : level === 3 ? pick([2, 5]) : pick([2, 3, 5, 10]);
      const n = rand(2, level <= 2 ? 3 : level === 3 ? 4 : 5);
      const e = pick(EMOJI);
      const ans = size * n;
      const pictures = size <= 5 ? Array.from({ length: n }, () => e.repeat(size)).join("  ") : "";
      const expr = level >= 3 ? `${n} × ${size} = ?` : "";
      const visual = [pictures, expr].filter(Boolean).join("\n");
      return { kind: "choice", prompt: P.groups[lang], visual, options: numOptions(ans, 3, 4, 1), answer: String(ans) };
    },
  },
  {
    id: "skipCount6",
    subject: "plus",
    age: 6,
    icon: "🦘",
    title: l("Лічба стрибками", "Счёт прыжками", "Skip counting"),
    gen: (level, lang) => {
      // Common Core K–2: count by 10s, 5s, 2s, then 10s and 100s from any number, and backward
      let step: number;
      let start: number;
      let down = false;
      if (level === 1) {
        step = 10;
        start = 10 * rand(0, 4);
      } else if (level === 2) {
        step = 5;
        start = 5 * rand(0, 4);
      } else if (level === 3) {
        step = 2;
        start = 2 * rand(0, 10);
      } else if (level === 4) {
        step = 10;
        start = rand(1, 9) + 10 * rand(0, 3); // 23, 33, 43…
        down = Math.random() < 0.3;
      } else {
        step = pick([100, 5, 10]);
        start = step === 100 ? 100 * rand(0, 3) : step === 5 ? 5 * rand(0, 10) : rand(1, 9) + 10 * rand(0, 4);
        down = Math.random() < 0.4;
      }
      let seq = Array.from({ length: 6 }, (_, i) => start + i * step);
      if (down) seq = seq.reverse();
      const hole = rand(1, 5);
      const ans = seq[hole];
      const shown = seq.map((x, i) => (i === hole ? "❓" : String(x))).join("  ");
      const prompt = hole === 5 ? P.skip[lang] : P.skipMid[lang];
      if (level >= 4) return { kind: "input", inputMode: "numeric", prompt, visual: shown, answer: String(ans) };
      return { kind: "choice", prompt, visual: shown, options: options(ans, [ans + step, ans - step, ans + 1, ans - 1, ans + 10].filter((x) => x >= 0)), answer: String(ans) };
    },
  },
  {
    id: "clock6",
    subject: "plus",
    age: 6,
    icon: "🕒",
    title: l("Годинник: стрілки й цифри", "Часы: стрелки и цифры", "Clocks: hands and digits"),
    gen: (level, lang) => {
      const mins = [[0], [0, 30], [0, 15, 30, 45], [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], [5, 10, 20, 25, 35, 40, 50, 55]][level - 1];
      const h = rand(1, 12);
      const m = pick(mins);
      const wrap = (x: number) => ((x + 11) % 12) + 1;
      const fmt = (hh: number, mm: number) => `${wrap(hh)}:${String(mm).padStart(2, "0")}`;
      // US clocks show no leading zero for the hour (5:00, not 05:00)
      const lcd = (hh: number, mm: number) => `${lang === "en" ? hh : String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      // classic mistakes: hour one off, hands swapped, half an hour off
      const near = (hh: number, mm: number) => [fmt(hh + 1, mm), fmt(hh - 1, mm), fmt(hh, (mm + 30) % 60), fmt(mm / 5 || 12, (hh * 5) % 60)];
      const kind = level <= 3 ? pick(["read", "toAnalog"]) : level === 4 ? pick(["read", "toAnalog", "h24"]) : pick(["toAnalog", "h24", "later", "later"]);
      if (kind === "toAnalog") {
        // electronic clock shown, pick the clock with hands
        const ans = fmt(h, m);
        return { kind: "choice", prompt: T.toAnalog[lang], digital: lcd(h, m), options: options(ans, near(h, m)), answer: ans, clockOptions: true };
      }
      if (kind === "h24" && lang === "en") {
        // US: a.m. or p.m. from an everyday moment (Common Core 2.MD.7)
        const [what, hh, mm, pm] = pick(AMPM);
        return { kind: "choice", prompt: `${what} at ${hh}:${String(mm).padStart(2, "0")}. Is that a.m. or p.m.?`, clock: { h: hh, m: mm }, options: ["a.m.", "p.m."], answer: pm ? "p.m." : "a.m." };
      }
      if (kind === "h24") {
        // afternoon time on an electronic clock: 15:00 is 3 o'clock on the dial
        const hh = rand(13, 22);
        const ans = fmt(hh - 12, m);
        return { kind: "choice", prompt: T.h24[lang], digital: lcd(hh, m), options: options(ans, near(hh - 12, m)), answer: ans, clockOptions: true };
      }
      if (kind === "later") {
        const dur = pick([15, 30, 45, 60]);
        const start = (h % 12) * 60 + pick([0, 15, 30, 45]);
        const endT = start + dur;
        const ans = fmt(Math.floor(endT / 60), endT % 60);
        const what = pick(T.events)[lang];
        const prompt = { uk: `${what} почався о ${fmt(Math.floor(start / 60), start % 60)} і тривав ${dur} хв. О котрій він закінчився?`, ru: `${what} начался в ${fmt(Math.floor(start / 60), start % 60)} и длился ${dur} мин. Во сколько он закончился?`, en: `${what} started at ${fmt(Math.floor(start / 60), start % 60)} and lasted ${dur} minutes. When did it end?` }[lang];
        const wrong = [start + dur + 15, start + dur - 15, start + dur + 60, start].map((x) => fmt(Math.floor(x / 60), ((x % 60) + 60) % 60));
        return { kind: "choice", prompt, clock: { h: wrap(Math.floor(start / 60)), m: start % 60 }, options: options(ans, wrong), answer: ans };
      }
      const ans = fmt(h, m);
      return { kind: "choice", prompt: P.clock[lang], clock: { h, m }, options: options(ans, near(h, m)), answer: ans };
    },
  },
  {
    id: "problems6",
    subject: "plus",
    age: 6,
    icon: "📖",
    title: l("Задачі-історії", "Задачи-истории", "Story problems"),
    gen: (level, lang) => {
      const pool = level <= 1 ? STORIES.slice(0, 2) : level <= 3 ? STORIES.slice(0, 4) : STORIES;
      const { text, answer } = pick(pool)(level, lang);
      return { kind: "choice", prompt: text, options: numOptions(answer, 2, 4, 0), answer: String(answer) };
    },
  },

  // ---------- logic ----------
  {
    id: "sudoku6",
    subject: "plus",
    age: 6,
    icon: "🔲",
    title: l("Міні-судоку", "Мини-судоку", "Mini sudoku"),
    gen: (level, lang) => {
      const n = level <= 2 ? 3 : 4;
      const icons = sample(pick(CATEGORIES).items, n);
      for (let attempt = 0; attempt < 50; attempt++) {
        const g = latin(n);
        const r = rand(0, n - 1), c = rand(0, n - 1);
        const blanks = new Set<string>();
        if (level === 2 || level === 3) {
          // one extra blank outside the target's row and column
          let rr = rand(0, n - 1), cc = rand(0, n - 1);
          while (rr === r || cc === c) [rr, cc] = [rand(0, n - 1), rand(0, n - 1)];
          blanks.add(`${rr},${cc}`);
        }
        if (level >= 4) {
          let cc = rand(0, n - 1);
          while (cc === c) cc = rand(0, n - 1);
          blanks.add(`${r},${cc}`);
        }
        if (level === 5) {
          let rr = rand(0, n - 1);
          while (rr === r) rr = rand(0, n - 1);
          blanks.add(`${rr},${c}`);
        }
        // the target must be the only possible symbol
        const seen = new Set<number>();
        for (let k = 0; k < n; k++) {
          if (k !== c && !blanks.has(`${r},${k}`)) seen.add(g[r][k]);
          if (k !== r && !blanks.has(`${k},${c}`)) seen.add(g[k][c]);
        }
        if (seen.size !== n - 1) continue;
        const grid = g.map((row, i) => row.map((v, j) => (i === r && j === c ? "❓" : blanks.has(`${i},${j}`) ? "" : icons[v])));
        return { kind: "choice", prompt: P.sudoku[lang], grid, options: shuffle(icons), answer: icons[g[r][c]], emojiOptions: true };
      }
      // fallback: 3x3 with a single blank
      const g = latin(3);
      const grid = g.map((row, i) => row.map((v, j) => (i === 0 && j === 0 ? "❓" : icons[v])));
      return { kind: "choice", prompt: P.sudoku[lang], grid, options: shuffle(icons.slice(0, 3)), answer: icons[g[0][0]], emojiOptions: true };
    },
  },
  {
    id: "balance6",
    subject: "plus",
    age: 6,
    icon: "⚖️",
    title: l("Терези", "Весы", "Balance scales"),
    gen: (level, lang) => {
      const [A, B, C, D] = sample(["🟥", "🟦", "🟩", "🟨", "🟪", "🟧"], 4);
      const rep = (e: string, k: number) => Array.from({ length: k }, () => e).join(" ");
      let lines: string[] = [];
      let ans = 0;
      if (level === 1) {
        // one scale: A weighs k Bs; how many Bs for two As?
        const k = rand(2, 5);
        lines = [`${A} = ${rep(B, k)}`, `${rep(A, 2)} = ❓ ${B}`];
        ans = k * 2;
      } else if (level === 2) {
        const k = rand(2, 4), m = rand(2, 3);
        lines = [`${A} = ${rep(B, k)}`, `${rep(A, m)} = ❓ ${B}`];
        ans = k * m;
      } else if (level === 3) {
        const k1 = rand(2, 3), k2 = rand(2, 3);
        lines = [`${A} = ${rep(B, k1)}`, `${B} = ${rep(C, k2)}`, `${A} = ❓ ${C}`];
        ans = k1 * k2;
      } else if (level === 4) {
        const k1 = rand(2, 3), k2 = rand(2, 3), m = 2;
        lines = [`${A} = ${rep(B, k1)}`, `${B} = ${rep(C, k2)}`, `${rep(A, m)} = ❓ ${C}`];
        ans = k1 * k2 * m;
      } else {
        const k1 = rand(2, 3), k2 = rand(2, 3), k3 = 2;
        lines = [`${A} = ${rep(B, k1)}`, `${B} = ${rep(C, k2)}`, `${C} = ${rep(D, k3)}`, `${A} = ❓ ${D}`];
        ans = k1 * k2 * k3;
      }
      return { kind: "choice", prompt: P.balance[lang], visual: `⚖️\n${lines.join("\n")}`, options: numOptions(ans, 2, 4, 1), answer: String(ans) };
    },
  },
  {
    id: "analogies6",
    subject: "plus",
    age: 6,
    icon: "🔗",
    title: l("Пари-аналогії", "Пары-аналогии", "Analogies"),
    gen: (level, lang) => {
      const groups = PAIR_GROUPS.filter((g) => g.lvl <= level);
      const group = level >= 4 ? pick(groups.filter((g) => g.lvl >= 3)) : pick(groups);
      const [p1, p2] = sample(group.pairs, 2);
      const others = PAIR_GROUPS.filter((g) => g !== group).flatMap((g) => g.pairs.map((p) => p[1])).filter((e) => e !== p2[1]);
      return {
        kind: "choice",
        prompt: P.analogy[lang],
        visual: `${p1[0]} ➜ ${p1[1]}\n${p2[0]} ➜ ❓`,
        options: options(p2[1], others, level <= 1 ? 3 : 4),
        answer: p2[1],
        emojiOptions: true,
      };
    },
  },
];
