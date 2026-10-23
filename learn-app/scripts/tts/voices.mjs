// Lists ElevenLabs voices available to this account, best candidates for a kids' app first.
// Usage (from learn-app/):  node --env-file=.env.local scripts/tts/voices.mjs
const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("ELEVENLABS_API_KEY is missing: put it in learn-app/.env.local");
  process.exit(1);
}

const res = await fetch("https://api.elevenlabs.io/v2/voices?page_size=100&include_total_count=true", {
  headers: { "xi-api-key": key },
});
if (!res.ok) {
  console.error(`ElevenLabs API error ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const { voices = [] } = await res.json();

// warm, clear, American English narrators float to the top
const score = (v) => {
  const l = Object.values(v.labels ?? {}).join(" ").toLowerCase();
  const d = (v.description ?? "").toLowerCase();
  let s = 0;
  if (/american/.test(l)) s += 3;
  if (/narrat|educat|children|kids|story/.test(l + " " + d)) s += 3;
  if (/warm|friendly|calm|soft|gentle|cheer|pleasant/.test(l + " " + d)) s += 2;
  if (/young|middle/.test(l)) s += 1;
  return s;
};

const rows = voices
  .map((v) => ({ v, s: score(v) }))
  .sort((a, b) => b.s - a.s)
  .map(({ v }) => ({
    name: v.name,
    id: v.voice_id,
    category: v.category,
    labels: Object.entries(v.labels ?? {})
      .map(([k, val]) => `${k}: ${val}`)
      .join(", "),
    preview: v.preview_url,
  }));

console.log(`${rows.length} voices\n`);
for (const r of rows) {
  console.log(`${r.name}  [${r.id}]  (${r.category})`);
  if (r.labels) console.log(`  ${r.labels}`);
  if (r.preview) console.log(`  preview: ${r.preview}`);
  console.log("");
}
