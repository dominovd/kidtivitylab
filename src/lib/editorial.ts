export interface ListingEditorial {
  intro?: string;
  quickPicks?: { label: string; activityId: string; reason: string }[];
  quickPicksHeading?: string;
  quickPicksIntro?: string;
  allActivitiesHeading?: string;
  guideHeading?: string;
  guideIntro?: string;
  guideKicker?: string;
  guideTips?: { title: string; text: string }[];
  faqs?: { question: string; answer: string }[];
  faqHeading?: string;
  faqKicker?: string;
}

export const SITUATION_EDITORIAL: Record<string, ListingEditorial> = {
  indoor: {
    quickPicksHeading: 'Match the activity to the room',
    quickPicksIntro: 'Start with the space, noise level, and attention span you actually have today.',
    quickPicks: [
      { label: 'For a clear patch of floor', activityId: 'masking-tape-shape-jump', reason: 'A few tape outlines create a short, energetic game without sending children running through the whole home.' },
      { label: 'For the kitchen table', activityId: 'muffin-tin-color-sort', reason: 'A contained sorting setup gives small hands a focused job and takes only minutes to prepare.' },
      { label: 'For open-ended pretend play', activityId: 'painters-tape-road', reason: 'The route can grow around furniture and keep changing as new destinations enter the story.' },
    ],
    guideKicker: 'Use the home you have',
    guideHeading: 'Choosing indoor play without creating more work',
    guideIntro: 'The best indoor activity fits the current room and ends before everyone is tired of it.',
    guideTips: [
      { title: 'Protect one clear zone', text: 'A single rug or table is easier to supervise and reset than an activity spread through every room.' },
      { title: 'Alternate noise levels', text: 'Follow marching or jumping with sorting, stories, or a simple observation game.' },
      { title: 'Keep setup visible', text: 'Put out only the first few materials; add more when the child shows what they want to do.' },
    ],
    faqHeading: 'Indoor play questions',
    faqs: [
      { question: 'What can children do indoors without screens?', answer: 'Try movement cues, pretend roads, sorting, forts, storytelling, music, or simple cause-and-effect play. Choose one clear invitation rather than presenting many options at once.' },
      { question: 'How can children burn energy in a small space?', answer: 'Use controlled movements such as animal walks, shape jumps, balance poses, or underarm sock tossing after clearing a safe area.' },
    ],
  },
  outdoor: {
    quickPicksHeading: 'Three ways to use the fresh air',
    quickPicksIntro: 'Explore, create, or move—the setting does most of the work.',
    quickPicks: [
      { label: 'For curious explorers', activityId: 'nature-scavenger-hunt', reason: 'Open-ended clues help children notice texture, shape, sound, and color in a familiar place.' },
      { label: 'For a hot day', activityId: 'water-painting', reason: 'Plain water creates instant marks and an automatically renewing canvas with almost no cleanup.' },
      { label: 'For big movement', activityId: 'sidewalk-chalk-obstacle-course', reason: 'Children can follow, repeat, and then redesign a route built to fit the available pavement.' },
    ],
    guideKicker: 'Before heading out',
    guideHeading: 'Let the setting choose the activity',
    guideIntro: 'Sun, surface, boundaries, and available shade matter more outdoors than an elaborate supply list.',
    guideTips: [
      { title: 'Name the boundary first', text: 'Show exactly where children may move before introducing the exciting part of the game.' },
      { title: 'Check the ground', text: 'Look for traffic, water, hot surfaces, loose gravel, animal waste, and tripping hazards.' },
      { title: 'Bring the basic three', text: 'Water to drink, sun protection, and a small towel solve more problems than extra craft supplies.' },
    ],
    faqHeading: 'Outdoor activity questions',
    faqs: [
      { question: 'What are easy outdoor activities with no play equipment?', answer: 'Animal walks, sensory observation, cloud stories, color hunts, and collecting permitted fallen natural objects need little or nothing.' },
      { question: 'How long should outdoor play last?', answer: 'There is no required duration. Consider weather, shade, the child’s comfort, and whether interest is still genuine rather than trying to reach a fixed time.' },
    ],
  },
  'road-trip': {
    intro: 'Travel games that keep eyes up and conversation moving. These ideas use passing scenery, words, and imagination—nothing that can roll under a seat.',
    allActivitiesHeading: 'Games for the miles between stops',
    guideKicker: 'A smoother journey',
    guideHeading: 'Use travel games in short rounds',
    guideIntro: 'A game does not need to occupy the whole drive. Save a few distinct ideas for the moments when patience starts to thin.',
    guideTips: [
      { title: 'Passengers play; drivers drive', text: 'The driver should never search signs, check answers, or manage materials.' },
      { title: 'Finish while it is still fun', text: 'Pause a successful game and return to it later instead of stretching it until children lose interest.' },
      { title: 'Make mixed ages a team', text: 'Let early readers spot shapes or colors while older children handle letters and longer clues.' },
    ],
    faqHeading: 'Screen-free travel game FAQ',
    faqs: [
      { question: 'What road-trip games need no supplies?', answer: 'I Spy, Story Chain, alphabet spotting, category naming, and collaborative “what happens next?” stories can all begin immediately.' },
      { question: 'What if a child gets carsick?', answer: 'Avoid books and close visual tasks. Choose conversation, music, storytelling, or looking toward distant scenery, and follow medical advice for persistent symptoms.' },
    ],
  },
  'sick-day': {
    quickPicksHeading: 'Choose by how much energy is available',
    quickPicksIntro: 'Comfort comes first; an activity is optional and can stop after one minute.',
    quickPicks: [
      { label: 'For tired hands', activityId: 'pom-pom-whisk-rescue', reason: 'The contained task can sit on a tray or lap and offers a small, visible goal.' },
      { label: 'For company without movement', activityId: 'story-chain', reason: 'A child can contribute one word, choose a character, or simply listen.' },
      { label: 'For a cozy reset', activityId: 'blanket-fort-reading-den', reason: 'A simple couch den makes rest feel intentional without requiring active play.' },
    ],
    guideKicker: 'Recovery leads',
    guideHeading: 'Keep sick-day play genuinely low pressure',
    guideIntro: 'The goal is not enrichment or productivity. Offer comfort, a little novelty, and an easy way to say no.',
    guideTips: [
      { title: 'Shrink the setup', text: 'Use a tray, couch corner, or bedside basket so the child does not need to relocate.' },
      { title: 'Avoid shared sensory materials', text: 'Choose washable personal items and clean high-touch tools before another child uses them.' },
      { title: 'Watch the child, not the plan', text: 'Stop if fatigue, pain, breathing, fever, or mood worsens and seek appropriate medical care when needed.' },
    ],
    faqHeading: 'Gentle sick-day activity questions',
    faqs: [
      { question: 'What can a sick child do besides watch television?', answer: 'Audiobooks, simple stories, sticker-free sorting, a calm sensory bottle, looking through photos, and quiet conversation can offer variety with little physical demand.' },
      { question: 'Should I encourage play when my child is ill?', answer: 'Offer rather than insist. Rest, fluids, comfort, and medical guidance take priority; quiet play is useful only when the child wants it.' },
    ],
  },
  'birthday-party': {
    quickPicksHeading: 'Pick by the moment in the party',
    quickPicksIntro: 'Every party has three phases: arrivals, the energy peak, and the wind-down before cake. Plan one game for each.',
    quickPicks: [
      { label: 'While guests arrive', activityId: 'picture-clue-treasure-hunt', reason: 'Early arrivals join the hunt one by one — nobody waits awkwardly for the party to start.' },
      { label: 'For the energy peak', activityId: 'freeze-dance', reason: 'Everyone plays at once, nobody is eliminated for long, and the adult controls the volume with the pause button.' },
      { label: 'To calm the room before cake', activityId: 'sleeping-lions', reason: 'The whole group lies still on purpose — the only party game where quiet is the goal.' },
    ],
    guideKicker: 'Party survival',
    guideHeading: 'Running games for a room full of excited kids',
    guideIntro: 'Party games fail for predictable reasons: rules explained too long, eliminated kids with nothing to do, and prizes that matter more than playing.',
    guideTips: [
      { title: 'Demonstrate, don’t explain', text: 'Play one fast example round yourself. Thirty seconds of showing beats three minutes of telling a crowd of five-year-olds.' },
      { title: 'Avoid true elimination', text: 'Kids who are "out" should re-enter within a round — collecting points, judging, or doing a silly task — or the game ends with most guests bored.' },
      { title: 'Plan more games than you need', text: 'Have five ready, expect to use three. Cut a game the moment energy dips instead of pushing it to the planned end.' },
    ],
    faqHeading: 'Birthday party game questions',
    faqs: [
      { question: 'How many games do I need for a 2-hour birthday party?', answer: 'Three to four organized games of 10–15 minutes each is usually enough, spaced between free play, food, and cake. Keep one or two backups ready in case a game ends early.' },
      { question: 'What party games work for mixed ages?', answer: 'Choose games where each child performs at their own level rather than competing head-to-head: freeze dance, treasure hunts with picture clues, cooperative balloon games, and Sleeping Lions all scale across ages.' },
      { question: 'Do party games need prizes?', answer: 'No — and skipping individual prizes avoids most party tears. If you want rewards, give the same small favor to everyone at the end, tied to the whole set of games rather than winning one.' },
    ],
  },
  'quiet-time': {
    quickPicksHeading: 'Different kinds of quiet',
    quickPicksIntro: 'Quiet time may mean focused hands, a soothing visual, or a shared story—not complete silence.',
    quickPicks: [
      { label: 'For focused fingers', activityId: 'muffin-tin-color-sort', reason: 'Repeated sorting creates a predictable tabletop rhythm for younger children.' },
      { label: 'For watching and breathing', activityId: 'calm-down-sensory-bottle', reason: 'The slow fall of glitter gives eyes one uncomplicated place to rest.' },
      { label: 'For connection', activityId: 'story-chain', reason: 'Taking one sentence at a time keeps bodies still while imaginations remain active.' },
    ],
    guideKicker: 'Lower the volume gradually',
    guideHeading: 'Build a transition instead of demanding calm',
    guideIntro: 'Children often settle more easily when the environment changes first and expectations stay concrete.',
    guideTips: [
      { title: 'Reduce choices', text: 'Present one or two calm invitations rather than a shelf full of possibilities.' },
      { title: 'Signal the change', text: 'Dim one light, move to a smaller space, or use the same short song before quiet time.' },
      { title: 'Allow quiet movement', text: 'Rocking, squeezing a cushion, or working with the hands may help a child regulate better than forced stillness.' },
    ],
    faqHeading: 'Quiet-time questions',
    faqs: [
      { question: 'How long should quiet time be?', answer: 'Start with a period the child can succeed at—even five or ten minutes. Extend it gradually only if the routine remains comfortable.' },
      { question: 'What if my child will not stay in one place?', answer: 'Define a safe area rather than one seat and offer low-energy movement such as carrying books, arranging cushions, or walking a taped line slowly.' },
    ],
  },
};

export const AGE_EDITORIAL: Record<string, ListingEditorial> = {
  '1-year-olds': {
    intro: 'One-year-olds learn through repeating simple actions: drop, pull, carry, bang, fill, and empty. These activities keep the goal obvious and the adult close.',
    guideKicker: 'At this stage',
    guideHeading: 'What makes an activity work for a one-year-old',
    guideTips: [
      { title: 'Make safety visible', text: 'Assume materials may be mouthed. Use large pieces, shallow water, stable containers, and hands-on supervision.' },
      { title: 'Expect a short encounter', text: 'Two interested minutes followed by a return later can be more realistic than one long session.' },
      { title: 'Let repetition be the activity', text: 'Emptying and refilling the same container is meaningful practice, not a failure to progress.' },
    ],
    faqHeading: 'Activities for one-year-olds: common questions',
    faqs: [
      { question: 'How much adult help does a one-year-old need?', answer: 'Usually close, active supervision. Prepare the environment, model one action, and remain near enough to intervene immediately.' },
      { question: 'Why does my toddler only dump everything out?', answer: 'Dumping explores gravity, sound, quantity, and control. Offer a clear container and make putting pieces back a separate invitation.' },
    ],
  },
  '2-year-olds': {
    intro: 'Two-year-olds want independence but still need simple boundaries. Look for activities with one clear action, room to repeat it, and an easy version of “I do it.”',
    guideKicker: 'Toddler logic',
    guideHeading: 'Plan for movement, imitation, and strong opinions',
    guideTips: [
      { title: 'Give one direction at a time', text: 'Show the first action instead of explaining the whole game before it begins.' },
      { title: 'Offer controlled choices', text: '“Blue or yellow?” is easier to act on than “What do you want to do?”' },
      { title: 'End with participation', text: 'Carry one cushion, peel one tape strip, or drop pieces into a box so cleanup feels like the last turn.' },
    ],
    faqHeading: 'Playing with a two-year-old',
    faqs: [
      { question: 'Why does my two-year-old change the rules?', answer: 'Toddlers are exploring materials before following shared plans. Describe what they are doing and join the new version when it is safe.' },
      { question: 'What activities hold a toddler’s attention?', answer: 'Immediate cause and effect, water, carrying, posting, pretend imitation, and big movement tend to work better than tasks with delayed results.' },
    ],
  },
  '3-year-olds': {
    intro: 'Three-year-olds can hold a short sequence, enter pretend worlds, and practise rules—especially when the game still leaves room for their own idea.',
    guideKicker: 'Preschool momentum',
    guideHeading: 'Use a clear start and an open middle',
    guideTips: [
      { title: 'Model the first round', text: 'Playing once together communicates more than a long explanation.' },
      { title: 'Build in a job', text: 'Caller, collector, builder, and helper roles give a three-year-old meaningful control.' },
      { title: 'Keep rules flexible', text: 'Preserve safety boundaries, but allow the child to rename, reorder, or extend the game.' },
    ],
    faqHeading: 'Activity questions for age three',
    faqs: [
      { question: 'How many steps can a three-year-old follow?', answer: 'Many can manage two related steps with a visual cue or demonstration. Reduce the sequence when the child is tired or excited.' },
      { question: 'Should activities teach letters and numbers?', answer: 'They can include them, but conversation, movement, pretend play, sorting, and problem-solving are equally valuable foundations.' },
    ],
  },
  '4-year-olds': {
    intro: 'At four, children often enjoy richer pretend play, small challenges, and being trusted with a real role. The strongest ideas let them plan as well as participate.',
    guideKicker: 'Growing independence',
    guideHeading: 'Move from following the game to shaping it',
    guideTips: [
      { title: 'Invite a prediction', text: 'Ask what might happen before adding water, moving the light, or changing the route.' },
      { title: 'Hand over one decision', text: 'Let the child choose the next obstacle, character, clue, or destination.' },
      { title: 'Talk about strategy', text: '“What could we try differently?” builds more flexible thinking than immediately supplying the answer.' },
    ],
    faqHeading: 'Activities for four-year-olds',
    faqs: [
      { question: 'How can I encourage independent play at four?', answer: 'Begin together, define where materials stay, and step back while remaining available. Open-ended worlds and familiar sorting tasks are easier to continue alone.' },
      { question: 'What if losing ruins every game?', answer: 'Use cooperative goals, personal bests, or games without winners while the child practises handling small disappointments.' },
    ],
  },
  '5-year-olds': {
    intro: 'Five-year-olds can remember more rules, explain their choices, and stay with a shared project longer. They also love changing a game once they understand it.',
    guideKicker: 'Ready for another layer',
    guideHeading: 'Add challenge without turning play into a lesson',
    guideTips: [
      { title: 'Use meaningful counting', text: 'Count throws, rescued toys, steps, or finds instead of adding disconnected worksheets.' },
      { title: 'Ask for the child’s rule', text: 'After one normal round, invite a new constraint that everyone must follow.' },
      { title: 'Leave room for competence', text: 'Give enough time to solve a manageable problem before offering help.' },
    ],
    faqHeading: 'Choosing activities at age five',
    faqs: [
      { question: 'What makes an activity challenging enough?', answer: 'Look for one stretch—longer focus, a new rule, finer control, or more planning—while keeping the materials and basic goal familiar.' },
      { question: 'How can play support school readiness?', answer: 'Turn-taking, listening, hand strength, storytelling, classification, and coping with mistakes all support classroom participation without recreating school at home.' },
    ],
  },
  '6-7-year-olds': {
    intro: 'Six- and seven-year-olds are ready to design, measure, negotiate rules, and improve an idea across several attempts—not just complete it once.',
    guideKicker: 'More ownership',
    guideHeading: 'Give school-age children a problem worth solving',
    guideTips: [
      { title: 'Specify the goal, not the method', text: 'Ask for a stable fort or a five-part course and let the child decide how to achieve it.' },
      { title: 'Make fairness discussable', text: 'Let players agree distances, turns, scoring, and exceptions before competitive play.' },
      { title: 'Record improvement', text: 'A sketch, time, count, or photo can make revision visible without turning it into grading.' },
    ],
    faqHeading: 'Activities for ages six and seven',
    faqs: [
      { question: 'How do I make a simple activity feel less babyish?', answer: 'Add design responsibility, a constraint, a mystery, measurement, or the chance to teach the game to someone else.' },
      { question: 'Should I correct the final result?', answer: 'Ask the child whether it works for their goal. Feedback tied to function—stability, clarity, fairness—is more useful than making it look adult-made.' },
    ],
  },
  '8-10-year-olds': {
    intro: 'Older children need genuine ownership. These ideas work best as design briefs, investigations, performances, or family challenges they can modify and lead.',
    guideKicker: 'Respect the age',
    guideHeading: 'Offer autonomy, not just a harder instruction',
    guideTips: [
      { title: 'Let them set constraints', text: 'Budget, materials, time, audience, and scoring are useful choices that make a familiar idea their project.' },
      { title: 'Connect to a real purpose', text: 'Create a course for a sibling, a show for the family, or a hunt for a visitor.' },
      { title: 'Do not over-direct', text: 'Agree on safety and available resources, then allow planning time and imperfect first attempts.' },
    ],
    faqHeading: 'Keeping ages eight to ten engaged',
    faqs: [
      { question: 'Why do older children reject “kids’ activities”?', answer: 'They may be protecting a growing sense of competence. Present the same materials as a challenge, production, experiment, or chance to lead.' },
      { question: 'How involved should an adult be?', answer: 'Be a resource, participant, or audience depending on the child’s request. Avoid taking over design decisions simply to speed things up.' },
    ],
  },
};

export const THEME_EDITORIAL: Record<string, ListingEditorial> = {
  sensory: {
    intro: 'Sensory play invites children to notice pressure, texture, movement, temperature, and resistance while their hands solve a concrete problem.',
    guideKicker: 'More than a texture bin',
    guideHeading: 'Choose sensory play by the child, not the trend',
    guideTips: [
      { title: 'Start with familiar sensations', text: 'A brush, water, a sealed bottle, or large soft pieces may be more welcoming than a crowded mixed-material bin.' },
      { title: 'Never force touch', text: 'Watching, using a tool, or declining are valid ways to participate.' },
      { title: 'Plan containment', text: 'A tray, towel, shallow amount, and known cleanup route help adults stay relaxed enough to let children explore.' },
    ],
    faqHeading: 'Sensory play questions',
    faqs: [
      { question: 'Does every child enjoy messy sensory play?', answer: 'No. Sensory preferences differ. Offer tools, dry alternatives, predictable materials, and an easy way to stop.' },
      { question: 'What is a low-mess sensory activity?', answer: 'A sealed calm-down bottle, whisk rescue with large pieces, water painting outdoors, or moving toy cars along tape provides sensory feedback with limited cleanup.' },
    ],
  },
  crafts: {
    intro: 'Creative play does not need a perfect object at the end. These ideas prioritize making choices, testing materials, performing, and changing direction.',
    guideKicker: 'Process over product',
    guideHeading: 'Protect the child’s idea from the example',
    guideTips: [
      { title: 'Show materials, not a model', text: 'A finished adult sample can turn exploration into copying before the child has formed an idea.' },
      { title: 'Comment on decisions', text: 'Notice pressure, color, sound, story, and persistence instead of judging whether the result is pretty.' },
      { title: 'Use limits creatively', text: 'A small selection of tools often supports deeper experimentation than a table covered with everything.' },
    ],
    faqHeading: 'Creative activity FAQ',
    faqs: [
      { question: 'What if my child asks me to do it for them?', answer: 'Help with the part beyond their motor ability, then return the meaningful decisions—color, placement, character, sound, or next step—to the child.' },
      { question: 'Do crafts need a finished product?', answer: 'No. Building a temporary fort, creating shadows, making rhythms, and painting with water are valid creative experiences even when nothing is kept.' },
    ],
  },
  learning: {
    intro: 'Learning through play happens when children have something real to notice, compare, explain, test, or remember—not when a playful surface hides a worksheet.',
    guideKicker: 'Keep the thinking visible',
    guideHeading: 'Use questions that open the activity',
    guideTips: [
      { title: 'Ask before telling', text: '“What do you notice?” and “What might happen?” leave room for observation and prediction.' },
      { title: 'Wait through the attempt', text: 'A pause gives children time to retrieve a word, revise a plan, or discover that the first idea did not work.' },
      { title: 'Name the useful detail', text: 'Connect words to what is happening now: rough bark, three sides, faster melting, or a letter on a sign.' },
    ],
    faqHeading: 'Play-based learning questions',
    faqs: [
      { question: 'How do I know if my child is learning during play?', answer: 'Look for comparing, repeating with a change, explaining, predicting, remembering a rule, or using a new word—not just a correct final answer.' },
      { question: 'Should I quiz children while they play?', answer: 'Occasional genuine questions can extend thinking, but constant testing may interrupt concentration. Describe and wonder alongside the child instead.' },
    ],
  },
  'calm-down': {
    intro: 'Calming activities give a wound-up child something concrete to do with their attention: watch, breathe, sort, squeeze, or listen. They work best offered as an invitation, not a correction.',
    guideKicker: 'Regulation, not punishment',
    guideHeading: 'Helping a child actually settle',
    guideIntro: 'A calm-down activity is not a time-out. It works when the child feels the adult is on their side and the activity itself is genuinely interesting.',
    guideTips: [
      { title: 'Catch the ramp, not the peak', text: 'These activities help most in the wind-up phase or after the storm has passed. Mid-meltdown, presence and safety come first; save the activity for a few minutes later.' },
      { title: 'Lower your own volume first', text: 'Children borrow regulation from adults. A slower voice and slower movements do half the work before the activity starts.' },
      { title: 'Keep a calm kit ready', text: 'A sensory bottle, a favorite book, and one quiet sorting task in a known spot beat improvising while a child is already upset.' },
    ],
    faqHeading: 'Calm-down activity questions',
    faqs: [
      { question: 'What activities help a child calm down?', answer: 'Slow visual tasks (a glitter bottle, watching clouds), rhythmic hands-on work (sorting, squeezing dough), heavy-work movement (carrying cushions, wall pushes), and shared low-voice activities like stories all give the nervous system something steady to settle around.' },
      { question: 'Why won’t my child use calm-down activities during a tantrum?', answer: 'During a full meltdown the thinking brain is mostly offline — no activity will land. Stay close, keep everyone safe, and offer the activity as the storm passes, when the child can accept input again.' },
    ],
  },
  'active-games': {
    intro: 'Active games give children a safe job for their energy: travel a route, aim at a target, copy a movement, or complete a sequence.',
    guideKicker: 'Movement with boundaries',
    guideHeading: 'Make active play safer and easier to stop',
    guideTips: [
      { title: 'Clear before calling children over', text: 'Remove hard edges, loose rugs, breakables, and unrelated toys before excitement rises.' },
      { title: 'Choose control over speed', text: 'Balance, aiming, crawling, and stop-start cues build more varied skills than running alone.' },
      { title: 'Announce the final round', text: 'A visible ending and a slower last movement make transition easier than an abrupt stop.' },
    ],
    faqHeading: 'Active play questions',
    faqs: [
      { question: 'How can children burn energy indoors safely?', answer: 'Use a defined clear zone for animal movements, tape shapes, balance challenges, dancing cues, or soft underarm target throws.' },
      { question: 'Does active play help children calm down?', answer: 'Often, but not always immediately. Follow vigorous play with water, a snack, slower movement, or a quiet invitation and observe what works for the individual child.' },
    ],
  },
};
