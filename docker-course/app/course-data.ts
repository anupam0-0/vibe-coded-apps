export type Difficulty = "Warm-up" | "Working" | "Stretch";

export type LessonSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  code?: string;
  note?: string;
};

export type RecallQuestion = { question: string; answer: string; from?: string };
export type MCQ = {
  question: string;
  choices: string[];
  answer: number;
  why: string;
  difficulty: Difficulty;
};
export type OpenQuestion = { question: string; model: string; difficulty: Difficulty };

export type Chapter = {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  objectives: string[];
  sections: LessonSection[];
  lab: { title: string; steps: string[]; success: string };
  recall: RecallQuestion[];
  mcqs: MCQ[];
  interview: OpenQuestion[];
  scenarios: OpenQuestion[];
};

export type Subject = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  prerequisites: { label: string; href: string }[];
  references: { label: string; href: string; helps: string }[];
  chapters: Chapter[];
};

const q = (
  question: string,
  choices: string[],
  answer: number,
  why: string,
  difficulty: Difficulty,
): MCQ => ({ question, choices, answer, why, difficulty });

const open = (
  question: string,
  model: string,
  difficulty: Difficulty,
): OpenQuestion => ({ question, model, difficulty });

export const subjects: Subject[] = [
  {
    id: "terminal-bash",
    number: "01",
    title: "Terminal & Bash",
    shortTitle: "Terminal",
    description: "Learn to talk to a Unix-like system: run commands, compose tools, inspect processes, and automate safely.",
    color: "tomato",
    prerequisites: [{ label: "No prerequisites — start here", href: "/" }],
    references: [
      { label: "MIT Missing Semester", href: "https://missing.csail.mit.edu/", helps: "Shell fluency, command-line editing, pipes, and working efficiently in a terminal." },
      { label: "The Linux Command Line · William Shotts", href: "https://linuxcommand.org/tlcl.php", helps: "A structured first book for files, processes, text tools, and shell scripting." },
      { label: "BashGuide · Greg's Wiki", href: "https://mywiki.wooledge.org/BashGuide", helps: "Careful Bash syntax, quoting, expansions, and beginner-friendly script practices." },
    ],
    chapters: [
      {
        id: "command-line-foundations",
        title: "A command is a tiny program",
        subtitle: "Terminal, shell, commands, paths, quoting, and help",
        minutes: 28,
        objectives: ["Distinguish a terminal from a shell and a command", "Read command names, options, and arguments", "Navigate paths and use built-in help", "Predict how quotes and expansions change an argument"],
        sections: [
          { title: "Terminal, shell, and process", paragraphs: ["A terminal is the text interface: it displays input and output. A shell is the program inside it that reads your command line, expands its syntax, and starts other programs. Bash is one shell. `ls`, `grep`, and `docker` are separate programs the shell can launch.", "When you press Enter, Bash parses the line, performs expansions, finds a command through its built-ins or `$PATH`, starts it, and reports its exit status. Keeping these roles straight helps you diagnose whether a problem is in the terminal, shell syntax, executable, or environment."], bullets: ["`pwd` prints the current working directory; relative paths start there.", "`command -v NAME` shows how Bash resolves a command.", "`type NAME` can distinguish a shell builtin from an external program."], code: "pwd\ncommand -v bash\ntype cd\nhelp cd\nman ls" },
          { title: "Anatomy of a command", paragraphs: ["A simple command is usually a program followed by options and operands. Options tune behavior; operands name the things to operate on. A space separates shell words, so a filename containing spaces must be quoted or escaped.", "Option conventions vary. Many tools accept `--` to mark the end of options, which is useful when a filename begins with a dash. Read a command's own help before assuming every utility follows the same rules."], code: "ls -lah ./notes\nprintf '%s\\n' 'two words'\nrm -- -old-draft" },
          { title: "Paths and directory movement", paragraphs: ["The filesystem is a tree rooted at `/`. `.` means the current directory and `..` means its parent. An absolute path starts at `/`; a relative path is interpreted from the current directory. `~` is expanded by Bash to your home directory.", "Use `cd` to change the shell's working directory. `mkdir -p` creates missing parent directories as needed. Build the habit of checking `pwd` before commands that modify or remove files."], bullets: ["`/var/log/app.log` is absolute; `logs/app.log` is relative.", "`cd -` jumps back to the previous working directory.", "`ls -la` includes hidden entries whose names begin with a dot."], code: "cd ~/projects/demo\npwd\nmkdir -p notes/drafts\ncd -" },
          { title: "Quoting and expansion", paragraphs: ["The shell does not pass your line to a program verbatim. It recognizes syntax first. Single quotes preserve every character literally; double quotes preserve most characters while still allowing selected expansions such as `$HOME`. Unquoted whitespace splits words, and wildcard characters can expand to matching filenames.", "When a value must stay one argument, quote the expansion: `$file`. This is the everyday defense against spaces, empty values, and accidental wildcard expansion. Prefer `$(command)` for command substitution; it is easier to read and nest than backticks."], code: "name='Ada Lovelace'\nprintf 'Hello, %s\\n' \"$name\"\nfor file in *.log; do printf '%s\\n' \"$file\"; done", note: "Quoting preserves argument boundaries. It does not make a command safe by itself: inspect variables before using them with destructive operations." },
        ],
        lab: { title: "Make a safe command-line workspace", steps: ["Create a directory named `cli-lab` under your home directory.", "Inside it, create `drafts` and `logs` with one `mkdir -p` command.", "Create a file whose name contains a space, then list hidden and ordinary files.", "Use `command -v`, `type`, and `help` or `man` to inspect three commands."], success: "You can explain where you are, what each command resolves to, and why the spaced filename stays one argument." },
        recall: [
          { question: "Before starting a command with a relative path, what tells you how that path will be interpreted?", answer: "The shell's current working directory, which `pwd` prints." },
          { question: "What is the difference between the terminal and Bash?", answer: "The terminal presents text input/output; Bash parses shell syntax and launches commands." },
          { question: "Why write `\"$file\"` instead of `$file`?", answer: "Quoting preserves the expansion as one argument and prevents word splitting and wildcard expansion." },
          { question: "What does `..` mean in a path?", answer: "The parent directory of the current directory." },
          { question: "When would `command -v tool` help?", answer: "When checking whether a command exists and how the shell resolves its name." },
        ],
        mcqs: [
          q("Which program interprets Bash syntax such as `$HOME` and `*.log`?", ["The terminal emulator", "The shell", "The filesystem", "The CPU scheduler"], 1, "The shell parses and expands the command line before starting programs.", "Warm-up"),
          q("What does `pwd` report?", ["The previous command's status", "The current working directory", "The home directory's size", "The active user"], 1, "`pwd` prints the current directory used to interpret relative paths.", "Warm-up"),
          q("Which path is absolute?", ["`../images`", "`~/images` before expansion", "`/var/log/app.log`", "`images/app.log`"], 2, "An absolute Unix path begins at the root directory `/`.", "Warm-up"),
          q("What does single quoting do to `$HOME`?", ["Expands it to the home path", "Passes the characters literally", "Deletes the dollar sign", "Runs a command named HOME"], 1, "Inside single quotes Bash preserves the enclosed characters literally.", "Working"),
          q("Why use `--` in `rm -- -draft`?", ["It enables recursive removal", "It ends option parsing so `-draft` is a filename", "It asks for confirmation", "It expands the filename"], 1, "Many utilities treat `--` as the end of options, preventing a dash-leading filename from being parsed as a flag.", "Working"),
          q("What does `type cd` often reveal?", ["That `cd` is a shell builtin", "That `cd` is a network protocol", "The directory size", "The command's exit code"], 0, "`cd` changes the shell process's own working directory, so it is normally built into the shell.", "Working"),
          q("Which expression captures command output in Bash?", ["`$(command)`", "`{command}`", "`<command>`", "`@command`"], 0, "Command substitution runs a command and substitutes its standard output.", "Working"),
          q("In `cat \"$path\"`, what happens if `$path` contains spaces?", ["It remains one argument", "It splits at each space", "Bash removes the spaces", "The command is always rejected"], 0, "Double-quoting an expansion preserves the value as a single argument.", "Stretch"),
          q("A command works in one folder but not another. Which first check is most useful?", ["Change the file permissions blindly", "Check `pwd` and whether the path is relative", "Restart the terminal", "Reinstall Bash"], 1, "Relative paths depend on the current directory, so confirm that context first.", "Stretch"),
          q("What is the safest habit before running a destructive command with a variable path?", ["Leave it unquoted so it is visible", "Print and inspect the expanded target first", "Add `sudo`", "Run it from `/`"], 1, "Inspecting the actual target catches empty, malformed, or unexpectedly broad expansions before damage occurs.", "Stretch"),
        ],
        interview: [
          open("Explain the difference between a terminal, a shell, and a command.", "A terminal handles the text interface, a shell parses input and launches work, and a command is a builtin or executable the shell runs.", "Warm-up"),
          open("How do relative paths differ from absolute paths?", "An absolute path starts at `/`; a relative path is resolved from the process's current working directory.", "Warm-up"),
          open("Explain why shell quoting matters when handling filenames.", "Unquoted expansions can split on whitespace and expand glob characters. Quoting keeps the intended value together as one argument.", "Working"),
          open("How would you find out whether a command is installed or built into Bash?", "I would use `command -v name` or `type name`, then consult `name --help` or its manual page for usage.", "Working"),
          open("A command says 'file not found' even though the file exists. What would you inspect?", "I would check `pwd`, the exact spelling and case, whether the path is absolute or relative, and whether quoting preserved spaces or special characters.", "Stretch"),
        ],
        scenarios: [
          open("You need to inspect `meeting notes.txt` without renaming it. What command shape would you use and why?", "Use a quoted path, for example `less \"meeting notes.txt\"`, so the shell passes one filename argument.", "Warm-up"),
          open("A script is looking for `config.yml` in the wrong folder. What two checks come first?", "Print the working directory and inspect whether the script uses a relative path; then decide whether to use a known absolute path or set the intended working directory.", "Warm-up"),
          open("A file named `-backup` must be removed. How do you avoid treating it as an option?", "Use `rm -- -backup` after confirming the current directory and target. `--` ends option parsing for common utilities.", "Working"),
          open("A path comes from user input and may contain spaces or `*`. How should a Bash script pass it to a command?", "Store it in a variable and quote the expansion, such as `tool -- \"$path\"`; validate the target if the action is destructive.", "Working"),
          open("A command exists but Bash reports it cannot be found. Give a diagnostic sequence.", "Run `command -v name`, inspect `$PATH`, verify the executable location and permissions, then check whether the current shell has stale command lookup state or requires an explicit path.", "Stretch"),
        ],
      },
      {
        id: "pipes-and-text-tools",
        title: "Make small tools work together",
        subtitle: "Standard streams, redirection, pipelines, filters, and exit status",
        minutes: 32,
        objectives: ["Trace stdin, stdout, and stderr", "Redirect output without confusing logs and data", "Build pipelines from small filters", "Use exit status to make decisions"],
        sections: [
          { title: "Three standard streams", paragraphs: ["Every process starts with standard input (fd 0), standard output (fd 1), and standard error (fd 2). By convention, useful results go to stdout and diagnostics go to stderr. This separation lets another program consume data without swallowing warnings.", "A terminal normally connects all three to your screen and keyboard. Redirection changes those connections for one command. `>` replaces a file, `>>` appends, `<` supplies input, and `2>` redirects error output."], code: "command >results.txt 2>errors.txt\ncommand >>results.txt\nwc -l <results.txt" },
          { title: "Pipelines are stream connections", paragraphs: ["The pipe operator `|` connects the stdout of one command to the stdin of the next. A pipeline is a data flow: each command should do one transformation, and the output shape of one stage should suit the next.", "Start by making a command work alone, then add one stage at a time. `grep` selects matching lines; `sort` orders them; `uniq -c` counts adjacent identical lines, so sorting first is usually necessary. `cut` extracts delimited fields; `sed` can perform simple stream edits."], bullets: ["Use `head` and `tail` to inspect a sample before processing a large file.", "Prefer `grep -F` for a literal string; plain `grep` treats the pattern as a regular expression.", "A pipeline can hide an earlier failure unless you inspect all pipeline statuses or enable `pipefail` in scripts."], code: "grep -F 'ERROR' app.log | cut -d' ' -f1 | sort | uniq -c | sort -nr | head" },
          { title: "Exit codes and conditional execution", paragraphs: ["A process returns an integer status when it exits. Zero conventionally means success; non-zero means some kind of failure or special condition. Bash stores the most recent foreground command's status in `$?`, but it changes after every command, so test it immediately or use a conditional directly.", "`&&` runs the next command only after success; `||` runs it after failure. In a pipeline, Bash normally reports the last command's status. `set -o pipefail` makes a script report failure if any pipeline stage failed."], code: "if grep -qF 'ready' status.txt; then\n  printf '%s\\n' 'service is ready'\nelse\n  printf '%s\\n' 'service not ready' >&2\nfi\n\nset -o pipefail\nproducer | transformer | consumer" },
          { title: "Find the right tool boundary", paragraphs: ["Text tools are valuable because they compose, but not every format is plain text. A JSON file should normally be queried with a JSON-aware tool; parsing it with a chain of fragile regular expressions breaks when whitespace or nesting changes.", "Quote patterns and filenames deliberately. Shell globs, regular expressions, and program-specific patterns are different languages. When a result looks surprising, print each stage's output to a temporary file or run the pipeline one command at a time."], note: "Pipeline debugging: temporarily remove the final stages, inspect the upstream output, then add filters back one by one." },
        ],
        lab: { title: "Build a log summary", steps: ["Create a small text file with timestamps, INFO lines, and repeated ERROR lines.", "Select error lines with `grep`, extract a field with `cut` or `awk`, and count repeated values with `sort | uniq -c`.", "Redirect the summary to a file while leaving diagnostics visible on the terminal.", "Make a deliberate failing command and observe how `&&`, `||`, and `pipefail` behave."], success: "You can identify which stream each output uses and explain which pipeline stage determines success." },
        recall: [
          { question: "What does quoting an expansion preserve?", answer: "It keeps its value as one argument, even if it contains spaces or wildcard characters.", from: "A command is a tiny program" },
          { question: "What are stdout and stderr for by convention?", answer: "Stdout carries normal results; stderr carries diagnostics and error messages." },
          { question: "What does `|` connect?", answer: "The left command's standard output to the right command's standard input." },
          { question: "Why do `sort | uniq -c` appear together?", answer: "`uniq` only combines adjacent identical lines, so sorting groups duplicates first." },
          { question: "What does a zero exit status usually mean?", answer: "The command completed successfully according to its own convention." },
        ],
        mcqs: [
          q("Which file descriptor is standard error?", ["0", "1", "2", "3"], 2, "The conventional descriptors are stdin 0, stdout 1, and stderr 2.", "Warm-up"),
          q("What does `>` do to an existing destination file?", ["Appends to it", "Replaces/truncates it", "Reads from it", "Sends output to stderr"], 1, "Output redirection with `>` creates or truncates the destination before writing.", "Warm-up"),
          q("In `a | b`, where does `a`'s stdout go?", ["To `b`'s stdin", "To `b`'s stderr", "To a file named `b`", "It is discarded"], 0, "A pipe connects one process's standard output to the next process's standard input.", "Warm-up"),
          q("Why does `sort names | uniq -c` usually count duplicates correctly?", ["`uniq` sorts internally", "Sorting places equal lines next to each other", "The pipe removes duplicates", "`sort` counts lines"], 1, "`uniq` only combines adjacent lines, so sort groups equal values together.", "Working"),
          q("What is the usual convention for a successful process exit?", ["Status 0", "Status 1", "Any even number", "No status"], 0, "Unix tools conventionally use zero for success and non-zero for failure or other conditions.", "Working"),
          q("What does `cmd1 && cmd2` mean?", ["Always run both concurrently", "Run `cmd2` only if `cmd1` succeeds", "Pipe `cmd1` to `cmd2`", "Run `cmd2` if `cmd1` fails"], 1, "`&&` is conditional sequencing based on the prior command's success status.", "Working"),
          q("How do you preserve a diagnostic while saving stdout to a file?", ["`cmd >out.txt`", "`cmd 2>out.txt`", "`cmd 1>&2`", "`cmd <out.txt`"], 0, "Redirecting fd 1 sends stdout to the file; stderr remains on its existing destination.", "Working"),
          q("What does `set -o pipefail` change in Bash?", ["It makes pipes run in parallel", "A pipeline can fail when an earlier stage fails", "It redirects stderr", "It retries each command"], 1, "Without pipefail, the pipeline status usually reflects only the last command; pipefail accounts for failed stages.", "Stretch"),
          q("A JSON pipeline breaks when spaces are added around a colon. What is the best improvement?", ["Add more `grep` calls", "Use a JSON-aware parser", "Remove all spaces from the file", "Redirect stderr to stdout"], 1, "Nested structured data should be parsed with a tool that understands JSON syntax.", "Stretch"),
          q("A long pipeline produces an empty result. What is the best first debugging move?", ["Rewrite every stage", "Run and inspect each stage progressively", "Add `sudo`", "Increase the terminal width"], 1, "Inspecting intermediate output localizes the stage where expected data disappears.", "Stretch"),
        ],
        interview: [
          open("Describe stdin, stdout, and stderr and why there are three.", "They are standard input, normal output, and diagnostic output. Separate streams make it possible to pipe data while keeping warnings visible or logging them elsewhere.", "Warm-up"),
          open("What is a pipeline, and what makes one maintainable?", "A pipeline connects process streams. Small stages with clear input/output roles, quoting, and inspectable intermediate results are easier to reason about.", "Warm-up"),
          open("Why can `grep pattern file | sort | uniq -c` be useful?", "It filters matching lines, orders them, then counts adjacent duplicates; each tool handles a narrow transformation.", "Working"),
          open("Explain the difference between `&&`, `||`, and `|`.", "`&&` conditionally sequences after success, `||` conditionally sequences after failure, and `|` connects stdout to stdin.", "Working"),
          open("How can a Bash script avoid silently accepting a broken pipeline?", "Enable `set -o pipefail` and check command statuses; also send diagnostics to stderr and keep error handling explicit.", "Stretch"),
        ],
        scenarios: [
          open("You need to save command results but still see its error messages. What redirection do you use?", "Use `command >results.txt`; stdout is saved and stderr remains on the terminal. Add `2>errors.txt` only if you also want a separate error log.", "Warm-up"),
          open("A count report undercounts repeated lines. The command uses `uniq -c` on unsorted input. How do you fix it?", "Sort the values before counting: `sort input | uniq -c` (or use an aggregation tool suited to the data).", "Warm-up"),
          open("A pipeline's last command succeeds even though the first command failed. What Bash setting helps?", "Use `set -o pipefail`, then handle the pipeline's non-zero status so the script stops or reports the failure.", "Working"),
          open("A regex-looking search matches too many lines because the target contains punctuation. What do you change?", "Use fixed-string mode such as `grep -F` when the target is literal, and quote the shell argument.", "Working"),
          open("A report pipeline returns no rows. Describe a disciplined way to find the failing stage.", "Run the source command first, inspect its output, then add one filter at a time while checking exit codes and intermediate results; verify field delimiters and pattern semantics.", "Stretch"),
        ],
      },
      {
        id: "bash-scripting-processes",
        title: "Turn repeat work into a safe script",
        subtitle: "Variables, functions, control flow, processes, signals, and jobs",
        minutes: 36,
        objectives: ["Write a small script with arguments and clear output", "Understand processes, PIDs, signals, and jobs", "Handle failures and cleanup intentionally", "Avoid common quoting and destructive-operation mistakes"],
        sections: [
          { title: "A script is a command interface", paragraphs: ["A shell script is a file of commands that Bash reads non-interactively. A shebang such as `#!/usr/bin/env bash` selects Bash when the file is executed directly. The executable bit controls direct execution; alternatively run `bash script.sh`.", "Arguments arrive in `$1`, `$2`, and so on. Use `$@` to forward the original argument list without collapsing boundaries. Put repeated logic in functions, validate required inputs early, and send usage errors to stderr."], code: "#!/usr/bin/env bash\nset -o nounset -o pipefail\n\nusage() { printf 'Usage: %s FILE\\n' \"${0##*/}\" >&2; }\nif (($# != 1)); then usage; exit 2; fi\nfile=$1\nprintf 'Inspecting: %s\\n' \"$file\"\nwc -l -- \"$file\"" },
          { title: "Variables, conditions, and loops", paragraphs: ["Bash variables are textual values; assignments have no spaces around `=`. Quote expansions when passing values as words. Prefer `[[ ... ]]` for Bash conditionals, arithmetic expressions `(( ... ))` for integer tests, and `case` for matching several known forms.", "Loops should handle filenames safely. `for file in *.log` expands matching names as distinct words, including names with spaces. Avoid parsing the output of `ls`; use globs or `find` with a null-delimited interface when handling arbitrary names."], code: "for file in ./*.log; do\n  [[ -e \"$file\" ]] || continue\n  printf 'lines=%s file=%s\\n' \"$(wc -l < \"$file\")\" \"$file\"\ndone" },
          { title: "Processes, jobs, and signals", paragraphs: ["A process is a running program instance with a PID, environment, open files, and resource usage. `ps` shows a snapshot; `top` or `htop` gives a changing view. A parent process starts child processes. A shell normally waits for a foreground command to finish.", "Append `&` to start a job in the background. `jobs` lists jobs known to the current shell; `fg` and `bg` move them between foreground and background. `Ctrl-C` normally sends SIGINT to the foreground process group. `kill PID` sends SIGTERM by default, allowing cleanup; SIGKILL should be a last resort because it cannot be caught."], code: "sleep 300 &\njobs\nps -o pid,ppid,stat,cmd -p \"$!\"\nkill \"$!\"" },
          { title: "Failures and cleanup", paragraphs: ["`set -e` changes how Bash reacts to non-zero commands, but its exceptions in conditionals, functions, and pipelines can surprise even experienced writers. Do not treat it as a complete error-handling design. Check critical commands explicitly and use `trap` to clean temporary resources on exit or signals.", "Write destructive scripts in stages: validate arguments, resolve and print targets, refuse dangerous roots or empty values, then act. Idempotence matters: running the script again should not corrupt a good state or cause an unexpected second action."], code: "tmp=$(mktemp)\ncleanup() { rm -f -- \"$tmp\"; }\ntrap cleanup EXIT\n\nif ! cp -- \"$1\" \"$tmp\"; then\n  printf 'copy failed\\n' >&2\n  exit 1\nfi", note: "`set -euo pipefail` is a useful starting convention, not magic safety. Understand each option and still validate inputs and handle expected failures." },
        ],
        lab: { title: "Write a tiny log-inspection utility", steps: ["Create a Bash script that accepts exactly one file path and prints a usage message otherwise.", "Check the file is readable; send a clear error to stderr and return a non-zero status if not.", "Print the line count and the number of lines containing `ERROR`.", "Add a temporary file with an `EXIT` trap, then verify it is removed on success and failure."], success: "The script works with a spaced filename, reports bad input clearly, and cleans temporary state." },
        recall: [
          { question: "What does `|` connect, and which status can be hidden by default?", answer: "It connects stdout to stdin; without `pipefail`, an earlier pipeline stage's failure can be hidden by the last stage's status.", from: "Make small tools work together" },
          { question: "Why quote `\"$@\"` when forwarding arguments?", answer: "It preserves each original argument as a separate word, including arguments containing spaces." },
          { question: "What signal does `kill PID` send by default?", answer: "SIGTERM, which allows a process to handle shutdown and clean up." },
          { question: "What does the shell's current directory affect?", answer: "How relative paths are resolved by commands started from that shell." },
          { question: "How does stderr differ from stdout?", answer: "Stderr carries diagnostics separately, so normal output can be piped or saved independently." },
        ],
        mcqs: [
          q("How should a script pass every original argument onward while preserving boundaries?", ["`$*`", "`\"$@\"`", "`$1 $2`", "`$?`"], 1, "Quoted `$@` expands each positional parameter as its own word.", "Warm-up"),
          q("What does `#!/usr/bin/env bash` do when the script is executed directly?", ["Selects Bash using the environment's PATH", "Turns on debug mode", "Changes the working directory", "Makes every command privileged"], 0, "The shebang identifies the interpreter; `env` locates Bash through PATH.", "Warm-up"),
          q("What does `jobs` list?", ["All machine processes", "Jobs managed by the current shell", "Installed packages", "Recent exit codes"], 1, "The shell's job table tracks background and stopped jobs it started or controls.", "Warm-up"),
          q("What is the usual first choice for asking a process to shut down cleanly?", ["SIGKILL", "SIGTERM", "SIGSTOP", "SIGCHLD"], 1, "SIGTERM requests termination and can be handled for cleanup; SIGKILL cannot be caught.", "Working"),
          q("Where should a script write its usage error?", ["Standard error", "Standard input", "The executable bit", "The shell history"], 0, "Usage and diagnostics belong on stderr so they do not contaminate normal output.", "Working"),
          q("Why is parsing `ls` output a fragile way to loop over filenames?", ["`ls` never sorts", "Spaces and unusual characters break line-based assumptions", "It loses file permissions", "Bash cannot run `ls` in a loop"], 1, "Filenames can contain whitespace and newlines; use globs or null-delimited tools instead.", "Working"),
          q("What does `trap cleanup EXIT` request?", ["Run `cleanup` when the script exits", "Ignore all signals", "Restart the script", "Run cleanup only after success"], 0, "An EXIT trap runs the handler when the shell is exiting, including many failure paths.", "Working"),
          q("Why should `set -e` not be treated as complete error handling?", ["It only works in interactive shells", "Its behavior has exceptions and does not replace explicit checks", "It disables all conditionals", "It turns every error into status zero"], 1, "Bash's errexit behavior has context-dependent exceptions, so critical operations still need deliberate handling.", "Stretch"),
          q("A script deletes a directory based on `$TARGET`. What is the strongest first safety step?", ["Prefix the command with `sudo`", "Validate the value and print/confirm the resolved target", "Use `rm -rf` for consistency", "Run from the target directory"], 1, "Validating and inspecting the resolved target helps prevent empty or overly broad destructive paths.", "Stretch"),
          q("A command was backgrounded and its PID is stored in `$!`. What is `$!`?", ["The last argument", "The most recent background process ID", "The previous directory", "The last exit status"], 1, "Bash sets `$!` to the PID of the most recent asynchronous/background job.", "Stretch"),
        ],
        interview: [
          open("What makes a shell script usable by someone else?", "A clear interface, argument validation, readable output, useful stderr diagnostics, sensible exit statuses, and safe handling of paths.", "Warm-up"),
          open("How do foreground and background jobs differ?", "The shell waits on a foreground job; a background job runs asynchronously and is tracked through the shell's job table.", "Warm-up"),
          open("How would you clean up a temporary file if the script exits early?", "Create it with a safe temporary-file utility and register a cleanup handler with `trap ... EXIT`.", "Working"),
          open("Why is `\"$@\"` safer than `$*` when forwarding arguments?", "Quoted `$@` preserves each argument boundary, while unquoted or collapsed forms can split and merge values incorrectly.", "Working"),
          open("When would you use SIGTERM versus SIGKILL?", "Try SIGTERM first to allow graceful shutdown and cleanup; use SIGKILL only when a process is stuck and the operational impact is understood.", "Stretch"),
        ],
        scenarios: [
          open("A script fails on files whose names contain spaces. What likely caused it?", "An unquoted expansion or line-based parsing split a filename. Quote variables and use globbing or null-delimited `find` output.", "Warm-up"),
          open("A long task must keep running after you regain the prompt. How do you launch and later inspect it?", "Start it with `&`, record `$!` if appropriate, then use `jobs`, `ps`, and logs to monitor it; use `fg` when shell-managed foreground interaction is needed.", "Warm-up"),
          open("Your script exits before removing a temp file when a copy fails. How do you make cleanup reliable?", "Register an EXIT trap immediately after creating the temp file and explicitly check the copy's status so the failure is reported.", "Working"),
          open("A script that uses `set -e` continues after a failed command in a conditional. Why, and what do you do?", "Errexit has exceptions in tested contexts. Check the critical command explicitly, use `if ! command; then ...`, and define the desired failure behavior.", "Working"),
          open("An automation script may delete a caller-provided path. Outline safeguards before deletion.", "Require the argument, normalize or validate it, reject empty/root/home-sensitive targets, show the resolved target, constrain scope, and only then perform a quoted operation with an explicit status check.", "Stretch"),
        ],
      },
    ],
  },
  {
    id: "linux-networking",
    number: "02",
    title: "Linux & Networking",
    shortTitle: "Linux + Net",
    description: "Build a working model of the operating system under your tools, then follow a request from interface to service and back.",
    color: "mustard",
    prerequisites: [{ label: "Terminal & Bash · all three chapters", href: "/subjects/terminal-bash" }],
    references: [
      { label: "How Linux Works · Brian Ward", href: "https://nostarch.com/howlinuxworks3", helps: "Processes, filesystems, startup, services, Linux networking, and shell scripts." },
      { label: "Julia Evans · Networking zine", href: "https://jvns.ca/networking-zine.pdf", helps: "A visual introduction to packets, TCP/IP, DNS, and networking vocabulary." },
      { label: "MIT Missing Semester", href: "https://missing.csail.mit.edu/", helps: "Practical command-line and debugging habits that support systems work." },
    ],
    chapters: [
      {
        id: "linux-operating-system",
        title: "What the operating system is doing",
        subtitle: "Kernel, processes, users, permissions, filesystems, services, and logs",
        minutes: 38,
        objectives: ["Describe the kernel/user-space boundary", "Inspect processes and resource use", "Reason about ownership and permissions", "Locate service state and logs"],
        sections: [
          { title: "Kernel and user space", paragraphs: ["The kernel manages CPU time, memory, devices, filesystems, and networking. Ordinary programs run in user space and request protected operations through system calls. A service is still a process; the operating system provides the mechanisms that let it access files, sockets, and hardware under controlled identities.", "Linux distributions package the kernel with user-space tools, libraries, service managers, and configuration. Two machines both called Linux can differ in package managers, init systems, network configuration, and default paths. Start diagnostics by identifying the environment instead of assuming every distribution behaves identically."], bullets: ["`uname -a` reports kernel and machine information.", "`cat /etc/os-release` identifies many Linux distributions.", "`systemctl` is common on systemd systems, but it is not a universal Linux interface."], code: "uname -a\ncat /etc/os-release\nid\ngetent passwd \"$USER\"" },
          { title: "Processes and resource limits", paragraphs: ["A process is an executing program with an address space, credentials, file descriptors, and at least one thread. The scheduler gives runnable threads CPU time. Processes can create children, inherit environment and open descriptors, and exit with a status that a parent can collect.", "Use `ps` for a snapshot and `top` for a changing view. High CPU suggests active computation or a tight loop; high memory may be a leak, cache, or expected workload. A process in uninterruptible sleep often waits for kernel I/O, so repeatedly killing it may not resolve the underlying storage or device problem."], code: "ps -eo pid,ppid,user,stat,%cpu,%mem,cmd --sort=-%cpu | head\nfree -h\nuptime" },
          { title: "Files, ownership, and permissions", paragraphs: ["A file has an owner, group, and permission bits for owner/group/other. Read, write, and execute mean different things for regular files and directories: directory execute is the search/traverse permission. A user can be denied access because one parent directory lacks execute permission even when the final file looks readable.", "`chmod` changes mode bits; `chown` changes ownership and often requires administrative privilege. Avoid treating `sudo` as a generic fix. First ask which identity a process uses and which exact path component denies access."], code: "id\nnamei -l /var/log/myapp/app.log\nstat /var/log/myapp/app.log\nls -ld /var /var/log /var/log/myapp" },
          { title: "Boot, services, and logs", paragraphs: ["On systemd-based systems, PID 1 is usually systemd, which starts and supervises services. A unit describes work such as a long-running daemon, timer, or mount. `systemctl status` gives a useful first snapshot; `journalctl` queries the system journal. Other distributions may use different service managers and log paths.", "A service can be enabled at boot yet currently stopped, or active but unhealthy at the application level. Separate manager state from application health. Check recent logs around the failure time and look for the first causal error rather than only the final restart message."], code: "systemctl status myapp.service\njournalctl -u myapp.service --since '15 minutes ago'\nps -ef | grep '[m]yapp'", note: "Use the service manager that belongs to the machine. The commands here apply to systemd-based Linux installations." },
        ],
        lab: { title: "Inspect a Linux service", steps: ["Identify the Linux distribution and kernel version.", "Choose a harmless running service; inspect its owner, PID, and parent process.", "Read its recent service logs and distinguish manager state from application-level health.", "Inspect permissions on one configuration or log path component by component."], success: "You can explain which user runs the process, where its logs are, and what permission controls access to its files." },
        recall: [
          { question: "What does the shell use as the base for a relative path?", answer: "The current working directory." },
          { question: "What are stdin, stdout, and stderr?", answer: "A process's conventional input, normal output, and diagnostic streams.", from: "Make small tools work together" },
          { question: "Why is `sudo` not a good first response to every permission error?", answer: "It may hide the real identity or path-permission issue and can grant broader power than needed." },
          { question: "What is a process?", answer: "A running program instance with state such as an address space, credentials, file descriptors, and threads." },
          { question: "What should you inspect before assuming a command exists on every Linux machine?", answer: "The distribution and its service manager/tooling; Linux systems differ in user-space choices." },
        ],
        mcqs: [
          q("Which part of Linux schedules processes and mediates protected hardware access?", ["The kernel", "The shell prompt", "A log file", "A package mirror"], 0, "The kernel provides core resource management and protected system services.", "Warm-up"),
          q("What does `ps` primarily show?", ["A snapshot of processes", "A network route", "A live filesystem mount", "Bash aliases"], 0, "`ps` reports process state at the time it runs; `top` is more suited to a live view.", "Warm-up"),
          q("For a directory, what does execute permission allow?", ["Searching/traversing entries", "Changing the kernel", "Reading file contents automatically", "Starting every service"], 0, "Directory execute permission allows path traversal/search, subject to other permissions and policy.", "Warm-up"),
          q("A user can read a file's mode bits but still cannot open it. What is a likely cause?", ["A parent directory lacks search/execute permission", "The terminal font is wrong", "The process has too much CPU", "The shell's history is full"], 0, "Every directory component in a path must be traversable for the user to reach the file.", "Working"),
          q("What is a useful first command on a systemd host to inspect a service?", ["`systemctl status name.service`", "`chmod 777 name.service`", "`kill -9 1`", "`cat /proc/kallsyms`"], 0, "The status view reports manager state, recent logs, and process information for a unit.", "Working"),
          q("What is an important distinction when a service is marked active?", ["Active means the application is definitely serving correctly", "Manager state does not prove application-level health", "It cannot have logs", "It must run as root"], 1, "A process may be alive while failing its actual request path or dependencies.", "Working"),
          q("What information does `id` help inspect?", ["Current user and group identities", "DNS cache size", "CPU temperature only", "The latest shell command"], 0, "`id` reports user and group identity, which helps reason about access checks.", "Working"),
          q("A service repeatedly restarts. Which evidence is most useful first?", ["The first error around the restart time in service logs", "A recursive chmod of `/`", "An unrelated package list", "The desktop wallpaper"], 0, "Logs near the first failure can reveal the cause; later restart messages are often consequences.", "Stretch"),
          q("A process shows high memory. What is the best conclusion from that metric alone?", ["It is definitely leaking", "It needs to be killed", "It uses memory, but context and trend are needed to diagnose", "The kernel is broken"], 2, "One snapshot cannot distinguish a leak, cache, expected workload, or a healthy peak.", "Stretch"),
          q("The same Linux command fails on two different distributions. What should you check?", ["Whether user-space tools and service managers differ", "Whether Linux has no kernel", "Whether paths never matter", "Whether every command requires sudo"], 0, "Linux distributions can use different init systems, defaults, tools, and configuration paths.", "Stretch"),
        ],
        interview: [
          open("Describe the kernel/user-space boundary in practical terms.", "Programs run with restricted user-space privileges and ask the kernel through system calls for operations such as files, processes, memory, and sockets.", "Warm-up"),
          open("How would you investigate a process that is using high CPU?", "Identify it with `top`/`ps`, inspect its command, owner, CPU trend and logs, then correlate activity with the workload before changing or stopping it.", "Working"),
          open("Explain why directory permissions matter when opening a file.", "The process needs search/execute access on every directory component, as well as the appropriate permission on the file itself.", "Working"),
          open("What is the difference between a service being enabled and being healthy?", "Enabled generally controls startup policy; active reports the manager's process state. Health requires checking whether the application can perform its work.", "Working"),
          open("A daemon fails after a configuration change. Outline your first investigation.", "Check manager status and logs around the first failure, verify the config syntax and file permissions under the service identity, and compare with the last known-good state.", "Stretch"),
        ],
        scenarios: [
          open("A process runs as `appuser`, but you can read its config as yourself. It reports permission denied. What do you inspect?", "Check the process identity, ownership/modes of each path component, ACLs or mandatory policy if present, and whether the service uses a different mount or namespace.", "Warm-up"),
          open("`systemctl` says a service is active but users receive errors. What next?", "Check application health endpoints/logs, listener sockets, dependencies, and a real request from the client side; active only confirms manager-level process state.", "Warm-up"),
          open("Memory usage rose steadily for hours. How do you distinguish a leak from normal caching?", "Trend process RSS and workload over time, inspect memory/cgroup limits and cache behavior, correlate with request volume, and look for sustained growth that does not fall after load drops.", "Working"),
          open("A command in your runbook fails because `systemctl` is absent. How do you adapt?", "Identify the distribution and init/service manager, then use its supported tools or inspect the process/logging arrangement; do not assume all Linux uses systemd.", "Working"),
          open("A web service cannot open `/srv/app/logs/current.log` although the file is readable. Give a least-privilege diagnostic approach.", "Inspect `id` for the service user and each directory with `namei -l`/`stat`; grant only the needed directory traverse and file access to the service identity rather than broad world permissions.", "Stretch"),
        ],
      },
      {
        id: "network-fundamentals",
        title: "Follow a packet to its destination",
        subtitle: "Interfaces, addresses, routes, ports, DNS, TCP, HTTP, and TLS",
        minutes: 42,
        objectives: ["Read an interface address and route", "Explain IP addresses, ports, and sockets", "Trace DNS and TCP before HTTP", "Identify where TLS fits in a request"],
        sections: [
          { title: "Interfaces, addresses, and routes", paragraphs: ["A network interface is a host's attachment to a network: physical Ethernet, Wi-Fi, loopback, or a virtual interface. An IP address identifies an interface within a network prefix. A route tells the host which next hop or interface to use for a destination; the default route handles destinations without a more specific match.", "CIDR notation combines an address with a prefix length, such as `192.168.1.0/24`. The prefix describes which leading bits identify the network. A host decides whether a destination is on-link or should be sent to a gateway. NAT may rewrite addresses at a boundary, but it is not the same thing as routing."], code: "ip addr\nip route\nip route get 1.1.1.1\nip link" },
          { title: "Ports and transport", paragraphs: ["IP gets packets to a host; a transport protocol helps deliver data to the right process. TCP provides an ordered byte stream with connection setup, retransmission, and congestion control. UDP sends datagrams without TCP's connection and reliability guarantees. A port is part of the transport endpoint, not a separate machine.", "A listening socket is an address/port/protocol combination accepting connections. `127.0.0.1` is IPv4 loopback; `::1` is IPv6 loopback. Binding only to loopback makes a service reachable from that same network namespace, not from other machines through its external interface."], code: "ss -lntup\nss -ntp\ncurl -v http://127.0.0.1:8080/" },
          { title: "DNS, HTTP, and TLS", paragraphs: ["A typical request starts by resolving a hostname through DNS to one or more addresses. The client chooses an address, routes packets toward it, establishes a transport connection, and then sends an application protocol request. DNS success therefore does not guarantee that TCP, TLS, or the application will succeed.", "HTTP defines request/response semantics such as methods, paths, headers, and status codes. HTTPS is HTTP protected by TLS, which authenticates the server certificate and encrypts the connection. A browser may reach the right IP but fail certificate validation because the requested hostname, certificate names, trust chain, or system clock is wrong."], code: "getent ahosts example.com\ncurl -v https://example.com/\nopenssl s_client -connect example.com:443 -servername example.com" },
          { title: "Put the layers in order", paragraphs: ["A useful first-pass dependency order is: name resolution → route and reachability → TCP connection → TLS negotiation → application response. This is a troubleshooting order, not a claim that every environment follows one exact packet sequence; proxies, caches, service meshes, and connection reuse can change the path.", "When you report an issue, include the source host, destination name and port, time, exact command, and observed failure stage. 'The network is down' is too vague to distinguish DNS, a route, a firewall, a listener, or a bad application response."], note: "For each hop, ask: what name is being resolved, which address is chosen, which route is used, what socket is expected, and what response came back?" },
        ],
        lab: { title: "Trace a local web request", steps: ["Inspect local addresses and routes with `ip addr` and `ip route`.", "List listening TCP sockets and find a local service port with `ss -lntp`.", "Resolve a hostname with `getent ahosts`, then inspect a request with `curl -v`.", "Write the observed stages in order: DNS result, chosen destination, connection, TLS if used, HTTP status."], success: "You can tell whether a failure is name resolution, routing/connectivity, transport, TLS, or application-level." },
        recall: [
          { question: "What shell syntax protects a path containing spaces as one argument?", answer: "Quote the expansion, such as `\"$path\"`.", from: "A command is a tiny program" },
          { question: "What does a route determine?", answer: "Which interface or next hop should be used to reach a destination." },
          { question: "What does a port help identify?", answer: "The transport endpoint/service process on a host, together with protocol and address." },
          { question: "Does successful DNS resolution prove a web service is healthy?", answer: "No. Connection, TLS negotiation, and the application response can still fail." },
          { question: "What is the practical role of loopback?", answer: "It lets a host or network namespace communicate with itself through a local interface." },
        ],
        mcqs: [
          q("What does a routing table help a host decide?", ["Which next hop/interface carries a packet", "Which user owns a file", "How HTTP formats JSON", "Whether a process can use CPU"], 0, "Routes select an egress interface or gateway based on the destination prefix.", "Warm-up"),
          q("What is `127.0.0.1`?", ["A common IPv4 loopback address", "A public DNS server", "A TCP port", "The default gateway on every LAN"], 0, "127.0.0.0/8 is reserved for IPv4 loopback; 127.0.0.1 is the common local address.", "Warm-up"),
          q("Which transport gives an ordered reliable byte stream?", ["TCP", "UDP", "DNS", "ARP"], 0, "TCP provides ordered delivery and retransmission over a connection.", "Warm-up"),
          q("What does a listening socket represent?", ["An endpoint waiting for connections or datagrams", "A firewall rule only", "A DNS record", "A file descriptor that must be stdin"], 0, "A listening socket is an address/port/protocol endpoint associated with a process.", "Working"),
          q("What is the usual first protocol step when a client has only a hostname?", ["DNS resolution", "HTTP response", "File permission check", "Process scheduling"], 0, "A client commonly resolves the name to one or more addresses before connecting, though caches/proxies can alter details.", "Working"),
          q("What does HTTPS add to HTTP?", ["A larger port number", "TLS protection and server authentication", "A route table", "Automatic application health"], 1, "TLS encrypts the connection and authenticates the server certificate when validation succeeds.", "Working"),
          q("A service binds only to `127.0.0.1`. What is a likely effect?", ["It is reachable through loopback in that namespace but not via the host's external interface", "It is available on every public IP", "It has no port", "DNS stops working"], 0, "Loopback binding restricts the listener to local traffic within the relevant network namespace.", "Working"),
          q("DNS lookup succeeds but `curl` reports connection refused. Which layer is the first suspect?", ["No listener or active rejection at the destination address/port", "The shell quoting rules", "A missing HTTP status code before TCP", "The filesystem inode"], 0, "Connection refused usually means the destination host actively rejected the TCP connect, commonly because nothing is listening.", "Stretch"),
          q("Why can a request reach the right IP and still fail TLS?", ["The certificate name/trust chain/clock may be invalid", "IP packets cannot carry TLS", "TCP changes HTTP into DNS", "Ports are always encrypted"], 0, "TLS validation checks identity and trust, not merely IP reachability.", "Stretch"),
          q("Which sequence is the most useful basic request-debugging order?", ["HTTP, DNS, route, shell", "DNS, route/reachability, TCP, TLS, application response", "Permissions, disk, DNS, CPU", "TLS, process ID, DNS, keyboard"], 1, "Checking dependencies in order helps locate the first failing stage of a typical client request.", "Stretch"),
        ],
        interview: [
          open("Explain the difference between an IP address and a port.", "An IP address identifies a network interface/reachable host location; a transport port helps direct traffic to an endpoint or service on that host.", "Warm-up"),
          open("What is the practical difference between TCP and UDP?", "TCP establishes a connection and provides ordered, reliable byte delivery. UDP sends independent datagrams without those TCP guarantees.", "Warm-up"),
          open("Walk through what happens after a user enters an HTTPS hostname.", "Resolve the name, select a destination and route, establish TCP, negotiate TLS and validate the certificate, then exchange HTTP request and response data.", "Working"),
          open("Why can a process listening on localhost be unreachable from another computer?", "It is bound to a loopback interface that routes to itself, not to the externally reachable host interface.", "Working"),
          open("DNS works but HTTPS times out. How do you narrow down the failing layer?", "Check the resolved address and route, test TCP reachability to port 443, inspect firewall/proxy behavior, then inspect TLS handshake and application response separately.", "Stretch"),
        ],
        scenarios: [
          open("A developer can curl `127.0.0.1:8080` on a server, but a teammate cannot connect remotely. What do you inspect first?", "Check the listener's bind address and network namespace, then host firewall/routing and the destination address. Loopback-only binding is a common cause.", "Warm-up"),
          open("A hostname returns an IP, but the request gets connection refused. What evidence will you collect?", "Confirm the chosen IP and port, inspect the server's listening socket/process, and check whether a firewall or proxy actively rejects the connection.", "Warm-up"),
          open("TLS reports a certificate name mismatch while TCP connects. What does that tell you?", "The transport path is working, but the certificate identity does not match the requested hostname (or the wrong virtual host/certificate is being served).", "Working"),
          open("A containerized process listens on port 3000 inside its environment; the host cannot reach it. What distinctions matter?", "Check which interface it binds inside its namespace, whether a host port is published, and whether host/container firewall or routing rules allow the path.", "Working"),
          open("A request intermittently goes to one of several IPs and only some fail. Outline a layered diagnosis.", "Capture each DNS answer and selected destination, compare routes and TCP outcomes per address, inspect TLS/certificate and app health per backend, then correlate with load balancer or resolver behavior.", "Stretch"),
        ],
      },
      {
        id: "network-diagnostics",
        title: "Debug the path, not the guess",
        subtitle: "A layered method with `ip`, `ss`, `dig`, `curl`, logs, and packet captures",
        minutes: 34,
        objectives: ["Turn a vague outage into a testable hypothesis", "Choose tools that answer one layer at a time", "Interpret common connection failures", "Write a useful incident note"],
        sections: [
          { title: "State a falsifiable hypothesis", paragraphs: ["Start with a precise report: source, destination name and port, time, command, expected behavior, observed behavior, and whether the failure is repeatable. Then propose one layer to test. Changing many firewall, DNS, and service settings at once destroys evidence and can create a second problem.", "Use a comparison: one client versus another, one destination IP versus another, localhost versus remote, or one time window versus another. A good comparison changes one variable and narrows where the path diverges."], bullets: ["Name resolution: `getent hosts NAME` or `dig NAME`.", "Route/interface: `ip addr`, `ip route`, `ip route get ADDRESS`.", "Listener/connect: `ss -lntup`, `curl -v`, `nc -vz HOST PORT` if installed."], code: "getent ahosts example.test\nip route get 203.0.113.20\nss -lntp\ncurl -v --connect-timeout 3 http://example.test:8080/" },
          { title: "Interpret the failure stage", paragraphs: ["Name-not-found points toward resolver configuration, DNS data, search domains, or a name typo. A timeout means no timely response arrived; it can result from a drop, unreachable route, stalled server, or wrong address. Connection refused typically means an active rejection at the destination or an intermediate device.", "An HTTP 4xx/5xx proves much more of the path worked: the client exchanged HTTP with some server. A TLS error means TCP likely connected but the TLS handshake or identity check failed. Preserve these distinctions in logs and incident notes."], code: "curl -v --connect-timeout 3 --max-time 8 https://example.test/\ndig +short example.test\nss -s" },
          { title: "Inspect packets when summaries are not enough", paragraphs: ["Packet capture can show whether SYN packets leave, whether replies arrive, and where a conversation stops. Tools such as `tcpdump` and Wireshark are powerful but expose sensitive metadata; capture only the needed interface, host, port, and time window, and handle the file carefully.", "A local capture sees only what the capture point can observe. Offloads, virtual bridges, NAT, proxies, and containers can make a capture look different from the logical flow. Compare captures at the client and server when possible, and do not infer a firewall rule solely from one missing packet."], code: "sudo tcpdump -ni any host 203.0.113.20 and port 443", note: "Packet captures can contain private addresses, DNS names, headers, and sometimes application data. Limit scope and protect the capture." },
          { title: "Close the loop", paragraphs: ["After a fix, repeat the same test from the original source. Confirm the application-level outcome, not just a successful ping or open TCP port. Record what changed, how you verified it, and what evidence would show a recurrence.", "A concise incident note should let another engineer reproduce the observation: timestamp and timezone, source, destination, exact command, result, relevant logs, and the current hypothesis. This keeps troubleshooting collaborative and prevents the same guesses from being repeated."], bullets: ["Ping tests ICMP reachability where permitted; it does not prove a TCP service works.", "A listening port does not prove the application is healthy.", "A successful request to one IP does not prove every backend is healthy." ] },
        ],
        lab: { title: "Write a short network incident note", steps: ["Choose a hostname and request that you can safely reach.", "Record DNS answers, route choice, TCP/HTTP result, and timestamps.", "Describe one simulated failure condition and which tool would test it.", "Write a three-line incident note with source, destination, observed layer, and next hypothesis."], success: "Another person could repeat your observation and understands what the evidence does—and does not—prove." },
        recall: [
          { question: "What does `systemctl status` tell you that an application health check may not?", answer: "The service manager's process/unit state; it does not guarantee the app can serve a real request.", from: "What the operating system is doing" },
          { question: "What should you check after hostname resolution?", answer: "Destination selection and route/reachability, then transport connection, TLS, and application behavior.", from: "Follow a packet to its destination" },
          { question: "What does connection refused commonly suggest?", answer: "The destination or an intermediate device actively rejected the connection, often because there is no listener at that address/port." },
          { question: "Why doesn't successful ping prove a web service works?", answer: "Ping tests ICMP reachability, not the service's TCP listener, TLS, or HTTP behavior." },
          { question: "Why change one variable at a time during an outage?", answer: "It preserves evidence and lets you identify which change affects the observed failure." },
        ],
        mcqs: [
          q("What is the best first response to 'the network is broken'?", ["Change DNS and firewall settings immediately", "Record source, destination, port, time, and exact failure", "Restart every service", "Capture all traffic indefinitely"], 1, "A precise reproduction gives you a testable starting point and avoids changing several variables at once.", "Warm-up"),
          q("Which command can show the route selected for a destination address?", ["`ip route get ADDRESS`", "`chmod ADDRESS`", "`jobs ADDRESS`", "`wc -l ADDRESS`"], 0, "`ip route get` asks the kernel how it would route a specific destination.", "Warm-up"),
          q("What does a TLS certificate name error most directly indicate?", ["The process has no CPU", "The presented certificate identity does not match the requested hostname", "DNS returned no address", "The port is always closed"], 1, "TLS certificate validation checks the certificate identity against the requested name.", "Warm-up"),
          q("A TCP connection times out. Which interpretation is safest?", ["The server definitely crashed", "No timely response arrived; several path or host causes remain possible", "The certificate is valid", "The HTTP route returned 404"], 1, "A timeout can result from dropped packets, routing, filters, a stalled peer, or other causes.", "Working"),
          q("What does HTTP 500 tell you compared with a DNS lookup result?", ["An HTTP server returned an application/server error", "The DNS server is unavailable", "The packet never left the client", "The TCP port cannot be reached"], 0, "A 500 is an HTTP response, showing that an application-facing server returned an error.", "Working"),
          q("What is a major caution with packet captures?", ["They cannot show TCP", "They may contain sensitive metadata or payload and need tight scope", "They always prove which firewall dropped a packet", "They require changing DNS first"], 1, "Captures can expose private information and only show traffic visible at that capture point.", "Working"),
          q("Which tool is best suited to inspect a local listening TCP socket?", ["`ss -lntp`", "`sort -u`", "`chmod -R`", "`history`"], 0, "`ss` reports socket state; these flags select listening TCP sockets and process details on common Linux systems.", "Working"),
          q("Ping succeeds but `curl` to a service port fails. What is the correct conclusion?", ["The service is healthy", "ICMP reachability works, but the TCP/application path still needs diagnosis", "DNS is definitely wrong", "The host has no route"], 1, "Ping and a service request test different protocols and layers.", "Stretch"),
          q("A name resolves to several backends; only one IP fails. What is the most useful next comparison?", ["Test each resolved address separately and compare route/connect/TLS/app outcomes", "Change the client keyboard", "Assume DNS itself is broken", "Delete all DNS records"], 0, "Per-address tests isolate a bad backend or path from a general resolver failure.", "Stretch"),
          q("Why repeat the original test after applying a fix?", ["A successful ping is enough", "To verify the intended application behavior from the original source", "To clear the terminal", "To remove the route table"], 1, "Verification should reproduce the original request and confirm the actual user-facing outcome.", "Stretch"),
        ],
        interview: [
          open("How do you turn a vague connectivity report into an investigation?", "Capture the source, destination, port, timestamp, exact request, expected result, and observed error, then form one layer-specific hypothesis.", "Warm-up"),
          open("What can `curl -v` tell you in a network investigation?", "It exposes connection progress, TLS negotiation, request/response details, and HTTP status, helping identify the stage that failed.", "Warm-up"),
          open("Why is ping not a complete test for an application outage?", "It tests ICMP reachability, which can be filtered independently; it does not prove a TCP listener, TLS handshake, or application response works.", "Working"),
          open("When would you use packet capture, and what care is required?", "Use it when higher-level summaries do not show packet exchange; narrow host/port/interface/time, protect the capture, and interpret only what that capture point can observe.", "Working"),
          open("A service works from one client but not another. How would you compare the paths?", "Run the same time-stamped DNS, route, TCP, TLS, and HTTP checks from both clients and compare chosen addresses, proxies, and observed failures.", "Stretch"),
        ],
        scenarios: [
          open("A user reports a 20-second page load and then a timeout. What fields do you request before acting?", "Source machine/network, hostname, port, exact URL/request, timestamp/timezone, whether it repeats, DNS answer, and the precise client error.", "Warm-up"),
          open("`getent` returns no address, but another hostname works. Where do you investigate?", "Check exact spelling/search domain, resolver configuration and DNS records, then compare queries against the intended resolver.", "Warm-up"),
          open("`curl` connects but returns HTTP 503. What layer has the evidence reached, and what next?", "The client reached an HTTP-speaking endpoint; inspect response headers/body, proxy/load-balancer health, backend availability, and server logs.", "Working"),
          open("A packet capture shows outgoing SYNs but no SYN-ACK at the client. What can and can't you conclude?", "The client sent connection attempts and saw no reply at that capture point. Compare server-side capture and routes/filters; the client capture alone does not identify exactly where packets disappear.", "Working"),
          open("Only a subset of DNS-returned addresses have elevated latency. Design a controlled investigation.", "Pin requests to each address while preserving the hostname for TLS, repeat with timestamps, compare route/TCP/TLS/HTTP timings and backend logs, and correlate results with load-balancer health.", "Stretch"),
        ],
      },
    ],
  },
  {
    id: "docker",
    number: "03",
    title: "Docker",
    shortTitle: "Docker",
    description: "Package an application as an image, run it as an isolated process, and connect its storage and services predictably.",
    color: "seafoam",
    prerequisites: [
      { label: "Terminal & Bash · all three chapters", href: "/subjects/terminal-bash" },
      { label: "Linux & Networking · all three chapters", href: "/subjects/linux-networking" },
    ],
    references: [
      { label: "Docker Docs · Get Started", href: "https://docs.docker.com/get-started/", helps: "Build and run a first containerized application, image, and stack." },
      { label: "Docker Deep Dive · Nigel Poulton", href: "https://leanpub.com/dockerdeepdive", helps: "A structured deeper treatment of Docker's core model and practical workflows." },
      { label: "Docker Docs · Compose", href: "https://docs.docker.com/guides/docker-compose/", helps: "Define local multi-container services, networks, configuration, and persistent data." },
    ],
    chapters: [
      {
        id: "container-mental-model",
        title: "A container is a process with boundaries",
        subtitle: "Images, containers, namespaces, cgroups, the Engine, and isolation",
        minutes: 40,
        objectives: ["Separate the ideas of image, container, and host", "Explain namespaces and cgroups at a useful level", "Understand Docker client/Engine responsibilities", "Spot what container isolation does and does not guarantee"],
        sections: [
          { title: "Image versus container", paragraphs: ["An image is a read-only template built from filesystem layers plus metadata such as the default command. A container is a running or stopped instance created from that image, with runtime configuration and usually a small writable layer. Several containers can start from the same image while keeping their process state separate.", "Containers are not tiny virtual machines with a complete independent kernel. On Linux, they are processes using the host kernel with isolation and resource controls. Docker Desktop on Windows or macOS runs Linux containers inside a managed Linux VM because the host kernel is not Linux."], bullets: ["`docker image ls` lists local images.", "`docker ps -a` lists running and stopped containers.", "Removing a container does not automatically remove a named volume."], code: "docker pull nginx:alpine\ndocker run --name web -d -p 8080:80 nginx:alpine\ndocker ps\ndocker logs web\ndocker rm -f web" },
          { title: "Namespaces create views", paragraphs: ["Linux namespaces give a process a scoped view of resources such as process IDs, mount points, network interfaces, hostnames, and users. The process sees a view that differs from the host's, while the kernel enforces the boundaries. Namespace isolation is a collection of mechanisms, not a guarantee that every resource is invisible or inaccessible.", "A container process can still be inspected from the host by its process ID. The host kernel remains shared, which is why kernel vulnerabilities and privileged container settings matter to security."], bullets: ["PID namespace: process ID view.", "Network namespace: interfaces, routes, and sockets.", "Mount namespace: filesystem mount view." ] },
          { title: "Cgroups manage resources", paragraphs: ["Control groups (cgroups) let Linux account for and limit resource use such as memory, CPU, and process counts. Namespaces answer 'what can this process see?' Cgroups help answer 'how much can it consume?'. Both may be configured at runtime, and support/details depend on the host kernel and Docker setup.", "Without resource limits, one noisy container can compete aggressively with others for host capacity. Limits should reflect the workload and monitoring evidence; setting an arbitrary tiny cap can create failures that look like application bugs."], code: "docker run --rm --memory=256m --cpus=1.5 alpine:3.20 sh -c 'cat /proc/meminfo | head'\ndocker stats" },
          { title: "The Engine and the run lifecycle", paragraphs: ["The Docker CLI sends requests to the Docker Engine API. The Engine coordinates image management, networks, volumes, and container lifecycle, working with lower-level runtime components to create processes. The CLI is a client; a successful command depends on a reachable, authorized daemon or compatible context.", "At start, Docker prepares the container configuration and filesystem, configures namespaces/cgroups and networking, then starts the requested process. When that main process exits, the container stops. A container is not meant to be a long-lived virtual machine with an interactive shell always running."], code: "docker context show\ndocker info\ndocker inspect web --format '{{.State.Status}}'", note: "`docker run` creates and starts a container. `docker start` starts an existing stopped container. `docker exec` starts an extra process inside a running container." },
        ],
        lab: { title: "Observe an isolated process", steps: ["Run a small Linux container with a named container and a shell command that prints its hostname and process list.", "Start a second container from the same image and compare the container IDs/hostnames.", "Inspect logs, status, and resource use with Docker CLI commands.", "Remove both containers and describe which data would disappear with their writable layers."], success: "You can explain which parts are image defaults, container runtime state, kernel isolation, and host-managed resources." },
        recall: [
          { question: "What does the current working directory determine?", answer: "How relative paths are resolved by shell commands.", from: "A command is a tiny program" },
          { question: "What is the difference between a process and its executable file?", answer: "The executable is a program file; a process is a running instance with memory, identity, descriptors, and execution state.", from: "What the operating system is doing" },
          { question: "What does a network namespace change for a process?", answer: "Its view of network interfaces, routes, and sockets." },
          { question: "What is a Docker image compared with a container?", answer: "An image is the template; a container is a runtime instance with process state and a writable layer." },
          { question: "Does a Linux container have its own kernel?", answer: "No. It uses the host Linux kernel with isolation and resource controls." },
        ],
        mcqs: [
          q("What is a Docker image?", ["A running program", "A read-only template used to create containers", "A host network interface", "A virtual CPU"], 1, "An image contains filesystem layers and metadata used to create container instances.", "Warm-up"),
          q("What is a container in the Linux model?", ["A process with isolation and resource controls", "A full virtual machine with its own kernel", "A Dockerfile", "A DNS server"], 0, "Containers use kernel mechanisms to isolate processes; Linux containers share the host kernel.", "Warm-up"),
          q("Which mechanism primarily scopes what resources a process can see?", ["Namespaces", "Cgroups", "Image tags", "Registry credentials"], 0, "Namespaces provide scoped views such as process IDs, mounts, and networking.", "Warm-up"),
          q("Which mechanism accounts for or limits CPU and memory use?", ["Cgroups", "DNS", "A Docker tag", "A bind mount"], 0, "Cgroups are Linux resource accounting and control mechanisms.", "Working"),
          q("What normally happens when a container's main process exits?", ["The container stops", "The Engine starts a kernel", "The image is deleted", "The network namespace becomes a VM"], 0, "The container lifecycle is tied to its configured main process; when it exits the container stops.", "Working"),
          q("Which component sends commands to the Docker Engine API?", ["The Docker CLI", "The image layer", "A cgroup", "The shell's current directory"], 0, "The CLI is a client that communicates with the Engine API.", "Working"),
          q("Where does Linux container isolation ultimately rely?", ["The host Linux kernel", "A separate kernel in every image", "The terminal font", "A DNS resolver"], 0, "Namespaces and cgroups are kernel features; containers use the host kernel.", "Working"),
          q("A container is stopped and removed. What usually happens to its anonymous writable layer?", ["It is discarded with the container", "It becomes the image", "It is copied to every sibling container", "It remains as a named volume automatically"], 0, "The container writable layer is ephemeral; persistent data should live in a volume or bind mount.", "Stretch"),
          q("Why can a Linux container run differently on Docker Desktop for Windows than on a Linux server?", ["Desktop runs Linux containers in a managed Linux VM", "Windows containers always use the Linux kernel directly", "Images contain a complete kernel by default", "Docker bypasses all host resources"], 0, "Docker Desktop provides a Linux environment for Linux containers on non-Linux hosts.", "Stretch"),
          q("What is the most accurate security conclusion about container isolation?", ["It removes all host risk", "It is useful isolation, but shares a kernel and depends on configuration", "It encrypts every file", "It guarantees process health"], 1, "Containers reduce coupling and scope processes, but the shared kernel and privileges still require care.", "Stretch"),
        ],
        interview: [
          open("Explain image versus container in one practical example.", "An image is the reusable filesystem/metadata template; running it with configuration creates a container instance with its own process and writable layer.", "Warm-up"),
          open("What do namespaces and cgroups each contribute?", "Namespaces scope a process's view of resources; cgroups account for or constrain how much CPU, memory, and other resources it consumes.", "Warm-up"),
          open("Why is a container not a virtual machine?", "A Linux container does not boot its own kernel. It runs isolated processes on a shared host kernel, while a VM virtualizes hardware and runs its own kernel.", "Working"),
          open("What happens when a Docker container's main process exits?", "The container stops. Extra `docker exec` processes do not replace the configured main process lifecycle.", "Working"),
          open("What security assumptions should you avoid when using containers?", "Do not assume isolation is an absolute boundary: avoid unnecessary privileges, run with least privilege, patch the host/runtime, and limit access to sensitive resources.", "Stretch"),
        ],
        scenarios: [
          open("A container disappears from `docker ps` a few seconds after start. What do you inspect first?", "Use `docker ps -a`, inspect its exit status and logs, and check the configured command; the main process may have exited or failed.", "Warm-up"),
          open("Two containers use the same image but have different files in `/tmp`. Why?", "Each container has its own runtime writable layer and filesystem view even though the read-only image layers are shared.", "Warm-up"),
          open("A container can see only its own interfaces. Which kernel concept explains this?", "A network namespace gives it a scoped view of interfaces, routes, and sockets.", "Working"),
          open("A container is consuming all host memory. What resource mechanism and evidence matter?", "Inspect cgroup/container memory metrics and `docker stats`; apply a workload-appropriate memory limit and monitor application behavior under it.", "Working"),
          open("A team says their container is 'secure because it is isolated.' How would you assess that claim?", "Review capabilities/privileges, mounts, host socket access, user identity, resource limits, image provenance, host/kernel patching, and exposed interfaces; isolation is one control, not a full threat model.", "Stretch"),
        ],
      },
      {
        id: "docker-images-builds",
        title: "Build a repeatable image",
        subtitle: "Dockerfile instructions, context, layers, cache, tags, and multi-stage builds",
        minutes: 44,
        objectives: ["Read the Docker build context and `.dockerignore`", "Use `FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD`, and `ENTRYPOINT` deliberately", "Improve cache behavior and image size", "Distinguish a mutable tag from an immutable digest"],
        sections: [
          { title: "The build context is an input boundary", paragraphs: ["`docker build` sends a build context to the builder. With `.` as context, that is the current directory (subject to ignore rules). `COPY` sources are resolved from that context, not arbitrary host paths. Large contexts waste time, and accidentally including credentials or local build output can leak data into the build.", "Use `.dockerignore` to exclude `.git`, dependencies, temporary files, local secrets, and generated artifacts that the build does not need. Keep the context intentionally small and inspect what is actually copied."], code: "cat > .dockerignore <<'EOF'\n.git\nnode_modules\n.env\n*.log\nEOF\ndocker build -t demo-app:dev ." },
          { title: "Dockerfile instructions and image layers", paragraphs: ["`FROM` selects the base image. `WORKDIR` sets the working directory for later instructions. `COPY` adds context files; `RUN` executes build-time commands and commits resulting filesystem changes into an image layer. `CMD` supplies the default command; `ENTRYPOINT` defines the main executable and can be combined with `CMD` defaults.", "The builder can reuse cache when an instruction and its inputs match. Put stable dependency manifests before frequently changing source so code edits do not invalidate expensive dependency installation unnecessarily. Fewer layers alone is not the goal: readable, cacheable, secure build steps matter more than golfed Dockerfiles."], code: "FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nCMD [\"npm\", \"start\"]" },
          { title: "Exec form, runtime configuration, and secrets", paragraphs: ["JSON-array exec form such as `CMD [\"app\", \"--serve\"]` starts the executable directly and gives it signals cleanly. Shell form runs through a shell, which may affect PID 1 and signal forwarding. A well-behaved app handles termination and exits rather than leaving a shell wrapper as the only process.", "Do not bake passwords, API keys, or private certificates into an image layer. Layers can remain in build cache and registries even if a later Dockerfile instruction deletes the file. Supply runtime configuration through an appropriate secret mechanism or environment for local development, and keep `.env` files out of the build context."], code: "ENTRYPOINT [\"/usr/local/bin/app\"]\nCMD [\"--port\", \"8080\"]", note: "Deleting a secret in a later layer does not erase it from an earlier layer. Keep secrets out of the build context and image history." },
          { title: "Tags, digests, and multi-stage builds", paragraphs: ["A tag such as `node:22-alpine` is a human-friendly name that can move when the publisher updates it. A digest identifies content by hash and is a stronger way to refer to an exact image. For repeatability, record or pin the intended base image and rebuild intentionally as part of patch maintenance.", "Multi-stage builds use one stage to compile or assemble an application and a smaller runtime stage to copy only the needed artifact. This reduces what ships in the final image and separates build tools from runtime dependencies. It does not remove the need to patch the runtime base image or inspect dependencies."], code: "FROM node:22-alpine AS build\nWORKDIR /src\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:22-alpine AS runtime\nWORKDIR /app\nCOPY --from=build /src/dist ./dist\nCMD [\"node\", \"dist/server.js\"]" },
        ],
        lab: { title: "Build a deliberately small application image", steps: ["Write a Dockerfile with an explicit base image, work directory, dependency install, and default command.", "Add a `.dockerignore` that excludes source-control metadata, local dependencies, logs, and secrets.", "Build it twice without changing inputs; compare which steps use cache.", "Change one source file and identify which steps must rebuild. Inspect the final image's command and layers."], success: "You can explain what entered the context, which instruction invalidated the cache, and what command becomes PID 1." },
        recall: [
          { question: "What does quoting `\"$path\"` protect against in a shell?", answer: "Word splitting and wildcard expansion that could change one intended path into several arguments.", from: "A command is a tiny program" },
          { question: "What is Docker's build context?", answer: "The set of files supplied to the builder for a build; `COPY` reads sources from this context." },
          { question: "What do cgroups limit or account for?", answer: "Resource use such as CPU and memory by processes or containers.", from: "A container is a process with boundaries" },
          { question: "Why should secrets not be copied into an image and deleted later?", answer: "Earlier layers and build cache may still preserve the secret bytes." },
          { question: "What is the difference between an image and its tag?", answer: "The image is content; a tag is a human-friendly reference that can move to different content." },
        ],
        mcqs: [
          q("What does `COPY` read from during a standard Docker build?", ["The build context", "Any absolute host path", "A running container by default", "The shell history"], 0, "Dockerfile COPY sources are constrained to the build context (with stage-specific source forms).", "Warm-up"),
          q("What is `.dockerignore` mainly for?", ["Excluding unnecessary or sensitive context files", "Adding a container network", "Changing the image tag", "Starting a service"], 0, "It keeps irrelevant and secret local files out of the build context.", "Warm-up"),
          q("Which Dockerfile instruction selects the base image?", ["`FROM`", "`EXPOSE`", "`CMD`", "`VOLUME`"], 0, "`FROM` begins a build stage from a base image.", "Warm-up"),
          q("What is a typical purpose for `WORKDIR /app`?", ["Set the working directory for later instructions and runtime defaults", "Publish a network port", "Delete the build context", "Mount a host volume"], 0, "WORKDIR establishes the current working directory for subsequent Dockerfile instructions and container execution.", "Working"),
          q("Why place dependency manifests before frequently changed source in a Dockerfile?", ["To improve cache reuse for dependency installation", "To hide the app from Docker", "To make the image use host files automatically", "To encrypt package names"], 0, "Stable inputs can remain cached when later-changing application source is copied afterward.", "Working"),
          q("What is a practical benefit of JSON exec form for `CMD`?", ["The executable receives signals more directly", "It creates a new kernel", "It makes a mutable tag immutable", "It automatically stores secrets"], 0, "Exec form avoids an implicit shell wrapper and supports cleaner process/signal behavior.", "Working"),
          q("Why is deleting a copied secret in a later layer insufficient?", ["The bytes may remain in an earlier image layer or cache", "Docker cannot delete files", "Tags are always encrypted", "The registry rewrites all secrets"], 0, "Layered images preserve prior layer contents; later removal creates a whiteout rather than rewriting old layers.", "Working"),
          q("Which reference identifies exact image content more strongly than a mutable tag?", ["A content digest", "The `latest` tag", "A container name", "A port number"], 0, "A digest is content-addressed; a tag can be moved by publishing a new image.", "Stretch"),
          q("What is a multi-stage build useful for?", ["Copying selected build artifacts into a smaller runtime stage", "Running a container without a process", "Replacing all security updates", "Making the host kernel private"], 0, "Multi-stage builds separate build tools from the final runtime filesystem.", "Stretch"),
          q("A one-line code change causes a costly dependency install to rerun. What should you inspect?", ["Instruction order and inputs that invalidate the layer cache", "The DNS TTL", "The process PID namespace", "The host clock only"], 0, "Docker cache keys depend on instruction and input changes; ordering stable manifests before source can preserve cached installs.", "Stretch"),
        ],
        interview: [
          open("What is the Docker build context, and why should it be small?", "It is the set of files available to the builder. A small context speeds builds and reduces the chance that local secrets or irrelevant files are included.", "Warm-up"),
          open("How do `CMD` and `ENTRYPOINT` differ?", "ENTRYPOINT defines the primary executable; CMD provides default command/arguments and can be overridden or combined with it.", "Working"),
          open("How would you organize a Dockerfile for cache efficiency?", "Copy stable dependency manifests first, install dependencies, then copy frequently changing source and build; verify the actual cache behavior.", "Working"),
          open("Why does exec form matter for signal handling?", "It starts the executable without an implicit shell wrapper, so the main process can receive termination signals cleanly.", "Working"),
          open("What trade-offs come with pinning a base image by digest?", "It improves exact reproducibility but does not automatically receive future patches; updates must be reviewed and the digest intentionally refreshed.", "Stretch"),
        ],
        scenarios: [
          open("A developer's Docker build is slow and includes `.git` and local dependencies. What changes do you make?", "Add a focused `.dockerignore`, keep the build context small, order stable dependency files before changing source, and observe cache hits after rebuild.", "Warm-up"),
          open("A container starts but ignores a flag passed after the image name. What do you inspect?", "Check the combination of ENTRYPOINT and CMD, exec versus shell form, and how runtime arguments replace default CMD values.", "Warm-up"),
          open("A secret was copied into a Docker image and then removed in a later instruction. What is the response?", "Treat it as exposed: revoke/rotate it, remove it from the build context and history, rebuild cleanly, and review registry/cache access.", "Working"),
          open("A base tag updates unexpectedly and a rebuild changes behavior. How do you improve repeatability without freezing patching forever?", "Record exact content (for example by digest), test updates deliberately, and refresh the pinned reference through a reviewed maintenance process.", "Working"),
          open("Your compile image is 1.4 GB but the app only needs a small runtime. How do you reduce it safely?", "Use a multi-stage build, copy only runtime artifacts and required libraries, choose a maintained minimal runtime base, then validate startup and vulnerability/patch expectations.", "Stretch"),
        ],
      },
      {
        id: "docker-runtime-compose",
        title: "Connect containers and keep data",
        subtitle: "Volumes, bind mounts, ports, networks, Compose, health, and safe operation",
        minutes: 45,
        objectives: ["Choose a bind mount or named volume", "Explain container ports versus published host ports", "Connect local services with Compose DNS", "Debug startup, health, and data persistence"],
        sections: [
          { title: "Keep state outside the container layer", paragraphs: ["A container's writable layer is tied to that container's lifecycle. A bind mount maps a host path into the container and is useful for source code or explicitly managed local files. A named volume is managed by Docker and is commonly used for persistent application data.", "Mounts change what a path means inside a container. A bind mount can hide files that were already present at that path in the image. Check ownership and permissions from both the host and the container's process identity; rootless Docker and desktop file sharing can change the details."], code: "docker volume create db-data\ndocker run -d --name db -v db-data:/var/lib/postgresql/data postgres:16\ndocker volume inspect db-data" },
          { title: "Ports and container networking", paragraphs: ["Containers attached to a user-defined bridge network can usually reach each other by container or service name and the container's listening port. Publishing maps a host port to a container port, for example `-p 8080:80`; it is the host-side entry path, not a requirement for peer containers on the same network.", "Inside a container, `localhost` refers to that same container/network namespace. A web container connecting to a database should use the database service name, not `localhost`. A service must bind to an interface reachable inside its namespace; a listener bound only to container loopback cannot normally be reached by peer containers."], code: "docker network create app-net\ndocker run -d --name web --network app-net nginx:alpine\ndocker run --rm --network app-net alpine:3.20 wget -qO- http://web:80/\ndocker run -d --name web-published -p 8080:80 nginx:alpine" },
          { title: "Compose describes a local application", paragraphs: ["Docker Compose uses YAML to define services, networks, volumes, and configuration for an application made of multiple containers. `docker compose up` creates or updates resources; `docker compose down` removes containers and networks but normally keeps named volumes unless asked to remove them.", "Compose service names provide DNS names on the project network. Use them in connection strings, and keep each service listening on its own container port. `depends_on` can express startup ordering, but ordering alone does not mean a dependency is ready to accept requests; use health checks or application retries."], code: "services:\n  web:\n    build: .\n    ports:\n      - \"8080:3000\"\n    depends_on:\n      - db\n  db:\n    image: postgres:16\n    volumes:\n      - db-data:/var/lib/postgresql/data\nvolumes:\n  db-data:" },
          { title: "Operate and troubleshoot deliberately", paragraphs: ["Start with `docker compose ps`, `docker compose logs`, and `docker inspect`. Compare the expected process command, environment, mounts, network, published ports, and health state with the actual configuration. A container can be running while its application is not ready or while a dependency connection fails.", "Use named volumes for state that must survive container replacement. Backups still need an application-aware plan and a restore test; a volume is persistence, not a backup. Avoid privileged containers and broad host mounts by default, and provide only the filesystem and capabilities the process needs."], code: "docker compose ps\ndocker compose logs --tail=100 web\ndocker inspect web\ndocker compose down\ndocker volume ls", note: "`docker compose down -v` removes project volumes. Read the command carefully before using it when data matters." },
        ],
        lab: { title: "Run a two-service local stack", steps: ["Create a Compose file with an application and a database on the default project network.", "Give the database a named volume and configure the app to reach it by the service name.", "Publish only the app's host port; do not publish the database unless your local workflow needs it.", "Stop and recreate the stack, then verify expected data persistence and inspect logs after an intentional connection error."], success: "You can explain the host-to-container port mapping, service DNS name, persistent volume, and what `down` will remove." },
        recall: [
          { question: "What happens to a container's writable layer when the container is removed?", answer: "It is removed with the container; use a volume or bind mount for data that must persist." },
          { question: "Why should a service process handle termination cleanly?", answer: "The container's lifecycle follows its main process, so it should stop, flush, and release resources when signaled.", from: "A container is a process with boundaries" },
          { question: "What is the difference between a host port and a container port?", answer: "A host port is the host-side published entry; a container port is where the process listens within its own network namespace." },
          { question: "Why should an application container not use `localhost` for the database service?", answer: "Its localhost is the app container itself; peers should use the Compose service name on the shared network." },
          { question: "What does `.dockerignore` protect?", answer: "It keeps unnecessary or sensitive files out of the build context." , from: "Build a repeatable image" },
        ],
        mcqs: [
          q("Which storage choice is commonly used for database data that should outlive container replacement?", ["A named volume", "The container writable layer only", "A process environment variable", "A published port"], 0, "Named volumes are Docker-managed persistent storage suitable for container data.", "Warm-up"),
          q("What does `-p 8080:80` normally mean?", ["Host port 8080 maps to container port 80", "Container port 8080 maps to host port 80", "Both ports belong to DNS", "It mounts `/8080`"], 0, "The common syntax is host-port:container-port.", "Warm-up"),
          q("In a container, what does `localhost` refer to?", ["That container's own network namespace", "The Docker host in every configuration", "Every peer container", "The default DNS resolver"], 0, "Loopback is local to the network namespace where the process runs.", "Warm-up"),
          q("How should one Compose service typically reach another service named `db`?", ["Use hostname `db` and its container listening port", "Use the host's public IP and a random port", "Use `localhost`", "Use the image digest as a hostname"], 0, "Compose provides service-name DNS on the project network.", "Working"),
          q("What does `docker compose down` usually preserve by default?", ["Named volumes", "All containers", "Published ports", "The current process"], 0, "Compose down removes project containers and networks; named volumes are kept unless removal is requested.", "Working"),
          q("Does Compose `depends_on` alone guarantee the database is ready to accept queries?", ["Yes, it waits for application readiness in every case", "No, ordering is not the same as readiness", "It creates a backup", "It publishes the database port"], 1, "Startup order alone does not mean the dependency has finished initialization or is healthy.", "Working"),
          q("Why might a host bind mount hide application files from the image?", ["The mount overlays the target path", "The container loses its kernel", "DNS rewrites the filesystem", "The image tag is mutable"], 0, "A mount at a path presents mounted content there instead of the underlying image directory contents.", "Working"),
          q("What is the best description of a Docker volume?", ["Persistent storage, but not automatically a backup", "A second process namespace", "A firewall", "An immutable image layer"], 0, "Volumes persist data independently of container lifecycle, but backup and restore still need planning.", "Stretch"),
          q("A peer container cannot connect even though the host can curl the published port. Which check is most relevant?", ["Service bind address, shared network, service DNS, and container port", "Only the host's desktop browser cache", "The app's Docker tag spelling", "Whether `docker down -v` ran"], 0, "Peer traffic uses the container network and listening port; host publishing is a separate path.", "Stretch"),
          q("A volume contains important data. Which command deserves extra caution?", ["`docker compose down -v`", "`docker compose ps`", "`docker compose logs`", "`docker volume inspect`"], 0, "The `-v` option removes Compose project volumes and can destroy persistent data.", "Stretch"),
        ],
        interview: [
          open("When would you choose a bind mount versus a named volume?", "Use a bind mount when a known host path must be shared, such as source code; use a named volume for Docker-managed persistent application data.", "Warm-up"),
          open("Explain host port publishing versus container-to-container communication.", "Publishing maps a host port to a container port for host/external access. Peer containers on a shared network can use service DNS and the service's container port directly.", "Working"),
          open("What does Compose provide for a local multi-service application?", "A declarative YAML model for services, networks, volumes, configuration, and commands to create/run/manage the stack.", "Working"),
          open("Why doesn't `depends_on` guarantee readiness?", "It can order startup, but the process may not yet be healthy or able to accept requests; use health checks or retries.", "Working"),
          open("How would you investigate an app container that is running but cannot reach its database?", "Check service DNS and shared network, database listener/bind address, container port, credentials/config, startup readiness, and logs from both services.", "Stretch"),
        ],
        scenarios: [
          open("A database loses its data when you recreate its container. What was probably missing?", "A volume or bind mount for its data directory; data only in the container writable layer disappears with the container.", "Warm-up"),
          open("Your browser reaches `localhost:8080`, but the web container cannot reach its DB at `localhost:5432`. Why?", "The web container's localhost is itself. Configure the connection to use the database's Compose service name and container port.", "Warm-up"),
          open("A Compose app starts before Postgres accepts connections and crashes. How do you make startup resilient?", "Add a meaningful health check/readiness condition where supported and implement bounded application retries with clear logs; do not rely solely on process start order.", "Working"),
          open("A host port is published, but remote peers still cannot connect. What else must you check?", "The app's bind address inside the container, host firewall and interface binding, host route/NAT, and whether the request targets the correct host and port.", "Working"),
          open("A teammate proposes `docker compose down -v` to fix a broken app. What do you do first?", "Determine whether named volumes contain needed state, inspect status/logs/config, back up data if needed, and prefer the least destructive action; `-v` deletes project volumes.", "Stretch"),
        ],
      },
    ],
  },
  {
    id: "ci-cd",
    number: "04",
    title: "CI/CD",
    shortTitle: "CI / CD",
    description: "Automate a trustworthy path from a small code change to tested, versioned, reproducible software—without a cloud deployment detour.",
    color: "lavender",
    prerequisites: [
      { label: "Terminal & Bash · all three chapters", href: "/subjects/terminal-bash" },
      { label: "Docker · image builds", href: "/subjects/docker/docker-images-builds" },
      { label: "Git basics are assumed", href: "https://git-scm.com/book/en/v2" },
    ],
    references: [
      { label: "GitHub Actions · Understanding the basics", href: "https://docs.github.com/en/actions/get-started/understand-github-actions", helps: "Workflow events, jobs, steps, runners, and the Actions mental model." },
      { label: "GitHub Actions · Continuous integration", href: "https://docs.github.com/en/actions/get-started/continuous-integration", helps: "Run build and test checks on repository changes and inspect their results." },
      { label: "GitLab · First CI/CD pipeline", href: "https://docs.gitlab.com/ci/quick_start/", helps: "A second platform's concise pipeline-as-code model using `.gitlab-ci.yml`." },
    ],
    chapters: [
      {
        id: "cicd-principles",
        title: "A pipeline is executable team memory",
        subtitle: "Continuous integration, delivery, deployment, Git events, and feedback",
        minutes: 34,
        objectives: ["Define CI, continuous delivery, and continuous deployment", "Connect small changes with fast feedback", "Separate build artifacts from source and environment", "Recognize useful pipeline signals and failure modes"],
        sections: [
          { title: "CI, delivery, deployment", paragraphs: ["Continuous integration (CI) means integrating small changes frequently and automatically building and checking them. The goal is to discover conflicts and defects while the change is still small enough to understand. CI is a team practice supported by automation, not just a green badge on a repository.", "Continuous delivery keeps the software in a state where a validated change can be released; the release decision may still be a human choice. Continuous deployment automatically releases every qualifying change. The distinction is about the release decision, not a particular vendor or cloud service."], bullets: ["Build: turn source and declared dependencies into a candidate artifact.", "Test: collect evidence that important behavior still works.", "Release/deploy: make a version available or run it in a target environment." ] },
          { title: "Small changes make feedback useful", paragraphs: ["A pipeline is most effective when commits are reviewable, builds are repeatable, and checks finish quickly enough to guide the author. Slow feedback encourages batching and makes failures harder to connect to a cause. Run fast checks early and reserve expensive integration checks for later stages when appropriate.", "A green pipeline is evidence about the checks that ran, not proof of correctness. Tests have blind spots, dependencies can change, and a workflow can accidentally skip the path it was meant to validate. Review the trigger, scope, and commands as carefully as the result."], code: "on: [pull_request, push]\njobs:\n  verify:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: ./scripts/lint.sh\n      - run: ./scripts/test.sh" },
          { title: "Make the artifact traceable", paragraphs: ["An artifact is the output of a build: a package, binary, archive, or container image. It should be linked to the source revision and build inputs that produced it. Rebuilding the same commit should be predictable enough to explain meaningful differences.", "Do not confuse the artifact with a running environment. The same image can be run with different configuration in different places. Keeping configuration outside the image makes the artifact easier to promote and inspect without baking environment-specific values or secrets into it."], bullets: ["Record the commit SHA and artifact identity.", "Keep logs that identify the exact failing step.", "Make test and build commands available locally when practical." ] },
          { title: "Design a useful feedback loop", paragraphs: ["A reliable pipeline answers: what event triggered it, which revision it tested, which checks ran, where the artifact went, and why a failure occurred. Jobs should fail visibly when a required check fails. Optional reporting steps should not hide a test failure or accidentally turn it into success.", "CI does not remove code review or engineering judgment. It gives reviewers repeatable evidence and prevents common regressions from being rediscovered manually. Start with a small valuable set of checks and add stages only when they answer a real risk."], note: "Cloud deployment is outside this course. You can learn CI deeply by building, testing, and packaging locally or in a hosted runner without deploying to cloud infrastructure." },
        ],
        lab: { title: "Map a change from commit to evidence", steps: ["Choose a small repository and identify its lint, test, and build commands.", "Write down the event that should trigger validation: push, pull request, or both.", "Describe the artifact produced and how to tie it to the commit that created it.", "Decide which checks should be fast and mandatory and what a failure should report."], success: "You can explain the pipeline's purpose and point to the evidence behind its green or red status." },
        recall: [
          { question: "What does a non-zero command status usually indicate?", answer: "The command reported failure or another non-success condition; scripts should interpret it deliberately.", from: "Make small tools work together" },
          { question: "What is a Docker image compared with a running container?", answer: "An image is a template; a container is a runtime process instance and state created from it.", from: "A container is a process with boundaries" },
          { question: "Why keep application configuration outside the image?", answer: "It lets the same immutable artifact run with different environment configuration and avoids baking secrets into image layers.", from: "Build a repeatable image" },
          { question: "What does `set -o pipefail` help expose?", answer: "Failure in an earlier stage of a shell pipeline.", from: "Make small tools work together" },
          { question: "What is a build artifact?", answer: "The output produced from source and build inputs, such as a package or container image." },
        ],
        mcqs: [
          q("What is the central CI practice?", ["Integrate small changes frequently and check them automatically", "Deploy every change directly to production", "Replace code review", "Run one build once a year"], 0, "CI emphasizes frequent integration and early automated feedback.", "Warm-up"),
          q("What best distinguishes continuous delivery from continuous deployment?", ["Whether every qualifying change is released automatically", "Whether tests exist", "Whether code is stored in Git", "Whether builds use Linux"], 0, "Delivery keeps a release-ready state with a release decision; deployment automatically releases qualifying changes.", "Warm-up"),
          q("What is an artifact?", ["A build output such as a package or image", "A Git branch name only", "A runner's CPU", "A shell alias"], 0, "Artifacts are outputs that can be stored, inspected, or consumed by later stages.", "Warm-up"),
          q("Why keep changes small in a CI workflow?", ["Failures are easier to connect to a small change and feedback arrives sooner", "Pipelines can skip tests", "Small commits do not need review", "It makes DNS faster"], 0, "Small changes reduce integration risk and make feedback more actionable.", "Working"),
          q("What does a green pipeline prove?", ["The checks that ran passed for the tested revision", "The software has no defects", "Every production environment is healthy", "The workflow cannot be misconfigured"], 0, "CI gives evidence from its configured checks; it cannot prove all behavior correct.", "Working"),
          q("Why should an artifact be traceable to a source revision?", ["To connect what was built and tested with the exact change", "To make the artifact larger", "To avoid storing logs", "To make tags mutable"], 0, "Traceability helps reproduce, audit, and diagnose the build.", "Working"),
          q("What happens when optional reporting logic accidentally overrides a failed test status?", ["The pipeline can give a misleading green result", "The artifact becomes immutable", "The runner is isolated", "The test runs twice"], 0, "Required check failures must remain visible and determine job success.", "Working"),
          q("Which statement about CI and code review is strongest?", ["CI replaces human review", "CI provides repeatable evidence that supports review", "CI guarantees correctness", "CI only applies to cloud deployments"], 1, "Automated checks support reviewers but leave design and judgment to people.", "Stretch"),
          q("A workflow passes on the default branch but does not run for pull requests. What should you inspect?", ["Workflow triggers and branch/event filters", "The artifact's file extension", "The shell prompt color", "The host's DNS cache only"], 0, "A green run says nothing about an event path that never triggered the required checks.", "Stretch"),
          q("What is a useful first pipeline for a small project?", ["A small set of fast, valuable lint/test/build checks", "A complete production deployment framework", "Twenty optional dashboards", "A job that always succeeds"], 0, "Start with checks that catch meaningful regressions and give quick feedback.", "Stretch"),
        ],
        interview: [
          open("Define continuous integration and explain its purpose.", "CI integrates changes frequently and runs repeatable build/test checks so conflicts and defects surface early.", "Warm-up"),
          open("How do continuous delivery and deployment differ?", "Delivery keeps changes release-ready while a human may choose when to release; deployment automatically releases every qualifying change.", "Warm-up"),
          open("What does a green pipeline mean and what does it not mean?", "The configured checks passed for the tested revision; it does not prove there are no bugs or that every environment is healthy.", "Working"),
          open("How would you decide which checks belong in an early CI pipeline?", "Prioritize fast, reliable checks tied to real regression risks, make required failures visible, and expand as evidence shows a need.", "Working"),
          open("Why should the same artifact move through later stages instead of being rebuilt independently?", "Promoting the tested artifact preserves identity and avoids silently changing build inputs between validation and release.", "Stretch"),
        ],
        scenarios: [
          open("A team waits until Friday to merge a week's worth of changes. Which CI principle would help most?", "Integrate smaller changes more frequently and run automated checks so conflicts and failures are localized to recent work.", "Warm-up"),
          open("A pipeline is green, but a developer says the pull-request workflow never triggered. What is the issue?", "The successful run does not cover that event path; inspect workflow triggers/filters and require the correct PR checks.", "Warm-up"),
          open("A test fails, but a notification step makes the whole job show success. How do you fix the feedback?", "Preserve and propagate the required test exit status; make notifications/reporting conditional or separate without masking the failed check.", "Working"),
          open("The team rebuilds an application separately before each environment and gets different outputs. How do you improve traceability?", "Build once from declared inputs, record the source revision and artifact identity, then promote that same artifact while supplying external configuration per environment.", "Working"),
          open("Managers treat a green CI badge as proof there are no defects. How do you set a more accurate expectation?", "Explain which revision and checks ran, identify coverage and environment limits, and treat the result as repeatable evidence alongside review and operational signals.", "Stretch"),
        ],
      },
      {
        id: "workflow-mechanics",
        title: "Read the pipeline as a program",
        subtitle: "Events, jobs, steps, runners, dependencies, artifacts, caches, and secrets",
        minutes: 40,
        objectives: ["Read workflow triggers and dependency graphs", "Distinguish jobs, steps, and runners", "Use artifacts and caches for different purposes", "Scope secrets and permissions"],
        sections: [
          { title: "Events, jobs, steps, runners", paragraphs: ["A workflow starts because an event occurs, such as a push, pull request, or manual request. A job groups work and runs on a runner, often a fresh virtual machine or container. Steps execute commands or reusable actions in order within a job; jobs may run in parallel unless dependencies say otherwise.", "Runners are execution environments, so their operating system, installed tools, permissions, and network access matter. A clean runner exposes undeclared dependencies that a developer's workstation may hide. Pinning tool versions or using a known container can improve consistency, while updates still need an intentional policy."], code: "name: verify\non:\n  pull_request:\n  push:\n    branches: [main]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: ./scripts/test.sh" },
          { title: "Dependencies, artifacts, and caches", paragraphs: ["A job dependency expresses ordering and can pass outputs or artifacts to a later job. Artifacts are outputs worth retaining or consuming, such as test reports and packages. A cache is a performance optimization for data that can be recreated, such as dependency downloads; it should not be the only copy of something required for correctness.", "Cache keys should reflect the inputs that determine the cached data, such as lockfiles and tool versions. A stale or overly broad cache can cause confusing failures. Make the workflow correct with an empty cache, then add caching and verify that cache misses still work."], bullets: ["Artifact: valuable output from this run, often retained for inspection or promotion.", "Cache: reusable intermediate data to save work; safe to miss and rebuild.", "Job output: small values for downstream workflow decisions." ] },
          { title: "Secrets and permissions", paragraphs: ["A CI secret is sensitive input made available to a workflow under some scope. Limit which events and jobs can access it, avoid printing it, and avoid exposing privileged secrets to untrusted code from forked pull requests. Masking in logs is helpful but is not a substitute for not leaking the value.", "Give the workflow only the repository permissions it needs. Third-party actions or reusable components execute code in your pipeline context; review their source, pin trusted versions where appropriate, and update intentionally. A workflow file is executable code and deserves the same review attention as application code."], code: "permissions:\n  contents: read\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: ./scripts/test.sh", note: "Do not put secrets in workflow YAML or Docker build args that become part of image history. Keep credentials scoped and out of logs/artifacts." },
          { title: "Debug by following the graph", paragraphs: ["When a workflow fails, identify the event, commit SHA, runner, job, and exact step first. Read the earliest meaningful error and its surrounding logs. Then reproduce the command on a clean local environment or matching container. A later failure can be fallout from an earlier missing artifact, wrong working directory, or failed checkout.", "A workflow's dependency graph is part of its logic. If two jobs both mutate shared state without coordination, parallel execution may expose a race. Prefer explicit inputs and outputs rather than hidden runner state. Hosted runners are often disposable; self-hosted runners add maintenance and isolation responsibilities."], code: "# Reproduce one failing workflow command locally\n./scripts/test.sh\n\n# Inspect the current revision and working tree\ngit rev-parse HEAD\ngit status --short" },
        ],
        lab: { title: "Add a pull-request verification workflow", steps: ["Create a workflow triggered on pull requests and pushes to the main branch.", "Use a clean runner, check out the exact revision, and run lint and tests as separate named steps.", "Save a test report as an artifact; if you add a cache, key it by the dependency lockfile.", "Restrict token permissions to read-only and keep the workflow green only when required checks pass."], success: "The workflow explains what triggered it, which commit it tested, and where results live." },
        recall: [
          { question: "What is continuous integration meant to provide?", answer: "Frequent automated build/test feedback on integrated changes." , from: "A pipeline is executable team memory" },
          { question: "What does a workflow event do?", answer: "It triggers pipeline execution, such as for a push or pull request." },
          { question: "What is the difference between an artifact and a cache?", answer: "An artifact is an output to retain/consume; a cache is recreatable intermediate data used to save time." },
          { question: "Why keep shell commands explicit and checked?", answer: "A non-zero command status should remain visible so failures are not masked by later steps.", from: "Make small tools work together" },
          { question: "Why should a workflow receive only necessary permissions?", answer: "A compromised or misconfigured step then has less authority to misuse." },
        ],
        mcqs: [
          q("What normally starts a workflow?", ["An event such as a push or pull request", "A Docker volume", "A shell alias", "A port mapping"], 0, "Workflow triggers connect repository or manual events to automation.", "Warm-up"),
          q("What is a runner?", ["The environment that executes a job", "A Git tag", "A cache key", "A container port"], 0, "A runner provides the machine/container and tooling where job steps execute.", "Warm-up"),
          q("What is a step?", ["An ordered command or action inside a job", "A DNS record", "A runner's operating system only", "A persistent volume"], 0, "Steps execute within a job and can run commands or reusable actions.", "Warm-up"),
          q("Which is the best use for a cache?", ["Recreatable dependencies that speed a later run", "The only copy of a release binary", "The only copy of a database backup", "A secret in plaintext"], 0, "Caches optimize work but should be safe to miss and recreate.", "Working"),
          q("Which is the best use for an artifact?", ["A test report or package produced by a run", "A reusable cache for every input", "A workflow trigger", "A command status"], 0, "Artifacts retain or pass useful run outputs to people or later jobs.", "Working"),
          q("Why should cache keys include relevant dependency inputs?", ["To avoid reusing data built for incompatible inputs", "To hide test failures", "To make runner permissions broader", "To publish ports"], 0, "Input-aware keys reduce stale or incompatible cache reuse.", "Working"),
          q("Why are secrets risky in workflows triggered by untrusted pull requests?", ["Untrusted code could execute in a context with access to them", "Pull requests cannot run code", "Secrets are always printed", "The workflow cannot use branches"], 0, "A workflow can execute contributor-controlled code; privileged secret access must be carefully scoped.", "Working"),
          q("What is a strong first step when a job fails?", ["Identify the exact commit, job, step, and earliest useful error", "Clear every cache and rewrite the workflow", "Increase all permissions", "Ignore the runner logs"], 0, "The execution context and first causal error narrow the investigation.", "Stretch"),
          q("Two jobs unexpectedly race on generated files. What workflow issue is likely?", ["Implicit shared mutable state or missing dependency", "A DNS TTL mismatch", "An image tag typo only", "A Bash prompt setting"], 0, "Parallel jobs should communicate through explicit dependencies and artifacts rather than assumed shared runner state.", "Stretch"),
          q("Why should third-party actions be treated as executable code?", ["They run logic in the workflow's environment and may access its context", "They only change CSS", "They cannot affect secrets", "They replace the runner kernel"], 0, "Actions execute in the pipeline context and should be reviewed and permission-scoped.", "Stretch"),
        ],
        interview: [
          open("What is the difference between a workflow, job, step, and runner?", "An event triggers a workflow; the workflow contains jobs; a job contains ordered steps and is executed by a runner environment.", "Warm-up"),
          open("When do you use an artifact instead of a cache?", "Use an artifact to retain or pass a meaningful run output; use a cache for recreatable intermediate data that improves speed.", "Working"),
          open("How do you reduce the risk of leaking CI secrets?", "Minimize secret scope and permissions, do not expose privileged secrets to untrusted code, never print them, and keep them out of images, artifacts, and logs.", "Working"),
          open("How would you debug a flaky workflow that passes locally?", "Compare clean runner OS/tool versions, exact commit and environment, then reproduce in a clean container; remove hidden state and inspect time, concurrency, and external dependencies.", "Working"),
          open("Why are self-hosted runners a security and operations decision?", "They require patching, isolation, credential and network controls, and cleanup; persistent runner state can cross-contaminate jobs.", "Stretch"),
        ],
        scenarios: [
          open("A later workflow job cannot find a file created by the test job. What might be missing?", "Jobs may run on separate clean runners. Publish the file as an artifact or have the downstream job rebuild it; do not assume shared disk state.", "Warm-up"),
          open("An npm cache hit causes tests to use stale dependencies after a lockfile update. What should you change?", "Include the lockfile and relevant runtime/tool versions in the cache key, and ensure cache miss/install logic remains correct.", "Warm-up"),
          open("A pull request from an unknown fork should run tests but must not receive deployment credentials. How do you structure permissions?", "Allow the untrusted test workflow the minimum read-only access, keep privileged secrets out of that event, and use a separately gated trusted workflow for sensitive actions.", "Working"),
          open("A job log says 'command not found' although it works on a developer laptop. How do you investigate?", "Inspect runner OS/image, PATH and tool versions, setup steps, shell, and working directory; declare/install the dependency in the workflow or use a known container.", "Working"),
          open("A workflow fails only when two jobs run in parallel. How do you find and fix the race?", "Identify shared mutable inputs, inspect job dependencies, make outputs explicit artifacts, isolate workspaces, or serialize only the conflicting section.", "Stretch"),
        ],
      },
      {
        id: "container-ci-pipeline",
        title: "Test and package a container locally",
        subtitle: "A complete cloud-free pipeline: validate, test, build, inspect, and trace an image",
        minutes: 46,
        objectives: ["Order checks from fast feedback to slower packaging", "Build a Docker image from a commit in CI", "Tag and identify the image without confusing tag and identity", "Diagnose pipeline failures from logs and inputs"],
        sections: [
          { title: "Design stages around feedback", paragraphs: ["A useful starter pipeline checks out one revision, installs declared dependencies, runs formatting/lint checks, runs unit tests, and builds the container image. Put quick deterministic checks before slow integration work so authors learn about easy failures sooner.", "The pipeline should run the same project commands developers use where practical. Avoid a large mismatch between local and CI steps: put stable commands in repository scripts or a task runner, then call those from the workflow."], code: "steps:\n  - uses: actions/checkout@v4\n  - run: ./scripts/lint.sh\n  - run: ./scripts/test.sh\n  - run: docker build -t sample-app:${{ github.sha }} ." },
          { title: "Build and identify an image", paragraphs: ["Use the source commit SHA as a traceable local tag in the job. A tag makes the image convenient to name, but tags are mutable references. Record the image ID/digest and the source revision together in build output or metadata when the workflow needs stronger identity.", "A successful build says the builder produced an image; it does not prove the image starts or serves its intended request. Add a smoke check that runs the image with controlled configuration, waits for readiness, exercises one local request, and reliably removes the test container."], code: "image=sample-app:${GITHUB_SHA}\ndocker build --pull -t \"$image\" .\ndocker image inspect \"$image\" --format '{{.Id}}'\ndocker run -d --rm --name sample-smoke -p 127.0.0.1:18080:8080 \"$image\"\ncurl --fail --retry 10 --retry-connrefused http://127.0.0.1:18080/" },
          { title: "Keep credentials and build inputs out", paragraphs: ["A cloud-free pipeline can stop after image build and local smoke validation. You do not need registry push or deployment credentials to learn continuous integration, image construction, or artifact traceability. If a later course adds a registry, treat publishing as a separate trust and permission boundary.", "Use `.dockerignore`, least-privilege workflow permissions, and unprivileged runtime settings. Never put credentials in Docker build arguments if they can persist in history. For multi-stage builds, use supported secret-mount mechanisms when a build genuinely needs temporary credentials, and still inspect what the final image contains."], bullets: ["Run the built image with a non-root user when the app supports it.", "Bind a local smoke-test port to `127.0.0.1` to avoid exposing it to the network.", "Clean up test containers and temporary resources even after failures." ] },
          { title: "Make failures actionable", paragraphs: ["Name steps after the operation: lint, unit tests, image build, smoke test. Save reports as artifacts when they help diagnosis. On failure, include the commit SHA and preserve the exact command/log. A failing smoke check could be a wrong port, slow startup, missing runtime files, invalid environment, or the application itself.", "Avoid retrying every failure. Retries are appropriate for known transient boundaries when bounded and observable; they should not conceal a deterministic test or build defect. Cache package downloads for speed only after correctness works on a clean cache miss."], code: "docker logs sample-smoke\ndocker inspect sample-smoke --format '{{json .State}}'\ndocker rm -f sample-smoke", note: "This chapter builds and tests an image on the runner. Pushing it to a registry or deploying it is a later topic." },
        ],
        lab: { title: "Create a cloud-free container CI pipeline", steps: ["Create separate lint, test, image-build, and smoke-test steps for a repository.", "Tag the image with the checked-out commit SHA and record its image ID.", "Run the image on a loopback-only host port and poll a health URL with a bounded timeout.", "Add cleanup that runs after success or failure; verify logs remain available when the smoke test fails."], success: "A change gets fast feedback, a traceable image build, and a local request check without any deployment credentials." },
        recall: [
          { question: "What sequence does a normal HTTP request follow before its application response?", answer: "Name resolution, route/reachability, transport connection, TLS when used, then application exchange.", from: "Follow a packet to its destination" },
          { question: "What does a named volume provide and what doesn't it provide?", answer: "It persists data beyond a container, but is not automatically a backup.", from: "Connect containers and keep data" },
          { question: "What can a green CI check actually establish?", answer: "That the configured checks passed for the revision and event that ran; it cannot prove correctness beyond those checks.", from: "A pipeline is executable team memory" },
          { question: "Why should build secrets stay out of image layers?", answer: "Layer history/cache may preserve them even if a later step deletes the visible file.", from: "Build a repeatable image" },
          { question: "What is the difference between a cache and an artifact?", answer: "A cache speeds work with recreatable data; an artifact is a meaningful output retained or passed between stages.", from: "Read the pipeline as a program" },
        ],
        mcqs: [
          q("Which order usually gives fast feedback early?", ["Lint, unit tests, image build, smoke test", "Smoke test, deploy, then checkout", "Cache, publish secret, lint", "Build a release before checking out code"], 0, "Fast deterministic checks should normally run before slower packaging and smoke validation.", "Warm-up"),
          q("What does tagging an image with a commit SHA provide?", ["A convenient traceable name tied to source", "An immutable identity by itself", "A guaranteed successful app", "A network route"], 0, "The tag communicates source association, but tags remain mutable references.", "Warm-up"),
          q("What does a container smoke test add after `docker build` succeeds?", ["Evidence that the built image can start and answer a basic request", "A guarantee of no bugs", "A production deployment", "An automatic database backup"], 0, "A smoke test exercises runtime startup and a basic application path beyond image construction.", "Warm-up"),
          q("Why bind a local smoke-test port to `127.0.0.1`?", ["To limit access to the local loopback interface", "To make it publicly reachable", "To disable the container port", "To change the image digest"], 0, "Loopback binding avoids exposing the temporary test port to other network interfaces.", "Working"),
          q("Which identity is stronger than an image tag for exact content?", ["Image ID/digest", "Container name", "Workflow name", "Port number"], 0, "A content identity is stronger because the tag can be retargeted.", "Working"),
          q("Why add cleanup for a smoke-test container after a failed job?", ["To keep the runner state isolated and predictable", "To erase pipeline logs", "To mutate the base image", "To skip the health check"], 0, "Reliable cleanup prevents stale resources from affecting later work and avoids leaking runner resources.", "Working"),
          q("Do you need registry credentials to learn container CI?", ["No; building and testing locally on the runner is enough for these fundamentals", "Yes, for every Docker build", "Only if using Bash", "Only for linting"], 0, "Image build and smoke tests do not require publishing to a registry.", "Working"),
          q("A built image starts, but its smoke test cannot reach the service. What should you check?", ["Container bind address/port, host mapping, readiness, and logs", "The CI badge color", "The image author's email", "The Git branch description"], 0, "Those checks distinguish service startup and network path from build success.", "Stretch"),
          q("Why should a CI cache be optional for correctness?", ["A clean cache miss must still reproduce dependencies and build", "Caches cannot be restored", "Artifacts are always deleted", "Runners have no storage"], 0, "A cache is only an optimization; workflow logic must work when it is absent or invalidated.", "Stretch"),
          q("What is the correct response to deterministic test failure after a retry?", ["Inspect and fix the underlying failure rather than hiding it with more retries", "Retry forever", "Mark the workflow successful manually", "Skip the test in CI"], 0, "Retries are for bounded known transient conditions and should not mask deterministic defects.", "Stretch"),
        ],
        interview: [
          open("What are the stages of a minimal container CI pipeline?", "Check out a revision, install declared dependencies, run lint/tests, build the image, then start it and perform a small smoke request.", "Warm-up"),
          open("How can an image be tied to the commit that produced it?", "Use the commit SHA in metadata/tagging and record the content ID/digest with the source revision in the job output.", "Working"),
          open("What does a smoke test validate that an image build does not?", "It checks runtime startup and a basic request path, revealing missing files, configuration, ports, or startup issues.", "Working"),
          open("How would you secure a local container smoke test in CI?", "Use minimal workflow permissions, no unnecessary secrets, a non-root runtime where feasible, a loopback-only host port, bounded health polling, and reliable cleanup.", "Working"),
          open("When are retries justified in a pipeline?", "For a known transient boundary with a bounded retry and visible attempt/result logging; not for deterministic test or build failures.", "Stretch"),
        ],
        scenarios: [
          open("The image builds, but the app exits immediately in the smoke step. Where do you start?", "Inspect the container's exit status and logs, then compare ENTRYPOINT/CMD, required runtime files, environment, and the main-process behavior.", "Warm-up"),
          open("CI smoke tests accidentally expose port 8080 on every runner interface. How do you narrow exposure?", "Publish it on loopback only, for example `127.0.0.1:18080:8080`, and ensure the test uses that local endpoint.", "Warm-up"),
          open("The health check races the app startup and sometimes fails. How do you make it robust without masking a real failure?", "Poll a meaningful endpoint with a bounded timeout and clear logs, inspect container health/readiness, and fail when the deadline expires rather than using unbounded retries.", "Working"),
          open("A team wants a secret to download a private dependency during image build. What should you recommend?", "Use a supported temporary BuildKit secret mount and tightly scoped workflow credentials, keep the secret out of context/layers/logs, and inspect the result; consider whether the dependency can be fetched in an earlier trusted step.", "Working"),
          open("The same commit creates different images on separate runs. Design an investigation.", "Compare base image digests, lockfiles, toolchain, build context, network-fetched dependencies, timestamps, architecture, and cache behavior; make inputs explicit and record artifact identity.", "Stretch"),
        ],
      },
    ],
  },
];

export const allChapters = subjects.flatMap((subject) =>
  subject.chapters.map((chapter) => ({ subject, chapter })),
);

export function getSubject(id: string) {
  return subjects.find((subject) => subject.id === id);
}

export function getChapter(subjectId: string, chapterId: string) {
  const subject = getSubject(subjectId);
  const chapter = subject?.chapters.find((item) => item.id === chapterId);
  return subject && chapter ? { subject, chapter } : undefined;
}

export function previousChapter(subjectId: string, chapterId: string) {
  const index = allChapters.findIndex(
    ({ subject, chapter }) => subject.id === subjectId && chapter.id === chapterId,
  );
  return index > 0 ? allChapters[index - 1] : undefined;
}
