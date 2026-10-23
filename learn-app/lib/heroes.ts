import { l, type L } from "./i18n";

export type Rarity = "starting" | "rare" | "epic" | "mythic" | "legendary" | "ultra";

export const RARITY: Record<Rarity, { name: L; color: string }> = {
  starting: { name: l("Starting", "Starting", "Starting"), color: "#9aa4b2" },
  rare: { name: l("Rare", "Rare", "Rare"), color: "#4fc36b" },
  epic: { name: l("Epic", "Epic", "Epic"), color: "#b04ce0" },
  mythic: { name: l("Mythic", "Mythic", "Mythic"), color: "#e5404b" },
  legendary: { name: l("Legendary", "Legendary", "Legendary"), color: "#f5c518" },
  ultra: { name: l("Ultra Legendary", "Ultra Legendary", "Ultra Legendary"), color: "#ff5ad1" },
};

export type Hero = {
  id: string;
  /** Coins (right answers in total) needed to unlock. */
  cost: number;
  rarity: Rarity;
  /** Shown only if the picture fails to load. */
  emoji: string;
  name: L;
};

const h = (id: string, cost: number, rarity: Rarity, emoji: string, name: L): Hero => ({ id, cost, rarity, emoji, name });

/** Original Kidtivity Lab heroes, cheapest first. */
export const HEROES: Hero[] = [
  h("pip", 10, "starting", "🐤", l("Pip", "Pip", "Pip")),
  h("biscuit", 25, "rare", "🐶", l("Biscuit", "Biscuit", "Biscuit")),
  h("luna", 50, "epic", "🐱", l("Luna", "Luna", "Luna")),
  h("bolt", 80, "epic", "🤖", l("Bolt", "Bolt", "Bolt")),
  h("ember", 120, "mythic", "🐉", l("Ember", "Ember", "Ember")),
  h("frost", 170, "legendary", "🦊", l("Frost", "Frost", "Frost")),
  h("coco", 230, "legendary", "🐵", l("Coco", "Coco", "Coco")),
  h("rex", 300, "legendary", "🦖", l("Rex", "Rex", "Rex")),
  h("nova", 400, "legendary", "🦸", l("Nova", "Nova", "Nova")),
  h("shadow", 500, "legendary", "🐼", l("Shadow", "Shadow", "Shadow")),
  h("zephyr", 650, "ultra", "🦄", l("Zephyr", "Zephyr", "Zephyr")),
  h("orion", 800, "ultra", "🦁", l("Orion", "Orion", "Orion")),
];

export const heroImage = (id: string) => `/learn/images/heroes/${id}.webp`;

export const unlockedHeroes = (coins: number) => HEROES.filter((x) => coins >= x.cost);
export const nextHero = (coins: number) => HEROES.find((x) => coins < x.cost) ?? null;
