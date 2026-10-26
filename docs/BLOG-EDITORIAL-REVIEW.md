# Blog drafts prepared October 26, 2026

Four original articles in American English are ready for editorial review. All remain `draft: true`. No production publication, push, or navigation change has been made.

| Article | Markdown | Printable |
| --- | --- | --- |
| Preschool adaptive skills | `src/content/blog/preschool-adaptive-skills-checklist.md` | `public/downloads/preschool-adaptive-skills-checklist.pdf` |
| How children learn | `src/content/blog/10-steps-to-identify-your-childs-learning-style.md` | `public/downloads/learning-observation-log.pdf` |
| Online friendships | `src/content/blog/10-tips-to-help-kids-navigate-online-friendships-safely.md` | `public/downloads/online-friendship-family-agreement.pdf` |
| Savings goals | `src/content/blog/5-steps-teaching-kids-savings-goals.md` | `public/downloads/savings-goal-tracker.pdf` |

Each article has a direct opening answer, a five-point Quick answer, four common questions, linked primary sources, and contextual internal links. The numbered articles contain exactly 10, 10, and 5 numbered H2 sections. Titles are at most 60 characters and descriptions are 140–155 characters.

## Editorial decisions

- The supplied brief is a reference for the deliverables, not authorization to publish, commit, or push. Draft status is retained for review.
- CDC milestones were checked against the current age-3, age-4, and age-5 pages. The table explicitly labels CDC milestones, AAP's broader 4–5 age range, and our practice suggestions separately. Missing milestones are a reason to discuss development, rather than automatically described as normal variation. The two-page PDF contains 25 specific items across seven areas, with an age/source label and three checkboxes for each item. Practice suggestions remain distinct from published milestones; the sheet is not a diagnostic or standardized assessment.
- The Education Week social-media poll was omitted because its original item and sample could not be verified. No invented poll percentage or expert quote appears.
- Learning-style preferences are distinguished from evidence for matching teaching to a supposed style. The Pashler paper is attributed to its journal's 2008 volume; the publisher also displays an online date in 2009. Newton and Salvi's 89.1% figure is qualified as a weighted survey result, with study limitations.
- The FBI “600% over two years” claim and October 2026 news reference could not be corroborated in a primary source, so the statistic is omitted. The safety article uses NCMEC and eSafety guidance instead.
- Roblox's official overview, experience-chat page, and June 2026 announcement differ on age/consent details. The article avoids promising one universal age threshold and points to current account-specific communication controls. It does not assume Roblox still uses a child-account PIN. Minecraft guidance explicitly states that Minecraft does not provide parental control features for versions earlier than 1.16.4 or for modded versions, matching its official page.
- Evidence preservation distinguishes ordinary message context from sexual images of children, which parents should not download, copy, or forward. NCMEC is the reporting route for suspected child exploitation; IC3 is described for other internet crimes and its direction of child cases to NCMEC is noted.
- The original Cambridge/Money Advice Service report was located but direct retrieval was blocked. A verified CFPB primary research report replaces it. No “habits fixed by age seven” assertion is made.
- Savings amounts, timelines, allowance examples, and parent matches are explicitly family examples, not scientific norms. Coins carry a choking-hazard reminder.
- No claims about the absence of advertising, chat, or collection of personal data in `/learn/` were added without a separate product/privacy audit.
- No invented reviewer, credentials, or medical-review claim was added. The existing author box remains in use.

## Assets and reproducibility

Images are in `public/images/blog/<slug>/`. Each article has a 1600×900 hero, an 800×450 hero variant, 2–3 inline images, and a 1000×1500 Pinterest pin. Hero WebPs are below 200 KB. Inline diagrams are exported as WebP; all editable SVG sources are stored under `scripts/blog-assets/svg/<slug>/`, outside the published assets. No blog SVG sources remain in `public/`. Pinterest headlines are 110 px (up from 46 px), with no large empty bottom section; all four were reviewed at 250 px width. Pins are promotional assets and aren't inserted into the article body.

Five narrative illustrations were generated with the built-in imagegen tool. Final prompts are recorded in `scripts/blog-assets/PROMPTS.md`. Original generated PNGs remain in the Codex generated-images directory; the project consumes its own WebP copies.

- `node scripts/blog-assets/images.mjs` rebuilds diagrams and pins from code and the existing hero WebPs, writes WebPs to `public/`, and writes SVGs only to `scripts/blog-assets/svg/`. Requires the project's `sharp` dependency.
- `python3 scripts/blog-assets/printables.py` rebuilds the four PDFs. Use `--only preschool-adaptive-skills-checklist.pdf` to update the two-page checklist alone. Requires `reportlab`. The other three PDFs remain one page each.

## Verification

- `npm run build:site` passes with all four articles hidden as drafts; `/blog/` remains noindex and excluded from sitemap.
- A separate temporary source copy with `draft: false` builds all four article pages. This checks related-activity slugs, Article/BreadcrumbList JSON-LD, printable links, image references, and Markdown rendering without publishing the working files.
- All four US Letter PDFs were rendered and visually inspected, along with image contact sheets and a browser view of the article template. After revision, both checklist pages and all four revised pins were rendered and inspected again.
- Internal article links and static assets are checked against the preview output. `/learn/` is separately built by the existing Next.js build pipeline and was not rebuilt for these content-only changes.
- The existing `vercel.json` contains both slash and non-slash 301 rules for the old `-2024` URL. A deployed HTTP redirect has not been asserted or tested: the new articles have not been deployed.

## Publication handoff

After editorial review, set the desired posts to `draft: false`, set actual publication dates if publishing later, and add Blog links to the header and footer with the first release. Run the full build and verify the deployed canonical URLs and old-URL redirects. The cross-links between draft articles require publishing those articles together or adjusting the links when releasing only one.

## Remaining optional art notes

The online-friendship hero still contains a block landscape that can resemble Minecraft. Three covers reuse a similar mother character and hand-on-cheek pose. These were explicitly left as optional observations in editorial feedback; the cover images are unchanged in this revision.
