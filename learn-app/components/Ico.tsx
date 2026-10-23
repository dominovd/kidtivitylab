export type IcoName =
  | "english-globe" | "idea-lightbulb" | "logic-puzzle" | "math-blocks"
  | "pencil" | "reading-book" | "reward-coin" | "reward-star";

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
