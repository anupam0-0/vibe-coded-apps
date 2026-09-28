import Link from "next/link";
import { notFound } from "next/navigation";
import MotionReveal from "../../components/motion-reveal";
import { getSubject, subjects } from "../../course-data";

export function generateStaticParams() {
  return subjects.map((subject) => ({ subject: subject.id }));
}

export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: subjectId } = await params;
  const subject = getSubject(subjectId);
  if (!subject) notFound();

  const minutes = subject.chapters.reduce((sum, chapter) => sum + chapter.minutes, 0);
  return (
    <div className="page-enter subject-page">
      <div className="breadcrumb"><Link href="/">COURSE HOME</Link><span>✦</span><b>REEL {subject.number}</b></div>
      <MotionReveal delay={0.02}><section className={`subject-hero subject-${subject.color}`}>
        <div className="subject-hero-copy"><span className="eyebrow">SUBJECT REEL {subject.number} / 04</span><h1>{subject.title}<span className="period">.</span></h1><p>{subject.description}</p><div className="subject-stats"><span><b>{subject.chapters.length}</b> chapters</span><i>·</i><span><b>{minutes}</b> minutes</span><i>·</i><span><b>60</b> review questions</span></div></div>
        <div className="subject-seal"><span>REEL</span><b>{subject.number}</b><small>NOW SHOWING</small></div>
      </section></MotionReveal>

      <section className="prerequisite-panel">
        <div className="prereq-icon">↗</div><div><span className="eyebrow">BEFORE YOU START</span><h2>Prerequisites</h2><p>These ideas make the first chapter easier. Follow a link if you want a quick refresher.</p></div>
        <div className="prereq-links">{subject.prerequisites.map((item) => item.href.startsWith("/") ? <Link href={item.href} key={item.href}>{item.label} <span>↗</span></Link> : <a href={item.href} target="_blank" rel="noreferrer" key={item.href}>{item.label} <span>↗</span></a>)}</div>
      </section>

      <section className="chapter-list-section">
        <div className="section-heading"><div><span className="eyebrow">THE CHAPTERS</span><h2>Run the reel in order.</h2></div><span className="hand-note">Each chapter ends in the review room.</span></div>
        <div className="chapter-list">
          {subject.chapters.map((chapter, index) => (
            <article className="chapter-list-card" key={chapter.id}>
              <div className="chapter-list-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="chapter-list-copy"><div className="chapter-list-meta"><span>CHAPTER {String(index + 1).padStart(2, "0")}</span><span>{chapter.minutes} MIN</span></div><h3><Link href={`/subjects/${subject.id}/${chapter.id}`}>{chapter.title}</Link></h3><p>{chapter.subtitle}</p><ul>{chapter.objectives.slice(0, 2).map((objective) => <li key={objective}>{objective}</li>)}</ul></div>
              <Link className="chapter-open" href={`/subjects/${subject.id}/${chapter.id}`} aria-label={`Open ${chapter.title}`}>↗</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="reference-shelf"><div className="section-heading"><div><span className="eyebrow">READ / WATCH / KEEP NEARBY</span><h2>Good source material.</h2></div></div><div className="reference-grid">{subject.references.map((reference, index) => <a className="reference-card" href={reference.href} target="_blank" rel="noreferrer" key={reference.href}><span className="reference-number">0{index + 1} · SOURCE</span><b>{reference.label}</b><p>{reference.helps}</p><span className="reference-arrow">Open resource ↗</span></a>)}</div></section>
    </div>
  );
}
