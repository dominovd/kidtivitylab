/**
 * Drafts activity pages with the DeepSeek API from a YouTube transcript excerpt.
 * Drafts land in content-drafts/activities/<slug>.md (gitignored); Claude edits them
 * before they move to src/content/activities/.
 *
 * Usage (repo root):
 *   node --env-file=.env scripts/content/deepseek-activities.mjs            # all jobs
 *   node --env-file=.env scripts/content/deepseek-activities.mjs --only nature-tape-frame
 *   node --env-file=.env scripts/content/deepseek-activities.mjs --jobs scripts/content/activity-jobs-batch4.json
 * Needs DEEPSEEK_API_KEY in .env (gitignored).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const key = process.env.DEEPSEEK_API_KEY;
if (!key) {
  console.error('DEEPSEEK_API_KEY is missing. Add it to .env in the repo root.');
  process.exit(1);
}
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;

const read = (p) => readFileSync(path.join(root, p), 'utf8');
const jobsFile = process.argv.includes('--jobs') ? process.argv[process.argv.indexOf('--jobs') + 1] : 'scripts/content/activity-jobs.json';
const jobs = JSON.parse(read(jobsFile)).filter((j) => !only || j.slug === only);
const schema = read('src/content.config.ts').split('const blog')[0];
const examples = ['walk-this-way', 'water-painting', 'rice-sensory-bin'].map(
  (s) => `--- EXAMPLE: src/content/activities/${s}.md ---\n${read(`src/content/activities/${s}.md`)}`
);

const system = `You write activity pages for kidtivitylab.com, a site of practical play ideas for parents of kids 0 to 10 in the US.
Output ONE complete Markdown file: YAML frontmatter between --- lines, then 4 to 6 numbered steps in the format "1. **Short action.** One or two sentences."
Follow the Zod schema exactly (field names, enums, age in MONTHS, hook max 120 characters, last_updated as given).

Content rules:
- American English. Warm, practical, parent-to-parent. Short sentences. Concrete details (amounts, sizes, minutes, exact phrases to say).
- Never use the em dash character. Use commas, periods or colons.
- Never use: delve, crucial, unlock, embark, journey, holistic, empower, game-changer, tapestry, "it's important to note".
- No statistics, studies, expert names or quotes. No brand names. Don't invent facts about child development; keep learning_details plain and observable.
- Describe the activity's mechanic from the source excerpt (or the job's "mechanic" field) in your own words. Do not copy sentences from it.
- Safety: include safety_note with every point given in the job. Keep it calm and specific.
- Fields to include: title, hook, age_min, age_max, place, time_minutes, materials, materials_list, goals, involvement, situations, seasons, skills_developed (4 items), safety_note, tips, setup_minutes, cleanup_minutes, mess_level, energy_level, adult_help, why_kids_love_it, before_you_start (3 items), learning_details (3), variations (3), common_problems (2), faqs (2, real questions parents search), source_video (exactly as given, only if the job has one), last_updated.
- Do NOT include image or image_alt.
- Output only the file content. No code fences, no commentary.

Schema:
${schema}

${examples.join('\n\n')}`;

mkdirSync(path.join(root, 'content-drafts/activities'), { recursive: true });
for (const job of jobs) {
  const user = `Write src/content/activities/${job.slug}.md.
Job (use these values): ${JSON.stringify({ ...job, last_updated: '2026-11-04' }, null, 2)}`;
  const t0 = Date.now();
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, temperature: 0.7, max_tokens: 4000, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  });
  if (!res.ok) {
    console.error(`${job.slug}: HTTP ${res.status} ${await res.text()}`);
    continue;
  }
  const data = await res.json();
  let text = data.choices?.[0]?.message?.content ?? '';
  text = text.replace(/^```[a-z]*\n/, '').replace(/\n```\s*$/, '').trim() + '\n';
  const out = path.join(root, 'content-drafts/activities', `${job.slug}.md`);
  writeFileSync(out, text);
  const u = data.usage || {};
  console.log(`${job.slug}: ${text.length} chars, tokens in ${u.prompt_tokens} / out ${u.completion_tokens}, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
console.log('Drafts: content-drafts/activities/');
