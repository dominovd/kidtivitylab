import { l, type Lang } from "../i18n";
import { type Skill, pick, rand, options, shuffle } from "../engine";
import { BASIC_WORDS, WORDS } from "./words";

const EN = "en-US";

const LOWER_TWINS: Record<string, string[]> = { b: ["d", "p", "q"], d: ["b", "p", "q"], p: ["q", "b", "d"], q: ["p", "g", "d"], m: ["n", "w", "u"], n: ["m", "u", "h"], u: ["n", "v", "w"], w: ["m", "v", "u"] };
const ABC = "abcdefghijklmnopqrstuvwxyz".split("");

const P = {
  enFirst: l("З якої англійської букви починається слово?", "С какой английской буквы начинается слово?", "Which letter does the word start with?"),
  enLower: l("Знайди маленьку букву", "Найди маленькую букву", "Find the small letter"),
  enMissing: l("Якої букви не вистачає в англійському слові?", "Какой буквы не хватает в английском слове?", "Which letter is missing?"),
  whichWord: l("Як це англійською?", "Как это по-английски?", "Which word matches the picture?"),
  listen: l("Послухай і знайди малюнок", "Послушай и найди картинку", "Listen and find the picture"),
  color: l("Якого це кольору англійською?", "Какого это цвета по-английски?", "What color is this?"),
  findColor: l("Знайди цей колір", "Найди этот цвет", "Find this color"),
  objectColor: l("Якого кольору цей предмет? Відповідай англійською", "Какого цвета этот предмет? Отвечай по-английски", "What color is it?"),
  number: l("Як це число англійською?", "Как это число по-английски?", "How do you say this number?"),
  whichDigit: l("Яке це число?", "Какое это число?", "Which number is this?"),
  grammar: l("Встав правильне слово", "Вставь правильное слово", "Fill in the gap"),
  order: l("Склади речення з слів", "Составь предложение из слов", "Put the words in order"),
};

const COLORS: [string, string][] = [
  ["🔴", "red"], ["🟠", "orange"], ["🟡", "yellow"], ["🟢", "green"], ["🔵", "blue"],
  ["🟣", "purple"], ["⚫", "black"], ["⚪", "white"], ["🟤", "brown"], ["🩷", "pink"],
];

/** Things whose color a child knows without thinking. */
const COLOR_OBJECTS: [string, string][] = [
  ["🍎", "red"], ["🍓", "red"], ["🍒", "red"], ["🍌", "yellow"], ["🍋", "yellow"], ["🐥", "yellow"],
  ["🥦", "green"], ["🐸", "green"], ["🍀", "green"], ["🍊", "orange"], ["🥕", "orange"], ["🎃", "orange"],
  ["🍇", "purple"], ["🍆", "purple"], ["🐻", "brown"], ["🍫", "brown"], ["🌸", "pink"], ["🐷", "pink"],
  ["☁️", "white"], ["🥛", "white"], ["🐳", "blue"], ["💧", "blue"], ["🎱", "black"], ["🦇", "black"],
];

const NUMBERS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

type Gap = { s: string; a: string; w: string[] };
const GRAMMAR: Gap[][] = [
  // to be
  [
    { s: "I ___ happy.", a: "am", w: ["is", "are"] },
    { s: "She ___ a teacher.", a: "is", w: ["am", "are"] },
    { s: "They ___ at school.", a: "are", w: ["is", "am"] },
    { s: "We ___ friends.", a: "are", w: ["is", "am"] },
    { s: "It ___ cold today.", a: "is", w: ["are", "am"] },
    { s: "My cats ___ hungry.", a: "are", w: ["is", "am"] },
    { s: "You ___ very kind.", a: "are", w: ["is", "am"] },
    { s: "My brother ___ ten.", a: "is", w: ["are", "am"] },
  ],
  // a / an
  [
    { s: "___ apple", a: "an", w: ["a"] },
    { s: "___ dog", a: "a", w: ["an"] },
    { s: "___ orange", a: "an", w: ["a"] },
    { s: "___ umbrella", a: "an", w: ["a"] },
    { s: "___ banana", a: "a", w: ["an"] },
    { s: "___ elephant", a: "an", w: ["a"] },
    { s: "___ house", a: "a", w: ["an"] },
    { s: "___ egg", a: "an", w: ["a"] },
    { s: "___ hour", a: "an", w: ["a"] },
    { s: "___ uniform", a: "a", w: ["an"] },
  ],
  // plurals
  [
    { s: "one child → two ___", a: "children", w: ["childs", "childrens"] },
    { s: "one mouse → two ___", a: "mice", w: ["mouses", "mices"] },
    { s: "one box → two ___", a: "boxes", w: ["boxs", "boxies"] },
    { s: "one city → two ___", a: "cities", w: ["citys", "cityes"] },
    { s: "one tooth → two ___", a: "teeth", w: ["tooths", "teeths"] },
    { s: "one foot → two ___", a: "feet", w: ["foots", "feets"] },
    { s: "one knife → two ___", a: "knives", w: ["knifes", "knifs"] },
    { s: "one man → two ___", a: "men", w: ["mans", "mens"] },
    { s: "one bus → two ___", a: "buses", w: ["buss", "busies"] },
  ],
  // present simple
  [
    { s: "He ___ football every day.", a: "plays", w: ["play", "playing"] },
    { s: "My mom ___ coffee in the morning.", a: "drinks", w: ["drink", "drinking"] },
    { s: "They ___ to school by bus.", a: "go", w: ["goes", "going"] },
    { s: "The cat ___ a lot.", a: "sleeps", w: ["sleep", "sleeping"] },
    { s: "I ___ like milk.", a: "don't", w: ["doesn't", "not"] },
    { s: "She ___ like spiders.", a: "doesn't", w: ["don't", "not"] },
    { s: "___ you speak English?", a: "Do", w: ["Does", "Are"] },
    { s: "___ he have a dog?", a: "Does", w: ["Do", "Is"] },
  ],
  // past simple
  [
    { s: "Yesterday I ___ to the park. (go)", a: "went", w: ["goed", "gone", "go"] },
    { s: "We ___ a film last night. (see)", a: "saw", w: ["seed", "seen", "see"] },
    { s: "She ___ an apple. (eat)", a: "ate", w: ["eated", "eaten", "eat"] },
    { s: "They ___ football on Sunday. (play)", a: "played", w: ["plaied", "play", "plays"] },
    { s: "I ___ a new bike. (buy)", a: "bought", w: ["buyed", "buys", "brought"] },
    { s: "He ___ a letter to his friend. (write)", a: "wrote", w: ["writed", "written", "writes"] },
    { s: "The dog ___ very fast. (run)", a: "ran", w: ["runned", "run", "runs"] },
    { s: "We ___ our grandma. (visit)", a: "visited", w: ["visit", "visitted", "visits"] },
    { s: "I ___ a cake with mom. (make)", a: "made", w: ["maked", "make", "makes"] },
  ],
];

const SENTENCES = [
  "I like to play football",
  "My cat is black and white",
  "We go to school every day",
  "She has a red bike",
  "The sun is very hot today",
  "Can you swim in the sea",
  "My brother likes pizza",
  "They are playing in the park",
  "I have two sisters",
  "Where is my blue pencil",
  "It is raining outside",
  "He reads a book every evening",
  "We visited our grandma yesterday",
  "What is your favorite color",
  "Dogs like to run",
  "Look at the big bird",
  "The baby is sleeping",
  "We love ice cream",
  "Is this your bag",
  "My dad drives a car",
  "The apples are green",
  "She can play the piano",
  "Please open the door",
  "How old are you",
  "My friends and I play football on Sundays",
  "There are three cats in the garden",
  "Our teacher gave us a lot of homework",
  "Did you see the new film yesterday",
  "We are going to visit our cousins",
  "The children were very happy at the party",
];

export const englishSkills: Skill[] = [
  // ---------- 6 years ----------
  {
    id: "enWords6",
    subject: "english",
    age: 6,
    icon: "🍎",
    title: l("Перші слова", "Первые слова", "First words"),
    gen: (level, lang) => {
      const word = pick(BASIC_WORDS);
      return {
        kind: "choice",
        prompt: P.whichWord[lang],
        visual: word.e,
        options: options(word.en, BASIC_WORDS.map((w) => w.en), level <= 2 ? 3 : 4),
        answer: word.en,
        answerSpeech: { text: word.en, lang: EN },
        optionSpeech: EN,
      };
    },
  },
  {
    id: "enListen6",
    subject: "english",
    age: 6,
    icon: "👂",
    title: l("Слухаємо англійську", "Слушаем английский", "Listening"),
    gen: (level, lang) => {
      const word = pick(BASIC_WORDS);
      return {
        kind: "choice",
        prompt: P.listen[lang],
        visual: "🔊",
        speak: { text: word.en, lang: EN, auto: true },
        options: options(word.e, BASIC_WORDS.map((w) => w.e), level <= 2 ? 3 : 4),
        answer: word.e,
        answerSpeech: { text: word.en, lang: EN },
        emojiOptions: true,
      };
    },
  },
  {
    id: "enColors6",
    subject: "english",
    age: 6,
    icon: "🎨",
    title: l("Кольори", "Цвета", "Colors"),
    gen: (level, lang) => {
      const type = level === 1 ? pick(["name", "find"]) : pick(["name", "find", "object", "object"]);
      if (type === "find") {
        // hear and read the word, tap the color
        const [e, name] = pick(COLORS);
        const others = COLORS.filter((c) => c[1] !== name).map((c) => c[0]);
        return {
          kind: "choice",
          prompt: P.findColor[lang],
          visual: name,
          speak: { text: name, lang: EN, auto: true },
          options: options(e, others, level <= 2 ? 3 : 4),
          answer: e,
          answerSpeech: { text: name, lang: EN },
          emojiOptions: true,
        };
      }
      if (type === "object") {
        const [obj, name] = pick(COLOR_OBJECTS);
        return {
          kind: "choice",
          prompt: P.objectColor[lang],
          visual: obj,
          options: options(name, COLORS.map((c) => c[1]), level <= 2 ? 3 : 4),
          answer: name,
          answerSpeech: { text: name, lang: EN },
          optionSpeech: EN,
        };
      }
      const [e, name] = pick(COLORS);
      return {
        kind: "choice",
        prompt: P.color[lang],
        visual: e,
        options: options(name, COLORS.map((c) => c[1]), level <= 2 ? 3 : 4),
        answer: name,
        answerSpeech: { text: name, lang: EN },
        optionSpeech: EN,
      };
    },
  },
  {
    id: "enNumbers6",
    subject: "english",
    age: 6,
    icon: "🔟",
    title: l("Числа англійською", "Числа по-английски", "Numbers"),
    gen: (level, lang) => {
      const max = [6, 10, 12, 15, 20][level - 1];
      const n = Math.floor(Math.random() * max) + 1;
      if (Math.random() < 0.5) {
        // the other way round: hear and read the word, pick the digit
        return {
          kind: "choice",
          prompt: P.whichDigit[lang],
          visual: NUMBERS[n],
          speak: { text: NUMBERS[n], lang: EN, auto: true },
          options: options(n, Array.from({ length: max }, (_, k) => k + 1).filter((x) => Math.abs(x - n) <= 3), level <= 2 ? 3 : 4),
          answer: String(n),
          answerSpeech: { text: NUMBERS[n], lang: EN },
        };
      }
      return {
        kind: "choice",
        prompt: P.number[lang],
        visual: String(n),
        options: options(NUMBERS[n], NUMBERS.slice(1, max + 1), level <= 2 ? 3 : 4),
        answer: NUMBERS[n],
        answerSpeech: { text: NUMBERS[n], lang: EN },
        optionSpeech: EN,
      };
    },
  },

  {
    id: "enLetters6",
    subject: "english",
    age: 6,
    icon: "🔤",
    title: l("Англійські букви", "Английские буквы", "ABC letters"),
    gen: (level, lang) => {
      const short = BASIC_WORDS.filter((w) => /^[a-z]+$/.test(w.en));
      if (level <= 2) {
        // hear the English word, pick its first letter (capital, then small)
        const w = pick(short);
        const first = w.en[0];
        const show = (c: string) => (level === 1 ? c.toUpperCase() : c);
        return {
          kind: "choice",
          prompt: P.enFirst[lang],
          visual: `${w.e}\n${w.en}`,
          speak: { text: w.en, lang: EN, auto: true },
          options: options(show(first), ABC.map(show), level === 1 ? 3 : 4),
          answer: show(first),
          answerSpeech: { text: w.en, lang: EN },
          optionSpeech: EN,
        };
      }
      if (level === 3) {
        // capital to small, with the look-alike letters as traps
        const c = Math.random() < 0.5 ? pick(Object.keys(LOWER_TWINS)) : pick(ABC);
        const traps = LOWER_TWINS[c] ?? ABC;
        return {
          kind: "choice",
          prompt: `${P.enLower[lang]}: ${c.toUpperCase()}`,
          visual: c.toUpperCase(),
          speak: { text: c, lang: EN, auto: true },
          options: options(c, traps, 4),
          answer: c,
          optionSpeech: EN,
        };
      }
      // a missing letter in a short (L4) or longer (L5) English word
      const pool = short.filter((w) => (level === 4 ? w.en.length <= 4 : w.en.length >= 5));
      const w = pick(pool);
      const pos = rand(level === 4 ? 1 : 0, w.en.length - 1);
      const letter = w.en[pos];
      return {
        kind: "choice",
        prompt: P.enMissing[lang],
        visual: `${w.e}\n${w.en.slice(0, pos)}_${w.en.slice(pos + 1)}`,
        options: options(letter, ABC, 4),
        answer: letter,
        answerSpeech: { text: w.en, lang: EN },
      };
    },
  },

  // ---------- 11 years ----------
  {
    id: "enVocab11",
    subject: "english",
    age: 11,
    icon: "📘",
    title: l("Словник", "Словарь", "Vocabulary"),
    gen: (level, lang: Lang) => {
      const pool = level <= 2 ? WORDS : WORDS.filter((w) => w.set === "extra");
      const word = pick(pool);
      const showNative = lang !== "en" && Math.random() < 0.6;
      return {
        kind: level >= 4 ? "input" : "choice",
        inputMode: "text",
        prompt: P.whichWord[lang],
        visual: showNative ? `${word.e}  ${word[lang]}` : word.e,
        options: options(word.en, pool.map((w) => w.en), 4),
        answer: word.en,
        answerSpeech: { text: word.en, lang: EN },
      };
    },
  },
  {
    id: "enGrammar11",
    subject: "english",
    age: 11,
    icon: "🧠",
    title: l("Граматика", "Грамматика", "Grammar"),
    gen: (level, lang) => {
      const groups = GRAMMAR.slice(0, Math.min(GRAMMAR.length, level + 1));
      const g = pick(pick(groups));
      return {
        kind: "choice",
        prompt: P.grammar[lang],
        visual: g.s,
        options: shuffle([g.a, ...g.w]),
        answer: g.a,
        answerSpeech: { text: g.s.replace(/\s*\(.*\)$/, "").replace("___", g.a).replace(" →", ","), lang: EN },
      };
    },
  },
  {
    id: "enSentence11",
    subject: "english",
    age: 11,
    icon: "🧱",
    title: l("Будуємо речення", "Строим предложения", "Sentence builder"),
    gen: (level, lang) => {
      const pool = SENTENCES.filter((s) => s.split(" ").length <= [5, 5, 6, 7, 9][level - 1]);
      const s = pick(pool.length ? pool : SENTENCES);
      const tokens = s.split(" ");
      let shuffled = shuffle(tokens);
      while (shuffled.join(" ") === s) shuffled = shuffle(tokens);
      return {
        kind: "order",
        prompt: P.order[lang],
        tokens: shuffled,
        answer: s,
        speak: { text: s, lang: EN },
      };
    },
  },
];
