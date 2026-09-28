"use client";

import { useEffect, useState } from "react";
import { chapters, Diagram } from "./course";

export default function Home() {
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("forest-course-progress") || "[]");
      if (Array.isArray(saved)) setCompleted(saved.filter((item): item is string => typeof item === "string"));
    } catch { setCompleted([]); }
    setHydrated(true);
  }, []);
  const chapter = chapters[active];
  const percent = Math.round(completed.length / chapters.length * 100);
  const select = (index: number) => { setActive(index); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const markComplete = () => {
    const next = completed.includes(chapter.id) ? completed.filter((id) => id !== chapter.id) : [...completed, chapter.id];
    setCompleted(next);
    localStorage.setItem("forest-course-progress", JSON.stringify(next));
  };
  return <main className="app-shell">
    <aside className={`course-nav ${menuOpen ? "nav-open" : ""}`}>
      <a className="course-brand" href="#top"><span className="brand-spirit">VC</span><span>VICE CITY<br/>NIGHT SHIFT<small>BACKEND FIELD GUIDE</small></span></a>
      <div className="nav-caption">THE JOURNEY <span>24 HOURS</span></div>
      <nav aria-label="Course chapters">{chapters.map((item, index) => <button key={item.id} className={`chapter-link ${index === active ? "selected" : ""} ${completed.includes(item.id) ? "is-done" : ""}`} onClick={() => select(index)}><span className="chapter-number">{completed.includes(item.id) ? "✦" : item.phase}</span><span className="chapter-link-copy">{item.title}<small>{item.time}</small></span><span className="chapter-arrow">{index === active ? "↗" : ""}</span></button>)}</nav>
      <div className="nav-progress"><div className="nav-progress-label"><span>JOURNEY PROGRESS</span><b>{hydrated ? percent : 0}%</b></div><div className="nav-meter"><i style={{ width: `${hydrated ? percent : 0}%` }}/></div><small>{completed.length} / {chapters.length} chapters marked clear</small></div>
      <div className="nav-sticker"><span>✧</span><p>Slow steps<br/>still take you<br/>somewhere.</p><small>FIELD NOTE 001</small></div>
      <div className="nav-footer">MADE FOR THE LONG WAY HOME <span>☾</span></div>
    </aside>
    <section className="workspace" id="top">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle chapter menu">☰</button><div className="breadcrumbs">FIELD GUIDE <span>/</span> CHAPTER {chapter.phase} <span>/</span> {chapter.title.toUpperCase()}</div><div className="top-meta"><span className="season-dot"/> NIGHT STUDY <span className="top-divider">·</span> BUILD MODE</div></header>
      <div className="page-wrap">
        <section className="cover-art"><svg className="cover-illustration" viewBox="0 0 1100 310" role="img" aria-label="A little house beneath a moon in a quiet forest"><defs><linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#152e39"/><stop offset="1" stopColor="#315650"/></linearGradient><linearGradient id="moon" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff2bd"/><stop offset="1" stopColor="#eabf7d"/></linearGradient></defs><rect width="1100" height="310" fill="url(#night)"/><circle cx="811" cy="84" r="45" fill="url(#moon)" opacity=".92"/><g fill="#f5eac2" opacity=".68"><circle cx="177" cy="52" r="2"/><circle cx="312" cy="91" r="1.5"/><circle cx="487" cy="42" r="2"/><circle cx="665" cy="116" r="1.4"/><circle cx="948" cy="47" r="1.6"/><path d="M103 111l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M927 134l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g><path d="M0 226Q184 145 333 212t290-7q179-69 477 16v89H0z" fill="#3b6959"/><path d="M0 260q202-52 361 0t358-8q179-45 381 4v54H0z" fill="#294c48"/><g fill="#183a3d"><path d="M85 253V115l-53 94h31L35 243h50zM102 253V92l-61 102h40L47 238h55z"/><path d="M1016 255V95l-61 105h40l-37 44h58zM1041 255V125l-47 79h30l-30 39h47z"/><path d="M198 246V159l-34 56h24l-22 31zM908 244V167l-30 49h20l-17 28z"/></g><g><path d="M477 215l82-61 82 61v67H477z" fill="#b98463"/><path d="M461 219l98-77 99 77" fill="none" stroke="#edc18d" strokeWidth="9" strokeLinejoin="round"/><rect x="506" y="218" width="31" height="64" rx="15" fill="#694b45"/><rect x="567" y="212" width="48" height="37" rx="4" fill="#f1cc87"/><path d="M591 212v37m-24-19h48" stroke="#845d4e" strokeWidth="4"/><circle cx="635" cy="235" r="3" fill="#f7e3ad"/></g><path d="M0 282q141-21 249 0t235 4q183-18 304 1t312-2v25H0z" fill="#1e3a3b"/><g fill="#e9d8a1"><circle cx="237" cy="249" r="3"/><circle cx="777" cy="250" r="2"/><circle cx="746" cy="226" r="2"/><circle cx="350" cy="272" r="2"/></g></svg><div className="cover-overlay"><span className="cover-kicker"><i/> A QUIET PLACE TO BUILD</span><h1>THE MOSS<br/><em>CIRCUIT</em></h1><p>A hands-on backend field guide<br/>for one very full day.</p><span className="cover-index">✦ FIELD GUIDE Nº 01</span></div><div className="cover-weather"><span>☾</span><small>FOREST AFTER RAIN<br/>GOOD FOCUS WEATHER</small></div></section>
        <div className="chapter-meta"><span className="chapter-tag">CHAPTER {chapter.phase}</span><span className="time-tag">◷ &nbsp;{chapter.time}</span><span className="chapter-saved">{completed.includes(chapter.id) ? "✦ SAVED TO YOUR JOURNEY" : "A SMALL STEP IS STILL A STEP"}</span></div>
        <div className="chapter-layout">
          <article className="lesson-content">
            <h2>{chapter.title}</h2><p className="chapter-deck">{chapter.deck}</p>
            <div className="lesson-stack">{chapter.lessons.map((lesson, index) => <section className="lesson" key={lesson.title}><div className="lesson-title"><span>{String(index+1).padStart(2,"0")}</span><h3>{lesson.title}</h3><i>✧</i></div><div className="lesson-body">{lesson.body}</div></section>)}</div>
            {chapter.id === "review" && <section className="meme-card"><div className="meme-art"><svg viewBox="0 0 180 130" role="img" aria-label="A sleepy forest spirit holding a tiny checklist"><ellipse cx="89" cy="112" rx="61" ry="12" fill="#173f3c"/><path d="M44 88q-3-50 31-59 37-8 55 19 14 22 0 49-14 18-45 16-29 0-41-25" fill="#d6d6b8"/><path d="M55 54q17-22 43-6m-39 25q7-10 17-2m27 1q8-9 17 0" fill="none" stroke="#354c49" strokeWidth="5" strokeLinecap="round"/><ellipse cx="75" cy="74" rx="3" ry="5" fill="#354c49"/><ellipse cx="113" cy="74" rx="3" ry="5" fill="#354c49"/><path d="M83 91q10 6 19 0" fill="none" stroke="#9b7861" strokeWidth="3" strokeLinecap="round"/><rect x="107" y="78" width="37" height="44" rx="3" fill="#f4e6c8" transform="rotate(9 107 78)"/><path d="m115 91 4 4 7-8m-10 18 4 4 7-8" fill="none" stroke="#71856d" strokeWidth="2"/></svg></div><div><span className="meme-label">THE STUDY SPIRIT KNOWS</span><p>“I opened one tutorial to learn ownership and now I have a distributed system.”</p><small>Close the tab. Build the tiny version.</small></div><span className="meme-sparkle">✦</span></section>}
            <div className="chapter-actions"><button className={`complete-button ${completed.includes(chapter.id) ? "completed" : ""}`} onClick={markComplete}>{completed.includes(chapter.id) ? "✦ CHAPTER CLEARED · UNMARK" : "MARK CHAPTER CLEARED  ↗"}</button><div className="pager"><button onClick={() => select(Math.max(0, active-1))} disabled={active === 0}>← PREVIOUS</button><button onClick={() => select(Math.min(chapters.length-1, active+1))} disabled={active === chapters.length-1}>NEXT CHAPTER →</button></div></div>
          </article>
          <aside className="chapter-aside"><div className="aside-card goals-card"><div className="aside-heading"><span>✦</span> BY THE END</div><ul>{chapter.goals.map((goal) => <li key={goal}><i>✓</i>{goal}</li>)}</ul></div><div className="aside-card resource-card"><div className="aside-heading"><span>↗</span> OPEN THE FIELD NOTES</div><p>Primary docs and the problem statement. Read for the question you’re solving now.</p>{chapter.resources.map((resource) => <a key={resource.label} href={resource.url} target={resource.url.startsWith("#") ? undefined : "_blank"} rel="noreferrer">{resource.label}<span>↗</span></a>)}</div><div className="aside-note"><span className="note-leaf">❧</span><p>Try the exercise before opening the answer in your head.</p><small>THE MOSS CIRCUIT / NOTE 0{chapter.phase}</small></div></aside>
        </div>
        <footer className="page-footer"><span>THE MOSS CIRCUIT <i>✦</i> LEARN BY MAKING SMALL THINGS</span><span>YOU ARE HERE · {chapter.phase} / {chapters.length}</span></footer>
      </div>
    </section>
  </main>;
}
