import Link from "next/link";
import MotionReveal from "../components/motion-reveal";
import { subjects } from "../course-data";

export default function ReelsIndexPage() {
  return (
    <div className="page-enter reels-index-page">
      <div className="breadcrumb"><Link href="/">COURSE HOME</Link><span>✦</span><b>STUDY REELS</b></div>
      <MotionReveal delay={0.02}>
        <section className="reels-index-hero">
          <div><span className="eyebrow">A SEPARATE WAY THROUGH THE COURSE</span><h1>One concept.<br /><em>Then the next.</em></h1><p>Every lesson subsection becomes a vertical, snap-to-stop card. Scroll or swipe through the ideas, jump to a prerequisite, open the parent chapter, or go straight to questions.</p><div className="reels-index-stats"><span>12 CHAPTERS</span><i>·</i><span>48 CONCEPT STOPS</span><i>·</i><span>NO SOCIAL FEED</span></div></div>
          <div className="reels-index-mark" aria-hidden="true"><span>▶</span><b>STUDY<br />REEL</b><small>PLAY / PAUSE YOUR PACE</small></div>
        </section>
      </MotionReveal>

      <div className="reels-index-heading"><div><span className="eyebrow">CHOOSE A CHAPTER</span><h2>Pick up a learning reel.</h2></div><Link href="/subjects/terminal-bash/command-line-foundations">Or start the regular course →</Link></div>
      <div className="reels-subject-list">
        {subjects.map((subject) => (
          <section className={`reels-subject-group subject-${subject.color}`} key={subject.id}>
            <div className="reels-subject-heading"><span className="reels-subject-number">REEL {subject.number}</span><h2>{subject.title}</h2><p>{subject.description}</p></div>
            <div className="reels-chapter-grid">
              {subject.chapters.map((chapter, index) => (
                <Link className="reels-chapter-card" href={`/reels/${subject.id}/${chapter.id}`} key={chapter.id}>
                  <span className="reels-chapter-index">{String(index + 1).padStart(2, "0")}</span>
                  <div><span className="reels-chapter-meta">{chapter.sections.length} CONCEPT STOPS · {chapter.minutes} MIN</span><b>{chapter.title}</b><small>{chapter.subtitle}</small></div>
                  <span className="reels-card-play" aria-hidden="true">▶</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
