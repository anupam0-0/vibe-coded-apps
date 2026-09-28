import Link from "next/link";
import MotionReveal from "./components/motion-reveal";
import { CourseProgress } from "./components/study-tools";
import { LittleFilmPal } from "./components/course-shell";
import { allChapters, subjects } from "./course-data";

const openingMoves = [
  { n: "01", title: "Command-line feet", line: "Move around, inspect, and ask the machine sensible questions.", href: "/subjects/terminal-bash/command-line-foundations", action: "Start with Bash" },
  { n: "02", title: "Know the stage", line: "See processes, permissions, packets, and the services behind a request.", href: "/subjects/linux-networking/linux-operating-system", action: "Meet Linux" },
  { n: "03", title: "Pack the act", line: "Build a container, give it data, and let its services find each other.", href: "/subjects/docker/container-mental-model", action: "Open Docker" },
];

export default function Home() {
  return (
    <div className="page-enter home-page">
      <MotionReveal delay={0.02}><section className="hero-card">
        <div className="hero-copy">
          <div className="eyebrow"><span className="small-spark">✦</span> A HAND-DRAWN FIELD COURSE FOR BUILDERS</div>
          <h1>Learn the machinery<br /><em>before the cloud.</em></h1>
          <p className="hero-lede">Get comfortable at the command line. Understand the operating system and the network underneath it. Then build containers and wire up a real CI pipeline.</p>
          <div className="hero-actions"><Link className="button button-ink" href="/subjects/terminal-bash/command-line-foundations">Roll the first reel <span>↗</span></Link><a className="text-link" href="#curriculum">Browse the curriculum <span>↓</span></a></div>
          <div className="hero-ribbon"><span>12 CHAPTERS</span><i>·</i><span>120 MCQS</span><i>·</i><span>LOCAL FIRST</span></div>
        </div>
        <div className="hero-illustration" aria-label="Animated cartoon terminal mascot">
          <span className="orbit orbit-one" /><span className="orbit orbit-two" />
          <div className="sun-disc" />
          <LittleFilmPal />
          <span className="illustration-caption">Bash says hello!</span>
          <span className="film-sprocket sprocket-a">✦</span><span className="film-sprocket sprocket-b">✷</span>
        </div>
        <span className="hero-index">VOL. 01<br /><b>OPS SCHOOL</b></span>
      </section></MotionReveal>

      <section className="welcome-strip">
        <div className="welcome-copy"><span className="eyebrow">YOUR PROJECTION BOOTH</span><h2>Pick up where you left off.</h2><p>Your chapter stamps stay in this browser on this device.</p></div>
        <CourseProgress total={allChapters.length} />
        <div className="strip-mark" aria-hidden="true">✦</div>
      </section>

      <section className="curriculum-section" id="curriculum">
        <div className="section-heading"><div><span className="eyebrow">FOUR REELS · TWELVE CHAPTERS</span><h2>A practical learning order.</h2></div><span className="hand-note">No cloud yet. Plenty to learn here. ↙</span></div>
        <div className="subject-grid">
          {subjects.map((subject) => (
            <Link className={`subject-card subject-${subject.color}`} href={`/subjects/${subject.id}`} key={subject.id}>
              <div className="subject-card-top"><span className="reel-number">REEL {subject.number}</span><span className="card-arrow">↗</span></div>
              <h3>{subject.title}</h3>
              <p>{subject.description}</p>
              <div className="subject-card-footer"><span>{subject.chapters.length} chapters</span><span>{subject.chapters.reduce((minutes, chapter) => minutes + chapter.minutes, 0)} min of lessons</span></div>
              <div className="card-underline" />
            </Link>
          ))}
        </div>
      </section>

      <section className="first-steps">
        <div className="section-heading compact-heading"><div><span className="eyebrow">A FRIENDLY FIRST PASS</span><h2>Three good first moves.</h2></div></div>
        <div className="step-row">{openingMoves.map((move) => <article className="step-card" key={move.n}><span className="step-number">{move.n}</span><h3>{move.title}</h3><p>{move.line}</p><Link href={move.href}>{move.action} <span>→</span></Link></article>)}</div>
      </section>

      <section className="teaching-note"><span className="note-star">✳</span><p><b>How this course works:</b> each chapter teaches the idea, shows commands, and gives you a local lab. The review room has ten multiple-choice questions, five interview prompts, five scenarios, and a memory reel that brings earlier concepts back.</p><span className="note-signature">— THE PROJECTIONIST</span></section>
    </div>
  );
}
