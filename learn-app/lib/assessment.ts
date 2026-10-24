import { l, type L } from "./i18n";
import type { Age, SubjectId } from "./engine";

/**
 * Age milestones for the parent survey.
 * Track "6": roughly kindergarten and 1st grade (ages 5–7).
 * Track "11": roughly 4th–6th grade (ages 9–12).
 * `expected`: a typical child of this age can do it. `next`: the next step, a stretch goal.
 * `skills`: which skills it maps to and the level that matches mastering it.
 */
export type Milestone = {
  id: string;
  age: Age;
  subject: SubjectId;
  stage: "expected" | "next";
  text: L;
  skills: Record<string, number>;
};

const m = (id: string, age: Age, subject: SubjectId, stage: Milestone["stage"], text: L, skills: Record<string, number>): Milestone => ({
  id, age, subject, stage, text, skills,
});

export const STAGE_TITLE: Record<Age, L> = {
  6: l("Kindergarten – 2nd grade", "Kindergarten – 2nd grade", "Kindergarten – 2nd grade"),
  11: l("Kindergarten – 2nd grade", "Kindergarten – 2nd grade", "Kindergarten – 2nd grade"),
};

export const MILESTONES: Milestone[] = [
  // ---------------- 6 years ----------------
  m("m6_count10", 6, "math", "expected", l("Лічить предмети до 10", "Считает предметы до 10", "Counts objects up to 10"), { count: 2 }),
  m("m6_compare", 6, "math", "expected", l("Порівнює числа: більше, менше, дорівнює", "Сравнивает числа: больше, меньше, равно", "Compares numbers: more, less, equal"), { compare: 2 }),
  m("m6_count20", 6, "math", "expected", l("Лічить до 20 і називає сусідні числа", "Считает до 20 и называет соседние числа", "Counts to 20 and names neighboring numbers"), { count: 4, sequence6: 3 }),
  m("m6_add10", 6, "math", "expected", l("Додає і віднімає в межах 10", "Складывает и вычитает в пределах 10", "Adds and subtracts within 10"), { add6: 3, sub6: 3 }),
  m("m6_make10", 6, "math", "expected", l("Make 10", "Make 10", "Knows which number makes 10 (7 + 3)"), { make10: 3 }),
  m("m6_shapes", 6, "math", "expected", l("Розпізнає круг, квадрат, трикутник, прямокутник", "Узнаёт круг, квадрат, треугольник, прямоугольник", "Recognizes circle, square, triangle, rectangle"), { shapes6: 2 }),
  m("m6_add20", 6, "math", "next", l("Додає і віднімає в межах 20", "Складывает и вычитает в пределах 20", "Adds and subtracts within 20"), { add6: 5, sub6: 5, compare: 4 }),
  // 1st–2nd grade range of the 5–8 band (Common Core 1.NBT/2.NBT/2.OA), practiced on the Extra challenge island
  m("m6_tensOnes", 6, "plus", "expected", l("Tens and ones in a two-digit number", "Tens and ones in a two-digit number", "Knows tens and ones in a two-digit number (34 = 3 tens 4 ones)"), { tensOnes: 3 }),
  m("m6_clock", 6, "plus", "expected", l("Time to the hour and half-hour", "Time to the hour and half-hour", "Tells time to the hour and half-hour"), { clock6: 3 }),
  m("m6_skip", 6, "plus", "next", l("Skip-counting", "Skip-counting", "Skip-counts by 2s, 5s and 10s"), { skipCount6: 3 }),
  m("m6_add100", 6, "plus", "next", l("Two-digit addition and subtraction", "Two-digit addition and subtraction", "Adds and subtracts two-digit numbers within 100"), { add2d: 3, sub2d: 3, add100: 2 }),
  m("m6_oddEven", 6, "plus", "next", l("Odd and even", "Odd and even", "Tells odd from even numbers"), { oddEven6: 3 }),
  m("m6_money", 6, "plus", "next", l("Money", "Money", "Counts coins: pennies, nickels, dimes, quarters"), { money6: 4 }),
  m("m6_problems", 6, "plus", "next", l("One-step word problems", "One-step word problems", "Solves one-step word problems on their own"), { problems6: 3 }),

  m("m6_letters", 6, "lang", "expected", l("Знає більшість літер", "Знает большинство букв", "Knows most letters"), { firstLetter: 2, missingLetter: 1 }),
  m("m6_sounds", 6, "lang", "expected", l("Чує перший звук у слові", "Слышит первый звук в слове", "Hears the first sound in a word"), { firstLetter: 3 }),
  m("m6_syllables", 6, "lang", "expected", l("Ділить слова на склади", "Делит слова на слоги", "Splits words into syllables"), { syllables6: 3 }),
  m("m6_readSyl", 6, "lang", "expected", l("Читає склади і короткі слова", "Читает слоги и короткие слова", "Reads syllables and short words"), { readWord: 2, missingLetter: 2 }),
  m("m6_readWords", 6, "lang", "next", l("Читає цілими словами", "Читает целыми словами", "Reads whole words fluently"), { readWord: 5, missingLetter: 4, readSentence6: 3 }),
  m("m6_sentences", 6, "lang", "next", l("Reads simple sentences", "Reads simple sentences", "Reads and understands a simple sentence"), { readSentence6: 4 }),
  m("m6_stories", 6, "lang", "next", l("Retells a short story", "Retells a short story", "Reads a short story and retells what happened in order"), { stories6: 3 }),

  m("m6_enRhyme", 6, "english", "expected", l("Rhymes", "Rhymes", "Hears which words rhyme (cat, hat)"), { enRhyme6: 2 }),
  m("m6_enSight", 6, "english", "expected", l("Sight words", "Sight words", "Reads first sight words: the, and, see, you"), { enSight6: 2 }),
  m("m6_enEnd", 6, "english", "expected", l("Last sound", "Last sound", "Hears the last sound in a short word"), { enEnd6: 2 }),
  m("m6_enLetters", 6, "english", "expected", l("Letters", "Letters", "Matches big and small letters"), { enLetters6: 3 }),
  m("m6_enColors", 6, "english", "expected", l("Називає кольори англійською", "Называет цвета по-английски", "Reads the color words (red, blue, green…)"), { enColors6: 3 }),
  m("m6_enNumbers", 6, "english", "expected", l("Лічить англійською до 10", "Считает по-английски до 10", "Reads the number words up to ten"), { enNumbers6: 3 }),
  m("m6_enMiddle", 6, "english", "next", l("Middle sound", "Middle sound", "Hears the middle vowel in words like cat, pig, sun"), { enEnd6: 5 }),
  m("m6_enSight2", 6, "english", "next", l("More sight words", "More sight words", "Reads 1st–2nd grade sight words (because, there, where)"), { enSight6: 4 }),

  m("m6_patterns", 6, "logic", "expected", l("Продовжує візерунок з 2–3 елементів", "Продолжает узор из 2–3 элементов", "Continues a pattern of 2–3 items"), { patterns6: 3 }),
  m("m6_classify", 6, "logic", "expected", l("Знаходить зайве і пояснює чому", "Находит лишнее и объясняет почему", "Finds the odd one out and says why"), { oddOne6: 3 }),
  m("m6_memory", 6, "logic", "expected", l("Запам'ятовує 3–4 предмети", "Запоминает 3–4 предмета", "Remembers 3–4 objects"), { memory6: 3 }),
  m("m6_calendar", 6, "logic", "expected", l("Знає пори року і дні тижня", "Знает времена года и дни недели", "Knows seasons and days of the week"), { calendar6: 3 }),

  // ---------------- 11 years ----------------
  m("m11_mult", 11, "math", "expected", l("Знає таблицю множення напам'ять", "Знает таблицу умножения наизусть", "Knows times tables by heart"), { mult: 3, div: 3 }),
  m("m11_bigNums", 11, "math", "expected", l("Додає і віднімає багатоцифрові числа", "Складывает и вычитает многозначные числа", "Adds and subtracts multi-digit numbers"), { mental: 4 }),
  m("m11_order", 11, "math", "expected", l("Знає порядок дій у виразах з дужками", "Знает порядок действий в выражениях со скобками", "Knows the order of operations with brackets"), { orderOps11: 3 }),
  m("m11_equations", 11, "math", "expected", l("Розв'язує прості рівняння", "Решает простые уравнения", "Solves simple equations"), { equations: 3 }),
  m("m11_problems", 11, "math", "expected", l("Розв'язує задачі на 2–3 дії, периметр і площу", "Решает задачи в 2–3 действия, периметр и площадь", "Solves 2–3 step problems, perimeter and area"), { problems: 3 }),
  m("m11_units", 11, "math", "expected", l("Переводить одиниці довжини, маси, часу", "Переводит единицы длины, массы, времени", "Converts units of length, mass and time"), { units11: 3 }),
  m("m11_fractions", 11, "math", "expected", l("Порівнює і додає дроби з однаковими знаменниками", "Сравнивает и складывает дроби с одинаковыми знаменателями", "Compares and adds fractions with like denominators"), { fractions: 4 }),
  m("m11_multMulti", 11, "math", "next", l("Множить і ділить багатоцифрові числа", "Умножает и делит многозначные числа", "Multiplies and divides multi-digit numbers"), { mult: 5, div: 5 }),
  m("m11_decimals", 11, "math", "next", l("Порівнює і додає десяткові дроби", "Сравнивает и складывает десятичные дроби", "Compares and adds decimals"), { decimals11: 4 }),
  m("m11_percent", 11, "math", "next", l("Знаходить відсоток від числа", "Находит процент от числа", "Finds a percentage of a number"), { percent11: 3 }),

  m("m11_reading", 11, "lang", "expected", l("Розуміє прочитаний текст і відповідає на питання", "Понимает прочитанный текст и отвечает на вопросы", "Understands a text and answers questions"), { reading: 3 }),
  m("m11_spelling", 11, "lang", "expected", l("Пише без помилок типові слова", "Пишет без ошибок типичные слова", "Spells common words correctly"), { spelling: 3 }),
  m("m11_pos", 11, "lang", "expected", l("Визначає частини мови", "Определяет части речи", "Identifies parts of speech"), { partsOfSpeech11: 3 }),
  m("m11_vocab", 11, "lang", "expected", l("Добирає антоніми і синоніми", "Подбирает антонимы и синонимы", "Finds opposites and synonyms"), { antonyms: 3 }),

  m("m11_enVocab", 11, "english", "expected", l("Має англійський словник 500+ слів", "Имеет английский словарь 500+ слов", "Knows and spells everyday vocabulary"), { enVocab11: 3 }),
  m("m11_enBe", 11, "english", "expected", l("Правильно вживає to be, a/an, множину", "Правильно использует to be, a/an, множественное число", "Uses to be, a/an and plurals correctly"), { enGrammar11: 3 }),
  m("m11_enSentences", 11, "english", "expected", l("Складає прості речення англійською", "Составляет простые предложения по-английски", "Builds complete sentences from words"), { enSentence11: 3 }),
  m("m11_enPast", 11, "english", "next", l("Використовує Present Simple і Past Simple", "Использует Present Simple и Past Simple", "Uses present and past tense verbs correctly"), { enGrammar11: 5 }),

  m("m11_seq", 11, "logic", "expected", l("Бачить закономірність у числовому ряді", "Видит закономерность в числовом ряду", "Spots patterns in number sequences"), { numSeq11: 3 }),
  m("m11_memory", 11, "logic", "expected", l("Утримує в пам'яті 5–6 цифр", "Удерживает в памяти 5–6 цифр", "Holds 5–6 digits in memory"), { digitSpan11: 2 }),
  m("m11_logic", 11, "logic", "expected", l("Розв'язує логічні задачі на порівняння", "Решает логические задачи на сравнение", "Solves comparison logic puzzles"), { whoFaster11: 3 }),
  m("m11_divisibility", 11, "logic", "next", l("Знає ознаки подільності на 2, 5, 9", "Знает признаки делимости на 2, 5, 9", "Knows divisibility rules for 2, 5, 9"), { oddNumber11: 4 }),
];

export type Answer = 0 | 1 | 2; // 0 not yet, 1 partly, 2 yes
export const ANSWER_LABEL: Record<Answer | "unknown", L> = {
  2: l("Вміє", "Умеет", "Can do"),
  1: l("Частково", "Частично", "Partly"),
  0: l("Ще ні", "Ещё нет", "Not yet"),
  unknown: l("Не знаю", "Не знаю", "Not sure"),
};

export const milestonesFor = (age: Age, subject?: SubjectId) =>
  MILESTONES.filter((x) => x.age === age && (!subject || x.subject === subject));

/**
 * Start level per skill from survey answers.
 * "Can do" sets the skill to the milestone's level, "partly" to one below it.
 * A skill with no answered milestones is left out.
 */
export function levelsFromSurvey(age: Age, answers: Record<string, Answer>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const ms of milestonesFor(age)) {
    const a = answers[ms.id];
    if (a === undefined) continue;
    for (const [skill, lvl] of Object.entries(ms.skills)) {
      const value = a === 2 ? lvl : a === 1 ? Math.max(1, lvl - 1) : Math.max(1, lvl - 2);
      // "not yet" on an easier milestone caps the level; "can do" on a harder one raises it
      if (out[skill] === undefined) out[skill] = value;
      else out[skill] = a === 2 ? Math.max(out[skill], value) : Math.min(out[skill], value);
    }
  }
  for (const k of Object.keys(out)) out[k] = Math.min(5, Math.max(1, out[k]));
  return out;
}

export const MAX_FOCUS = 4;

/**
 * Focus: at most one milestone per subject (MAX_FOCUS in total), taken from the
 * expected milestones the child cannot do yet ("not yet" before "partly", then list order).
 * A milestone leaves the focus once every linked skill has been played and reached its level,
 * so the next one moves up automatically.
 */
export function focusSkills(
  age: Age,
  answers: Record<string, Answer>,
  stats: Record<string, { level: number; rounds: number }> = {},
): string[] {
  const reached = (ms: Milestone) =>
    Object.entries(ms.skills).every(([id, lvl]) => (stats[id]?.rounds ?? 0) > 0 && (stats[id]?.level ?? 1) >= lvl);
  const open = milestonesFor(age)
    .map((ms, i) => ({ ms, i, a: answers[ms.id] }))
    .filter((x) => x.ms.stage === "expected" && (x.a === 0 || x.a === 1) && !reached(x.ms))
    .sort((x, y) => (x.a as number) - (y.a as number) || x.i - y.i);
  const bySubject = new Map<string, Milestone>();
  for (const { ms } of open) if (!bySubject.has(ms.subject) && bySubject.size < MAX_FOCUS) bySubject.set(ms.subject, ms);
  return [...new Set([...bySubject.values()].flatMap((ms) => Object.keys(ms.skills)))];
}
