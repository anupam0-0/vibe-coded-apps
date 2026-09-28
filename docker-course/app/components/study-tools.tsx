"use client";

import { useEffect, useState } from "react";
import type { Chapter } from "../course-data";

const STORAGE_KEY = "operators-reel-completed-v1";

function readCompleted(): string[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : [];
  } catch {
    return [];
  }
}

function announceProgress() {
  window.dispatchEvent(new Event("operators-reel-progress"));
}

export function CompleteChapter({ chapterId }: { chapterId: string }) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setComplete(readCompleted().includes(chapterId));
  }, [chapterId]);

  function toggle() {
    const completed = readCompleted();
    const next = complete ? completed.filter((item) => item !== chapterId) : [...new Set([...completed, chapterId])];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setComplete(!complete);
      announceProgress();
    } catch {
      setComplete(!complete);
    }
  }

  return <button className={`complete-button ${complete ? "is-complete" : ""}`} onClick={toggle} type="button"><span>{complete ? "✓" : "○"}</span>{complete ? "Chapter stamped complete" : "Stamp this chapter complete"}</button>;
}

export function CopyCodeButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return <button className="code-copy-button" type="button" onClick={copy} aria-label="Copy code sample">{copied ? "COPIED" : "COPY"}</button>;
}

export function CourseProgress({ total }: { total: number }) {
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const update = () => setCompleted(readCompleted().length);
    update();
    window.addEventListener("operators-reel-progress", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("operators-reel-progress", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const percent = total ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  return <div className="progress-ticket" aria-label={`${completed} of ${total} chapters completed`}>
    <div className="progress-ticket-top"><span>YOUR FILM STRIP</span><b>{completed}/{total}</b></div>
    <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
    <small>{completed === 0 ? "A fresh reel. Pick a first chapter." : completed === total ? "Every frame in the can. Splendid work." : `${percent}% watched · your progress stays on this device`}</small>
  </div>;
}

function DifficultyTag({ level }: { level: string }) {
  return <span className={`difficulty-tag difficulty-${level.toLowerCase()}`}>{level}</span>;
}

function MCQSet({ chapter }: { chapter: Chapter }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const answered = Object.keys(answers).length;
  const score = chapter.mcqs.reduce((sum, item, index) => sum + (answers[index] === item.answer ? 1 : 0), 0);

  return <div className="question-stack">
    <div className="quiz-progress"><div><span>{answered} of {chapter.mcqs.length} answered</span><b>{answered === chapter.mcqs.length ? `${score}/${chapter.mcqs.length} correct` : "Easy → working → stretch"}</b></div><div className="progress-track"><span style={{ width: `${(answered / chapter.mcqs.length) * 100}%` }} /></div></div>
    {chapter.mcqs.map((item, index) => {
      const selected = answers[index];
      return <article className="question-card" key={item.question}>
        <div className="question-meta"><span>MCQ {String(index + 1).padStart(2, "0")}</span><DifficultyTag level={item.difficulty} /></div>
        <h3>{item.question}</h3>
        <div className="choice-list" role="group" aria-label={`Answers for question ${index + 1}`}>
          {item.choices.map((choice, choiceIndex) => {
            const chosen = selected === choiceIndex;
            const correct = selected !== undefined && choiceIndex === item.answer;
            return <button key={choice} type="button" className={`choice ${chosen ? "is-chosen" : ""} ${correct ? "is-correct" : ""} ${chosen && !correct ? "is-wrong" : ""}`} onClick={() => setAnswers((current) => ({ ...current, [index]: choiceIndex }))} aria-pressed={chosen}>
              <span className="choice-letter">{String.fromCharCode(65 + choiceIndex)}</span><span>{choice}</span>{correct && <b className="choice-mark">✓</b>}
            </button>;
          })}
        </div>
        {selected !== undefined && <p className={`answer-note ${selected === item.answer ? "answer-right" : "answer-review"}`}><b>{selected === item.answer ? "That's it." : "Take another look."}</b> {item.why}</p>}
      </article>;
    })}
  </div>;
}

function OpenQuestionSet({ items, kind }: { items: Chapter["interview"]; kind: "interview" | "scenario" }) {
  return <div className="open-question-list">
    {items.map((item, index) => <details className="open-question" key={item.question}>
      <summary><span className="open-number">{String(index + 1).padStart(2, "0")}</span><span className="open-copy"><b>{item.question}</b><span><DifficultyTag level={item.difficulty} /> {kind === "interview" ? "Interview prompt" : "Scenario drill"}</span></span><i aria-hidden="true">+</i></summary>
      <div className="model-answer"><span>{kind === "interview" ? "A strong answer includes" : "A sound approach"}</span><p>{item.model}</p></div>
    </details>)}
  </div>;
}

export function ChapterEnd({ chapter }: { chapter: Chapter }) {
  const [tab, setTab] = useState<"mcq" | "interview" | "scenario" | "recall">("mcq");
  const tabs = [
    { id: "mcq" as const, label: "10 MCQs", count: chapter.mcqs.length },
    { id: "interview" as const, label: "Interview", count: chapter.interview.length },
    { id: "scenario" as const, label: "Scenarios", count: chapter.scenarios.length },
    { id: "recall" as const, label: "Memory reel", count: chapter.recall.length },
  ];

  return <section className="chapter-end" id="practice">
    <div className="section-heading end-heading"><div><span className="eyebrow">THE REVIEW ROOM</span><h2>Try it from memory.</h2><p>Questions climb from warm-up to stretch. Say your answer before opening the notes.</p></div><span className="exam-stamp">20<br /><small>DRILLS</small></span></div>
    <div className="practice-tabs" role="tablist" aria-label="Chapter review activities">
      {tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}<span>{item.count}</span></button>)}
    </div>
    <div className="practice-panel" role="tabpanel">
      {tab === "mcq" && <MCQSet chapter={chapter} />}
      {tab === "interview" && <><div className="practice-intro"><b>Answer aloud in your own words.</b> Open the notes after you finish to compare your reasoning.</div><OpenQuestionSet items={chapter.interview} kind="interview" /></>}
      {tab === "scenario" && <><div className="practice-intro"><b>Work the evidence in order.</b> State what you would inspect first, what result you expect, and what you would do next.</div><OpenQuestionSet items={chapter.scenarios} kind="scenario" /></>}
      {tab === "recall" && <><div className="practice-intro"><b>Bring older frames back into view.</b> These prompts revisit prerequisites and earlier chapters; try an answer before revealing the recall note.</div><div className="open-question-list">{chapter.recall.map((item, index) => <details className="open-question recall-question" key={item.question}><summary><span className="open-number">{String(index + 1).padStart(2, "0")}</span><span className="open-copy"><b>{item.question}</b><span>{item.from ? `Memory from · ${item.from}` : "Foundation check"}</span></span><i aria-hidden="true">+</i></summary><div className="model-answer"><span>Recall note</span><p>{item.answer}</p></div></details>)}</div></>}
    </div>
  </section>;
}
