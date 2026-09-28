import Link from "next/link";
import { notFound } from "next/navigation";
import MotionReveal from "../../../components/motion-reveal";
import { ChapterEnd, CompleteChapter, CopyCodeButton } from "../../../components/study-tools";
import { allChapters, getChapter, subjects, type LessonSection } from "../../../course-data";
import HandsOnLab from "../../../components/hands-on-lab";
import { practicalLabs } from "../../../practical-labs";

export function generateStaticParams() {
  return subjects.flatMap((subject) =>
    subject.chapters.map((chapter) => ({ subject: subject.id, chapter: chapter.id })),
  );
}

function CodeWindow({ code }: { code: string }) {
  return (
    <div className="code-window">
      <div className="code-window-top">
        <span className="window-dots"><i /><i /><i /></span>
        <span>FIELD NOTES / TERMINAL</span>
        <CopyCodeButton value={code} />
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function LessonBlock({ section, index }: { section: LessonSection; index: number }) {
  return (
    <section className="lesson-section" id={`lesson-${index + 1}`}>
      <div className="lesson-section-header">
        <span className="section-count">{String(index + 1).padStart(2, "0")}</span>
        <h2>{section.title}</h2>
      </div>
      {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {section.bullets && <ul className="lesson-bullets">{section.bullets.map((bullet) => <li key={bullet}><span>✦</span>{bullet}</li>)}</ul>}
      {section.code && <CodeWindow code={section.code} />}
      {section.note && <aside className="lesson-note"><span>✳ FIELD NOTE</span><p>{section.note}</p></aside>}
    </section>
  );
}

export default async function ChapterPage({ params }: { params: Promise<{ subject: string; chapter: string }> }) {
  const { subject: subjectId, chapter: chapterId } = await params;
  const result = getChapter(subjectId, chapterId);
  if (!result) notFound();

  const { subject, chapter } = result;
  const position = allChapters.findIndex(({ chapter: item }) => item.id === chapter.id);
  const previous = position > 0 ? allChapters[position - 1] : undefined;
  const next = position < allChapters.length - 1 ? allChapters[position + 1] : undefined;
  const chapterIndex = subject.chapters.findIndex((item) => item.id === chapter.id);
  const prerequisites = chapterIndex > 0
    ? [{ label: `Chapter ${chapterIndex} · ${subject.chapters[chapterIndex - 1].title}`, href: `/subjects/${subject.id}/${subject.chapters[chapterIndex - 1].id}` }]
    : subject.prerequisites;

  return (
    <article className="page-enter chapter-page">
      <div className="breadcrumb">
        <Link href="/">COURSE HOME</Link><span>✦</span>
        <Link href={`/subjects/${subject.id}`}>REEL {subject.number} · {subject.shortTitle.toUpperCase()}</Link>
        <span>✦</span><b>CHAPTER {String(chapterIndex + 1).padStart(2, "0")}</b>
      </div>

      <MotionReveal delay={0.02}>
        <header className={`chapter-cover subject-${subject.color}`}>
          <div className="chapter-cover-copy">
            <div className="chapter-cover-meta"><span>REEL {subject.number} / CHAPTER {String(chapterIndex + 1).padStart(2, "0")}</span><span>{chapter.minutes} MIN STUDY</span></div>
            <h1>{chapter.title}<span className="period">.</span></h1>
            <p>{chapter.subtitle}</p>
            <div className="chapter-cover-footer"><span>✦ {chapter.objectives.length} LEARNING GOALS</span><span>✦ REVIEW ROOM INCLUDED</span></div>
          </div>
          <div className="chapter-ticket"><span>NOW SHOWING</span><b>{String(chapterIndex + 1).padStart(2, "0")}</b><small>TAKE YOUR SEAT</small></div>
        </header>
      </MotionReveal>

      <div className="chapter-layout">
        <aside className="chapter-aside">
          <div className="aside-card prereq-card">
            <span className="eyebrow">PREREQUISITES</span><p>Review these first or keep them nearby.</p>
            <div className="aside-link-list">{prerequisites.map((item) => item.href.startsWith("/") ? <Link href={item.href} key={item.href}>↗ {item.label}</Link> : <a href={item.href} target="_blank" rel="noreferrer" key={item.href}>↗ {item.label}</a>)}</div>
          </div>
          <div className="aside-card toc-card">
            <span className="eyebrow">IN THIS CHAPTER</span>
            {chapter.sections.map((section, index) => <a href={`#lesson-${index + 1}`} key={section.title}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}
            <a href="#field-lab"><span>✦</span>Field lab</a><a href="#practice"><span>✦</span>Review room</a>
          </div>
          <div className="aside-stamp"><span>TAKE YOUR TIME</span><b>Understanding<br />beats speed.</b></div>
        </aside>

        <div className="chapter-content">
          <section className="objectives-card">
            <div className="objectives-title"><span className="eyebrow">BY THE END OF THIS CHAPTER</span><h2>You will be able to…</h2></div>
            <ul>{chapter.objectives.map((objective) => <li key={objective}><span>✓</span>{objective}</li>)}</ul>
          </section>

          <div className="lesson-sections">{chapter.sections.map((section, index) => <LessonBlock key={section.title} section={section} index={index} />)}</div>

          <HandsOnLab key={chapter.id} chapterId={chapter.id} lab={chapter.lab} practice={practicalLabs[chapter.id]} />

          <section className="source-note">
            <div><span className="eyebrow">ON THE REFERENCE SHELF</span><h2>Want the source material?</h2></div>
            <div className="source-note-links">{subject.references.map((reference) => <a href={reference.href} target="_blank" rel="noreferrer" key={reference.href}>{reference.label} ↗</a>)}</div>
          </section>

          <ChapterEnd chapter={chapter} />
          <div className="chapter-finish"><div><span className="eyebrow">LAST FRAME</span><h2>Keep this chapter in the can?</h2><p>Your stamp is saved in this browser on this device.</p></div><CompleteChapter chapterId={chapter.id} /></div>

          <nav className="chapter-pagination" aria-label="Chapter navigation">
            {previous ? <Link href={`/subjects/${previous.subject.id}/${previous.chapter.id}`} className="page-prev"><span>← PREVIOUS FRAME</span><b>{previous.chapter.title}</b></Link> : <span className="page-prev disabled"><span>FIRST CHAPTER</span><b>You are at the beginning.</b></span>}
            {next ? <Link href={`/subjects/${next.subject.id}/${next.chapter.id}`} className="page-next"><span>NEXT FRAME →</span><b>{next.chapter.title}</b></Link> : <Link href="/" className="page-next"><span>ROLL CREDITS →</span><b>Back to the course home</b></Link>}
          </nav>
        </div>
      </div>
    </article>
  );
}
