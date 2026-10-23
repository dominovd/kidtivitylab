export type IcoName =
  | "words-abc" | "idea-lightbulb" | "logic-puzzle" | "math-blocks"
  | "pencil" | "reading-book" | "reward-coin" | "reward-star"
  | "streak-flame" | "heroes" | "parents" | "sound-on" | "sound-off" | "focus" | "level-check"
  | "lock" | "trophy" | "feel-easy" | "feel-ok" | "feel-hard" | "new-badge";

/** Illustrated icon from public/images/ui. Decorative by default. */
export default function Ico({ name, size = 24, alt = "", className = "" }: { name: IcoName; size?: number; alt?: string; className?: string }) {
  return (
    <img
      src={`/learn/images/ui/${name}.webp`}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={`ico ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}
