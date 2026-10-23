import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Kidtivity Learn Works: Adaptive Practice Games for Kids 5–8",
  description:
    "What's inside Kidtivity Learn: short practice rounds in math, reading, and logic for ages 5–8, adaptive difficulty, collectible heroes, and a parent view. Free, no account, no ads.",
  alternates: { canonical: "/learn/how-it-works/" },
};

export default function HowItWorks() {
  return (
    <main className="app static-page">
      <header className="topbar">
        <a className="brand" href="/learn/">
          <span>🌈</span> Kidtivity Learn
        </a>
      </header>
      <article className="card static-article">
        <h1>How Kidtivity Learn works</h1>
        <p>
          Kidtivity Learn is the practice-games corner of <a href="/">Kidtivity Lab</a>, a site built by a
          parent of two kids. It started as a homemade tool for our own family: short daily rounds instead of
          worksheet battles. It grew into something worth sharing. It's free, there are no ads, and you don't
          need an account.
        </p>

        <h2>One simple loop</h2>
        <p>
          The games are built for ages 5–8, roughly kindergarten to 2nd grade. Content is split into islands:
          math, reading, words and sounds, logic and memory, plus an extra-challenge island for kids who want
          more. Each island holds small skills like “addition within 20”, “reading sentences”, or “days,
          months, seasons”. A round is 8 quick questions with big buttons, pictures, and a cheerful voice that
          can read every task aloud.
        </p>

        <h2>Difficulty that adapts</h2>
        <p>
          Every skill has five levels. Finish a round with 90%+ right answers and the skill moves up a level;
          struggle below 50% and it gently steps down. After each round, kids tap how it felt (easy, OK, or
          hard), and that nudges the level too, so the game meets them where they are. Parents can also run a
          quick level check per island, or fill in a two-minute skills survey that sets sensible starting
          levels for everything at once.
        </p>

        <h2>Heroes keep it going</h2>
        <p>
          Every right answer earns a coin, and coins unlock a parade of twelve original heroes, from Pip the
          chick to Orion the cosmic lion. A hero can tag along as a companion during rounds. That's the whole
          economy: no purchases, no timers, no tricks.
        </p>

        <h2>For parents</h2>
        <p>
          The parent section (behind a small multiplication gate) shows accuracy, streaks, recent rounds, and
          what your child says after each one, including signals like “says it's easy and gets everything
          right: ready for harder”. You can rename profiles, hide skills, and download a backup of all progress
          as a file.
        </p>

        <h2>Privacy</h2>
        <p>
          Progress is stored in your browser on your device. Nothing is uploaded, and there are no accounts or
          tracking profiles. If you switch devices, move progress yourself with the backup file from the parent
          section.
        </p>

        <h2>What this is (and isn't)</h2>
        <p>
          Kidtivity Learn is practice, not a curriculum. It won't teach a skill from scratch and it doesn't
          promise learning outcomes. It gives kids a friendly place to rehearse what they're learning at
          school, in rounds short enough to fit before dinner. If a task set feels too easy or too hard, the
          level controls in the parent section are there for exactly that.
        </p>

        <p>
          <a className="btn primary" href="/learn/">
            Start playing →
          </a>
        </p>
      </article>
      <footer className="app-footer">
        <a href="/learn/">Kidtivity Learn</a>
        <span aria-hidden="true">·</span>
        <a href="/">Kidtivity Lab: activities for kids</a>
        <span aria-hidden="true">·</span>
        <a href="/about/">About</a>
      </footer>
    </main>
  );
}
