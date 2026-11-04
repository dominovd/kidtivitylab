# Activity content batch 4

Prepared 2026-11-04. Drafts remain in `content-drafts/activities/` for editorial review. Nothing has been moved into the live activity collection.

## Text verification

- All 14 drafts parsed with the actual activity Zod schema extracted from `src/content.config.ts`.
- Job metadata preserved, including goal order and month-based age ranges.
- Each draft has 4 skills, 3 preparation notes, 3 learning details, 3 variations, 2 problems, 2 FAQs, and 5 numbered steps.
- Hooks range from 61 to 79 characters. No em dashes, image fields, or invented video sources.
- Slugs do not overlap the current collection. Hot and Cold uses continuous distance feedback rather than a treasure-hunt trail or hidden people.
- `npm run build:site` passed for the existing site (183 pages). Drafts were validated separately because the site loader intentionally excludes the draft folder. The build reported existing duplicate-ID warnings for two blog articles.
- Draft folder is gitignored; retain these local files or deliberately stage them when moving content into the live collection.

## Editorial adjustments

- Salt tray uses a thin 1/8-inch layer and smoothing on the table instead of vigorous shaking.
- Dress-up relay keeps shoes on, omits sock-changing during movement, uses manageable hems, and allows walking.
- A soaked sponge is an observation, not a promised sinking result. A lid boat is tested before adding a load.
- Board game defines finishing, turn order, and non-chaining special spaces. Tower game defines a final-roll overshoot rule.
- Button snake has adult-only assembly, attachment checks, and nearby supervision despite the job's independent involvement tag.
- Rhyme props can be replaced with large picture cards; a household tube check is not presented as a guarantee of safety.

Background checks: [ACS on density, sinking, and floating](https://www.acs.org/middleschoolchemistry/lessonplans/chapter3/lesson4.html), [CPSC on small parts](https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance/Small-Parts-for-Toys-and-Childrens-Products). These support editorial checks and are not added as developmental claims to the activity copy.

## Illustrations

Generated with the built-in ImageGen tool. Final assets: `public/images/activities/<slug>.webp`, 900 by 600 pixels, quality 80. No image or image_alt fields added to drafts, as requested in the brief.

Base prompt:

> Warm storybook illustration in soft colored pencil and watercolor, detailed but gentle, natural daylight, cozy US home or backyard, diverse kids with friendly round faces, muted greens, warm yellows and terracotta. Landscape 3:2. No text, no readable letters or numerals, no logos, no brand names, no rainbows, no screens.

Scene prompts:

- **rhyme-match-basket:** Child about 5 at a kitchen table pulling a sock out of a wicker basket; small objects paired on table: toy cat next to small hat, toy car next to jar; parent across table.
- **rhyme-or-not-hop:** Backyard child about 5 hopping on one foot toward parent calling a word; second child frozen in a silly pose.
- **syllable-clap-names:** Family couch: child about 5 clapping hands smiling, parent clapping along; subtle hand motion lines.
- **name-puzzle:** Child about 5 fitting cut cardstock pieces into a row on a table, child scissors and paper scraps nearby; colorful blocky shapes without readable letters.
- **salt-tray-writing:** Close view baking sheet containing thin white salt layer over orange paper; child's finger draws curvy line; small paintbrush at edge.
- **button-snake:** Child about 5 on couch threading colorful felt squares onto short ribbon using one securely attached large button; felt snake across lap.
- **dress-up-relay:** Living room party two kids about 6 putting on comfortably oversized shirts and floppy hats, one doing a button, other kids cheering; short hems, no scarves or neck drawstrings, shoes.
- **hopscotch-number-hop:** Traffic-free driveway chalk hopscotch grid with dot marks instead of numbers; child about 5 hopping on one foot, beanbag on square, parent watching.
- **sock-match-sort:** Bed covered with colorful socks; child about 4 holding two matching striped socks; rolled pairs in piles by size.
- **homemade-board-game:** Kitchen table large paper with hand-drawn winding path game, toy figures as playing pieces, one die; child about 6 and parent playing, child rolling die; no writing.
- **picture-memory-match:** Floor rug grid of face-down handmade cards; child about 5 flipping card with simple drawn sun, second child waiting turn.
- **sink-or-float:** Clear shallow plastic bin water on towel, apple and cork floating, metal spoon and rock resting on bottom; child about 5 holding toy car over water and thinking; adult next to bin.
- **roll-and-build-tower:** Child about 5 rolling large die on table beside tall wobbly colorful block tower; parent with shorter tower across table.
- **hot-and-cold:** Living room child about 5 searching behind cushion, older sibling gesturing warmer with hands; toy peeking under nearby blanket.

## Next editorial step

Proofread the 14 drafts, move approved files to `src/content/activities/`, add image paths and alt text, link activities in the age-5 milestone table, and rebuild. This handoff does not publish or change that table.

