import { l, type Lang } from "../i18n";
import { type Skill, pick, rand, options, numOptions, shuffle, sample, speechLang } from "../engine";
import { BASIC_WORDS } from "./words";

// ---------------- shapes (6) ----------------
export type ShapeId = "circle" | "square" | "triangle" | "rectangle" | "rhombus" | "oval" | "pentagon" | "hexagon";

const SHAPES: Record<ShapeId, { name: Record<Lang, string>; corners: number }> = {
  circle: { name: { uk: "круг", ru: "круг", en: "circle" }, corners: 0 },
  square: { name: { uk: "квадрат", ru: "квадрат", en: "square" }, corners: 4 },
  triangle: { name: { uk: "трикутник", ru: "треугольник", en: "triangle" }, corners: 3 },
  rectangle: { name: { uk: "прямокутник", ru: "прямоугольник", en: "rectangle" }, corners: 4 },
  rhombus: { name: { uk: "ромб", ru: "ромб", en: "rhombus" }, corners: 4 },
  oval: { name: { uk: "овал", ru: "овал", en: "oval" }, corners: 0 },
  pentagon: { name: { uk: "п'ятикутник", ru: "пятиугольник", en: "pentagon" }, corners: 5 },
  hexagon: { name: { uk: "шестикутник", ru: "шестиугольник", en: "hexagon" }, corners: 6 },
};
const SHAPES_BY_LEVEL: ShapeId[][] = [
  ["circle", "square", "triangle"],
  ["circle", "square", "triangle", "rectangle"],
  ["circle", "square", "triangle", "rectangle", "rhombus", "oval"],
  ["circle", "square", "triangle", "rectangle", "rhombus", "oval", "pentagon"],
  ["circle", "square", "triangle", "rectangle", "rhombus", "oval", "pentagon", "hexagon"],
];

// ---------------- syllables (6) ----------------
const VOWELS: Record<"uk" | "ru", RegExp> = { uk: /[аеєиіїоуюя]/gi, ru: /[аеёиоуыэюя]/gi };
const EN_SYLLABLES: Record<string, number> = {
  apple: 2, cat: 1, dog: 1, house: 1, sun: 1, fish: 1, tree: 1, car: 1, elephant: 3, banana: 3, bear: 1, fox: 1,
  frog: 1, watermelon: 4, carrot: 2, mouse: 1, owl: 1, moon: 1, star: 1, bee: 1, duck: 1, cow: 1, pear: 1, cheese: 1,
  wolf: 1, balloon: 2, ball: 1, turtle: 2, giraffe: 2, snake: 1, grapes: 1, rabbit: 2, rooster: 2, train: 1, milk: 1,
  lemon: 2, penguin: 2, lion: 2, tiger: 2, pig: 1, horse: 1, bread: 1, book: 1, pencil: 2, flower: 2,
};
const syllables = (word: string, lang: Lang) =>
  lang === "en" ? EN_SYLLABLES[word] ?? 0 : (word.match(VOWELS[lang]) ?? []).length;

/** Extra picture words for syllable counting, so 2-, 3- and 4-syllable answers are as common as 1. */
const SYL_EXTRA: [string, string, number][] = [
  ["🐒", "monkey", 2], ["🍕", "pizza", 2], ["🤖", "robot", 2], ["🚀", "rocket", 2], ["🍪", "cookie", 2], ["🦓", "zebra", 2],
  ["🐼", "panda", 2], ["🕷️", "spider", 2], ["🧁", "cupcake", 2], ["🌈", "rainbow", 2], ["🐰", "bunny", 2], ["🧸", "teddy", 2],
  ["🦕", "dinosaur", 3], ["🦋", "butterfly", 3], ["🍓", "strawberry", 3], ["🦘", "kangaroo", 3], ["🐙", "octopus", 3],
  ["🍍", "pineapple", 3], ["🍅", "tomato", 3], ["🥔", "potato", 3], ["☂️", "umbrella", 3], ["🥦", "broccoli", 3], ["🍔", "hamburger", 3],
  ["🐛", "caterpillar", 4], ["🚁", "helicopter", 4], ["🥑", "avocado", 4], ["🐊", "alligator", 4], ["📺", "television", 4], ["🥣", "macaroni", 4],
];

// ---------------- calendar (6) ----------------
const DAYS = {
  uk: ["понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"],
  ru: ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"],
  // US calendars start the week on Sunday
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};
const DAYS_GEN = {
  uk: ["понеділка", "вівторка", "середи", "четверга", "п'ятниці", "суботи", "неділі"],
  ru: ["понедельника", "вторника", "среды", "четверга", "пятницы", "субботы", "воскресенья"],
  en: DAYS.en,
};
const DAYS_INS = {
  uk: ["понеділком", "вівторком", "середою", "четвергом", "п'ятницею", "суботою", "неділею"],
  ru: ["понедельником", "вторником", "средой", "четвергом", "пятницей", "субботой", "воскресеньем"],
  en: DAYS.en,
};
const SEASONS = { uk: ["зима", "весна", "літо", "осінь"], ru: ["зима", "весна", "лето", "осень"], en: ["winter", "spring", "summer", "fall"] };
const SEASONS_GEN = { uk: ["зими", "весни", "літа", "осені"], ru: ["зимы", "весны", "лета", "осени"], en: SEASONS.en };
const SEASON_EMOJI = ["⛄", "🌷", "🏖️", "🍂"];
/** Several pictures per season and per time of day, so the same picture does not come back every round. */
const SEASON_PICS = [["⛄", "🛷", "🧤", "❄️"], ["🌷", "🐣", "🌱", "🦋"], ["🏖️", "🍉", "🏊", "🍦"], ["🍂", "🍄", "🍁", "🌧️"]];
const DAYPART_PICS = [["🌅", "🐓", "🥣"], ["🌞", "🏫", "🍽️"], ["🌇", "🛁", "📺"], ["🌙", "⭐", "😴"]];
const SEASON_WHEN = {
  uk: ["взимку", "навесні", "влітку", "восени"],
  ru: ["зимой", "весной", "летом", "осенью"],
  en: ["in winter", "in spring", "in summer", "in fall"],
};
const DAYPART = { uk: ["ранок", "день", "вечір", "ніч"], ru: ["утро", "день", "вечер", "ночь"], en: ["morning", "afternoon", "evening", "night"] };

// ---------------- parts of speech (11) ----------------
const POS_NAMES: Record<Lang, string[]> = {
  uk: ["іменник", "прикметник", "дієслово", "прислівник", "числівник"],
  ru: ["существительное", "прилагательное", "глагол", "наречие", "числительное"],
  en: ["noun", "adjective", "verb", "adverb", "numeral"],
};
const POS_WORDS: Record<Lang, string[][]> = {
  uk: [
    ["книжка", "річка", "радість", "сонце", "учитель", "мрія", "вікно", "дружба", "ліс", "місто", "пісня", "зошит"],
    ["зелений", "веселий", "високий", "дерев'яний", "смачний", "холодний", "мамин", "розумний", "яскравий", "тихий", "літній", "сміливий"],
    ["читати", "біжить", "малювали", "співає", "думати", "стрибнув", "говоримо", "плисти", "будуємо", "спить", "писати", "грає"],
    ["швидко", "вчора", "тут", "завжди", "далеко", "вранці", "голосно", "ніколи", "тепер", "поруч", "влітку", "повільно"],
    ["п'ять", "сьомий", "двадцять", "сто", "перший", "три", "дев'ятий", "десять", "другий", "сорок"],
  ],
  ru: [
    ["книга", "река", "радость", "солнце", "учитель", "мечта", "окно", "дружба", "лес", "город", "песня", "тетрадь"],
    ["зелёный", "весёлый", "высокий", "деревянный", "вкусный", "холодный", "мамин", "умный", "яркий", "тихий", "летний", "смелый"],
    ["читать", "бежит", "рисовали", "поёт", "думать", "прыгнул", "говорим", "плыть", "строим", "спит", "писать", "играет"],
    ["быстро", "вчера", "здесь", "всегда", "далеко", "утром", "громко", "никогда", "теперь", "рядом", "летом", "медленно"],
    ["пять", "седьмой", "двадцать", "сто", "первый", "три", "девятый", "десять", "второй", "сорок"],
  ],
  en: [
    ["book", "river", "happiness", "sun", "teacher", "chair", "window", "friendship", "forest", "city", "song", "notebook"],
    ["green", "happy", "tall", "wooden", "tasty", "noisy", "clever", "bright", "quiet", "brave", "heavy", "sunny"],
    ["write", "sing", "think", "bring", "choose", "forget", "swim", "sleep", "become", "catch", "speak", "eat"],
    ["quickly", "yesterday", "here", "always", "happily", "often", "slowly", "loudly", "never", "now", "soon", "carefully"],
    ["five", "seventh", "twenty", "hundred", "first", "three", "ninth", "ten", "eleventh", "forty"],
  ],
};

// ---------------- units (11) ----------------
type Unit = "km" | "m" | "dm" | "cm" | "mm" | "t" | "kg" | "g" | "h" | "min" | "s" | "wk" | "d";
const U: Record<Unit, Record<Lang, string>> = {
  km: { uk: "км", ru: "км", en: "km" },
  m: { uk: "м", ru: "м", en: "m" },
  dm: { uk: "дм", ru: "дм", en: "dm" },
  cm: { uk: "см", ru: "см", en: "cm" },
  mm: { uk: "мм", ru: "мм", en: "mm" },
  t: { uk: "т", ru: "т", en: "t" },
  kg: { uk: "кг", ru: "кг", en: "kg" },
  g: { uk: "г", ru: "г", en: "g" },
  h: { uk: "год", ru: "ч", en: "h" },
  min: { uk: "хв", ru: "мин", en: "min" },
  s: { uk: "с", ru: "с", en: "s" },
  wk: { uk: "тиж.", ru: "нед.", en: "wk" },
  d: { uk: "дн.", ru: "дн.", en: "days" },
};
const CONV: { from: Unit; to: Unit; k: number; lvl: number }[] = [
  { from: "m", to: "cm", k: 100, lvl: 1 },
  { from: "cm", to: "mm", k: 10, lvl: 1 },
  { from: "dm", to: "cm", k: 10, lvl: 1 },
  { from: "h", to: "min", k: 60, lvl: 2 },
  { from: "km", to: "m", k: 1000, lvl: 2 },
  { from: "kg", to: "g", k: 1000, lvl: 2 },
  { from: "wk", to: "d", k: 7, lvl: 2 },
  { from: "t", to: "kg", k: 1000, lvl: 3 },
  { from: "min", to: "s", k: 60, lvl: 3 },
  { from: "m", to: "mm", k: 1000, lvl: 3 },
];

/** Coloured emoji shapes for "find the shape" (shapes that have an emoji). */
const SHAPE_EMOJI: Partial<Record<ShapeId, string[]>> = {
  circle: ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣"],
  square: ["🟥", "🟧", "🟨", "🟩", "🟦", "🟪"],
  triangle: ["🔺", "🔻"],
  rhombus: ["🔶", "🔷"],
};
/** Everyday objects and the shape they look like. */
const SHAPE_OBJECTS: [string, ShapeId][] = [
  ["🍕", "triangle"], ["⛺", "triangle"], ["📐", "triangle"],
  ["⚽", "circle"], ["🍪", "circle"], ["🕐", "circle"], ["🍩", "circle"],
  ["🎲", "square"], ["🧇", "square"], ["🖼️", "square"],
  ["🚪", "rectangle"], ["📱", "rectangle"], ["📺", "rectangle"],
  ["🥚", "oval"], ["🪁", "rhombus"],
];


const MONTHS = {
  uk: ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"],
  ru: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const MONTHS_GEN = {
  uk: ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const MONTHS_INS = {
  uk: ["січнем", "лютим", "березнем", "квітнем", "травнем", "червнем", "липнем", "серпнем", "вереснем", "жовтнем", "листопадом", "груднем"],
  ru: ["январём", "февралём", "мартом", "апрелем", "маем", "июнем", "июлем", "августом", "сентябрём", "октябрём", "ноябрём", "декабрём"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
/** Season index (0 winter … 3 autumn) of a month index. */
const seasonOf = (m: number) => (m === 11 || m <= 1 ? 0 : m <= 4 ? 1 : m <= 7 ? 2 : 3);
const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
const CAL = {
  orderDays: l("Розклади дні тижня по порядку", "Разложи дни недели по порядку", "Put the days in order"),
  orderMonths: l("Розклади місяці по порядку", "Разложи месяцы по порядку", "Put the months in order"),
  firstDay: l("Який день тижня перший?", "Какой день недели первый?", "Which is the first day of the week?"),
  daysInWeek: l("Скільки днів у тижні?", "Сколько дней в неделе?", "How many days are in a week?"),
  monthsInYear: l("Скільки місяців у році?", "Сколько месяцев в году?", "How many months are in a year?"),
  firstMonth: l("Який місяць у році перший?", "Какой месяц в году первый?", "Which is the first month of the year?"),
  lastMonth: l("Який місяць у році останній?", "Какой месяц в году последний?", "Which is the last month of the year?"),
};

const P = {
  find: l("Знайди фігуру:", "Найди фигуру:", "Find the shape:"),
  looksLike: l("На яку фігуру це схоже?", "На какую фигуру это похоже?", "Which shape does it look like?"),
  shapeName: l("Як називається ця фігура?", "Как называется эта фигура?", "What is this shape called?"),
  corners: l("Скільки кутів у цієї фігури?", "Сколько углов у этой фигуры?", "How many corners does this shape have?"),
  syllables: l("Скільки складів у слові?", "Сколько слогов в слове?", "How many syllables are in the word?"),
  season: l("Яка це пора року?", "Какое это время года?", "Which season is this?"),
  daypart: l("Яка це частина доби?", "Какая это часть суток?", "What time of day is this?"),
  bigger: l("Яке число більше?", "Какое число больше?", "Which number is bigger?"),
  solve: l("Обчисли", "Вычисли", "Calculate"),
  convert: l("Переведи в інші одиниці", "Переведи в другие единицы", "Convert the units"),
  pos: l("Яка це частина мови?", "Какая это часть речи?", "Which part of speech is this?"),
};

const dec = (hundredths: number, places: number, lang: Lang) => {
  const s = (hundredths / 100).toFixed(places);
  return lang === "en" ? s : s.replace(".", ",");
};

export const extraSkills: Skill[] = [
  // ---------- 6 years ----------
  {
    id: "shapes6",
    subject: "math",
    age: 6,
    icon: "🔷",
    title: l("Геометричні фігури", "Геометрические фигуры", "Shapes"),
    gen: (level, lang) => {
      const pool = SHAPES_BY_LEVEL[level - 1];
      const id = pick(pool);
      const kind = level <= 2 ? pick(["name", "find", "find"]) : pick(["name", "find", "object", "corners"]);
      if (kind === "find") {
        const findable = pool.filter((x) => SHAPE_EMOJI[x]);
        const target = pick(findable);
        const others = sample(findable.filter((x) => x !== target), Math.min(level <= 1 ? 2 : 3, findable.length - 1));
        const right = pick(SHAPE_EMOJI[target]!);
        return {
          kind: "choice",
          prompt: `${P.find[lang]} ${SHAPES[target].name[lang]}`,
          options: shuffle([right, ...others.map((x) => pick(SHAPE_EMOJI[x]!))]),
          answer: right,
          emojiOptions: true,
        };
      }
      if (kind === "object") {
        const objs = SHAPE_OBJECTS.filter(([, sh]) => pool.includes(sh));
        const [e, sh] = pick(objs);
        return {
          kind: "choice",
          prompt: P.looksLike[lang],
          visual: e,
          options: options(SHAPES[sh].name[lang], pool.map((x) => SHAPES[x].name[lang]), Math.min(4, pool.length)),
          answer: SHAPES[sh].name[lang],
        };
      }
      if (kind === "corners") {
        const withCorners = pool.filter((s) => SHAPES[s].corners > 0);
        const sid = pick(withCorners);
        const c = SHAPES[sid].corners;
        return { kind: "choice", prompt: P.corners[lang], shape: sid, options: numOptions(c, 2, 4, 3).slice(0, 4), answer: String(c) };
      }
      return {
        kind: "choice",
        prompt: P.shapeName[lang],
        shape: id,
        options: options(SHAPES[id].name[lang], pool.map((s) => SHAPES[s].name[lang]), Math.min(4, pool.length)),
        answer: SHAPES[id].name[lang],
      };
    },
  },
  {
    id: "syllables6",
    subject: "lang",
    age: 6,
    icon: "👏",
    title: l("Склади", "Слоги", "Syllables"),
    gen: (level, lang) => {
      const maxSyl = [2, 3, 3, 4, 4][level - 1];
      let w: { e: string; text: string };
      let n: number;
      if (lang === "en") {
        // pick the syllable count first, so every answer is equally likely
        const all = [
          ...BASIC_WORDS.map((x) => ({ e: x.e, text: x.en, n: syllables(x.en, "en") })),
          ...SYL_EXTRA.map(([e, text, k]) => ({ e, text, n: k })),
        ];
        const target = rand(1, maxSyl);
        const c = pick(all.filter((x) => x.n === target));
        w = c;
        n = c.n;
      } else {
        const pool = BASIC_WORDS.filter((x) => {
          const k = syllables(x[lang], lang);
          return k >= 1 && k <= maxSyl;
        });
        const x = pick(pool);
        w = { e: x.e, text: x[lang] };
        n = syllables(x[lang], lang);
      }
      return {
        kind: "choice",
        prompt: P.syllables[lang],
        visual: `${w.e}\n${w.text.toLocaleUpperCase()}`,
        speak: { text: w.text, lang: speechLang[lang], auto: true },
        options: ["1", "2", "3", "4"].slice(0, Math.max(3, maxSyl)),
        answer: String(n),
      };
    },
  },
  {
    id: "calendar6",
    subject: "logic",
    age: 6,
    icon: "📅",
    title: l("Дні тижня, місяці, пори року", "Дни недели, месяцы, времена года", "Days, months, seasons"),
    gen: (level, lang) => {
      const dayType = level === 1 ? pick(["after", "first", "season", "seasonPic"]) : level === 2 ? pick(["after", "before", "monthAfter", "orderDays"]) : level === 3 ? pick(["before", "afterTomorrow", "monthBefore", "monthSeason", "orderDays", "orderMonths"]) : level === 4 ? pick(["inDays", "monthIn", "orderMonths", "counts", "firstLast", "monthSeason"]) : pick(["daysAgo", "yesterday", "monthIn", "monthAgo", "orderMonths"]);
      const D = DAYS[lang], M = MONTHS[lang];
      const choose = (prompt: string, ans: string, pool: string[], visual = "📅") => ({ kind: "choice" as const, prompt, visual, options: options(ans, pool, 4), answer: ans });
      const order = (list: string[], from: number, n: number, prompt: string) => {
        const seq = Array.from({ length: n }, (_, k) => list[(from + k) % list.length]);
        let tokens = shuffle(seq);
        while (tokens.join() === seq.join()) tokens = shuffle(seq);
        return { kind: "order" as const, prompt, tokens, answer: seq.join(" ") };
      };
      const i = rand(0, 6);
      const m = rand(0, 11);
      switch (dayType) {
        case "seasonPic": {
          const k = rand(0, 3);
          return { kind: "choice", prompt: P.season[lang], visual: pick(SEASON_PICS[k]), options: shuffle(SEASONS[lang]), answer: SEASONS[lang][k] };
        }
        case "season": {
          const k = rand(0, 3);
          const right = pick(SEASON_PICS[k]);
          const wrong = [0, 1, 2, 3].filter((j) => j !== k).map((j) => pick(SEASON_PICS[j]));
          const prompt = { uk: `Що буває ${SEASON_WHEN.uk[k]}?`, ru: `Что бывает ${SEASON_WHEN.ru[k]}?`, en: `What do we see ${SEASON_WHEN.en[k]}?` }[lang];
          return { kind: "choice", prompt, options: shuffle([right, ...wrong.slice(0, 2)]), answer: right, emojiOptions: true };
        }
        case "first":
          return choose(CAL.firstDay[lang], D[0], D);
        case "after":
          return choose({ uk: `Який день іде після ${DAYS_GEN.uk[i]}?`, ru: `Какой день идёт после ${DAYS_GEN.ru[i]}?`, en: `Which day comes after ${D[i]}?` }[lang], D[(i + 1) % 7], D);
        case "before":
          return choose({ uk: `Який день іде перед ${DAYS_INS.uk[i]}?`, ru: `Какой день идёт перед ${DAYS_INS.ru[i]}?`, en: `Which day comes before ${D[i]}?` }[lang], D[(i + 6) % 7], D);
        case "afterTomorrow":
          return choose({ uk: `Сьогодні ${D[i]}. Який день буде післязавтра?`, ru: `Сегодня ${D[i]}. Какой день будет послезавтра?`, en: `Today is ${D[i]}. What day is the day after tomorrow?` }[lang], D[(i + 2) % 7], D);
        case "inDays": {
          const n = rand(2, 4);
          return choose({ uk: `Сьогодні ${D[i]}. Який день буде через ${n} ${n === 4 ? "дні" : "дні"}?`, ru: `Сегодня ${D[i]}. Какой день будет через ${n} дня?`, en: `Today is ${D[i]}. What day will it be in ${n} days?` }[lang], D[(i + n) % 7], D);
        }
        case "daysAgo": {
          const n = rand(2, 4);
          return choose({ uk: `Сьогодні ${D[i]}. Який день був ${n} дні тому?`, ru: `Сегодня ${D[i]}. Какой день был ${n} дня назад?`, en: `Today is ${D[i]}. What day was it ${n} days ago?` }[lang], D[(i + 7 - n) % 7], D);
        }
        case "yesterday":
          return choose({ uk: `Завтра ${D[i]}. Який день був учора?`, ru: `Завтра ${D[i]}. Какой день был вчера?`, en: `Tomorrow is ${D[i]}. What day was yesterday?` }[lang], D[(i + 5) % 7], D);
        case "monthAfter":
          return choose({ uk: `Який місяць іде після ${MONTHS_GEN.uk[m]}?`, ru: `Какой месяц идёт после ${MONTHS_GEN.ru[m]}?`, en: `Which month comes after ${M[m]}?` }[lang], M[(m + 1) % 12], M, "🗓️");
        case "monthBefore":
          return choose({ uk: `Який місяць іде перед ${MONTHS_INS.uk[m]}?`, ru: `Какой месяц идёт перед ${MONTHS_INS.ru[m]}?`, en: `Which month comes before ${M[m]}?` }[lang], M[(m + 11) % 12], M, "🗓️");
        case "monthIn": {
          const n = rand(2, 3);
          return choose({ uk: `Який місяць буде через ${n} місяці після ${MONTHS_GEN.uk[m]}?`, ru: `Какой месяц будет через ${n} месяца после ${MONTHS_GEN.ru[m]}?`, en: `Which month is ${n} months after ${M[m]}?` }[lang], M[(m + n) % 12], M, "🗓️");
        }
        case "monthAgo": {
          const n = rand(2, 3);
          return choose({ uk: `Який місяць був за ${n} місяці до ${MONTHS_GEN.uk[m]}?`, ru: `Какой месяц был за ${n} месяца до ${MONTHS_GEN.ru[m]}?`, en: `Which month is ${n} months before ${M[m]}?` }[lang], M[(m + 12 - n) % 12], M, "🗓️");
        }
        case "monthSeason":
          return { kind: "choice", prompt: { uk: `${cap(M[m])}: яка це пора року?`, ru: `${cap(M[m])}: какое это время года?`, en: `${M[m]}: which season is it?` }[lang], visual: "🗓️", options: shuffle(SEASONS[lang]), answer: SEASONS[lang][seasonOf(m)] };
        case "counts":
          return Math.random() < 0.5
            ? { kind: "choice", prompt: CAL.daysInWeek[lang], visual: "📅", options: shuffle(["5", "6", "7", "8"]), answer: "7" }
            : { kind: "choice", prompt: CAL.monthsInYear[lang], visual: "🗓️", options: shuffle(["10", "11", "12", "13"]), answer: "12" };
        case "firstLast":
          return Math.random() < 0.5 ? choose(CAL.firstMonth[lang], M[0], M, "🗓️") : choose(CAL.lastMonth[lang], M[11], M, "🗓️");
        case "orderDays":
          return order(D, i, level <= 2 ? 3 : 4, CAL.orderDays[lang]);
        default:
          return order(M, m, level <= 3 ? 3 : level === 4 ? 4 : 5, CAL.orderMonths[lang]);
      }
    },
  },

  // ---------- 11 years ----------
  {
    id: "orderOps11",
    subject: "math",
    age: 11,
    icon: "🧷",
    title: l("Порядок дій", "Порядок действий", "Order of operations"),
    gen: (level, lang) => {
      let expr = "";
      let ans = 0;
      const t = level <= 1 ? 0 : level === 2 ? rand(0, 1) : level === 3 ? rand(1, 2) : level === 4 ? rand(2, 3) : rand(3, 4);
      if (t === 0) {
        const [a, b, c] = [rand(2, 30), rand(2, 9), rand(2, 9)];
        [expr, ans] = Math.random() < 0.5 ? [`${a} + ${b} × ${c}`, a + b * c] : [`${b} × ${c} + ${a}`, a + b * c];
      } else if (t === 1) {
        const c = rand(2, 9), q = rand(2, 9);
        if (Math.random() < 0.5) {
          const a = rand(q + 1, q + 40);
          [expr, ans] = [`${a} − ${q * c} : ${c}`, a - q];
        } else {
          const x = rand(2, 9), y = rand(1, x * c - 1);
          [expr, ans] = [`${x} × ${c} − ${y}`, x * c - y];
        }
      } else if (t === 2) {
        const [a, b, c] = [rand(2, 20), rand(2, 20), rand(2, 9)];
        if (Math.random() < 0.5) [expr, ans] = [`(${a} + ${b}) × ${c}`, (a + b) * c];
        else {
          const [x, y] = a > b ? [a, b] : [b + 1, a];
          [expr, ans] = [`${c} × (${x} − ${y})`, c * (x - y)];
        }
      } else if (t === 3) {
        const [a, b, c, e] = [rand(10, 60), rand(2, 9), rand(2, 9), rand(2, 9)];
        const d = e * rand(1, 5);
        [expr, ans] = [`${a} + ${b} × ${c} − ${d} : ${e}`, a + b * c - d / e];
      } else {
        const [a, b, c, d, e] = [rand(2, 15), rand(2, 15), rand(3, 9), rand(2, 6), rand(2, 6)];
        [expr, ans] = [`(${a} + ${b}) × ${c} − ${d} × ${e}`, (a + b) * c - d * e];
        if (ans < 0) [expr, ans] = [`(${a} + ${b}) × ${c} + ${d} × ${e}`, (a + b) * c + d * e];
      }
      return { kind: "input", inputMode: "numeric", prompt: P.solve[lang], visual: `${expr} = ?`, answer: String(ans) };
    },
  },
  {
    id: "decimals11",
    subject: "math",
    age: 11,
    icon: "🔟",
    title: l("Десяткові дроби", "Десятичные дроби", "Decimals"),
    gen: (level, lang) => {
      if (level <= 2) {
        let a: number, b: number, pa = 1, pb = 1;
        if (level === 1) {
          a = rand(1, 99) * 10;
          b = rand(1, 99) * 10;
          while (b === a) b = rand(1, 99) * 10;
        } else {
          // trap: 0,5 vs 0,45
          const whole = rand(0, 9);
          a = whole * 100 + rand(1, 9) * 10;
          b = whole * 100 + rand(10, 99);
          pb = 2;
          if (b % 10 === 0) b += 1;
          if (b === a) b += 3;
        }
        const A = dec(a, pa, lang), B = dec(b, pb, lang);
        return { kind: "choice", prompt: P.bigger[lang], options: shuffle([A, B]), answer: a > b ? A : B };
      }
      if (level === 3) {
        const a = rand(1, 99) * 10, b = rand(1, 99) * 10;
        const s = a + b;
        return {
          kind: "choice",
          prompt: P.solve[lang],
          visual: `${dec(a, 1, lang)} + ${dec(b, 1, lang)} = ?`,
          options: options(dec(s, 1, lang), [dec(s + 10, 1, lang), dec(s - 10, 1, lang), dec(s + 100, 1, lang), dec(Math.floor(a / 10) + b, 1, lang)]),
          answer: dec(s, 1, lang),
        };
      }
      if (level === 4) {
        let a = rand(100, 2000), b = rand(50, 1500);
        const plus = Math.random() < 0.5;
        if (!plus && b > a) [a, b] = [b, a];
        const r = plus ? a + b : a - b;
        return { kind: "input", inputMode: "decimal", prompt: P.solve[lang], visual: `${dec(a, 2, lang)} ${plus ? "+" : "−"} ${dec(b, 2, lang)} = ?`, answer: (r / 100).toString() };
      }
      const a = rand(101, 9999);
      const k = pick([10, 100]);
      const mul = Math.random() < 0.5;
      const r = mul ? (a * k) / 100 : a / 100 / k;
      return {
        kind: "input",
        inputMode: "decimal",
        prompt: P.solve[lang],
        visual: `${dec(a, 2, lang)} ${mul ? "×" : ":"} ${k} = ?`,
        answer: String(Number(r.toFixed(4))),
      };
    },
  },
  {
    id: "units11",
    subject: "math",
    age: 11,
    icon: "📏",
    title: l("Одиниці вимірювання", "Единицы измерения", "Units"),
    gen: (level, lang) => {
      const pool = CONV.filter((c) => c.lvl <= Math.min(level, 3));
      const c = pick(pool);
      const u = (x: Unit) => U[x][lang];
      if (level <= 3) {
        const n = rand(2, level === 1 ? 9 : 25);
        return { kind: "input", inputMode: "numeric", prompt: P.convert[lang], visual: `${n} ${u(c.from)} = ? ${u(c.to)}`, answer: String(n * c.k) };
      }
      if (level === 4) {
        const n = rand(1, 9), rest = rand(1, c.k - 1);
        return { kind: "input", inputMode: "numeric", prompt: P.convert[lang], visual: `${n} ${u(c.from)} ${rest} ${u(c.to)} = ? ${u(c.to)}`, answer: String(n * c.k + rest) };
      }
      const n = rand(2, 12);
      return { kind: "input", inputMode: "numeric", prompt: P.convert[lang], visual: `${n * c.k} ${u(c.to)} = ? ${u(c.from)}`, answer: String(n) };
    },
  },
  {
    id: "percent11",
    subject: "math",
    age: 11,
    icon: "💯",
    title: l("Відсотки", "Проценты", "Percentages"),
    gen: (level, lang) => {
      const of = { uk: "від", ru: "от", en: "of" }[lang];
      if (level <= 3) {
        const p = pick([[50, 10], [50, 10, 25, 20], [5, 20, 25, 30, 75, 40]][level - 1]);
        const unit = 100 / gcd(p, 100);
        const n = unit * rand(1, level === 1 ? 10 : 20);
        return { kind: "input", inputMode: "numeric", prompt: P.solve[lang], visual: `${p}% ${of} ${n} = ?`, answer: String((n * p) / 100) };
      }
      if (level === 4) {
        const p = pick([10, 20, 25, 50]);
        const n = (100 / gcd(p, 100)) * rand(2, 20);
        const part = (n * p) / 100;
        const text = {
          uk: `${p}% числа дорівнюють ${part}. Знайди це число.`,
          ru: `${p}% числа равны ${part}. Найди это число.`,
          en: `${p}% of a number is ${part}. Find the number.`,
        }[lang];
        return { kind: "input", inputMode: "numeric", prompt: text, answer: String(n) };
      }
      const p = pick([10, 15, 20, 25, 30]);
      const price = (100 / gcd(p, 100)) * rand(2, 30);
      const text = {
        uk: `Кросівки коштують ${price} грн. Знижка ${p}%. Скільки гривень треба заплатити?`,
        ru: `Кроссовки стоят ${price} грн. Скидка ${p}%. Сколько гривен нужно заплатить?`,
        en: `Sneakers cost $${price}. There is a ${p}% discount. How many dollars do you pay?`,
      }[lang];
      return { kind: "input", inputMode: "numeric", prompt: text, answer: String(price - (price * p) / 100) };
    },
  },
  {
    id: "partsOfSpeech11",
    subject: "lang",
    age: 11,
    icon: "🏷️",
    title: l("Частини мови", "Части речи", "Parts of speech"),
    gen: (level, lang) => {
      const n = level <= 2 ? 3 : level === 3 ? 4 : 5;
      const cat = rand(0, n - 1);
      const word = pick(POS_WORDS[lang][cat]);
      return { kind: "choice", prompt: P.pos[lang], visual: word, options: POS_NAMES[lang].slice(0, n), answer: POS_NAMES[lang][cat] };
    },
  },
];

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

export const SHAPE_IDS = Object.keys(SHAPES) as ShapeId[];
