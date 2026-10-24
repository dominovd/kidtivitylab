# Kidtivity Lab

Games & activities for parents to spend quality time with their kids.
Interactive Activity Finder + programmatic SEO pages. US/EN market first.
Live at [kidtivitylab.com](https://kidtivitylab.com) (soon).

## Stack

- [Astro 5](https://astro.build) — static site generation, zero JS by default
- Content Collections (Markdown + zod schema) — no database; schema maps 1:1 to Postgres/Supabase for a later migration
- Activity Finder — one vanilla-JS island (`src/scripts/finder.js`) fed by a build-time JSON index (`/activities.json`)
- `@astrojs/sitemap`, JSON-LD (HowTo / ItemList / BreadcrumbList)

## Develop

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static build into dist/
npm run preview   # serve the build locally
```

## Deploy (Vercel)

Push to GitHub → import the repo in Vercel → framework preset "Astro" is detected automatically. No env vars needed. Set the production domain to kidtivitylab.com.

`npm run build` builds the site and then the Kidtivity Learn game (`learn-app/`, Next.js static export) into `dist/learn` (see `scripts/build-learn.mjs`). One Vercel project serves both.

## Ads: never on /learn/

When ads are added to the site, **`/learn/` (Kidtivity Learn) must stay ad-free**:

- The game is played by kids themselves (ages 5–8), so it is child-directed under COPPA: no ad or tracking scripts there at all, including "auto ads" and analytics that set identifiers.
- Our own copy promises it: `/learn/how-it-works/` and the start screen say "no ads".
- Add ad code only to the Astro layout (`src/layouts/Base.astro`), never to `learn-app/`. Ad scripts in the Astro layout don't reach `/learn/`, because the game has its own layout.
- In the ad network's dashboard (e.g. AdSense site settings / auto ads), exclude the `/learn/` path and keep it excluded.
- The parent-facing site still needs a child-audience review before ads: no personalized ads aimed at kids, follow the network's family/children policy.

## Adding an activity

Create `src/content/activities/<slug>.md`. Frontmatter is validated by the schema in `src/content.config.ts` (ages in **months**; activities for under-3s that use materials **must** have a `safety_note` — the build fails otherwise). The Markdown body is the numbered step list.

Programmatic pages (age hubs, age × situation, situations, themes) generate automatically from the database. A page only appears once it clears `MIN_ACTIVITIES_PER_PAGE` (`src/lib/activities.ts`) — currently **3** while the database is small; **raise to 8 before launch**.

## Images

Activity images live in `public/images/activities/` and are referenced from frontmatter (`image: /images/activities/<slug>.webp`). Cards and pages render a placeholder until an image is added. Keep one consistent illustration style site-wide (see `docs/requirements-v1.md` §7.3).

## Before launch (TODO)

- [ ] Grow database to 300+ activities (weighted to ages 1–5), raise `MIN_ACTIVITIES_PER_PAGE` to 8
- [ ] Self-host Nunito via `@fontsource/nunito` (currently Google Fonts CDN)
- [ ] Point the email form at ConvertKit/MailerLite
- [ ] Real privacy policy; GA4 + Search Console
- [ ] OG image generation per page; seasonal pages 2–3 months before peaks
- [ ] Ads (if any): exclude `/learn/` everywhere — see "Ads: never on /learn/" above

## Project docs

- `docs/requirements-v1.md` — full product, design & technical requirements
- `research/` — keyword research (Semrush, US, Jul 2026): clustered XLSX + findings
- `design/` — v1 mockups (desktop + mobile)

Claude project on claude.ai: "kidtivitylab.com" (concept, findings, requirements mirrored there).
