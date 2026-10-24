import { l, type Lang } from "../i18n";
import { type Skill, rand, pick, numOptions, options, plural, shuffle } from "../engine";

const OBJ = ["🍎", "⭐", "🐟", "🎈", "🌸", "🐞", "🍓", "⚽", "🐥", "🍪"];

function emojiRow(e: string, n: number) {
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(e + (i % 5 === 4 && i !== n - 1 ? "\n" : ""));
  return out.join(" ").replace(/\n /g, "\n");
}

const P = {
  howMany: l("Скільки тут предметів?", "Сколько здесь предметов?", "How many are there?"),
  solve: l("Скільки буде?", "Сколько будет?", "What is the answer?"),
  compare: l("Який знак поставити?", "Какой знак поставить?", "Which sign goes in the box?"),
  missing: l("Яке число пропущене?", "Какое число пропущено?", "Which number is missing?"),
  findX: l("Знайди x", "Найди x", "Find x"),
  bigger: l("Який дріб більший?", "Какая дробь больше?", "Which fraction is bigger?"),
  simplify: l("Скороти дріб", "Сократи дробь", "Simplify the fraction"),
  fracSum: l("Обчисли", "Вычисли", "Calculate"),
};

const sum6Max = [5, 7, 10, 15, 20];

export const mathSkills: Skill[] = [
  // ---------- 6 years ----------
  {
    id: "count",
    subject: "math",
    age: 6,
    icon: "🔢",
    title: l("Рахуємо предмети", "Считаем предметы", "Counting"),
    gen: (level, lang) => {
      const max = [5, 8, 10, 15, 20][level - 1];
      const n = rand(Math.max(1, max - 7), max);
      return {
        kind: "choice",
        prompt: P.howMany[lang],
        visual: emojiRow(pick(OBJ), n),
        options: numOptions(n, 2, 4, 1),
        answer: String(n),
      };
    },
  },
  {
    id: "add6",
    subject: "math",
    age: 6,
    icon: "➕",
    title: l("Додавання", "Сложение", "Addition"),
    gen: (level, lang) => {
      const max = sum6Max[level - 1];
      // picture levels start from 1: an empty group is hard to show to a 5-year-old
      const a = rand(level <= 2 ? 1 : 0, max - 1);
      const b = rand(1, max - a);
      const e = pick(OBJ);
      const pictures = level <= 2 ? `\n${e.repeat(a)} + ${e.repeat(b)}` : "";
      return {
        kind: "choice",
        prompt: P.solve[lang],
        visual: `${a} + ${b} = ?${pictures}`,
        options: numOptions(a + b, 2, 4),
        answer: String(a + b),
      };
    },
  },
  {
    id: "sub6",
    subject: "math",
    age: 6,
    icon: "➖",
    title: l("Віднімання", "Вычитание", "Subtraction"),
    gen: (level, lang) => {
      const max = sum6Max[level - 1];
      const a = rand(1, max);
      const b = rand(0, a);
      const e = pick(OBJ);
      const pictures = level <= 2 ? `\n${e.repeat(a)}` : "";
      return {
        kind: "choice",
        prompt: P.solve[lang],
        visual: `${a} − ${b} = ?${pictures}`,
        options: numOptions(a - b, 2, 4),
        answer: String(a - b),
      };
    },
  },
  {
    id: "compare",
    subject: "math",
    age: 6,
    icon: "⚖️",
    title: l("Більше чи менше", "Больше или меньше", "Bigger or smaller"),
    gen: (level, lang) => {
      const max = [5, 10, 20, 50, 100][level - 1];
      const a = rand(0, max);
      const b = Math.random() < 0.2 ? a : rand(0, max);
      const ans = a > b ? ">" : a < b ? "<" : "=";
      return {
        kind: "choice",
        prompt: P.compare[lang],
        visual: `${a}  ⬜  ${b}`,
        options: [">", "<", "="],
        answer: ans,
      };
    },
  },
  {
    id: "sequence6",
    subject: "math",
    age: 6,
    icon: "🪜",
    title: l("Числовий ряд", "Числовой ряд", "Number line"),
    gen: (level, lang) => {
      const max = [10, 15, 20, 30, 50][level - 1];
      const step = level >= 4 ? pick([1, 2]) : 1;
      const down = level >= 3 && Math.random() < 0.3;
      const len = 5;
      let start = rand(0, max - step * (len - 1));
      let seq = Array.from({ length: len }, (_, i) => start + i * step);
      if (down) seq = seq.reverse();
      const hole = rand(1, len - 1);
      const ans = seq[hole];
      return {
        kind: "choice",
        prompt: P.missing[lang],
        visual: seq.map((x, i) => (i === hole ? "❓" : x)).join("  "),
        options: numOptions(ans, 2, 4),
        answer: String(ans),
      };
    },
  },

  // ---------- 11 years ----------
  {
    id: "mental",
    subject: "math",
    age: 11,
    icon: "🧮",
    title: l("Усний рахунок", "Устный счёт", "Mental math"),
    gen: (level, lang) => {
      const max = [50, 100, 500, 1000, 10000][level - 1];
      const op = pick(["+", "−"]);
      let a = rand(Math.floor(max / 10), max);
      let b = rand(Math.floor(max / 20), max);
      if (op === "−" && b > a) [a, b] = [b, a];
      const ans = op === "+" ? a + b : a - b;
      return { kind: "input", inputMode: "numeric", prompt: P.solve[lang], visual: `${a} ${op} ${b} = ?`, answer: String(ans) };
    },
  },
  {
    id: "mult",
    subject: "math",
    age: 11,
    icon: "✖️",
    title: l("Множення", "Умножение", "Multiplication"),
    gen: (level, lang) => {
      let a: number, b: number;
      if (level === 1) [a, b] = [rand(2, 5), rand(2, 10)];
      else if (level === 2) [a, b] = [rand(2, 9), rand(2, 9)];
      else if (level === 3) [a, b] = [rand(3, 12), rand(3, 12)];
      else if (level === 4) [a, b] = [rand(11, 99), rand(2, 9)];
      else [a, b] = [rand(11, 40), rand(11, 25)];
      return { kind: "input", inputMode: "numeric", prompt: P.solve[lang], visual: `${a} × ${b} = ?`, answer: String(a * b) };
    },
  },
  {
    id: "div",
    subject: "math",
    age: 11,
    icon: "➗",
    title: l("Ділення", "Деление", "Division"),
    gen: (level, lang) => {
      let q: number, b: number;
      if (level === 1) [q, b] = [rand(2, 10), rand(2, 5)];
      else if (level === 2) [q, b] = [rand(2, 9), rand(2, 9)];
      else if (level === 3) [q, b] = [rand(3, 12), rand(3, 12)];
      else if (level === 4) [q, b] = [rand(11, 60), rand(2, 9)];
      else [q, b] = [rand(12, 50), rand(11, 25)];
      return { kind: "input", inputMode: "numeric", prompt: P.solve[lang], visual: `${q * b} : ${b} = ?`, answer: String(q) };
    },
  },
  {
    id: "fractions",
    subject: "math",
    age: 11,
    icon: "🍕",
    title: l("Дроби", "Дроби", "Fractions"),
    gen: (level, lang) => {
      const type = level <= 1 ? 0 : level === 2 ? rand(0, 1) : level === 3 ? rand(1, 2) : rand(2, 3);
      if (type === 0) {
        // same denominator
        const d = rand(3, 12);
        let a = rand(1, d - 1);
        let b = rand(1, d - 1);
        while (b === a) b = rand(1, d - 1);
        const ans = `${Math.max(a, b)}/${d}`;
        return { kind: "choice", prompt: P.bigger[lang], visual: "🍕", options: shuffle([`${a}/${d}`, `${b}/${d}`]), answer: ans };
      }
      if (type === 1) {
        // same numerator
        const n = rand(1, 5);
        let d1 = rand(n + 1, 12);
        let d2 = rand(n + 1, 12);
        while (d2 === d1) d2 = rand(n + 1, 12);
        const ans = `${n}/${Math.min(d1, d2)}`;
        return { kind: "choice", prompt: P.bigger[lang], visual: "🍕", options: shuffle([`${n}/${d1}`, `${n}/${d2}`]), answer: ans };
      }
      if (type === 2) {
        const pairs: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 5], [4, 5], [5, 6], [3, 7], [2, 7]];
        const [n, d] = pick(pairs);
        const k = rand(2, 6);
        const wrong = [`${n}/${d * k}`, `${n * k}/${d}`, `${n + 1}/${d}`, `${n}/${d + 1}`].filter((x) => x !== `${n}/${d}`);
        return { kind: "choice", prompt: P.simplify[lang], visual: `${n * k}/${d * k} = ?`, options: options(`${n}/${d}`, wrong), answer: `${n}/${d}` };
      }
      // add with same denominator (result may simplify: we ask for the unsimplified sum)
      const d = rand(5, 15);
      const a = rand(1, d - 2);
      const b = rand(1, d - a - 1);
      const ans = `${a + b}/${d}`;
      const wrong = [`${a + b}/${d * 2}`, `${a * b}/${d}`, `${a + b + 1}/${d}`, `${a + b - 1}/${d}`];
      return { kind: "choice", prompt: P.fracSum[lang], visual: `${a}/${d} + ${b}/${d} = ?`, options: options(ans, wrong), answer: ans };
    },
  },
  {
    id: "equations",
    subject: "math",
    age: 11,
    icon: "🔍",
    title: l("Рівняння", "Уравнения", "Equations"),
    gen: (level, lang) => {
      const x = rand(level >= 4 ? 2 : 1, level >= 3 ? 30 : 15);
      let visual: string;
      const t = level <= 1 ? rand(0, 1) : level === 2 ? rand(0, 2) : level === 3 ? rand(1, 3) : rand(2, 4);
      if (t === 0) {
        const a = rand(2, 20);
        visual = `x + ${a} = ${x + a}`;
      } else if (t === 1) {
        const a = rand(2, 20);
        visual = `x − ${a} = ${x}`;
        return { kind: "input", inputMode: "numeric", prompt: P.findX[lang], visual, answer: String(x + a) };
      } else if (t === 2) {
        const a = rand(2, 9);
        visual = `${a} · x = ${a * x}`;
      } else if (t === 3) {
        const a = rand(2, 9);
        const b = rand(1, 30);
        visual = `${a} · x + ${b} = ${a * x + b}`;
      } else {
        const a = rand(2, 7);
        const b = rand(1, 20);
        // x is shifted by b so the bracket stays positive
        const xx = x + b;
        visual = `${a} · (x − ${b}) = ${a * (xx - b)}`;
        return { kind: "input", inputMode: "numeric", prompt: P.findX[lang], visual, answer: String(xx) };
      }
      return { kind: "input", inputMode: "numeric", prompt: P.findX[lang], visual, answer: String(x) };
    },
  },
  {
    id: "problems",
    subject: "math",
    age: 11,
    icon: "📝",
    title: l("Текстові задачі", "Текстовые задачи", "Word problems"),
    gen: (level, lang) => {
      const scale = [1, 2, 3, 5, 8][level - 1];
      const tpl = pick(PROBLEMS);
      const { text, answer } = tpl(scale, lang);
      return { kind: "input", inputMode: "numeric", prompt: text, answer: String(answer) };
    },
  },
];

type Problem = (scale: number, lang: Lang) => { text: string; answer: number };

const MONEY: Record<Lang, [string, string, string]> = {
  uk: ["гривню", "гривні", "гривень"],
  ru: ["гривну", "гривны", "гривен"],
  en: ["hryvnia", "hryvnias", "hryvnias"],
};
const money = (n: number, lang: Lang) => (lang === "en" ? `${n} ${n === 1 ? "hryvnia" : "hryvnias"}` : `${n} ${plural(n, MONEY[lang])}`);

const PROBLEMS: Problem[] = [
  (s, lang) => {
    const b = rand(5, 20) * s;
    const a = b + rand(5, 40) * s;
    const text = {
      uk: `У Марка було ${money(a, "uk")}. Він купив книжку за ${money(b, "uk")}. Скільки гривень у нього залишилося?`,
      ru: `У Марка было ${money(a, "ru")}. Он купил книгу за ${money(b, "ru")}. Сколько гривен у него осталось?`,
      en: `Mark had ${money(a, "en")}. He bought a book for ${money(b, "en")}. How many hryvnias does he have left?`,
    }[lang];
    return { text, answer: a - b };
  },
  (s, lang) => {
    const a = rand(6, 12) + (s > 2 ? rand(0, 12) : 0);
    const b = rand(2, 5 + s);
    const pencils = { uk: plural(a, ["олівець", "олівці", "олівців"]), ru: plural(a, ["карандаш", "карандаша", "карандашей"]) };
    const text = {
      uk: `В одній коробці ${a} ${pencils.uk}. Скільки олівців у ${b} коробках?`,
      ru: `В одной коробке ${a} ${pencils.ru}. Сколько карандашей в ${b} коробках?`,
      en: `One box holds ${a} pencils. How many pencils are there in ${b} boxes?`,
    }[lang];
    return { text, answer: a * b };
  },
  (s, lang) => {
    const kids = rand(2, 4 + Math.min(s, 5));
    const each = rand(3, 6 + s);
    const total = kids * each;
    const sweets = { uk: plural(total, ["цукерку", "цукерки", "цукерок"]), ru: plural(total, ["конфету", "конфеты", "конфет"]) };
    const text = {
      uk: `Мама порівну розділила ${total} ${sweets.uk} між ${kids} дітьми. Скільки цукерок отримала кожна дитина?`,
      ru: `Мама поровну разделила ${total} ${sweets.ru} между ${kids} детьми. Сколько конфет получил каждый ребёнок?`,
      en: `Mom shared ${total} sweets equally among ${kids} children. How many sweets did each child get?`,
    }[lang];
    return { text, answer: each };
  },
  (s, lang) => {
    const v = rand(8, 15) + s * 2;
    const t = rand(2, 3 + Math.min(s, 4));
    const text = {
      uk: `Велосипедист їде зі швидкістю ${v} км/год. Скільки кілометрів він проїде за ${t} год?`,
      ru: `Велосипедист едет со скоростью ${v} км/ч. Сколько километров он проедет за ${t} ч?`,
      en: `A cyclist rides at ${v} km/h. How many kilometers will they ride in ${t} hours?`,
    }[lang];
    return { text, answer: v * t };
  },
  (s, lang) => {
    const a = rand(3, 10 + s * 2);
    const b = rand(2, a);
    const text = {
      uk: `Прямокутник має довжину ${a} см і ширину ${b} см. Чому дорівнює його периметр у сантиметрах?`,
      ru: `У прямоугольника длина ${a} см и ширина ${b} см. Чему равен его периметр в сантиметрах?`,
      en: `A rectangle is ${a} cm long and ${b} cm wide. What is its perimeter in centimeters?`,
    }[lang];
    return { text, answer: 2 * (a + b) };
  },
  (s, lang) => {
    const a = rand(3, 8 + s);
    const b = rand(2, 6 + s);
    const text = {
      uk: `Кімната має форму прямокутника ${a} м на ${b} м. Яка її площа у квадратних метрах?`,
      ru: `Комната имеет форму прямоугольника ${a} м на ${b} м. Какова её площадь в квадратных метрах?`,
      en: `A room is a rectangle ${a} m by ${b} m. What is its area in square meters?`,
    }[lang];
    return { text, answer: a * b };
  },
  (s, lang) => {
    const price = rand(5, 15) * (s > 2 ? 2 : 1);
    const n = rand(2, 6 + s);
    const text = {
      uk: `Один зошит коштує ${money(price, "uk")}. Скільки гривень коштують ${n} таких зошитів?`,
      ru: `Одна тетрадь стоит ${money(price, "ru")}. Сколько гривен стоят ${n} таких тетрадей?`,
      en: `One notebook costs ${money(price, "en")}. How many hryvnias do ${n} notebooks cost?`,
    }[lang];
    return { text, answer: price * n };
  },
  (s, lang) => {
    const start = rand(8, 11);
    const dur = rand(1, 3 + Math.min(s, 3));
    const text = {
      uk: `Екскурсія почалася о ${start}:00 і тривала ${dur} ${plural(dur, ["годину", "години", "годин"])}. О котрій годині вона закінчилася? (впиши лише годину)`,
      ru: `Экскурсия началась в ${start}:00 и длилась ${dur} ${plural(dur, ["час", "часа", "часов"])}. В котором часу она закончилась? (впиши только час)`,
      en: `A trip started at ${start}:00 and lasted ${dur} ${dur === 1 ? "hour" : "hours"}. At what hour did it end? (type the hour only)`,
    }[lang];
    return { text, answer: start + dur };
  },
];
