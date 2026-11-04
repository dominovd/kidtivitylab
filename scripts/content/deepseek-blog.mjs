/**
 * Drafts blog article bodies with the DeepSeek API from the briefs in docs/briefs/.
 * Output: content-drafts/blog/<slug>.md (gitignored), the full file with frontmatter + body.
 * Claude edits and fact-checks each draft before it replaces src/content/blog/<slug>.md.
 *
 * Usage (repo root):
 *   node --env-file=.env scripts/content/deepseek-blog.mjs                 # all 6 backlog posts
 *   node --env-file=.env scripts/content/deepseek-blog.mjs --only 10-creative-movement-activities-for-kids
 * Needs DEEPSEEK_API_KEY in .env (gitignored).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const key = process.env.DEEPSEEK_API_KEY;
if (!key) {
  console.error('DEEPSEEK_API_KEY is missing. Add it to .env in the repo root.');
  process.exit(1);
}
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const arg = (n) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null);
const only = arg('--only');
const read = (p) => readFileSync(path.join(root, p), 'utf8');

const SLUGS = [
  '25-plastic-bottle-craft-ideas-for-kids',
  'easy-experiments-with-water-for-busy-parents',
  'family-bonding-through-easy-experiments-with-baking-soda',
  'outdoor-science-activities-for-preschoolers-nature-exploration',
  '10-creative-movement-activities-for-kids',
  'innovative-fun-learning-games-for-4-year-olds',
].filter((s) => !only || s === only);

// Existing activity pages the article may link to.
const actDir = path.join(root, 'src/content/activities');
const activities = readdirSync(actDir)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  .map((f) => {
    const t = readFileSync(path.join(actDir, f), 'utf8');
    const title = (t.match(/^title:\s*"?(.+?)"?\s*$/m) || [])[1] || '';
    const a = (t.match(/^age_min:\s*(\d+)/m) || [])[1];
    const b = (t.match(/^age_max:\s*(\d+)/m) || [])[1];
    return { slug: f.replace(/\.md$/, ''), line: `${f.replace(/\.md$/, '')}: ${title} (ages ${Math.floor(a / 12)}-${Math.floor(b / 12)})` };
  });
const activitySlugs = new Set(activities.map((a) => a.slug));

const rules = read('docs/briefs/README.md');
const handoff = read('docs/briefs/blog-assets-handoff.md');
const corrections = (handoff.split('## Поправки для текста статей')[1] || '').split('\n## ')[0];
const example = read('src/content/blog/balancing-screen-time-and-social-play-for-kids.md');

const BANNED = ['delve', 'navigate the complexities', "in today's digital age", 'it\'s important to note', 'unlock', 'embark', 'tapestry', 'crucial', 'game-changer', 'empower', 'holistic', 'journey', 'in conclusion', 'reviewed by'];

const system = `You write blog articles for kidtivitylab.com, a site of practical play ideas for parents of kids 0 to 10 in the US.
The brief and the shared rules are in Russian. The article is in American English.

Hard rules:
- Never use the em dash character (—) or the en dash as punctuation. Use commas, periods, colons or parentheses. For ranges write "ages 3 to 5" or "3-5".
- Never use: ${BANNED.join(', ')}.
- No invented statistics, studies, experts, quotes or reviewers. The only facts with numbers or health/development claims are the ones in the brief's facts section, each with an inline Markdown link to the source URL given in the brief.
- Follow the brief's structure, H2 sections, list items, ages and corrections exactly. The number of list items must equal the number in the H1.
- Parent-to-parent voice: "you", contractions, paragraphs of 1 to 3 sentences, 2 or 3 short real-life scenes with the child's age, exact phrases a parent can say in quotes.
- Each list item is an H3 like "### 1. Sink or Float", then one line in this exact format: "**Ages:** 2-4 · **Time:** 10 min · **You need:** a bowl of water, a spoon, an apple", then 2 to 4 sentences on how, then a "why it works" or safety line when the brief asks for it.
- When a list item matches an existing site activity, link its name to /activities/<slug>/ and keep it to 2 or 3 sentences. Only use slugs from the list provided. Never invent /activities/ links.
- Right after the first 2 or 3 sentences, add a "> **Quick answer**" blockquote with 5 bullet points (same format as the example).
- Insert the in-article images given below where they fit, as ![alt](path), using the exact path and alt. Do not insert the hero, the -800 version or the pin.
- Mention the free printable (the PDF in the frontmatter) once in the relevant section, as plain text ("Grab the free ... card at the top of this page"), no link.
- End with "## Common questions" with the 4 questions from the brief as H3, each answered in 2 to 4 sentences.
- No "In conclusion" section, no sign-off, no H1 (the page renders the H1 from frontmatter).
- Length as in the brief.

Output format, nothing else (no code fences, no commentary):
LEDE: <one or two sentences, max 200 characters, that sit under the H1>
---BODY---
<the Markdown body>

Style example of a published post on the site (frontmatter + body):
${example}`;

mkdirSync(path.join(root, 'content-drafts/blog'), { recursive: true });
for (const slug of SLUGS) {
  const brief = read(`docs/briefs/${slug}.md`);
  const draft = read(`src/content/blog/${slug}.md`);
  const fm = draft.split(/^---\s*$/m)[1];
  const assets = (handoff.split(`## ${slug}\n`)[1] || '').split('\n## ')[0];
  const user = `Write the body of src/content/blog/${slug}.md.

=== SHARED RULES (docs/briefs/README.md) ===
${rules}

=== BRIEF ===
${brief}

=== CORRECTIONS FROM THE ASSET REVIEW (apply the ones about this article) ===
${corrections}

=== CURRENT FRONTMATTER (title, h1, description, printable, related_activities, sources are fixed) ===
${fm}

=== IMAGES AVAILABLE (folder /images/blog/${slug}/) ===
${assets}

=== EXISTING SITE ACTIVITIES (slug: title (ages)) ===
${activities.map((a) => a.line).join('\n')}`;

  const t0 = Date.now();
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, temperature: 0.6, max_tokens: 8000, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  });
  if (!res.ok) {
    console.error(`${slug}: HTTP ${res.status} ${await res.text()}`);
    continue;
  }
  const data = await res.json();
  let text = (data.choices?.[0]?.message?.content ?? '').replace(/^```[a-z]*\n/, '').replace(/\n```\s*$/, '').trim();
  const lede = ((text.match(/^LEDE:\s*(.+)$/m) || [])[1] || 'TODO').trim();
  const body = (text.split('---BODY---')[1] || text).trim();
  const newFm = fm
    .replace(/^# DRAFT:.*\n/m, '')
    .replace(/^lede:.*$/m, `lede: ${JSON.stringify(lede)}`);
  const out = path.join(root, 'content-drafts/blog', `${slug}.md`);
  writeFileSync(out, `---${newFm}---\n\n${body}\n`);

  // Quick checks for the editor.
  const warn = [];
  const words = body.split(/\s+/).length;
  if (/[—–]/.test(body + lede)) warn.push(`dash x${(body + lede).match(/[—–]/g).length}`);
  for (const w of BANNED) if ((body + lede).toLowerCase().includes(w)) warn.push(`banned "${w}"`);
  for (const m of body.matchAll(/\/activities\/([a-z0-9-]+)\//g)) if (!activitySlugs.has(m[1])) warn.push(`bad link ${m[1]}`);
  for (const m of body.matchAll(/\]\((\/images\/blog\/[^)]+)\)/g)) if (!existsSync(path.join(root, 'public', m[1]))) warn.push(`missing image ${m[1]}`);
  const h3 = (body.match(/^### \d+\./gm) || []).length;
  const u = data.usage || {};
  console.log(`${slug}: ${words} words, ${h3} numbered items, tokens in ${u.prompt_tokens} / out ${u.completion_tokens}, ${((Date.now() - t0) / 1000).toFixed(1)}s${warn.length ? '\n  WARN: ' + warn.join('; ') : ''}`);
}
console.log('Drafts: content-drafts/blog/');
