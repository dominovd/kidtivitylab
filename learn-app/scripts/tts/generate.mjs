// Generates the app's voice clips with ElevenLabs into public/audio/en/ and writes manifest.json.
// Clips that already exist are skipped, so re-running only pays for new or changed lines.
//
// Usage (from learn-app/):
//   node --env-file=.env.local scripts/tts/generate.mjs          shows what would be generated
//   node --env-file=.env.local scripts/tts/generate.mjs --yes    generates
// After changing task texts: npx tsx scripts/tts/build-phrases.ts, then run this again.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const VOICE_NAME = process.env.VOICE ?? "Jessica";
const MODEL = "eleven_flash_v2_5";
const SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true, speed: 0.85 };
const FORMAT = "mp3_44100_64";
const PARALLEL = 3;

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("ELEVENLABS_API_KEY is missing: put it in learn-app/.env.local");
  process.exit(1);
}
const API = "https://api.elevenlabs.io";
const headers = { "xi-api-key": key, "Content-Type": "application/json" };
const OUT = new URL("../../public/audio/en/", import.meta.url);
const go = process.argv.includes("--yes");

const clips = JSON.parse(await readFile(new URL("./phrases.json", import.meta.url), "utf8"));
// the file name depends on everything that changes the sound, so edits regenerate only what changed
const fileOf = (c) =>
  createHash("sha1")
    .update(JSON.stringify([c.key, c.text, c.previous_text ?? "", c.next_text ?? "", VOICE_NAME, MODEL, SETTINGS]))
    .digest("hex")
    .slice(0, 12) + ".mp3";

await mkdir(OUT, { recursive: true });
const todo = clips.filter((c) => !existsSync(new URL(fileOf(c), OUT)));
const chars = todo.reduce((s, c) => s + c.text.length, 0);
console.log(`${clips.length} clips in total, ${clips.length - todo.length} already done, ${todo.length} to generate (${chars} characters).`);

// credits left (needs the "User" permission on the key; skipped otherwise)
const sub = await fetch(`${API}/v1/user/subscription`, { headers }).catch(() => null);
if (sub?.ok) {
  const s = await sub.json();
  console.log(`Credits: ${s.character_count} of ${s.character_limit} used this period (${s.tier}).`);
} else console.log("Credits: unknown (the key has no User permission), check the ElevenLabs dashboard.");

if (!todo.length) {
  await writeManifest();
  process.exit(0);
}
if (!go) {
  console.log(`\nNothing generated yet. Flash costs about half a credit per character, so roughly ${Math.ceil(chars / 2)} credits.`);
  console.log("Run again with --yes to generate.");
  process.exit(0);
}

const { voices = [] } = await (await fetch(`${API}/v2/voices?page_size=100`, { headers })).json();
const voice = voices.find((v) => v.name.toLowerCase().startsWith(VOICE_NAME.toLowerCase()));
if (!voice) {
  console.error(`No voice named "${VOICE_NAME}" in your library.`);
  process.exit(1);
}

async function tts(c, attempt = 1) {
  const res = await fetch(`${API}/v1/text-to-speech/${voice.voice_id}?output_format=${FORMAT}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text: c.text, model_id: MODEL, voice_settings: SETTINGS, previous_text: c.previous_text, next_text: c.next_text }),
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    await new Promise((r) => setTimeout(r, 1500 * attempt));
    return tts(c, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

let done = 0;
let failed = 0;
const queue = [...todo];
async function worker() {
  for (let c = queue.shift(); c; c = queue.shift()) {
    try {
      await writeFile(new URL(fileOf(c), OUT), await tts(c));
    } catch (e) {
      failed++;
      console.error(`\n✗ ${c.key}: ${e.message}`);
      if (/quota|credits|401|402/.test(e.message)) {
        queue.length = 0;
        console.error("Stopping: out of credits or the key was rejected.");
      }
    }
    done++;
    process.stdout.write(`\r${done}/${todo.length}`);
  }
}
await Promise.all(Array.from({ length: PARALLEL }, worker));
console.log(failed ? `\n${failed} clips failed; run again to retry them.` : "\nAll clips generated.");
await writeManifest();

async function writeManifest() {
  const items = {};
  for (const c of clips) if (existsSync(new URL(fileOf(c), OUT))) items[c.key] = fileOf(c);
  const manifest = { voice: VOICE_NAME, model: MODEL, speed: SETTINGS.speed, count: Object.keys(items).length, items };
  await writeFile(new URL("manifest.json", OUT), JSON.stringify(manifest) + "\n");
  console.log(`manifest.json: ${manifest.count} clips.`);
}
