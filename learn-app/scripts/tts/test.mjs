// Generates a few sample phrases with several ElevenLabs voices so you can compare them by ear.
// Usage (from learn-app/):  node --env-file=.env.local scripts/tts/test.mjs
// Optional: VOICES="Name1,Name2" to test specific voices from your library.
import { mkdir, writeFile } from "node:fs/promises";

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("ELEVENLABS_API_KEY is missing: put it in learn-app/.env.local");
  process.exit(1);
}
const API = "https://api.elevenlabs.io";
const OUT = new URL("./samples/", import.meta.url);
const headers = { "xi-api-key": key, "Content-Type": "application/json" };

// warm American narrators from the default library; any that are missing are skipped
const WANT = (process.env.VOICES ?? "Matilda,Sarah,Jessica,Laura,Will").split(",").map((s) => s.trim());

const PHRASES = [
  ["prompt", "Which letter does the word start with?"],
  ["math", "83 plus 4 equals what?"],
  ["word", "Apple."],
  ["praise", "Wonderful! Three in a row, you're on fire!"],
  ["hero", "Hooray! You have a new friend: Luna!"],
];

const SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true, speed: 0.92 };

async function tts(voiceId, text, model = "eleven_multilingual_v2") {
  const res = await fetch(`${API}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text, model_id: model, voice_settings: SETTINGS }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

const list = await fetch(`${API}/v2/voices?page_size=100`, { headers });
if (!list.ok) {
  console.error(`Voices API error ${list.status}: ${await list.text()}`);
  console.error("Check that the key has Voices: Read.");
  process.exit(1);
}
const { voices = [] } = await list.json();
const byName = (n) => voices.find((v) => v.name.toLowerCase().startsWith(n.toLowerCase()));
const picked = WANT.map((n) => [n, byName(n)]).filter(([n, v]) => {
  if (!v) console.log(`skip: no voice named "${n}" in your library`);
  return !!v;
});
if (!picked.length) {
  console.error("None of the voices were found. Run scripts/tts/voices.mjs and pass VOICES=\"Name1,Name2\".");
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
let chars = 0;
for (const [name, v] of picked) {
  // one file per voice: all phrases in a row with a short pause, easy to compare
  const all = PHRASES.map(([, t]) => t).join(" ... ");
  await writeFile(new URL(`${name.toLowerCase()}-all.mp3`, OUT), await tts(v.voice_id, all));
  chars += all.length;
  console.log(`✓ ${name}  (${v.labels?.accent ?? "?"}, ${v.labels?.age ?? "?"}, ${v.labels?.gender ?? "?"})`);
}

// the same voice, cheaper Flash model (half the credits): is the difference audible?
const [firstName, first] = picked[0];
const allText = PHRASES.map(([, t]) => t).join(" ... ");
await writeFile(new URL(`${firstName.toLowerCase()}-all-flash.mp3`, OUT), await tts(first.voice_id, allText, "eleven_flash_v2_5"));
chars += allText.length;

// whole sentence vs. sentence stitched from separate clips (the plan for math)
const parts = ["83", "plus", "4", "equals what?"];
const clips = [];
for (const p of parts) clips.push(await tts(first.voice_id, p));
await writeFile(new URL(`${firstName.toLowerCase()}-math-stitched.mp3`, OUT), Buffer.concat(clips));
await writeFile(new URL(`${firstName.toLowerCase()}-math-whole.mp3`, OUT), await tts(first.voice_id, "83 plus 4 equals what?"));
chars += parts.join("").length + 22;

console.log(`\nDone. About ${chars} characters used. Files: learn-app/scripts/tts/samples/`);
