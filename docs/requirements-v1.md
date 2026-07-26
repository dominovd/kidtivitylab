# Kidtivitylab.com — Product, Design & Technical Requirements

Version 1.0 — July 26, 2026
Status: Draft for review
Owner: Denis

---

## 1. Product Overview

**Kidtivitylab.com** is a website that helps parents spend more — and more interesting — time with their children. It offers a curated database of games and activities, surfaced two ways:

1. **Activity Finder** — an interactive tool: parent sets age, place, time, materials, and goal → gets matching activities with step-by-step instructions.
2. **Programmatic SEO pages** — thousands of landing pages built from the same database (age × situation × theme), targeting long-tail search demand.

**Business goal:** build an organic traffic asset in the parenting niche (US/EN market first), monetized via display ads and affiliate links, with an email list built through printable lead magnets.

**Key data points behind the strategy** (Semrush, US, Jul 2026 — see `kidtivitylab_keyword_strategy.xlsx`):
- 10,354 keywords, ~541K combined monthly searches; ~84% of rated volume sits at KD ≤ 30.
- Top keyword: "rainy day activities for kids" — 60,500/mo, KD 12.
- Age is the primary axis (peak: ages 1–5); situations (rainy day, indoor, holidays, travel) outperform generic themes.
- AI Overviews cover 61% of head-term volume → long-tail pages + interactive tool are the defensible play.

---

## 2. Target Audience

- **Primary:** parents of children aged 1–5 (highest search demand), mostly mothers, US/EN-speaking, on mobile (~70%+ expected).
- **Secondary:** parents of kids 6–10, grandparents, babysitters, preschool teachers.
- **Context of use:** "I need something NOW" — a bored child is next to them. The site must deliver a usable answer in under 30 seconds, on a phone, one-handed.

This context drives every design decision: speed, zero clutter above the fold, instant filtering, scannable instructions.

---

## 3. Scope & Phases

### Phase 1 — MVP (launch)
- Activity database: **300–400 activities**, weighted toward ages 1–5.
- Activity Finder tool (client-side, no backend).
- Programmatic pages: age hubs (1–10 years + baby months) and age × situation pages for the top clusters: rainy day, indoor, outdoor, car/travel, sensory, crafts, learning, games.
- Seasonal hubs: summer, fall, winter, spring (holiday pages prepared 2–3 months before each peak: Christmas, Easter, Halloween, Thanksgiving, Valentine's).
- Individual activity pages (one URL per activity).
- 5–10 printable PDF packs as email lead magnets.
- Core SEO infrastructure (see §8).

### Phase 2 — Growth
- Database → 800–1,000 activities; expand ages 6–10.
- Email sequences; more printables; "activity of the day" feature.
- Short video demos embedded on top pages (70% of search volume shows video SERP features).
- Display ads (Mediavine/Raptive when traffic qualifies; AdSense earlier if desired).

### Phase 3 — Product
- Optional DB backend (see §9), user accounts, favorites, personalized plans, possible premium printables.

**Out of scope for MVP:** user accounts, comments, multi-language, native app, CMS admin UI.

---

## 4. Information Architecture & URLs

```
/                                   → Home = Activity Finder + featured collections
/activities/[slug]/                 → Single activity page
/age/[age]/                         → Age hubs: /age/2-year-olds/ … /age/10-year-olds/
/age/[age]/[situation]/             → /age/3-year-olds/indoor/, /age/2-year-olds/rainy-day/
/baby/[months]/                     → /baby/8-month-old/ (babies: months, not years)
/situations/[slug]/                 → /situations/rainy-day/, /situations/road-trip/
/themes/[slug]/                     → /themes/sensory/, /themes/crafts/, /themes/stem/
/seasonal/[slug]/                   → /seasonal/christmas/, /seasonal/summer/
/printables/                        → Lead-magnet library (email-gated downloads)
/about/, /privacy/, /contact/
```

Rules:
- Only generate an age × situation page when it has **≥ 8 matching activities** (thin-content guard). Below threshold, the URL 301s or is simply not generated.
- Every programmatic page = filtered activity list + 150–300 words of unique, genuinely useful intro copy (age-specific developmental context, practical tips) — not template filler.
- Breadcrumbs on every page; each activity page links up to its age hub and situation pages (internal linking mesh).

---

## 5. Core Feature: Activity Finder

**Interaction model:** filter panel → instant results. No page reload, no "search" button; results update on every tap.

**Filters (facets):**

| Facet | Values |
|---|---|
| Age | 0–1 (months), 1, 2, 3, 4, 5, 6–7, 8–10 |
| Place | At home / Outdoors / On the road / At the table |
| Time | 5–10 min / 15–30 min / 45+ min |
| Materials | Nothing needed / Paper & pencils / Household items / Craft supplies |
| Goal | Burn energy / Calm down / Fine motor / Speech & language / Logic & STEM / Creativity |
| Parent involvement | Play together / Independent play |

**Behaviors:**
- Age is the only required facet; all others optional.
- "Surprise me" button → one random activity matching current filters (fun, shareable).
- Result cards: title, 1-line hook, time badge, materials badge, age range. Tap → activity page (or inline expand on mobile).
- Empty state: never show zero results — relax the least important filter and say so ("Nothing for exactly 5 minutes — here are 15-minute ideas").
- Filter state encoded in URL query (`?age=3&place=home&time=10`) → shareable, and the tool can be deep-linked from programmatic pages with filters pre-applied.
- Must work fully client-side against a bundled JSON index (see §9). Target: interactive in < 1s on mid-range mobile.

---

## 6. Content Model (Activity Schema)

Single source of truth. MVP: Astro Content Collections (one Markdown/JSON file per activity in the repo). Schema is designed to map 1:1 to a future Postgres table.

```yaml
id: string (slug, stable)          # "frozen-toys-rescue"
title: string                      # "Frozen Toys Ice Rescue"
hook: string (≤ 120 chars)         # one-line sell for cards
age_min: number (months)           # 24
age_max: number (months)           # 60
place: enum[]                      # [home, outdoors, road, table]
time_minutes: enum                 # 10 | 30 | 45
materials: enum                    # none | paper | household | craft
materials_list: string[]           # ["ice cube tray", "small toys", "salt"]
goals: enum[]                      # [motor, calm, energy, speech, stem, creative]
involvement: enum                  # together | independent
steps: markdown                    # numbered, imperative, ≤ 7 steps
tips: markdown (optional)          # variations, what to expect by age
safety_note: string (optional)     # choking hazards etc. — REQUIRED for ages < 3 when materials involved
skills_developed: string[]         # for SEO copy & schema.org
seasons: enum[] (optional)         # [christmas, summer, ...]
image: path                        # 1 illustration per activity (see §7)
affiliate_products: [] (optional)  # {name, url} — only when a purchase truly helps
```

**Content quality bar (non-negotiable):**
- Steps must be concrete enough to execute without thinking ("Fill the tray, drop one toy per cube, freeze 3h" — not "freeze some toys").
- Every activity for under-3s with small objects carries a safety note.
- No filler activities to pad the count — 300 excellent beats 500 mediocre. This is the moat against AI-generated competitor content.

---

## 7. Design Requirements

### 7.1 Brand direction
- **Feeling:** warm, playful, trustworthy — "a well-organized toy shelf", not a corporate parenting portal and not a noisy kids' cartoon site. The user is the *parent*, not the child.
- **Tone of voice:** friendly, direct, zero guilt-tripping ("quality time" pressure is off-brand). Short sentences. Address the parent as "you".
- Logo: wordmark "Kidtivity Lab" with a simple playful mark (e.g., building-block or beaker-with-star motif). Must work at 24px height.

### 7.2 Color & typography
- **Palette:** warm off-white background (#FAF7F2 direction), one saturated primary (warm coral/orange direction), one secondary (teal/green direction), dark warm gray for text (#2D2A26 direction — never pure black on pure white). Accent colors used sparingly for facet badges (each facet family gets a consistent hue).
- All text/background combinations meet **WCAG AA (4.5:1)**.
- **Type:** one friendly rounded sans for headings (e.g., Nunito), one highly-readable sans for body (e.g., system stack or Inter). Max 2 families, self-hosted, `font-display: swap`. Base size 16–18px, generous line height (1.6) — parents read while distracted.

### 7.3 Layout & components
- **Mobile-first**; single-column on mobile, max content width ~1100px on desktop.
- Component inventory (design these once, reuse everywhere): activity card, filter chip (tap-toggle, large touch targets ≥ 44px), badge (time/materials/age), step list, safety callout, email-capture block, breadcrumb, age-hub header, seasonal banner, footer.
- Activity page above the fold on mobile: title, hook, badges (age/time/materials), first image, "Materials" list. Steps immediately after — no life-story preamble (the anti-recipe-blog rule).
- Illustrations: one consistent style across the whole site (flat, warm, simple shapes — buildable with a repeatable AI-illustration pipeline + human curation). No stock photos of laughing families.
- Ad-readiness: reserve layout slots (fixed heights to prevent CLS) for future ad units: 1 in-content slot per screen of content, sticky sidebar slot on desktop. No ads inside the tool's filter area, ever.

### 7.4 Accessibility & UX rules
- Full keyboard operability of the Finder; filter chips are real buttons with `aria-pressed`.
- Never rely on color alone to convey facet state.
- Print stylesheet for activity pages (parents print instructions) — clean, ink-friendly.
- No layout shift from images (explicit width/height), no interstitials, no autoplaying media.

---

## 8. SEO Requirements

- **Meta patterns** per template, human-reviewed for head pages. Example age×situation title: `27 Indoor Activities for 3 Year Olds (No Prep, Parent-Tested)` — number is computed from actual DB count at build time.
- **Structured data:** `HowTo` on activity pages; `ItemList` on hub/listing pages; `BreadcrumbList` everywhere; `FAQPage` on hubs where a real FAQ block exists.
- XML sitemaps split by section; auto-regenerated at build.
- Canonicals on all pages; filter-state URLs (`?age=…`) canonicalize to their clean programmatic equivalent when one exists.
- Internal linking: every activity page → its hubs; every hub → 3–5 sibling hubs ("Also see: rainy day ideas for 3-year-olds"). Orphan pages = build error.
- Publish cadence: seasonal pages live 2–3 months before peak (Christmas pages by early October).
- OG images auto-generated per page (title + illustration) for social/Pinterest sharing; Pinterest-friendly tall image variant on activity pages (Pinterest is a top referrer in this niche).

## 9. Tech Stack & Architecture

- **Framework: Astro** (SSG). All programmatic pages statically generated at build; content in **Astro Content Collections** (Markdown + zod-validated frontmatter matching §6 schema).
- **No database at MVP** — by design. The build step compiles all activities into a single minified JSON index (~300 activities ≈ well under 200KB) consumed by the Finder.
- **Finder = one Astro island** (Preact/Svelte/vanilla — implementer's choice, but total JS budget for the page ≤ 60KB gzipped). Everything else ships zero JS.
- **DB-ready:** schema §6 maps 1:1 to Postgres/Supabase. Migration trigger points: >1,500 activities, user accounts, or favorites. Until then, files + git = free CMS with version history.
- Hosting: any static host (Cloudflare Pages / Netlify / Vercel). Custom 404 suggesting the Finder.
- Email capture: form → provider API (ConvertKit/MailerLite) via serverless function or provider-hosted form — no own backend.
- Analytics: GA4 + Search Console; event tracking on filter usage, "surprise me" clicks, printable downloads (these events guide database expansion priorities).

### Performance budget (hard requirements)
- Core Web Vitals: LCP < 2.0s (mobile, 4G), CLS < 0.05, INP < 200ms.
- Lighthouse mobile ≥ 95 on activity, hub, and home templates.
- Images: AVIF/WebP with fallbacks, lazy-loaded below fold, explicit dimensions.

---

## 10. Monetization Plan (design/tech implications only)

1. **Launch → traffic building:** no ads. Email capture + affiliate links inside `materials_list` where honest ("craft supplies" → Amazon list). Affiliate disclosure block component required.
2. **~50K sessions/mo:** apply to Raptive/Mediavine; ad slots already reserved in layout (§7.3) so adding ads causes zero redesign and zero CLS.
3. **Later:** premium printable packs / seasonal activity calendars (Gumroad-style checkout, no own backend needed).

---

## 11. Acceptance Criteria (MVP done =)

- [ ] 300+ activities in repo, all passing schema validation; every under-3 activity with materials has a safety note.
- [ ] Finder returns correct results for all facet combinations; empty-state relaxation works; state is URL-encoded.
- [ ] All programmatic pages ≥ 8 activities; zero orphan pages; sitemaps valid in Search Console.
- [ ] CWV budget met on the three key templates (mobile, throttled).
- [ ] Structured data passes Rich Results Test on all templates.
- [ ] Email capture works end-to-end; at least 5 printable packs live.
- [ ] Seasonal pages for the next two upcoming seasons are live.
- [ ] Design reviewed on a real phone, one-handed, with a screaming toddler in the room (the ultimate UX test).
