/**
 * Collects everything the app can say aloud (ages 5–8 track) and writes scripts/tts/phrases.json:
 * the list of clips to pre-generate with scripts/tts/generate.mjs.
 *
 * Phrases without numbers are recorded whole. Phrases with numbers are split into
 * text segments and number/time atoms, which the app stitches together at playback
 * (see lib/voice.ts). Each clip carries previous/next text so its intonation fits the sentence.
 *
 * Usage (from learn-app/):  npx tsx scripts/tts/build-phrases.ts
 */
import { writeFileSync } from "node:fs";
import { SKILLS } from "../../lib/skills";
import { taskSpeech } from "../../lib/say";
import { t } from "../../lib/i18n";
import { HEROES } from "../../lib/heroes";
import { praise, encourage } from "../../lib/praise";
import { NUM_RE, splitForSpeech, numberKey, phraseKey, sayAs, spokenText } from "../../lib/voice-keys";

type Clip = { key: string; text: string; previous_text?: string; next_text?: string };

const SAMPLES = 4000;
const spoken = new Set<string>();
const add = (s?: string) => {
  const v = s ? spokenText(s) : "";
  if (v) spoken.add(v);
};

// 1. everything the task generators can produce
for (const s of SKILLS.filter((x) => x.age === 6)) {
  for (let lv = 1; lv <= 5; lv++)
    for (let i = 0; i < SAMPLES; i++) {
      const q = s.gen(lv, "en");
      for (const p of taskSpeech(q, "en", true)) add(p.text);
      add(q.answerSpeech?.text);
      if (q.optionSpeech) q.options?.forEach(add);
      if (q.tokenSpeech) q.tokens?.forEach(add);
    }
}

// 2. app lines outside the tasks
for (let i = 0; i < 600; i++) {
  add(praise("en", i % 4));
  add(encourage("en"));
}
for (const k of ["howWasIt", "feelUp", "feelDown", "feelKeep", "feelThanks"] as const) add(t(k, "en"));
for (const h of HEROES) add(`${t("newHeroSay", "en")}: ${h.name.en}!`);
add("Hello! I can talk. Apple, banana, cat.");

// 3. split into clips
const clips = new Map<string, Clip>();
const put = (c: Clip) => {
  if (!clips.has(c.key)) clips.set(c.key, c);
};

const numbers = new Set<string>();
// Lines with numbers are reduced to templates with fixed sample numbers, so the context
// (and with it the clip file names) stays the same however the generators were sampled.
const NUM_G = new RegExp(NUM_RE.source, "g");
const SAMPLE = ["4", "6", "8", "3", "5", "7"];
const templates = new Set<string>();
for (const text of spoken) {
  if (!NUM_RE.test(text)) {
    put({ key: phraseKey(text), text: sayAs(text) });
    continue;
  }
  text.match(NUM_G)!.forEach((n) => numbers.add(n));
  let k = 0;
  templates.add(text.replace(NUM_G, (n) => (n.includes(":") ? "10:30" : SAMPLE[k++ % SAMPLE.length])));
}
for (const text of [...templates].sort()) {
  // segments get the surrounding sentence as context
  const parts = splitForSpeech(text);
  parts.forEach((p, i) => {
    if (p.kind === "num") return;
    const prev = parts.slice(0, i).map((x) => x.value).join(" ");
    const next = parts.slice(i + 1).map((x) => x.value).join(" ");
    // "... equals what" ends a spoken question: say it as one
    const say = sayAs(p.value) + (i === parts.length - 1 && /\bwhat$/.test(p.value) ? "?" : "");
    put({ key: phraseKey(p.value), text: say, previous_text: sayAs(prev) || undefined, next_text: sayAs(next) || undefined });
  });
}

// number atoms: everything seen, plus the full ranges the generators can reach
for (let n = 0; n <= 120; n++) numbers.add(String(n));
for (let n = 0; n <= 1000; n += 10) numbers.add(String(n));
for (let n = 0; n <= 500; n += 5) numbers.add(String(n));
for (let h = 1; h <= 12; h++) for (const m of ["00", "15", "30", "45"]) numbers.add(`${h}:${m}`);

for (const n of numbers) {
  put({ key: numberKey(n, "mid"), text: n, next_text: n.includes(":") ? "and lasted 15 minutes." : "plus 4 equals what?" });
  put({ key: numberKey(n, "end"), text: `${n}.`, previous_text: n.includes(":") ? "The lesson ended at" : "4 plus 6 equals" });
}

const list = [...clips.values()].sort((a, b) => a.key.localeCompare(b.key));
const chars = list.reduce((s, c) => s + c.text.length, 0);
writeFileSync(new URL("./phrases.json", import.meta.url), JSON.stringify(list, null, 1) + "\n");
console.log(`${spoken.size} spoken lines → ${list.length} clips, ${chars} characters`);
