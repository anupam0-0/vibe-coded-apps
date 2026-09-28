"use client";

import { useEffect, useState } from "react";
import type { PracticalLab } from "../practical-labs";
import type { Chapter } from "../course-data";

const STORAGE_KEY = "operators-reel-bench-v1";

type SavedLab = { draft: string; checked: number[] };

function readSaved(key: string): SavedLab | undefined {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return undefined;
    const parsed: unknown = JSON.parse(value);
    if (
      parsed &&
      typeof parsed === "object" &&
      "draft" in parsed &&
      typeof parsed.draft === "string" &&
      "checked" in parsed &&
      Array.isArray(parsed.checked) &&
      parsed.checked.every((item) => typeof item === "number")
    ) {
      return { draft: parsed.draft, checked: parsed.checked };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export default function HandsOnLab({
  chapterId,
  lab,
  practice,
}: {
  chapterId: string;
  lab: Chapter["lab"];
  practice: PracticalLab;
}) {
  const storageKey = `${STORAGE_KEY}:${chapterId}`;
  const [draft, setDraft] = useState(practice.starterCode);
  const [checked, setChecked] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [solutionCopied, setSolutionCopied] = useState(false);

  useEffect(() => {
    const saved = readSaved(storageKey);
    if (saved) {
      setDraft(saved.draft);
      setChecked(saved.checked.filter((index) => index >= 0 && index < practice.checkpoints.length));
    } else {
      setDraft(practice.starterCode);
      setChecked([]);
    }
    setReady(true);
  }, [practice.checkpoints.length, practice.starterCode, storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ draft, checked }));
    } catch {
      // The lab still works when browser storage is unavailable.
    }
  }, [checked, draft, ready, storageKey]);

  async function copyCode(value: string, isSolution = false) {
    try {
      await navigator.clipboard.writeText(value);
      if (isSolution) {
        setSolutionCopied(true);
        window.setTimeout(() => setSolutionCopied(false), 1400);
      } else {
        setCopyMessage("Copied. Paste it into your local terminal or file.");
        window.setTimeout(() => setCopyMessage(""), 2200);
      }
    } catch {
      if (!isSolution) setCopyMessage("Copy was blocked by this browser. Select the code and copy it manually.");
    }
  }

  function toggleCheckpoint(index: number) {
    setChecked((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index].sort(),
    );
  }

  function resetDraft() {
    setDraft(practice.starterCode);
    setChecked([]);
    setCopyMessage("");
  }

  return (
    <section className="field-lab hands-on-lab" id="field-lab">
      <div className="lab-head">
        <div>
          <span className="eyebrow">LOCAL BENCH · WRITE, RUN, INSPECT</span>
          <h2>{lab.title}</h2>
        </div>
        <span className="lab-badge">HANDS<br />ON</span>
      </div>
      <p className="lab-intro">{practice.mission}</p>

      <div className="bench-environment">
        <span>WHAT YOU NEED</span>
        <p>{practice.environment}</p>
      </div>

      <details className="bench-task-list" open>
        <summary>Open the task sequence <span>{lab.steps.length} steps</span></summary>
        <ol>{lab.steps.map((step) => <li key={step}><span>{step}</span></li>)}</ol>
      </details>

      <div className="bench-workspace">
        <div className="bench-editor">
          <div className="bench-editor-bar">
            <span><i aria-hidden="true" /> {practice.codeFile}</span>
            <div>
              <button type="button" onClick={resetDraft}>Reset draft</button>
              <button type="button" className="bench-copy-button" onClick={() => copyCode(draft)}>Copy code</button>
            </div>
          </div>
          <label className="sr-only" htmlFor={`bench-editor-${chapterId}`}>Editable starter code for {practice.codeFile}</label>
          <textarea
            id={`bench-editor-${chapterId}`}
            className="bench-code-editor"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-describedby={`bench-run-${chapterId}`}
          />
          <div className="bench-editor-foot">
            <span>{ready ? "Draft saved in this browser" : "Restoring your draft…"}</span>
            <span>{draft.split("\n").length} lines · edit freely</span>
          </div>
          {copyMessage && <p className="bench-copy-status" role="status">{copyMessage}</p>}
        </div>

        <aside className="bench-run-card" id={`bench-run-${chapterId}`}>
          <span className="eyebrow">RUN IT LOCALLY</span>
          <p>Finish the TODOs, save your draft using the filename above, then run it in the environment listed here.</p>
          <pre><code>{practice.runInstructions}</code></pre>
          <div className="bench-safety-note">This page does not execute shell commands. You run and inspect the exercise on your own local machine.</div>
        </aside>
      </div>

      <div className="bench-review-grid">
        <section className="bench-checkpoints">
          <div className="bench-subhead">
            <div><span className="eyebrow">CHECK YOUR WORK</span><h3>Bench checkpoints</h3></div>
            <span>{checked.length}/{practice.checkpoints.length} done</span>
          </div>
          <div className="bench-checklist">
            {practice.checkpoints.map((checkpoint, index) => (
              <label className={checked.includes(index) ? "is-checked" : ""} key={checkpoint}>
                <input type="checkbox" checked={checked.includes(index)} onChange={() => toggleCheckpoint(index)} />
                <span>{checkpoint}</span>
              </label>
            ))}
          </div>
          <div className="bench-expected"><span>EXPECTED RESULT</span><p>{practice.expectedResult}</p></div>
        </section>

        <div className="bench-guides">
          <details className="bench-disclosure">
            <summary><span>Hint</span><b>Need a nudge?</b><i>+</i></summary>
            <p>{practice.hint}</p>
          </details>
          <details className="bench-disclosure bench-solution">
            <summary><span>Reference</span><b>Reveal a working solution</b><i>+</i></summary>
            <div className="bench-solution-body">
              <p>Try the task first, then compare your version. Explain each line before you reuse it.</p>
              <pre><code>{practice.solution}</code></pre>
              <button type="button" onClick={() => copyCode(practice.solution, true)}>{solutionCopied ? "Copied" : "Copy solution"}</button>
            </div>
          </details>
          <div className="bench-stretch"><span>LEVEL UP</span><p>{practice.stretch}</p></div>
        </div>
      </div>

      <div className="lab-success"><span>✓ SUCCESS LOOKS LIKE</span><p>{lab.success}</p></div>
    </section>
  );
}
