import type { Lang } from "./i18n";
import { pick } from "./engine";

/** Short phrases after an answer. No gendered forms, so they fit any child. */
const PRAISE: Record<Lang, string[]> = {
  uk: ["Молодець!", "Так тримати!", "Чудово!", "Супер!", "Блискуче!", "Неймовірно!", "Оце так!", "Клас!"],
  ru: ["Молодец!", "Так держать!", "Замечательно!", "Супер!", "Отлично!", "Великолепно!", "Здорово!", "Класс!"],
  en: ["Well done!", "Keep it up!", "Wonderful!", "Awesome!", "Brilliant!", "Great job!", "Amazing!", "Super!"],
};

const ENCOURAGE: Record<Lang, string[]> = {
  uk: ["Спробуй ще!", "Не здавайся!", "Усе вийде!", "Майже! Наступного разу вийде", "Нічого страшного, ми вчимося!"],
  ru: ["Попробуй ещё!", "Не сдавайся!", "Всё получится!", "Почти! В следующий раз получится", "Ничего страшного, мы учимся!"],
  en: ["Try again!", "Don't give up!", "You'll get it!", "Almost! Next time you'll get it", "That's OK, we're learning!"],
};

const STREAK: Record<Lang, string[]> = {
  uk: ["Три поспіль! Ти в ударі!", "Ого, яка серія!"],
  ru: ["Три подряд! Ты в ударе!", "Ого, какая серия!"],
  en: ["Three in a row! You're on fire!", "Wow, what a streak!"],
};

export function praise(lang: Lang, combo: number) {
  if (combo > 0 && combo % 3 === 0) return pick(STREAK[lang]);
  return pick(PRAISE[lang]);
}
export const encourage = (lang: Lang) => pick(ENCOURAGE[lang]);
