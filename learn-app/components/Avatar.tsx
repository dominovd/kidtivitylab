"use client";

import HeroPic from "./HeroPic";
import { HEROES } from "@/lib/heroes";

/** Profile avatar: an emoji or "hero:<id>" (an unlocked hero, with emoji fallback). */
export default function Avatar({ value, size = 40, className = "" }: { value: string; size?: number; className?: string }) {
  if (value.startsWith("hero:")) {
    const hero = HEROES.find((h) => h.id === value.slice(5));
    if (hero)
      return (
        <span className={`avatar-img ${className}`} style={{ width: size, height: size, display: "inline-flex" }}>
          <HeroPic hero={hero} size={size} />
        </span>
      );
  }
  // legacy "img:" avatars from the family version have no public image: show a neutral emoji
  const emoji = value.startsWith("img:") || value.startsWith("hero:") ? "🙂" : value;
  return (
    <span className={`avatar-emoji ${className}`} style={{ fontSize: size * 0.85, lineHeight: 1 }} aria-hidden>
      {emoji}
    </span>
  );
}
