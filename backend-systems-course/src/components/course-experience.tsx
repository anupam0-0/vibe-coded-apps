"use client";

import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookmarkCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  CornerDownRight,
  GraduationCap,
  Lightbulb,
  ListChecks,
  RotateCcw,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { course, totalQuestions, type CourseModule, type Difficulty, type Question } from "@/lib/course";

type View = "lesson" | "quiz" | "finished";
type Progress = { completed: string[]; scores: Record<string, number> };

const STORAGE_KEY = "ten-million-row-field-guide:v1";

const toneClasses: Record<CourseModule["tone"], { chip: string; soft: string; border: string; dot: string }> = {
  coral: { chip: "bg-coral/10 text-coral", soft: "bg-coral/10", border: "border-coral/30", dot: "bg-coral" },
  sage: { chip: "bg-sage/15 text-[#587b64]", soft: "bg-sage/15", border: "border-sage/35", dot: "bg-sage" },
  sun: { chip: "bg-sun/25 text-[#8b6417]", soft: "bg-sun/20", border: "border-sun/50", dot: "bg-sun" },
  sky: { chip: "bg-sky/20 text-[#497984]", soft: "bg-sky/20", border: "border-sky/40", dot: "bg-sky" },
};

const difficultyClasses: Record<Difficulty, string> = {
  "Warm-up": "bg-sage/15 text-[#587b64]",
  Apply: "bg-sky/20 text-[#497984]",
  Diagnose: "bg-sun/25 text-[#8b6417]",
  Design: "bg-coral/10 text-coral",
};

function DoodlePath() {
  return (
    <svg aria-hidden="true" viewBox="0 0 420 250" className="h-full w-full overflow-visible">
      <motion.path d="M24 176 C76 61 132 209 188 126 S293 56 384 112" fill="none" stroke="#2e312f" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: "easeInOut" }} />
      <motion.path d="M369 101 l17 11 -17 8" fill="none" stroke="#2e312f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: 1, pathLength: 1 }} transition={{ delay: 1.4, duration: 0.35 }} />
      <motion.g initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <circle cx="48" cy="158" r="28" fill="#fffdf7" stroke="#789782" strokeWidth="2" />
        <path d="M37 159h22M48 148v22" stroke="#789782" strokeWidth="2" strokeLinecap="round" />
        <text x="16" y="205" className="handwritten" fill="#77766f" fontSize="13">one clear question</text>
      </motion.g>
      <motion.g initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.65, duration: 0.5 }}>
        <rect x="164" y="91" width="53" height="55" rx="8" fill="#eab957" stroke="#2e312f" strokeWidth="2" transform="rotate(-6 164 91)" />
        <path d="M176 107h28M176 117h22M176 127h17" stroke="#2e312f" strokeWidth="2" strokeLinecap="round" />
        <text x="156" y="163" className="handwritten" fill="#77766f" fontSize="13">small batches</text>
      </motion.g>
      <motion.g initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, duration: 0.5 }}>
        <path d="M325 68c0-8 46-8 46 0v46c0 9-46 9-46 0z" fill="#d86a50" stroke="#2e312f" strokeWidth="2" />
        <ellipse cx="348" cy="68" rx="23" ry="8" fill="#f6c4aa" stroke="#2e312f" strokeWidth="2" />
        <path d="M325 91c0 9 46 9 46 0M325 111c0 9 46 9 46 0" fill="none" stroke="#2e312f" strokeWidth="1.5" />
        <text x="317" y="137" className="handwritten" fill="#77766f" fontSize="13">steady, not rushed</text>
      </motion.g>
      <motion.path d="M256 51c17-18 39-15 44 1 4 14-9 25-22 21-12-4-9-19 0-21" fill="none" stroke="#d86a50" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.25, duration: 0.7 }} />
      <motion.path d="M80 54c3-7 7-7 10 0 7-4 11 0 6 7 5 5 2 10-5 8-4 8-9 7-11 0-8 2-11-3-6-9-5-4-2-9 6-6" fill="#eab957" stroke="#2e312f" strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6, type: "spring" }} />
    </svg>
  );
}

function ProgressRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 17;
  return (
    <svg viewBox="0 0 44 44" className="size-11 -rotate-90" aria-label={`${value}% course progress`} role="img">
      <circle cx="22" cy="22" r="17" fill="none" stroke="#e9e2d4" strokeWidth="4" />
      <motion.circle cx="22" cy="22" r="17" fill="none" stroke="#d86a50" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} animate={{ strokeDashoffset: circumference - (value / 100) * circumference }} transition={{ duration: 0.8, ease: "easeOut" }} />
    </svg>
  );
}

function ModelRibbon({ chapter }: { chapter: CourseModule }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-ink/15 bg-paper/70 p-3.5 sm:p-4" aria-label={`Mental model: ${chapter.model.join(" then ")}`}>
      <div className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-ink"><Waypoints size={13} className="text-coral" /> Sketch the path</div>
      <div className="flex flex-wrap items-center gap-2">
        {chapter.model.map((node, index) => (
          <motion.div key={node} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="contents">
            <span className={`rounded-xl border bg-white/80 px-3 py-2 text-xs font-semibold shadow-[0_2px_0_rgba(46,49,47,.05)] ${toneClasses[chapter.tone].border}`}>{node}</span>
            {index < chapter.model.length - 1 && <ArrowRight aria-hidden="true" size={14} className="text-ink/40" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SectionRail({
  active,
  progress,
  onSelect,
}: {
  active: string;
  progress: Progress;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="paper-card h-fit rounded-[26px] p-4 lg:sticky lg:top-5">
      <div className="flex items-center justify-between px-1 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-ink">Your field notes</p>
          <p className="mt-1 font-display text-lg font-bold">8 small chapters</p>
        </div>
        <div className="rounded-full bg-paper-deep p-2 text-ink/65"><Waypoints size={17} /></div>
      </div>
      <nav aria-label="Course sections" className="sidebar-scroll flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
        {course.map((chapter) => {
          const selected = active === chapter.id;
          const done = progress.completed.includes(chapter.id);
          return (
            <button
              key={chapter.id}
              onClick={() => onSelect(chapter.id)}
              aria-current={selected ? "step" : undefined}
              className={`group flex min-w-[235px] items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all lg:min-w-0 lg:w-full ${selected ? `bg-white ${toneClasses[chapter.tone].border} shadow-sm` : "border-transparent hover:bg-white/60"}`}
            >
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${toneClasses[chapter.tone].chip}`}>
                {done ? <Check size={15} strokeWidth={3} /> : chapter.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold leading-5">{chapter.title}</span>
                <span className="mt-0.5 block text-[10px] text-muted-ink">{chapter.duration} · 10 questions</span>
              </span>
              {selected && <ArrowRight size={15} className="shrink-0 text-coral" />}
            </button>
          );
        })}
      </nav>
      <div className="mt-4 rounded-2xl border border-dashed border-ink/20 bg-paper/70 px-3 py-3">
        <div className="flex items-start gap-2.5">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-sun" />
          <p className="text-[11px] leading-[1.55] text-ink/70">No speed run needed. Build the mental model, then make the quiz teach you where it is still fuzzy.</p>
        </div>
      </div>
    </aside>
  );
}

function Lesson({ chapter, onQuiz }: { chapter: CourseModule; onQuiz: () => void }) {
  return (
    <div className="space-y-5">
      <div className="paper-card relative overflow-hidden rounded-[25px] p-5 sm:p-7">
        <div className="absolute -right-6 -top-9 size-40 rounded-full bg-sun/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${toneClasses[chapter.tone].chip}`}>Chapter {chapter.number}</span>
              <span className="flex items-center gap-1 text-[11px] text-muted-ink"><Clock3 size={13} /> {chapter.duration} read</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[34px]">{chapter.title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-ink">{chapter.subtitle}</p>
            <div className="mt-5 rounded-2xl border-l-[3px] border-coral bg-coral/[0.06] px-4 py-3 text-sm leading-relaxed text-ink/80">
              <span className="handwritten mr-2 text-xs font-bold text-coral">big idea →</span>{chapter.bigIdea}
            </div>
            <ModelRibbon chapter={chapter} />
          </div>
          <div className="hidden h-[150px] w-[230px] shrink-0 sm:block" aria-hidden="true"><DoodlePath /></div>
        </div>
        <div className="mt-6 border-t border-ink/10 pt-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-ink">After this chapter, you can…</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {chapter.goals.map((goal, i) => (
              <div key={goal} className="flex items-start gap-2 rounded-xl bg-white/65 px-3 py-2.5 text-xs leading-relaxed">
                <span className={`mt-px grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${toneClasses[chapter.tone].chip}`}>{i + 1}</span>{goal}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative pl-2 sm:pl-4">
        <div className="absolute bottom-5 left-[20px] top-3 border-l border-dashed border-ink/20 sm:left-[32px]" />
        <div className="space-y-4">
          {chapter.blocks.map((block, index) => (
            <motion.article key={block.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.35 }} className="relative pl-9 sm:pl-12">
              <span className={`absolute left-0 top-5 z-10 grid size-8 place-items-center rounded-full border-2 border-paper text-xs font-extrabold shadow-sm sm:left-1 ${toneClasses[chapter.tone].chip}`}>{index + 1}</span>
              <div className={`paper-card rounded-[22px] p-4 sm:p-6 ${index % 2 === 1 ? "-rotate-[.2deg]" : "rotate-[.15deg]"}`}>
                <h3 className="font-display text-lg font-bold sm:text-xl">{block.title}</h3>
                <p className="mt-2 text-sm leading-[1.8] text-ink/75">{block.story}</p>
                <div className="mt-3 grid gap-2.5">
                  {block.details.map((detail) => <p key={detail} className="text-[13px] leading-[1.8] text-ink/80">{detail}</p>)}
                </div>
                {block.code && <pre className="paper-grid mt-4 overflow-x-auto rounded-2xl border border-ink/10 bg-[#f3f0e7] p-4 font-mono text-[11px] leading-[1.75] text-[#394640] sm:text-xs"><code>{block.code}</code></pre>}
                {block.note && <div className="mt-4 flex gap-2 rounded-xl bg-sun/10 px-3 py-2.5 text-xs leading-relaxed text-ink/75"><Sparkles size={14} className="mt-0.5 shrink-0 text-[#b38420]" /><span>{block.note}</span></div>}
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <div className="paper-card scribble-border rounded-[23px] bg-[#f4f0e4] p-5 sm:ml-12 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage/15 text-[#587b64]"><BookmarkCheck size={17} /></div>
          <div className="flex-1">
            <p className="handwritten text-xs font-bold text-[#587b64]">Field note to keep</p>
            <p className="mt-1.5 text-sm leading-[1.75] text-ink/80">{chapter.fieldNote}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-dashed border-ink/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-ink">Ready to see if the idea holds up under pressure?</p>
          <Button variant="coral" onClick={onQuiz} className="w-full sm:w-auto"><ListChecks size={16} /> Take the 10-question checkpoint <ArrowRight size={15} /></Button>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  selected,
  onSelect,
  showHint,
  onToggleHint,
}: {
  question: Question;
  index: number;
  selected: number | null;
  onSelect: (choice: number) => void;
  showHint: boolean;
  onToggleHint: () => void;
}) {
  const answered = selected !== null;
  const correct = selected === question.answer;
  return (
    <motion.div key={index} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }} className="paper-card rounded-[24px] p-4 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-bold tracking-wide text-paper">QUESTION {String(index + 1).padStart(2, "0")}</span>
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${difficultyClasses[question.difficulty]}`}>{question.difficulty}</span>
        </div>
        <button type="button" onClick={onToggleHint} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-ink transition hover:bg-sun/15 hover:text-ink"><CircleHelp size={14} /> {showHint ? "Hide nudge" : "Need a nudge?"}</button>
      </div>
      {showHint && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 rounded-xl bg-sun/12 px-3 py-2 text-xs leading-relaxed text-ink/75"><span className="font-bold text-[#8b6417]">Tiny nudge: </span>{question.hint}</motion.p>}
      <h3 className="mt-5 max-w-3xl font-display text-xl font-bold leading-[1.45] sm:text-[25px]">{question.prompt}</h3>
      <p className="mt-2 text-xs text-muted-ink">Choose the best answer. The explanation will show after your choice.</p>
      <div className="mt-5 space-y-2.5">
        {question.choices.map((choice, choiceIndex) => {
          const isChosen = selected === choiceIndex;
          const isAnswer = question.answer === choiceIndex;
          let style = "border-ink/12 bg-white/70 hover:border-ink/35 hover:bg-white";
          if (answered && isAnswer) style = "border-sage bg-sage/10 text-[#41654d]";
          else if (answered && isChosen && !correct) style = "border-coral bg-coral/8 text-[#a44f3b]";
          else if (!answered && isChosen) style = "border-coral bg-coral/8";
          return (
            <button key={choice} type="button" onClick={() => onSelect(choiceIndex)} disabled={answered} className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left text-[13px] leading-relaxed transition sm:px-4 sm:py-3.5 ${style} disabled:cursor-default`}>
              <span className={`mt-px grid size-6 shrink-0 place-items-center rounded-lg text-[10px] font-bold ${answered && isAnswer ? "bg-sage text-white" : answered && isChosen ? "bg-coral text-white" : "bg-paper-deep text-ink/65"}`}>{answered && isAnswer ? <Check size={13} strokeWidth={3} /> : String.fromCharCode(65 + choiceIndex)}</span>
              <span>{choice}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 rounded-2xl border p-4 ${correct ? "border-sage/30 bg-sage/10" : "border-coral/25 bg-coral/[0.06]"}`}>
          <p className={`text-xs font-extrabold uppercase tracking-[0.13em] ${correct ? "text-[#587b64]" : "text-coral"}`}>{correct ? "✓ That's the reasoning" : "↗ Let's untangle it"}</p>
          <p className="mt-1.5 text-[13px] leading-[1.75] text-ink/80">{question.explanation}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

function Quiz({
  chapter,
  index,
  setIndex,
  answers,
  setAnswers,
  onFinish,
}: {
  chapter: CourseModule;
  index: number;
  setIndex: (index: number) => void;
  answers: (number | null)[];
  setAnswers: (answers: (number | null)[]) => void;
  onFinish: () => void;
}) {
  const [showHint, setShowHint] = useState(false);
  const question = chapter.quiz[index];
  const selected = answers[index] ?? null;
  const score = answers.reduce((count, value, i) => count + (value === chapter.quiz[i].answer ? 1 : 0), 0);
  const answeredCount = answers.filter((value) => value !== null).length;

  function moveForward() {
    if (selected === null) return;
    if (index === chapter.quiz.length - 1) onFinish();
    else {
      setIndex(index + 1);
      setShowHint(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="paper-card rounded-[22px] px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-coral">Checkpoint · Chapter {chapter.number}</p>
            <p className="mt-1 font-display text-lg font-bold">One question at a time. Think out loud.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-ink"><span className="rounded-full bg-paper-deep px-3 py-1.5 font-semibold">{answeredCount} / 10 answered</span><span className="rounded-full bg-sage/10 px-3 py-1.5 font-semibold text-[#587b64]">{score} right so far</span></div>
        </div>
        <div className="mt-4 flex gap-1.5" aria-label={`Question ${index + 1} of 10`}>
          {chapter.quiz.map((item, i) => <button key={item.prompt} type="button" onClick={() => setIndex(i)} aria-label={`Go to question ${i + 1}`} className={`h-1.5 flex-1 rounded-full transition ${i === index ? "bg-coral" : answers[i] !== null ? (answers[i] === item.answer ? "bg-sage" : "bg-sun") : "bg-paper-deep"}`} />)}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <QuestionCard key={`${chapter.id}-${index}`} question={question} index={index} selected={selected} onSelect={(choice) => { const next = [...answers]; next[index] = choice; setAnswers(next); }} showHint={showHint} onToggleHint={() => setShowHint((current) => !current)} />
      </AnimatePresence>
      <div className="flex items-center justify-between gap-3">
        <Button variant="paper" size="sm" onClick={() => { setIndex(Math.max(0, index - 1)); setShowHint(false); }} disabled={index === 0}><ArrowLeft size={14} /> Previous</Button>
        <p className="hidden text-[11px] text-muted-ink sm:block">You can revisit earlier questions before finishing.</p>
        <Button variant="default" onClick={moveForward} disabled={selected === null || (index === chapter.quiz.length - 1 && answeredCount < chapter.quiz.length)}>{index === chapter.quiz.length - 1 ? (answeredCount < chapter.quiz.length ? "Answer all 10" : "Finish chapter") : "Next question"}<ArrowRight size={15} /></Button>
      </div>
    </div>
  );
}

function Finished({ chapter, score, isLast, onReview, onNext }: { chapter: CourseModule; score: number; isLast: boolean; onReview: () => void; onNext: () => void }) {
  const percent = Math.round((score / chapter.quiz.length) * 100);
  const message = percent >= 80 ? "Your systems instincts are getting sharper." : percent >= 60 ? "Good field work. A few ideas deserve another pass." : "That was a useful diagnostic. Revisit the parts that felt slippery.";
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="paper-card overflow-hidden rounded-[27px]">
      <div className="paper-grid border-b border-ink/10 bg-[#f2efe4] px-5 py-7 text-center sm:px-10 sm:py-10">
        <motion.div initial={{ scale: 0.7, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 180, damping: 12 }} className="mx-auto grid size-[82px] place-items-center rounded-[27px] border border-sun/40 bg-sun/20 text-[#a77819] shadow-sm"><GraduationCap size={37} /></motion.div>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-coral">Chapter {chapter.number} · in the notebook</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold">{score} <span className="text-ink/30">/ {chapter.quiz.length}</span></h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-ink">{message}</p>
        <div className="mx-auto mt-5 h-2 max-w-sm overflow-hidden rounded-full bg-white/70"><motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.8, delay: 0.2 }} className="h-full rounded-full bg-sage" /></div>
      </div>
      <div className="flex flex-col items-center justify-between gap-3 p-5 sm:flex-row sm:px-8">
        <p className="flex items-center gap-2 text-xs text-muted-ink"><CheckCircle2 size={16} className="text-sage" /> Section complete · saved in this browser</p>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button variant="paper" onClick={onReview} className="flex-1 sm:flex-none"><RotateCcw size={14} /> Review quiz</Button>
          <Button variant="coral" onClick={onNext} className="flex-1 sm:flex-none">{isLast ? "Back to course map" : "Next chapter"} <ArrowRight size={14} /></Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CourseExperience() {
  const [activeId, setActiveId] = useState(course[0].id);
  const [view, setView] = useState<View>("lesson");
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null));
  const [progress, setProgress] = useState<Progress>({ completed: [], scores: {} });
  const [ready, setReady] = useState(false);
  const chapter = useMemo(() => course.find((item) => item.id === activeId) ?? course[0], [activeId]);
  const completed = progress.completed.includes(chapter.id);
  const percent = Math.round((progress.completed.length / course.length) * 100);
  const score = answers.reduce((count, answer, index) => count + (answer === chapter.quiz[index]?.answer ? 1 : 0), 0);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Progress;
        if (Array.isArray(parsed.completed) && parsed.scores && typeof parsed.scores === "object") setProgress(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, ready]);

  function selectChapter(id: string) {
    setActiveId(id);
    setView("lesson");
    setQuizIndex(0);
    setAnswers(Array(10).fill(null));
  }

  function beginQuiz() {
    setAnswers(Array(chapter.quiz.length).fill(null));
    setQuizIndex(0);
    setView("quiz");
  }

  function finishQuiz() {
    const finalScore = answers.reduce((count, answer, index) => count + (answer === chapter.quiz[index].answer ? 1 : 0), 0);
    setProgress((current) => ({
      completed: current.completed.includes(chapter.id) ? current.completed : [...current.completed, chapter.id],
      scores: { ...current.scores, [chapter.id]: finalScore },
    }));
    setView("finished");
  }

  function nextChapter() {
    const currentIndex = course.findIndex((item) => item.id === chapter.id);
    if (currentIndex === course.length - 1) {
      setView("lesson");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const next = course[currentIndex + 1];
    selectChapter(next.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const moduleScore = progress.scores[chapter.id] ?? score;

  return (
    <MotionConfig reducedMotion="user">
    <main className="min-h-screen px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
      <div className="mx-auto max-w-[1450px]">
        <header className="paper-card flex items-center justify-between gap-3 rounded-[22px] px-4 py-3 sm:px-6">
          <button type="button" onClick={() => { setView("lesson"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex min-w-0 items-center gap-2.5 text-left">
            <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-coral text-white shadow-sm"><Waypoints size={20} /></span>
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-extrabold tracking-tight sm:text-base">THE 10M ROW FIELD GUIDE</span>
              <span className="hidden text-[10px] font-medium tracking-wide text-muted-ink sm:block">a doodle-filled course in backend thinking</span>
            </span>
          </button>
          <div className="flex items-center gap-2 rounded-2xl bg-white/65 py-1 pl-3 pr-1.5">
            <div className="hidden text-right sm:block"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-ink">Course progress</p><p className="text-xs font-bold">{progress.completed.length} of 8 chapters</p></div>
            <ProgressRing value={percent} />
          </div>
        </header>

        <section className="relative mt-4 overflow-hidden rounded-[28px] border border-ink/10 bg-[#efe8d8] px-5 py-6 sm:px-8 sm:py-7 lg:px-10">
          <div className="absolute -left-16 -top-20 size-56 rounded-full bg-sage/10 blur-3xl" />
          <div className="absolute -bottom-24 right-[25%] size-56 rounded-full bg-coral/10 blur-3xl" />
          <div className="relative grid items-center gap-5 sm:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-ink/15 bg-paper/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.17em]">Backend systems · sketchbook edition</span><span className="handwritten text-xs text-coral">start with why</span></div>
              <h1 className="mt-4 max-w-[640px] font-display text-[34px] font-black leading-[1.04] tracking-[-0.045em] sm:text-[52px] lg:text-[60px]">Ten million rows.<br /><span className="hand-underline text-coral">One better question.</span></h1>
              <p className="mt-5 max-w-xl text-sm leading-[1.75] text-ink/75 sm:text-[15px]">A hands-on path from SQL fundamentals to safe large-scale migrations. Follow the sketches, challenge your assumptions, and let each ten-question checkpoint teach you something new.</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button variant="coral" size="lg" onClick={() => { setView("lesson"); document.getElementById("current-chapter")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Open chapter {chapter.number} <ArrowDown size={16} /></Button>
                <span className="flex items-center gap-1.5 text-xs text-muted-ink"><ListChecks size={15} /> {course.length} chapters · {totalQuestions} teaching questions</span>
              </div>
            </div>
            <div className="relative mx-auto hidden h-[210px] w-full max-w-[460px] sm:block lg:h-[240px]" aria-label="Sketch of a query turning into batches and a steady database write">
              <DoodlePath />
              <span className="absolute bottom-1 right-4 rotate-[-5deg] rounded-lg border border-sun/40 bg-sun/25 px-3 py-1.5 handwritten text-xs text-ink/75">little by little ✎</span>
            </div>
          </div>
          <div className="relative mt-7 grid grid-cols-4 gap-2 border-t border-ink/10 pt-4 sm:grid-cols-8 sm:gap-3">
            {course.map((item, i) => <button key={item.id} type="button" onClick={() => { selectChapter(item.id); document.getElementById("current-chapter")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="group flex items-center gap-2 text-left" aria-label={`Open chapter ${i + 1}: ${item.title}`}>
              <span className={`grid size-7 shrink-0 place-items-center rounded-full border border-ink/10 text-[9px] font-bold transition group-hover:-translate-y-0.5 ${progress.completed.includes(item.id) ? "bg-sage text-white" : toneClasses[item.tone].soft}`}>{progress.completed.includes(item.id) ? <Check size={13} /> : item.number}</span>
              <span className="hidden min-w-0 truncate text-[10px] font-medium text-muted-ink md:block">{item.title.split(" ").slice(0, 2).join(" ")}</span>
            </button>)}
          </div>
          <motion.div className="pointer-events-none absolute right-4 top-4 text-coral/60" animate={{ rotate: [0, 5, 0], y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}><ArrowUpRight size={22} /></motion.div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
          <SectionRail active={chapter.id} progress={progress} onSelect={selectChapter} />
          <section id="current-chapter" className="min-w-0 scroll-mt-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-ink"><span className="font-semibold text-ink">Notebook</span><CornerDownRight size={13} /><span className="truncate">Chapter {chapter.number} / 08</span></div>
              {completed && <span className="flex items-center gap-1 rounded-full bg-sage/15 px-2.5 py-1 text-[10px] font-bold text-[#587b64]"><CheckCircle2 size={13} /> completed · {progress.scores[chapter.id] ?? 0}/10</span>}
            </div>
            <div className="mb-4 flex w-fit items-center gap-1 rounded-full border border-ink/10 bg-white/65 p-1">
              <button type="button" onClick={() => setView("lesson")} className={`rounded-full px-4 py-2 text-xs font-bold transition ${view === "lesson" ? "bg-ink text-paper shadow-sm" : "text-muted-ink hover:bg-white"}`}><span className="flex items-center gap-1.5"><GraduationCap size={14} /> Learn</span></button>
              <button type="button" onClick={() => { if (view !== "quiz") { setView("quiz"); setQuizIndex(0); setAnswers(Array(chapter.quiz.length).fill(null)); } }} className={`rounded-full px-4 py-2 text-xs font-bold transition ${view === "quiz" ? "bg-ink text-paper shadow-sm" : "text-muted-ink hover:bg-white"}`}><span className="flex items-center gap-1.5"><ListChecks size={14} /> Check your thinking <span className="rounded-full bg-sun/35 px-1.5 py-0.5 text-[9px]">10</span></span></button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={`${chapter.id}-${view}`} initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                {view === "lesson" && <Lesson chapter={chapter} onQuiz={() => { setAnswers(Array(chapter.quiz.length).fill(null)); setQuizIndex(0); setView("quiz"); }} />}
                {view === "quiz" && <Quiz chapter={chapter} index={quizIndex} setIndex={setQuizIndex} answers={answers} setAnswers={setAnswers} onFinish={finishQuiz} />}
                {view === "finished" && <Finished chapter={chapter} score={moduleScore} isLast={chapter.id === course[course.length - 1].id} onReview={beginQuiz} onNext={nextChapter} />}
              </motion.div>
            </AnimatePresence>

            <footer className="mt-5 flex flex-col gap-3 rounded-[20px] border border-dashed border-ink/15 bg-white/35 px-4 py-3 text-xs text-muted-ink sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2"><span className="handwritten text-coral">✎</span> Keep asking what happens at the boundary: before, during, and after a crash.</p>
              <button type="button" onClick={nextChapter} className="flex items-center gap-1 font-bold text-ink hover:text-coral">Peek at the next chapter <ChevronDown className="-rotate-90" size={14} /></button>
            </footer>
          </section>
        </div>
        <div className="mt-5 flex flex-col items-start justify-between gap-2 border-t border-ink/10 px-2 py-4 text-[10px] text-muted-ink sm:flex-row sm:items-center">
          <p>Made for curious backend builders <span className="text-coral">✿</span> Learn the reasoning; leave the MCQ for later.</p>
          <a href="https://www.postgresql.org/docs/current/" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-ink">PostgreSQL docs <ArrowUpRight size={11} /></a>
        </div>
      </div>
    </main>
    </MotionConfig>
  );
}
