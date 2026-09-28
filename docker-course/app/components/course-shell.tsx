import Link from "next/link";
import type { ReactNode } from "react";
import { subjects } from "../course-data";

function LittleFilmPal() {
  return (
    <svg className="film-pal" viewBox="0 0 126 126" role="img" aria-label="A cheerful little terminal mascot">
      <g className="pal-body">
        <path d="M38 44c2-14 12-23 25-23s23 9 25 23l-5 37H43z" fill="#f3d89a" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M41 43c5-7 12-10 22-10s17 3 22 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="54" cy="52" rx="3.8" ry="5.4" fill="currentColor" />
        <ellipse cx="73" cy="52" rx="3.8" ry="5.4" fill="currentColor" />
        <path d="M57 65c4 5 10 5 14 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M48 81l-3 18m28-18 4 18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M45 99c-8-3-15-1-17 4-2 5 6 8 18 6m31-10c9-2 16 1 17 6 1 5-7 7-18 4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path className="pal-arm pal-arm-left" d="M41 54c-13 2-19 10-22 21-2 6-6 8-10 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="8" cy="79" r="5" fill="#fff4d4" stroke="currentColor" strokeWidth="3" />
        <path className="pal-arm pal-arm-right" d="M84 55c12 1 19 7 21 17 1 5 6 8 10 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="117" cy="76" r="5" fill="#fff4d4" stroke="currentColor" strokeWidth="3" />
      </g>
      <path d="M18 27l4 7m83-10-5 8M15 103l7-3m82 6 7 1" stroke="#b84e35" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ChapterLinks() {
  return (
    <div className="curriculum-nav">
      <Link className="nav-home" href="/">★ Course home</Link>
      <Link className="nav-reels-home" href="/reels"><span aria-hidden="true">▶</span><b>Study Reels</b><small>One concept at a time</small></Link>
      {subjects.map((subject) => (
        <section className="nav-subject" key={subject.id}>
          <Link className="nav-subject-title" href={`/subjects/${subject.id}`}>
            <span className={`nav-reel reel-${subject.color}`}>{subject.number}</span>
            <span>{subject.shortTitle}</span>
          </Link>
          <div className="nav-chapters">
            {subject.chapters.map((chapter, index) => (
              <Link key={chapter.id} href={`/subjects/${subject.id}/${chapter.id}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {chapter.title}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function CourseShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <aside className="left-rail" aria-label="Course navigation">
        <Link href="/" className="brand-lockup">
          <span className="brand-icon">OP</span>
          <span className="brand-copy"><b>OPERATOR&apos;S REEL</b><small>Practical DevOps school</small></span>
        </Link>
        <ChapterLinks />
        <div className="rail-stamp"><span>THE CLOUD CAN WAIT</span><b>Learn the machinery first.</b></div>
      </aside>
      <div className="right-stage">
        <header className="top-bar">
          <div className="top-bar-left"><span className="record-dot" /> <span>REEL 01–04</span><span className="top-divider">/</span><span>THE PRACTICAL OPS COURSE</span></div>
          <div className="top-bar-right"><span className="top-cloud">✦ NO CLOUD REQUIRED ✦</span><details className="mobile-index"><summary>Course index</summary><div className="mobile-index-content"><ChapterLinks /></div></details></div>
        </header>
        <main className="main-stage">{children}</main>
        <footer className="site-footer"><span>Made for curious operators</span><span>✦</span><span>Study slowly · try things locally · keep good notes</span></footer>
      </div>
      <div className="film-grain" aria-hidden="true" />
      <div className="film-gate" aria-hidden="true"><span /><span /><span /><span /></div>
    </div>
  );
}

export { LittleFilmPal };
