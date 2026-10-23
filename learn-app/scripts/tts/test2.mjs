// Round 2: Jessica only. Compares models and tests stitched math with context hints.
// Usage (from learn-app/):  node --env-file=.env.local scripts/tts/test2.mjs
import { mkdir, writeFile } from "node:fs/promises";

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("ELEVENLABS_API_KEY is missing: put it in learn-app/.env.local");
  process.exit(1);
}
const API = "https://api.elevenlabs.io";
const OUT = new URL("./samples2/", import.meta.url);
const headers = { "xi-api-key": key, "Content-Type": "application/json" };
const SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true, speed: 0.92 };

async function tts(voiceId, text, { model = "eleven_multilingual_v2", previous_text, next_text } = {}) {
  const res = await fetch(`${API}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text, model_id: model, voice_settings: SETTINGS, previous_text, next_text }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

const list = await fetch(`${API}/v2/voices?page_size=100`, { headers });
const { voices = [] } = await list.json();
const jessica = voices.find((v) => v.name.toLowerCase().startsWith("jessica"));
if (!jessica) {
  console.error('No voice named "Jessica" found.');
  process.exit(1);
}
const id = jessica.voice_id;
await mkdir(OUT, { recursive: true });

const all = "Which letter does the word start with? ... 83 plus 4 equals what? ... Apple. ... Wonderful! Three in a row, you're on fire! ... Hooray! You have a new friend: Luna!";
await writeFile(new URL("jessica-all-flash.mp3", OUT), await tts(id, all, { model: "eleven_flash_v2_5" }));
await writeFile(new URL("jessica-all-turbo.mp3", OUT), await tts(id, all, { model: "eleven_turbo_v2_5" }));
console.log("✓ model comparison");

// math: whole sentence vs. clips generated with context, so each piece keeps mid-sentence intonation
const sentence = "83 plus 4 equals what?";
await writeFile(new URL("math-whole.mp3", OUT), await tts(id, sentence));
const pieces = [
  ["83", "", "plus 4 equals what?"],
  ["plus", "83", "4 equals what?"],
  ["4", "83 plus", "equals what?"],
  ["equals what?", "83 plus 4", ""],
];
for (const [i, [text, prev, next]] of pieces.entries()) {
  await writeFile(new URL(`math-piece-${i}.mp3`, OUT), await tts(id, text, { previous_text: prev || undefined, next_text: next || undefined }));
}
console.log("✓ math pieces");
console.log("\nDone. Files: learn-app/scripts/tts/samples2/");
