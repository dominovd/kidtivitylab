// Round 3: Jessica on Flash at slower speeds (0.85 and 0.78), whole sentence + context pieces.
// Usage (from learn-app/):  node --env-file=.env.local scripts/tts/test3.mjs
import { mkdir, writeFile } from "node:fs/promises";

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("ELEVENLABS_API_KEY is missing: put it in learn-app/.env.local");
  process.exit(1);
}
const API = "https://api.elevenlabs.io";
const OUT = new URL("./samples3/", import.meta.url);
const headers = { "xi-api-key": key, "Content-Type": "application/json" };

async function tts(voiceId, text, speed, { previous_text, next_text } = {}) {
  const res = await fetch(`${API}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      text,
      model_id: "eleven_flash_v2_5",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true, speed },
      previous_text,
      next_text,
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

const { voices = [] } = await (await fetch(`${API}/v2/voices?page_size=100`, { headers })).json();
const jessica = voices.find((v) => v.name.toLowerCase().startsWith("jessica"));
if (!jessica) {
  console.error('No voice named "Jessica" found.');
  process.exit(1);
}
const id = jessica.voice_id;
await mkdir(OUT, { recursive: true });

const pieces = [
  ["83", "", "plus 4 equals what?"],
  ["plus", "83", "4 equals what?"],
  ["4", "83 plus", "equals what?"],
  ["equals what?", "83 plus 4", ""],
];
for (const speed of [0.85, 0.78]) {
  const tag = String(speed).replace(".", "");
  await writeFile(new URL(`s${tag}-whole.mp3`, OUT), await tts(id, "83 plus 4 equals what?", speed));
  for (const [i, [text, prev, next]] of pieces.entries()) {
    await writeFile(new URL(`s${tag}-piece-${i}.mp3`, OUT), await tts(id, text, speed, { previous_text: prev || undefined, next_text: next || undefined }));
  }
  await writeFile(new URL(`s${tag}-praise.mp3`, OUT), await tts(id, "Which letter does the word start with? ... Wonderful! Three in a row, you're on fire!", speed));
  console.log(`✓ speed ${speed}`);
}
console.log("\nDone. Files: learn-app/scripts/tts/samples3/");
