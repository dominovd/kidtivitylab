"use client";

import { useState } from "react";
import { heroImage, type Hero } from "@/lib/heroes";

/** Hero picture from public/images/heroes; falls back to the emoji until the image exists. */
export default function HeroPic({ hero, size = 96, locked = false }: { hero: Hero; size?: number; locked?: boolean }) {
  // try .webp, then .png, then fall back to the emoji
  const [stage, setStage] = useState(0);
  const failed = stage >= 2;
  return (
    <span className={`hero-pic ${locked ? "locked" : ""}`} style={{ width: size, height: size }}>
      {failed ? (
        <span className="hero-emoji" style={{ fontSize: size * 0.7 }} aria-hidden>
          {hero.emoji}
        </span>
      ) : (
        <img
          src={stage === 0 ? heroImage(hero.id) : heroImage(hero.id).replace(".webp", ".png")}
          width={size}
          height={size}
          alt=""
          onError={() => setStage((x) => x + 1)}
        />
      )}
    </span>
  );
}
