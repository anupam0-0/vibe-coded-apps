"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Chapter, Subject } from "../course-data";

type Prerequisite = { label: string; href: string };

function shuffledIndexes(length: number, previousOrder: number[] = []) {
  const indexes = Array.from({ length }, (_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  const isSequential = (values: number[]) => values.every((value, index) => value === index);
  const repeatsPrevious = (values: number[]) => previousOrder.length === length && values.every((value, index) => value === previousOrder[index]);
  if (length > 1 && isSequential(indexes)) [indexes[0], indexes[1]] = [indexes[1], indexes[0]];
  if (length > 2 && repeatsPrevious(indexes)) {
    for (let left = 0; left < length; left += 1) {
      for (let right = left + 1; right < length; right += 1) {
        [indexes[left], indexes[right]] = [indexes[right], indexes[left]];
        if (!isSequential(indexes) && !repeatsPrevious(indexes)) return indexes;
        [indexes[left], indexes[right]] = [indexes[right], indexes[left]];
      }
    }
  }
  return indexes;
}

export default function LearningReels({
  subject,
  chapter,
  chapterNumber,
  prerequisites,
}: {
  subject: Subject;
  chapter: Chapter;
  chapterNumber: number;
  prerequisites: Prerequisite[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [feed, setFeed] = useState<{ chapterId: string; order: number[] }>({ chapterId: "", order: [] });
  const [active, setActive] = useState(0);
  const [guideOpen, setGuideOpen] = useState(false);
  const [prerequisitesOpen, setPrerequisitesOpen] = useState(false);

  const order = feed.chapterId === chapter.id ? feed.order : [];
  const reelItems = order.flatMap((sectionIndex) => {
    const section = chapter.sections[sectionIndex];
    return section ? [{ section, sectionIndex }] : [];
  });
  const activeItem = reelItems[active];

  useEffect(() => {
    setFeed({ chapterId: chapter.id, order: shuffledIndexes(chapter.sections.length) });
    setActive(0);
    setGuideOpen(false);
    setPrerequisitesOpen(false);
  }, [chapter.id, chapter.sections.length]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !order.length) return;
    const cards = root.querySelectorAll<HTMLElement>("[data-feed-index]");
    const observer = new IntersectionObserver((entries) => {
      const mostVisible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (mostVisible) setActive(Number((mostVisible.target as HTMLElement).dataset.feedIndex));
    }, { root, threshold: [0.12, 0.3, 0.55] });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [chapter.id, order]);

  function goTo(index: number) {
    if (!order.length) return;
    const next = Math.max(0, Math.min(order.length - 1, index));
    const target = scrollRef.current?.querySelector<HTMLElement>(`[data-feed-index="${next}"]`);
    if (target && scrollRef.current) scrollRef.current.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    setActive(next);
  }

  function shuffleAgain() {
    setFeed({ chapterId: chapter.id, order: shuffledIndexes(chapter.sections.length, order) });
    setActive(0);
    setPrerequisitesOpen(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      goTo(active + 1);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      goTo(active - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(order.length - 1);
    }
  }

  const chapterHref = `/subjects/${subject.id}/${chapter.id}`;
  const questionsHref = `${chapterHref}#practice`;
  const progress = order.length ? `${((active + 1) / order.length) * 100}%` : "0%";

  return (
    <section className={`learning-reels-page subject-${subject.color}`} aria-label={`${chapter.title} learning reels`}>
      <div className="reel-player-layout">
        <div className="reel-window-wrap">
          <div className="reel-window" ref={scrollRef} tabIndex={0} onKeyDown={handleKeys} aria-label="Swipe vertically through shuffled lesson concepts">
            {!order.length && <div className="reel-loading" aria-live="polite">Shuffling your lesson…</div>}
            {reelItems.map(({ section, sectionIndex }, feedIndex) => (
              <article
                className={`learning-reel ${active === feedIndex ? "is-active" : ""}`}
                data-feed-index={feedIndex}
                key={`${section.title}-${sectionIndex}`}
                aria-labelledby={`reel-title-${sectionIndex}`}
              >
                <div className="learning-reel-top">
                  <span>RANDOM PICK {String(feedIndex + 1).padStart(2, "0")}</span>
                  <span>{String(feedIndex + 1).padStart(2, "0")} / {String(order.length).padStart(2, "0")}</span>
                </div>
                <h2 id={`reel-title-${sectionIndex}`}>{section.title}</h2>
                <div className="reel-copy">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
                {section.bullets && <ul className="reel-bullets">{section.bullets.map((bullet) => <li key={bullet}><span>✦</span>{bullet}</li>)}</ul>}
                {section.code && <pre className="reel-code"><code>{section.code}</code></pre>}
                {section.note && <aside className="reel-note"><span>FIELD NOTE</span><p>{section.note}</p></aside>}
                <span className="reel-card-source">{subject.shortTitle} · CHAPTER {String(chapterNumber).padStart(2, "0")}</span>
              </article>
            ))}
            {!!order.length && (
              <article className="reel-outro" aria-labelledby="reel-outro-title">
                <span className="eyebrow">THAT&apos;S THE CHAPTER MIXED UP</span>
                <h2 id="reel-outro-title">Want another pass?</h2>
                <p>Shuffle the concepts into a fresh order, or open the hands-on bench and questions for this chapter.</p>
                <button type="button" className="button button-ink" onClick={shuffleAgain}>Shuffle again <span>⤨</span></button>
                <Link href={`${chapterHref}#field-lab`} className="reel-outro-reading">Try the hands-on bench ↗</Link>
                <Link href={questionsHref} className="reel-outro-reading">Open chapter questions ↗</Link>
              </article>
            )}
          </div>
        </div>

        <aside className={`reel-sidebar ${guideOpen ? "is-open" : ""}`} aria-label="Reel learning guide">
          <button className="reel-panel-toggle" type="button" aria-expanded={guideOpen} aria-label={guideOpen ? "Close reel guide" : "Open reel guide"} onClick={() => setGuideOpen((value) => !value)}>
            <span aria-hidden="true">{guideOpen ? "×" : "☷"}</span><b>{guideOpen ? "Close" : "Guide"}</b>
          </button>
          <div className="reel-sidebar-heading">
            <Link className="reel-back-link" href={chapterHref}>← Full chapter</Link>
            <span className="eyebrow">RANDOM LEARNING FEED</span>
            <h1>{chapter.title}<span className="period">.</span></h1>
            <p className="reel-now-showing"><span>NOW SHOWING</span>{activeItem?.section.title ?? "Shuffling concepts…"}</p>
            <div className="reel-progress" aria-label={`Concept ${order.length ? active + 1 : 0} of ${order.length}`}>
              <div><span>THIS MIX</span><b>{String(order.length ? active + 1 : 0).padStart(2, "0")} / {String(order.length).padStart(2, "0")}</b></div>
              <div className="reel-progress-track"><span style={{ width: progress }} /></div>
            </div>
          </div>

          <nav className="reel-topic-index" aria-label="Concepts in the shuffled feed">
            <div className="reel-topic-heading"><h2>Concepts</h2><span>SHUFFLED</span></div>
            {reelItems.map(({ section, sectionIndex }, feedIndex) => (
              <button type="button" className={feedIndex === active ? "current" : ""} aria-current={feedIndex === active ? "step" : undefined} onClick={() => goTo(feedIndex)} key={`${section.title}-${sectionIndex}`}>
                <span>{String(feedIndex + 1).padStart(2, "0")}</span><b>{section.title}</b>
              </button>
            ))}
          </nav>

          <nav className="reel-actions" aria-label="Learning actions">
            <Link className="reel-action" aria-label="Parent topic: full chapter" title="Parent topic" href={chapterHref}><span className="reel-action-icon">↗</span><b>Parent topic</b></Link>
            <div className="reel-action-wrap">
              <button className={`reel-action ${prerequisitesOpen ? "selected" : ""}`} type="button" aria-label="Prerequisites" title="Prerequisites" aria-expanded={prerequisitesOpen} onClick={() => setPrerequisitesOpen((value) => !value)}><span className="reel-action-icon">↶</span><b>Prerequisites</b></button>
              {prerequisitesOpen && <div className="reel-popover"><div className="reel-popover-title">BEFORE THIS CHAPTER</div>{prerequisites.map((item) => item.href.startsWith("/") ? <Link href={item.href} key={item.href}>{item.label} ↗</Link> : <a href={item.href} target="_blank" rel="noreferrer" key={item.href}>{item.label} ↗</a>)}</div>}
            </div>
            <Link className="reel-action" aria-label="Chapter questions" title="Questions" href={questionsHref}><span className="reel-action-icon">?</span><b>Questions</b></Link>
            <button className="reel-action reel-shuffle-action" type="button" aria-label="Shuffle concepts" title="Shuffle concepts" onClick={shuffleAgain}><span className="reel-action-icon">⤨</span><b>Shuffle</b></button>
          </nav>
          <div className="reel-arrow-actions"><button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous random concept">↑</button><button type="button" onClick={() => goTo(active + 1)} disabled={active >= order.length - 1} aria-label="Next random concept">↓</button></div>
        </aside>
      </div>
    </section>
  );
}
