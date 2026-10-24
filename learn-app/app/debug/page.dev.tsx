import type { Metadata } from "next";
import Debug from "@/components/Debug";

export const metadata: Metadata = { title: "Debug · Kidtivity Learn", robots: { index: false, follow: false } };

export default function DebugPage() {
  return <Debug />;
}
