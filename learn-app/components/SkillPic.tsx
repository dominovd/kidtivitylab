"use client";

import { useState } from "react";
import type { Skill } from "@/lib/engine";

/** Skill illustration from public/images/skills; falls back to the skill's emoji. */
export default function SkillPic({ skill, size = 56, className = "" }: { skill: Pick<Skill, "id" | "icon">; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <span className={`skill-emoji ${className}`} style={{ fontSize: size * 0.7, width: size, height: size }} aria-hidden>
        {skill.icon}
      </span>
    );
  return (
    <img
      src={`/learn/images/skills/${skill.id}.webp`}
      width={size}
      height={size}
      alt=""
      aria-hidden
      className={`skill-pic ${className}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
