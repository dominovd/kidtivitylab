/**
 * Phonics for native English speakers, ages 5–8 (Common Core RF.K–2):
 * rhyming words, sight words, last and middle sounds.
 */
import { l } from "../i18n";
import { type Skill, pick, options, shuffle, sample } from "../engine";

const EN = "en-US";
const same = (s: string) => l(s, s, s);

// ---------- rhyming (RF.K.2a) ----------
/** Each group rhymes; a word never rhymes with words from other groups. */
const RHYMES: [string, string][][] = [
  [["cat", "🐱"], ["hat", "🎩"], ["bat", "🦇"]],
  [["dog", "🐶"], ["frog", "🐸"], ["log", "🪵"]],
  [["bee", "🐝"], ["tree", "🌳"], ["key", "🔑"]],
  [["car", "🚗"], ["star", "⭐"], ["jar", "🫙"]],
  [["moon", "🌙"], ["spoon", "🥄"], ["balloon", "🎈"]],
  [["mouse", "🐭"], ["house", "🏠"]],
  [["snake", "🐍"], ["cake", "🎂"]],
  [["goat", "🐐"], ["boat", "⛵"], ["coat", "🧥"]],
  [["fox", "🦊"], ["box", "📦"], ["socks", "🧦"]],
  [["bear", "🐻"], ["pear", "🍐"], ["chair", "🪑"]],
  [["king", "🤴"], ["ring", "💍"]],
  [["train", "🚂"], ["rain", "🌧️"], ["chain", "⛓️"]],
  [["clock", "🕰️"], ["rock", "🪨"], ["lock", "🔒"]],
  [["whale", "🐳"], ["snail", "🐌"], ["pail", "🪣"]],
  [["bug", "🐛"], ["mug", "☕"]],
  [["hen", "🐔"], ["pen", "🖊️"], ["ten", "🔟"]],
  [["pan", "🍳"], ["van", "🚐"], ["fan", "🪭"]],
  [["nose", "👃"], ["rose", "🌹"]],
  [["kite", "🪁"], ["night", "🌃"]],
  [["bed", "🛏️"], ["sled", "🛷"]],
  [["shell", "🐚"], ["bell", "🔔"]],
  [["pie", "🥧"], ["tie", "👔"], ["eye", "👁️"]],
  [["sun", "☀️"], ["one", "1️⃣"]],
  [["fish", "🐟"], ["dish", "🍽️"]],
];
const card = ([w, e]: [string, string]) => `${e} ${w}`;

const R = {
  rhyme: same("Which one rhymes with"),
  notRhyme: same("Which one does NOT rhyme?"),
  readRhyme: same("Read the words. Which one rhymes with"),
};

// ---------- sight words (RF.K.3c, RF.1.3g, RF.2.3f) ----------
const SIGHT: string[][] = [
  // pre-primer
  ["a", "I", "the", "and", "see", "can", "we", "go", "is", "it", "to", "my", "you", "me", "up", "in", "look", "he", "said", "like", "big", "red", "one", "two"],
  // primer
  ["are", "she", "was", "they", "have", "what", "all", "do", "come", "here", "this", "that", "play", "little", "on", "at", "for", "no", "yes", "but", "with", "will", "get", "ran"],
  // 1st grade
  ["from", "his", "has", "had", "her", "him", "when", "then", "there", "where", "were", "could", "would", "after", "again", "know", "some", "put", "ask", "every", "going", "just", "once", "over"],
  // 2nd grade
  ["because", "been", "before", "both", "buy", "call", "does", "don't", "found", "first", "goes", "many", "which", "why", "write", "your", "always", "around", "very", "these", "those", "their", "pull", "sleep"],
];
/** Sentences with one sight word missing: [sentence with ___, answer, distractors]. */
const SIGHT_GAPS: [string, string, string[]][] = [
  ["I ___ a big dog.", "see", ["sea", "said", "she"]],
  ["We ___ to the park.", "went", ["want", "what", "when"]],
  ["The cat is ___ the box.", "in", ["on", "it", "is"]],
  ["She ___ a red ball.", "has", ["his", "had", "was"]],
  ["Can you ___ with me?", "play", ["pull", "put", "plan"]],
  ["They ___ happy today.", "are", ["all", "ask", "our"]],
  ["___ is my hat?", "Where", ["Were", "There", "When"]],
  ["I like ___ new bike.", "your", ["you", "very", "four"]],
  ["He ran ___ the hill.", "up", ["us", "upon", "at"]],
  ["Look ___ the bird!", "at", ["it", "an", "as"]],
  ["We ___ friends.", "are", ["art", "her", "ate"]],
  ["___ you help me?", "Could", ["Cold", "Would", "Come"]],
  ["The dog ___ his bone.", "found", ["four", "from", "fond"]],
  ["I ___ my hands before lunch.", "wash", ["want", "wish", "was"]],
  ["Mom said, \"___ to bed!\"", "Go", ["Got", "Good", "Get"]],
  ["The sun is ___ hot.", "very", ["every", "ever", "here"]],
  ["___ do birds fly?", "Why", ["Who", "What", "Way"]],
  ["Put the toys ___ the bed.", "under", ["over", "until", "and"]],
  ["We ___ eat lunch at noon.", "always", ["away", "also", "again"]],
  ["Please ___ your name here.", "write", ["white", "right", "while"]],
];

// ---------- last and middle sounds (RF.K.2d) ----------
/** Words whose last letter is also their last sound. */
const ENDINGS: [string, string][] = [
  ["cat", "🐱"], ["dog", "🐶"], ["sun", "☀️"], ["car", "🚗"], ["fox", "🦊"], ["bus", "🚌"], ["bed", "🛏️"], ["hat", "🎩"],
  ["web", "🕸️"], ["cup", "☕"], ["bag", "👜"], ["map", "🗺️"], ["net", "🥅"], ["box", "📦"], ["pig", "🐷"], ["hen", "🐔"],
  ["crab", "🦀"], ["drum", "🥁"], ["ship", "🚢"], ["bell", "🔔"], ["leaf", "🍃"], ["goat", "🐐"], ["boat", "⛵"], ["star", "⭐"],
  ["frog", "🐸"], ["owl", "🦉"], ["moon", "🌙"], ["duck", "🦆"], ["milk", "🥛"], ["book", "📖"], ["bread", "🍞"], ["ball", "⚽"],
  ["lemon", "🍋"], ["lion", "🦁"], ["tiger", "🐯"], ["pencil", "✏️"], ["carrot", "🥕"], ["rabbit", "🐰"], ["robot", "🤖"], ["rocket", "🚀"],
  ["ant", "🐜"], ["bat", "🦇"], ["nut", "🥜"], ["mop", "🧹"], ["log", "🪵"], ["fan", "🪭"], ["van", "🚐"], ["pen", "🖊️"],
  ["pin", "📌"], ["ten", "🔟"], ["rat", "🐀"], ["bug", "🐛"], ["lip", "👄"], ["owl", "🦉"],
];
/** Short-vowel CVC words for the middle sound. */
const CVC: [string, string][] = [
  ["cat", "🐱"], ["hat", "🎩"], ["map", "🗺️"], ["bag", "👜"], ["van", "🚐"], ["fan", "🪭"],
  ["bed", "🛏️"], ["web", "🕸️"], ["hen", "🐔"], ["net", "🥅"], ["pen", "🖊️"], ["ten", "🔟"],
  ["pig", "🐷"], ["six", "6️⃣"], ["lip", "👄"], ["pin", "📌"],
  ["dog", "🐶"], ["fox", "🦊"], ["box", "📦"], ["log", "🪵"], ["mop", "🧹"],
  ["sun", "☀️"], ["bus", "🚌"], ["cup", "☕"], ["bug", "🐛"], ["nut", "🥜"], ["rat", "🐀"], ["ant", "🐜"], ["bat", "🦇"],
];
const ABC = "abcdefghijklmnopqrstuvwxyz".split("");
const VOWELS = ["a", "e", "i", "o", "u"];

export const phonicsSkills: Skill[] = [
  {
    id: "enRhyme6",
    subject: "english",
    age: 6,
    icon: "🎵",
    title: same("Rhyming words"),
    gen: (level) => {
      const [group, ...others] = shuffle(RHYMES);
      const [target, rhyme] = sample(group, 2);
      const wrong = others.map((g) => pick(g));
      if (level === 4) {
        // three that rhyme and one that doesn't
        const g = shuffle(RHYMES).find((x) => x.length >= 3)!;
        const odd = pick(RHYMES.filter((x) => x !== g).flat());
        const opts = shuffle([...g.slice(0, 3), odd].map(card));
        return { kind: "choice", prompt: R.notRhyme.en, options: opts, answer: card(odd), optionSpeech: EN };
      }
      if (level === 5) {
        // words only: read and match the sound
        const opts = shuffle([rhyme, ...wrong.slice(0, 3)].map(([w]) => w));
        return { kind: "choice", prompt: `${R.readRhyme.en} ${target[0]}?`, visual: target[0], options: opts, answer: rhyme[0], speak: { text: target[0], lang: EN } };
      }
      const n = level === 1 ? 2 : level === 2 ? 3 : 4;
      const opts = shuffle([rhyme, ...wrong.slice(0, n - 1)].map(card));
      return {
        kind: "choice",
        prompt: `${R.rhyme.en} ${target[0]}?`,
        visual: `${target[1]}\n${target[0]}`,
        speak: { text: target[0], lang: EN, auto: true },
        options: opts,
        answer: card(rhyme),
        optionSpeech: EN,
      };
    },
  },
  {
    id: "enSight6",
    subject: "english",
    age: 6,
    icon: "👀",
    title: same("Sight words"),
    gen: (level) => {
      if (level === 5) {
        const [sentence, ans, wrong] = pick(SIGHT_GAPS);
        return { kind: "choice", prompt: same("Which word fits?").en, visual: sentence, options: shuffle([ans, ...wrong]), answer: ans, answerSpeech: { text: sentence.replace("___", ans), lang: EN } };
      }
      const list = SIGHT[level - 1];
      const word = pick(list);
      // look-alike words (same first letter) make it a real reading task
      const pool = SIGHT.flat().filter((w) => w !== word);
      const alike = pool.filter((w) => w[0].toLowerCase() === word[0].toLowerCase());
      const n = level === 1 ? 3 : 4;
      const distract = level >= 3 && alike.length >= n - 1 ? alike : [...alike, ...list.filter((w) => w !== word)];
      return {
        kind: "choice",
        prompt: same("Listen and tap the word").en,
        visual: "🔊",
        speak: { text: word, lang: EN, auto: true },
        options: options(word, distract, n),
        answer: word,
        answerSpeech: { text: word, lang: EN },
      };
    },
  },
  {
    id: "enEnd6",
    subject: "english",
    age: 6,
    icon: "🔚",
    title: same("Last and middle sounds"),
    gen: (level) => {
      if (level === 5 || (level === 4 && Math.random() < 0.5)) {
        // middle (vowel) sound in a CVC word
        const [w, e] = pick(CVC);
        return {
          kind: "choice",
          prompt: same("Which sound is in the middle?").en,
          visual: `${e}\n${w[0]} _ ${w[2]}`,
          speak: { text: w, lang: EN, auto: true },
          options: options(w[1], VOWELS, level === 4 ? 3 : 4),
          answer: w[1],
          answerSpeech: { text: w, lang: EN },
        };
      }
      const pool = level <= 2 ? ENDINGS.filter(([w]) => w.length === 3) : ENDINGS;
      const [w, e] = pick(pool);
      const last = w[w.length - 1];
      return {
        kind: "choice",
        prompt: same("Which letter does the word end with?").en,
        // picture only: the child hears the word and finds its last sound
        visual: e,
        speak: { text: w, lang: EN, auto: true },
        options: options(last, ABC.filter((c) => !VOWELS.includes(c)), level === 1 ? 3 : 4),
        answer: last,
        answerSpeech: { text: w, lang: EN },
      };
    },
  },
];

