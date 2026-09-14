import type { Metadata } from "next";
import { musicPracticeRpg } from "@/content/site-config";

export const metadata: Metadata = {
  title: "Music Practice RPG - BenChanTech",
  description: "A continuing fantasy adventure shaped by real music practice. For any instrument or voice, alongside your own music and teacher assignments.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: "Music Practice RPG - BenChanTech",
    description: "Choose your next move, practice your music, and discover the consequences on Resonant Isle.",
    url: "/studio"
  }
};

export default function StudioPage() {
  return (
    <section className="detail-page">
      <p className="eyebrow">{musicPracticeRpg.name} · on Studio.com</p>
      <h1>Your real music practice moves the adventure forward.</h1>
      <p>
        Music Practice RPG connects the music you are already learning with a continuing fantasy story.
        Choose what your hero tries next, practice your instrument or voice, and return to discover the consequences.
      </p>
      <p>
        The adventure begins on Resonant Isle, where you arrive with your instrument and a world in need of repair.
        Your choices and practice shape the next chapter, giving you a reason to pick up your music again tomorrow.
      </p>
      <p>
        <a className="detail-link" href={musicPracticeRpg.url} target="_blank" rel="noopener noreferrer">
          Start your first quest on Studio.com <span className="sr-only">(opens in a new tab)</span>
        </a>
      </p>

      <div className="detail-grid">
        <article>
          <h2>Bring the music you already play</h2>
          <p>
            Use any instrument or your voice. Work on your own pieces, difficult passages, scales, exercises,
            or teacher assignments. The adventure fits around your musical goals and practice time.
          </p>
        </article>
        <article>
          <h2>Choose, practice, discover</h2>
          <p>
            Make a meaningful choice for your hero, then commit that move through real practice.
            The story continues from earlier sessions: discoveries, mistakes, repairs, and unfinished business
            can influence what comes next.
          </p>
        </article>
        <article>
          <h2>Effort matters</h2>
          <p>
            Practice privately and log your time, or record for richer feedback. Rough attempts can matter too.
            Choose a short, light story or a deeper fantasy experience. Curiosity gives you another reason
            to return to your music without turning every performance into a grade.
          </p>
        </article>
        <article>
          <h2>Your teacher stays in charge</h2>
          <p>
            Teacher assignments remain the musical priority. The RPG adds story and curiosity to your routine.
            Ben Chan brings his work as a violinist, educator, developer, and lifelong gamer to this practice adventure.
          </p>
        </article>
      </div>

      <p>
        Tell the app what you play, what you are working on, and how much story you want.
        Make your first move, practice, and come back to find out how the island responds.
      </p>
      <p>
        <a className="detail-link" href={musicPracticeRpg.url} target="_blank" rel="noopener noreferrer">
          Open Music Practice RPG <span className="sr-only">(opens in a new tab)</span>
        </a>
      </p>
    </section>
  );
}
