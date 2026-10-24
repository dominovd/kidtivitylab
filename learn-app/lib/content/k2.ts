/**
 * Skills added for the US K–2 standards: make 10 (K.OA.4, 1.OA.6), money (2.MD.8), odd and even (2.OA.3).
 */
import { l } from "../i18n";
import { type Skill, pick, rand, options, shuffle } from "../engine";

const same = (s: string) => l(s, s, s);
const EN = "en-US";

/** A ten-frame (or five-frame) drawn with emoji: filled dots, then empty ones, rows of 5. */
const DOTS = ["🔴", "🔵", "🟢", "🟡", "🟣"];
function frame(filled: number, size: 5 | 10 | 20, dot = pick(DOTS)) {
  const cells = Array.from({ length: size }, (_, i) => (i < filled ? dot : "⚪"));
  const rows: string[] = [];
  for (let i = 0; i < size; i += 5) rows.push(cells.slice(i, i + 5).join(""));
  return rows.join("\n");
}

const COIN_NAME: Record<number, string> = { 1: "penny", 5: "nickel", 10: "dime", 25: "quarter" };
const COIN_PLURAL: Record<number, string> = { 1: "pennies", 5: "nickels", 10: "dimes", 25: "quarters" };
/** US style: under a dollar in cents (45¢), a dollar or more in dollars ($1.05). */
const cents = (n: number) => (n >= 100 ? `$${(n / 100).toFixed(2)}` : `${n}¢`);

export const k2Skills: Skill[] = [
  {
    id: "make10",
    subject: "math",
    age: 6,
    icon: "🔟",
    title: same("Make 10"),
    gen: (level) => {
      if (level === 1) {
        // five-frame (make 5) or an almost full ten-frame (make 10 with 1–4 more)
        if (Math.random() < 0.5) {
          const a = rand(1, 4);
          return { kind: "choice", prompt: "How many more to make 5?", visual: frame(a, 5), options: options(5 - a, [1, 2, 3, 4, 5].filter((x) => x !== 5 - a), 3), answer: String(5 - a) };
        }
        const a = rand(6, 9);
        return { kind: "choice", prompt: "How many more to make 10?", visual: frame(a, 10), options: options(10 - a, [1, 2, 3, 4, 5].filter((x) => x !== 10 - a), 3), answer: String(10 - a) };
      }
      if (level === 2) {
        const a = rand(1, 9);
        return { kind: "choice", prompt: "How many more to make 10?", visual: frame(a, 10), options: options(10 - a, [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => Math.abs(x - (10 - a)) <= 3), 4), answer: String(10 - a) };
      }
      if (level === 3) {
        const a = rand(1, 9);
        const visual = Math.random() < 0.5 ? `${a} + ☐ = 10` : `☐ + ${a} = 10`;
        return { kind: "choice", prompt: "Which number makes 10?", visual, options: options(10 - a, [10 - a + 1, 10 - a - 1, a, 10 - a + 2].filter((x) => x >= 0 && x <= 10), 4), answer: String(10 - a) };
      }
      if (level === 4) {
        // which pair makes 10?
        const a = rand(1, 9);
        const right = `${a} + ${10 - a}`;
        const wrong = new Set<string>();
        while (wrong.size < 3) {
          const x = rand(1, 9);
          const y = rand(1, 9);
          if (x + y !== 10) wrong.add(`${x} + ${y}`);
        }
        return { kind: "choice", prompt: "Which two numbers make 10?", options: shuffle([right, ...wrong]), answer: right };
      }
      // level 5: make 20 with a double ten-frame, or make the next ten
      if (Math.random() < 0.5) {
        const a = rand(11, 19);
        return { kind: "choice", prompt: "How many more to make 20?", visual: frame(a, 20), options: options(20 - a, [20 - a + 1, 20 - a - 1, 20 - a + 2, 10 - (a - 10) + 10].filter((x) => x > 0 && x !== 20 - a), 4), answer: String(20 - a) };
      }
      const t = rand(2, 9) * 10;
      const a = t - rand(1, 9);
      return { kind: "choice", prompt: `How many more to make ${t}?`, visual: `${a} + ☐ = ${t}`, options: options(t - a, [t - a + 1, t - a - 1, t - a + 10, 10 - (t - a)].filter((x) => x > 0 && x !== t - a), 4), answer: String(t - a) };
    },
  },
  {
    id: "money6",
    subject: "plus",
    age: 6,
    icon: "🪙",
    title: same("Money"),
    gen: (level) => {
      if (level === 1) {
        const c = pick([1, 5, 10, 25]);
        const t = rand(0, 2);
        if (t === 1) {
          // which coin is worth this much?
          return { kind: "choice", prompt: `Which coin is worth ${c}¢?`, options: shuffle(["penny", "nickel", "dime", "quarter"]), answer: COIN_NAME[c], optionSpeech: EN };
        }
        if (t === 2) {
          // which is worth more?
          const [x, y] = shuffle([1, 5, 10, 25]).slice(0, 2);
          const more = Math.max(x, y);
          return { kind: "choice", prompt: `Which is worth more: a ${COIN_NAME[x]} or a ${COIN_NAME[y]}?`, coins: [x, y], options: [COIN_NAME[x], COIN_NAME[y]], answer: COIN_NAME[more], optionSpeech: EN };
        }
        // name the coin's value
        return {
          kind: "choice",
          prompt: `How much is a ${COIN_NAME[c]} worth?`,
          coins: [c],
          options: shuffle(["1¢", "5¢", "10¢", "25¢"]),
          answer: `${c}¢`,
          answerSpeech: { text: `A ${COIN_NAME[c]} is ${c} ${c === 1 ? "cent" : "cents"}`, lang: EN },
        };
      }
      if (level === 2) {
        // several coins of one kind
        const c = pick([1, 5, 10]);
        const n = rand(2, c === 1 ? 9 : 5);
        const total = c * n;
        return { kind: "choice", prompt: `How much money? (${n} ${COIN_PLURAL[c]})`, coins: Array(n).fill(c), options: options(cents(total), [total + c, total - c, total + 1, total + 10, n].filter((x) => x > 0).map(cents), 4), answer: cents(total) };
      }
      // levels 3–4: mixed coins, biggest first like you'd count them
      if (level <= 4) {
        const kinds = level === 3 ? pick([[10, 1], [5, 1], [10, 5]]) : [25, 10, 5, 1];
        const coins: number[] = [];
        for (const k of kinds) {
          const n = level === 3 ? rand(1, k === 1 ? 6 : 4) : rand(k === 25 ? 0 : 1, k === 1 ? 4 : 3);
          for (let i = 0; i < n; i++) coins.push(k);
        }
        // 2nd grade counts within a dollar: drop the biggest coins until the total fits
        while (coins.reduce((a, b) => a + b, 0) >= 100) coins.splice(coins.indexOf(Math.max(...coins)), 1);
        const total = coins.reduce((a, b) => a + b, 0);
        return { kind: "choice", prompt: "How much money is this?", coins, options: options(cents(total), [total + 5, total - 5, total + 10, total - 1, total + 1].filter((x) => x > 0).map(cents), 4), answer: cents(total) };
      }
      // level 5: word problems with change, and dollars
      if (Math.random() < 0.5) {
        const have = pick([50, 75, 100]);
        const cost = 5 * rand(2, have / 5 - 1);
        const left = have - cost;
        const thing = pick(["a sticker", "a pencil", "an apple", "a toy car", "a bookmark"]);
        return {
          kind: "choice",
          prompt: `You have ${cents(have)}. You buy ${thing} for ${cost}¢. How much money is left?`,
          options: options(`${left}¢`, [left + 5, left - 5, left + 10, cost].filter((x) => x > 0 && x !== left).map((x) => `${x}¢`), 4),
          answer: `${left}¢`,
        };
      }
      const q = rand(1, 3);
      const d = rand(0, 4);
      const coins = [...Array(q).fill(25), ...Array(d).fill(10)];
      const total = 25 * q + 10 * d;
      const need = 100 - total;
      if (need <= 0) return { kind: "choice", prompt: "How much money is this?", coins, options: options(cents(total), [total + 5, total - 5, total + 10, total - 10].map(cents), 4), answer: cents(total) };
      return { kind: "choice", prompt: "How many more cents to make one dollar?", coins, options: options(`${need}¢`, [need + 5, need - 5, need + 10, need - 10].filter((x) => x > 0).map((x) => `${x}¢`), 4), answer: `${need}¢` };
    },
  },
  {
    id: "oddEven6",
    subject: "plus",
    age: 6,
    icon: "🧦",
    title: same("Odd and even"),
    gen: (level) => {
      const ask = (n: number, visual?: string) => ({
        kind: "choice" as const,
        prompt: visual ? "Make pairs. Is the number odd or even?" : `Is ${n} odd or even?`,
        visual: visual ?? String(n),
        options: ["odd", "even"],
        answer: n % 2 ? "odd" : "even",
        answerSpeech: { text: `${n} is ${n % 2 ? "odd" : "even"}`, lang: EN },
      });
      if (level <= 2) {
        // objects in pairs: one left over means odd
        const n = rand(2, level === 1 ? 10 : 20);
        const e = pick(["🧦", "👟", "🧤", "🍎", "🐞", "⭐"]);
        const pairs = Math.floor(n / 2);
        const rows = Array.from({ length: Math.ceil(pairs / 5) }, (_, r) => Array.from({ length: Math.min(5, pairs - r * 5) }, () => e + e).join("  "));
        if (n % 2) rows.push(e);
        return ask(n, rows.join("\n"));
      }
      if (level === 3) return ask(rand(1, 20));
      if (level === 4) return ask(rand(21, 100));
      // level 5: pick the even (or odd) one among four numbers
      const wantEven = Math.random() < 0.5;
      const right = rand(10, 99) * 1;
      const target = wantEven ? right - (right % 2) : right - (right % 2) + 1;
      const others = new Set<number>();
      while (others.size < 3) {
        const x = rand(10, 99);
        if (x % 2 !== target % 2) others.add(x);
      }
      return {
        kind: "choice",
        prompt: wantEven ? "Which number is even?" : "Which number is odd?",
        options: shuffle([target, ...others].map(String)),
        answer: String(target),
      };
    },
  },
];
