"use client";

import App from "@/components/App";
import { ProgressProvider } from "@/lib/progress";

export default function Home() {
  return (
    <ProgressProvider>
      <App />
    </ProgressProvider>
  );
}
