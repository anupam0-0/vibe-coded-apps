export type Difficulty = "Warm-up" | "Apply" | "Diagnose" | "Design";

export type Question = {
  prompt: string;
  choices: [string, string, string, string];
  answer: number;
  difficulty: Difficulty;
  hint: string;
  explanation: string;
};

export type LessonBlock = {
  title: string;
  story: string;
  details: string[];
  code?: string;
  note?: string;
};

export type CourseModule = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  duration: string;
  tone: "coral" | "sage" | "sun" | "sky";
  bigIdea: string;
  model: string[];
  goals: string[];
  blocks: LessonBlock[];
  fieldNote: string;
  quiz: Question[];
};

let questionNumber = 0;

const q = (
  difficulty: Difficulty,
  prompt: string,
  choices: Question["choices"],
  answer: number,
  hint: string,
  explanation: string,
): Question => {
  const desiredPosition = (questionNumber * 3 + Math.floor(questionNumber / 4)) % 4;
  questionNumber += 1;
  const shift = (desiredPosition - answer + choices.length) % choices.length;
  const balancedChoices: Question["choices"] = ["", "", "", ""];
  choices.forEach((choice, index) => {
    balancedChoices[(index + shift) % choices.length] = choice;
  });
  return { difficulty, prompt, choices: balancedChoices, answer: desiredPosition, hint, explanation };
};

export const course: CourseModule[] = [
  {
    id: "querying",
    number: "01",
    title: "Ask the database a better question",
    subtitle: "SQL, indexes, and reading the plan before the write",
    duration: "18 min",
    tone: "coral",
    bigIdea: "A SQL statement is a request for work. Before scaling the request, learn what work the database thinks you asked it to do.",
    model: ["SQL intent", "Planner", "Access path", "Rows touched"],
    goals: ["Predict the rows a statement can touch", "Choose an index that matches a query shape", "Read EXPLAIN without treating it as a speed certificate"],
    blocks: [
      {
        title: "Start with the shape of the data",
        story: "A table is a stack of pages in a filing room. SQL describes the records you want; it does not promise which shelves the database will visit to find them.",
        details: [
          "SELECT reads; INSERT adds; UPDATE changes matching rows; DELETE removes matching rows. JOIN combines related rows, GROUP BY forms groups, and HAVING filters those groups after aggregation.",
          "A subquery or CTE names an intermediate result. A window function calculates across related rows while keeping each row visible—for example, ranking orders per customer. Learn these because migrations often need a careful WHERE clause, a stable ordering, or a per-group progress check.",
          "Before a bulk UPDATE, count the candidate rows with the same predicate. Ask whether the predicate includes every intended record, whether NULL values change the logic, and whether a concurrent insert can join the target set halfway through."
        ],
        code: "SELECT count(*)\nFROM users\nWHERE config_version = 1;\n\nUPDATE users\nSET config_version = 2\nWHERE config_version = 1;",
        note: "The count is a planning check, not a reservation. Data can change after the SELECT, so the update itself must still have a correct predicate."
      },
      {
        title: "Indexes buy a route, at a price",
        story: "A B-tree index is like a sorted card catalog pointing to table rows. It can make a selective lookup faster, but it takes storage and every relevant write has to keep it current.",
        details: [
          "A sequential scan walks table pages in order. An index scan follows index entries to table rows. An index-only scan can answer from the index when the needed columns are present and PostgreSQL's visibility map says heap visibility checks can be skipped.",
          "A composite index is ordered by its leftmost columns. An index on (status, id) can support filtering by status and then walking ids; it generally cannot efficiently serve a predicate on id alone in the same way.",
          "PostgreSQL's ordinary table is a heap: rows live in heap pages, while a B-tree index is a separate structure that points to tuple locations. Some database engines use a clustered index as the table's primary physical organization. PostgreSQL's CLUSTER command can rewrite a table into index order, but later writes do not keep that order continuously maintained.",
          "An index is not automatically faster. If a query needs a large fraction of the table, random heap lookups may cost more than one sequential pass. Indexing a column also adds write amplification when that column changes."
        ],
        code: "CREATE INDEX users_status_id_idx\nON users (status, id);\n\nSELECT id\nFROM users\nWHERE status = 'active' AND id > 9000\nORDER BY id\nLIMIT 500;",
        note: "Unique constraints and foreign keys also encode correctness rules. They are more than query-speed decorations."
      },
      {
        title: "Let the plan challenge your intuition",
        story: "The planner estimates the cost of different routes using table statistics, selectivity, available indexes, and expected row counts. It chooses an estimate, not a guarantee about real latency.",
        details: [
          "EXPLAIN shows a planned path without executing the query. EXPLAIN ANALYZE executes it and reports observed work. For a SELECT, that can be useful on safe data; for a mutating statement, the mutation really happens unless you wrap it in a transaction and roll it back.",
          "Compare estimated rows with actual rows, scan type, loops, sort work, and buffer reads. A large estimate error can send the planner down a poor route. Stale statistics, skewed data, or a parameter-specific distribution can explain the mismatch.",
          "The rough path is SQL text → parser → planner/optimizer → execution plan → executor and storage engine. The planner chooses among possible scans and joins using estimates; the executor performs the selected operations against table pages and indexes.",
          "A plan that is fast on 1,000 rows may behave differently on 10 million. Measure representative data and consider the whole workload: a new index that speeds one read may slow every update."
        ],
        code: "EXPLAIN (ANALYZE, BUFFERS)\nSELECT id FROM users\nWHERE config_version = 1\nORDER BY id\nLIMIT 1000;",
        note: "Do not run EXPLAIN ANALYZE on a production UPDATE just to see what happens; it performs the update."
      },
      {
        title: "Pagination changes the amount of discarded work",
        story: "OFFSET pagination asks the database to walk past earlier rows again. A cursor remembers where the last page ended and starts from that boundary.",
        details: [
          "With ORDER BY id, keyset pagination uses WHERE id > last_id ORDER BY id LIMIT batch_size. A matching index lets each batch seek forward instead of skipping an ever-growing prefix.",
          "Stable ordering matters. A non-unique sort key can repeat or skip records unless a unique tie-breaker is included, such as (created_at, id). Rows changing their sort key during processing can still move across the cursor boundary.",
          "A high-water mark can define the set that existed when the job began. Whether to include newly created rows is a product decision: capture a maximum id, or deliberately let the run continue to chase incoming data."
        ],
        code: "SELECT id\nFROM users\nWHERE id > :last_id AND id <= :high_water_id\nORDER BY id\nLIMIT 10000;",
        note: "Pagination chooses a traversal strategy. It does not by itself make the update safe, atomic, or resumable."
      }
    ],
    fieldNote: "When a plan says “Seq Scan,” ask how many rows qualify and whether touching most of the table is actually the expensive part. A sequential scan can be the right plan.",
    quiz: [
      q("Warm-up", "An UPDATE statement has no WHERE clause. What is the first operational assumption to make?", ["It changes no rows until a lock is taken", "It targets every row in the table", "It changes only rows with non-NULL values", "It changes one row per index"], 1, "Read the statement literally before thinking about its execution plan.", "Without a WHERE predicate, every row is a target. A plan can make that work more efficient, but it cannot narrow the intended set for you."),
      q("Warm-up", "Why might a B-tree index on email help SELECT ... WHERE email = ...?", ["It stores all table rows in RAM", "It gives the database an ordered lookup path to matching row locations", "It removes the need for a transaction", "It automatically makes email unique"], 1, "An index is a lookup structure, not a correctness rule unless paired with a constraint.", "The B-tree narrows the search path. Uniqueness requires a unique constraint or unique index, and the index still has storage and maintenance costs."),
      q("Warm-up", "Which clause filters groups after GROUP BY has formed them?", ["WHERE", "JOIN", "HAVING", "ORDER BY"], 2, "One filter applies to source rows; another applies to aggregated groups.", "WHERE filters input rows before aggregation. HAVING filters the groups produced by GROUP BY, often using aggregate values."),
      q("Apply", "A table has 10 million rows; a query needs nearly all of them. Why can a sequential scan beat an index scan?", ["A sequential scan avoids many random row lookups", "Indexes cannot be used on large tables", "Sequential scans ignore visibility rules", "The planner always prefers sequential scans"], 0, "Think about the cost of following millions of pointers back to scattered heap pages.", "When most rows qualify, walking the table in page order can cost less than fetching a large fraction of heap rows through index pointers. The planner compares estimated costs."),
      q("Apply", "Queries filter by status and then walk forward by id. Which composite index is the best starting hypothesis?", ["(id, status)", "(status, id)", "(email, status)", "Separate indexes always combine more cheaply"], 1, "B-tree column order matters: equality on the left, then the range/order column is a common pattern.", "An index on (status, id) matches the equality filter on status and the forward id range. Confirm with a representative plan; the right choice depends on query mix and data distribution."),
      q("Apply", "You want actual execution timing and row counts for a SELECT. Which tool gives observations?", ["EXPLAIN only", "EXPLAIN ANALYZE", "CREATE STATISTICS only", "A unique constraint"], 1, "One command plans; the other also executes and reports observations.", "EXPLAIN ANALYZE executes the query and returns actual rows and timing. It is observational, not a guarantee that another dataset or production load will behave the same way."),
      q("Diagnose", "An index scan estimates 20 rows but actually returns 400,000. What is the most useful next thought?", ["The index is corrupt", "Estimates or data distribution may be wrong; inspect statistics and skew", "The query should add OFFSET", "The table must be fully cached"], 1, "Compare estimated and actual rows before replacing the index.", "A large estimate mismatch can cause a poor plan choice. Statistics may be stale or fail to capture skew; inspect the full plan and data distribution before changing indexes."),
      q("Diagnose", "Why can updating an indexed column make a bulk migration more expensive?", ["The index entry may also need maintenance, adding writes", "The table becomes read-only", "The planner disables WAL", "Every update rebuilds every index from scratch"], 0, "A logical row change can have effects beyond the heap tuple.", "Changing an indexed value can require index maintenance, in addition to the row version and WAL. It does not normally rebuild the entire index, but it adds physical work."),
      q("Design", "A batch job uses OFFSET 4,000,000 LIMIT 10,000. It slows as it advances. Which redesign best addresses traversal cost?", ["Use a random starting offset", "Use a stable keyset cursor such as id > last_id with a matching index", "Increase OFFSET to 5,000,000", "Remove ORDER BY so rows come back faster"], 1, "Avoid rescanning and discarding an ever-growing prefix; keep deterministic order.", "Keyset pagination seeks from the last key and processes the next ordered range. Removing ordering makes resume boundaries unsafe; increasing OFFSET makes discarded work larger."),
      q("Design", "A migration should process only users present when it starts, ordered by id. Which boundary makes that intent explicit?", ["Use id > last_id with no upper limit", "Capture a high-water id and query last_id < id <= high_water_id", "Sort by mutable display name", "Use OFFSET so later inserts are naturally hidden"], 1, "A cursor marks the lower boundary; what marks the original population's upper boundary?", "A captured high-water id bounds the initial cohort. Combine it with a stable unique cursor and a deliberate policy for users created later."),
    ]
  },
  {
    id: "transactions",
    number: "02",
    title: "Transactions, locks & invisible history",
    subtitle: "ACID, isolation, MVCC, WAL, and why long writes create a wake",
    duration: "20 min",
    tone: "sage",
    bigIdea: "Transactions define which pieces of work succeed together. Isolation and locking define what competing work can observe while they run.",
    model: ["Begin", "Read / write", "Conflict rules", "Commit"],
    goals: ["Separate atomicity from idempotency", "Recognize lock contention and common anomalies", "Explain why MVCC leaves old row versions behind"],
    blocks: [
      {
        title: "ACID is a set of promises with different jobs",
        story: "Think of a transaction like editing a ledger under a clear set of rules. ACID does not mean every large change is cheap; it describes correctness properties around committing work.",
        details: [
          "Atomicity means the transaction commits as one unit or rolls back. Consistency means declared invariants remain true when the transaction completes. Isolation governs interference with concurrent transactions. Durability means a committed result survives the failures covered by the database's guarantees.",
          "A transaction around one million rows can be atomic and still produce a long lock window, a large WAL burst, and a slow rollback. Batching changes the failure boundary: each batch can commit separately, so partial progress becomes a real state to manage.",
          "Do not use “transactional” as a synonym for “safe.” Ask which invariants the transaction protects, how long it holds resources, and what an operator sees if batch 437 fails."
        ],
        code: "BEGIN;\nUPDATE accounts SET balance = balance - 10 WHERE id = 1;\nUPDATE accounts SET balance = balance + 10 WHERE id = 2;\nCOMMIT;",
        note: "The two balance changes belong together. A ten-million-row backfill may need a different transaction boundary because of its operational footprint."
      },
      {
        title: "Isolation levels are choices about concurrent observations",
        story: "Two clerks can read the same ledger at different moments. Isolation determines whether they see each other's in-progress edits and whether a repeated read can change underneath them.",
        details: [
          "Dirty read: seeing another transaction's uncommitted value. Non-repeatable read: reading the same row twice and seeing a committed change between reads. Phantom: rerunning a predicate and seeing a different set of rows. Lost update: concurrent read-modify-write operations overwrite one another.",
          "PostgreSQL maps READ UNCOMMITTED to READ COMMITTED, so dirty reads do not occur there. READ COMMITTED gives each statement a fresh snapshot. REPEATABLE READ holds a transaction-level snapshot and can abort conflicting writes. SERIALIZABLE aims for an outcome equivalent to some serial order, sometimes by rejecting a transaction that must be retried.",
          "Higher isolation is not a magic switch. It can increase conflicts and retries. Pick the weakest level that preserves the required invariant, and write explicit locking or constraint logic where the invariant needs it."
        ],
        code: "BEGIN ISOLATION LEVEL REPEATABLE READ;\nSELECT balance FROM accounts WHERE id = 1;\n-- the transaction keeps a stable snapshot\nCOMMIT;",
        note: "Isolation-level names hide implementation differences across databases. Verify the semantics of your actual engine."
      },
      {
        title: "Locks protect rows, then queues form behind them",
        story: "A row lock is a “please wait, I am changing this record” sign. If a transaction holds many signs for too long, normal requests line up behind the migration.",
        details: [
          "UPDATE and DELETE acquire row locks for their targets. DDL and explicit locks can involve stronger table-level locks. A deadlock occurs when transactions each hold a resource the other needs; PostgreSQL detects the cycle and aborts one participant.",
          "Short, predictable transactions reduce the time locks are held. Consistent lock ordering reduces deadlocks. A retry policy should treat deadlock or serialization failures as retryable only when the whole transaction is safe to repeat.",
          "Chunking can reduce lock duration per commit, but too many tiny chunks increase round trips and job overhead. Batch size is an operational control to tune against latency, WAL, and contention."
        ],
        code: "-- Keep each unit small enough to commit promptly\nBEGIN;\nUPDATE users SET config_version = 2\nWHERE id > :last_id AND id <= :next_id;\nCOMMIT;",
        note: "Do not hold a transaction open while waiting on an external queue, human action, or slow network call."
      },
      {
        title: "MVCC turns updates into versions, not erasures",
        story: "PostgreSQL MVCC lets readers see a consistent snapshot while writers create a newer row version. The old version must stick around until no active snapshot can still need it.",
        details: [
          "A large UPDATE generates new tuple versions and WAL records. Index changes, full-page writes, replica replay, cache churn, and vacuum work can add more I/O than the SQL text suggests.",
          "Old row versions become dead tuples after they are no longer visible to any active transaction. Vacuum reclaims space for reuse; it does not usually shrink the table file back to the operating system. Long-running transactions can delay cleanup and let dead tuples accumulate.",
          "WAL supports crash recovery and replication. A burst of writes can fill storage, increase replica lag, and push background cleanup into a heavier workload after the statement finishes. Measure effects on the whole database, not only the foreground query time."
        ],
        code: "UPDATE users\nSET settings = settings || '{\"theme\":\"new\"}'::jsonb\nWHERE cohort = 'legacy';",
        note: "A logical “one field changed” update still writes a new row version; PostgreSQL does not edit a value in place like a text editor."
      }
    ],
    fieldNote: "A transaction boundary is also a recovery boundary. Before making it larger, ask what locks, WAL, rollback time, and vacuum delay the larger unit would hold in one breath.",
    quiz: [
      q("Warm-up", "Which ACID property says a transaction's changes commit together or roll back together?", ["Consistency", "Isolation", "Atomicity", "Durability"], 2, "It is the all-or-nothing property.", "Atomicity groups the writes into one commit or rollback result. It does not mean the transaction is small or cheap."),
      q("Warm-up", "What is a dirty read?", ["Reading a row twice and seeing a committed change", "Reading another transaction's uncommitted value", "Reading a stale replica", "Reading without an index"], 1, "Focus on whether the other writer has committed yet.", "A dirty read exposes data that may later roll back. PostgreSQL's READ UNCOMMITTED behaves like READ COMMITTED, so PostgreSQL does not permit dirty reads."),
      q("Warm-up", "What does a row lock primarily protect during an UPDATE?", ["The row from conflicting concurrent changes", "Every row in every related table", "The query plan from changing", "WAL from being written"], 0, "Lock scope is narrower than “all users wait.”", "Row locks coordinate concurrent operations on the same rows. Other queries may still proceed, though table locks, resource pressure, and contention can broaden the impact."),
      q("Apply", "In PostgreSQL READ COMMITTED, two SELECT statements in one transaction can see different committed data because…", ["Each statement gets a fresh snapshot", "WAL is disabled until COMMIT", "All row locks are released between reads", "The isolation level means no isolation"], 0, "Compare statement-level snapshots with a transaction-level snapshot.", "READ COMMITTED takes a new snapshot for each statement. A concurrent commit between the SELECTs may therefore be visible to the second one."),
      q("Apply", "A transaction updates millions of rows and takes several minutes. Which risk follows directly from keeping it open?", ["Old tuple cleanup may be delayed by its snapshot", "Every concurrent SELECT must fail", "The primary stops generating WAL", "The table's indexes disappear"], 0, "Think about versions that still-active snapshots might need.", "A long-running snapshot can prevent vacuum from reclaiming dead tuples that may still be visible to it. Long transactions also extend lock and resource lifetimes."),
      q("Apply", "Two sessions each lock one row, then request the row held by the other. What happened?", ["A phantom read", "A deadlock cycle", "A cache stampede", "A lost checkpoint"], 1, "Each transaction is waiting for a resource held by its counterpart.", "That wait cycle is a deadlock. PostgreSQL detects it and aborts one transaction; the application may retry the complete transaction if safe."),
      q("Diagnose", "A bulk update is slow even though its predicate uses an index. Which explanation should stay on the table?", ["The update may touch many rows and generate WAL, tuple versions, and index work", "An index guarantees constant-time updates", "The transaction has no durability", "EXPLAIN removes row locks"], 0, "An efficient way to find targets does not make changing every target free.", "The access path is only one part of cost. Millions of row versions and related writes still have to be produced, logged, replicated, and cleaned up."),
      q("Diagnose", "Two users load the same balance, add 10, and save it. One increment disappears. Which anomaly is the best fit?", ["Phantom read", "Lost update", "Dirty read", "Write skew is impossible"], 1, "Both writers based their replacement value on one old value.", "A lost update occurs when a later write overwrites a concurrent change based on a stale read. Use atomic arithmetic, a row lock, optimistic version check, or suitable isolation."),
      q("Design", "A transfer must debit one account and credit another. What is the strongest reason to keep both changes in one short transaction?", ["The pair is one invariant: both happen or neither happens", "It makes the index-only scan faster", "It removes the need for balance constraints", "It forces all reads to become SERIALIZABLE"], 0, "Describe the correctness condition if only the debit commits.", "Atomicity preserves the transfer invariant. Keep the transaction narrow and avoid unrelated waits inside it; constraints may still be needed for valid balances."),
      q("Design", "A batch update gets serialization failures under REPEATABLE READ. Which retry design is safest?", ["Retry only the last SQL statement outside its transaction", "Retry the whole transaction with bounded backoff and idempotent logic", "Disable all constraints and continue", "Ignore failures because the database will eventually commit"], 1, "A transaction rejected for a conflict did not commit as a valid unit.", "Retry the complete unit of work, with a bounded policy and repeat-safe behavior. Retrying one statement can invalidate assumptions made earlier in the aborted transaction."),
    ]
  },
  {
    id: "bulk-work",
    number: "03",
    title: "Move millions of rows without a cliff",
    subtitle: "Batching, cursors, checkpoints, and online schema changes",
    duration: "22 min",
    tone: "sun",
    bigIdea: "Large data changes become manageable when the unit of work is bounded, observable, repeatable, and resumable.",
    model: ["Define cohort", "Read a batch", "Write + verify", "Checkpoint"],
    goals: ["Design keyset batches with a clear population boundary", "Place checkpoints where they cannot skip uncommitted work", "Plan schema and data rollout separately"],
    blocks: [
      {
        title: "A large UPDATE is a workload, not a line of SQL",
        story: "The database has to turn each logical mutation into physical work. Ten million rows may mean heap writes, index changes, WAL, replication traffic, cache churn, and later vacuum cleanup.",
        details: [
          "One transaction offers one all-or-nothing boundary, but can hold locks longer, produce a large WAL burst, make rollback expensive, and make progress hard to observe. It may compete with customer traffic for I/O, connections, and CPU.",
          "Batching commits bounded slices. It lets the system pause between slices, tune throughput, and keep partial progress. That trades global atomicity for an explicit state machine: some rows are complete while the job is running.",
          "Decide the eligible cohort first. “All existing users” may need a captured high-water id or a durable cohort table; “all users including signups during the run” needs an ongoing catch-up path."
        ],
        code: "-- One bounded range per transaction\nUPDATE users\nSET config_version = 2\nWHERE id > :last_id AND id <= :next_id\n  AND config_version < 2;",
        note: "A row-count estimate and an explicit inclusion rule are part of the design, not paperwork after the SQL is written."
      },
      {
        title: "Keyset pagination is a resumable cursor",
        story: "Imagine a bookmark placed after the last book you finished. OFFSET asks the librarian to recount every earlier book each time; a keyset cursor starts at the bookmark.",
        details: [
          "Select the next batch with a stable, indexed key: WHERE id > last_id ORDER BY id LIMIT batch_size. Persist the last successfully processed key so a worker can continue after interruption.",
          "Use a unique ordering. If you sort by a non-unique timestamp, add id as a tie-breaker and store both values in the cursor. Avoid ordering by fields the migration itself changes.",
          "If new rows may arrive during processing, state whether they belong. A captured high-water key creates a finite initial cohort; a follow-up sweep, change stream, or lazy path handles later arrivals."
        ],
        code: "SELECT id FROM users\nWHERE (created_at, id) > (:last_created_at, :last_id)\n  AND id <= :high_water_id\nORDER BY created_at, id\nLIMIT 5000;",
        note: "The cursor says where to look next. It does not prove that all work before the cursor committed unless checkpoint ordering is correct."
      },
      {
        title: "A checkpoint must tell the truth",
        story: "A checkpoint is a bookmark saying “everything up to here is durable.” If you move the bookmark before the work commits, a crash makes the worker skip unfinished pages.",
        details: [
          "A migration-job record can track status, cursor, started_at, updated_at, processed count, failure count, and version. Keep progress metadata separate from the user-facing source data when that makes retries and operations clearer.",
          "For a single database transaction, update the batch and checkpoint atomically when possible. If the write succeeds but checkpoint persistence fails, replay the batch safely. If the checkpoint commits first and the row mutation fails, the cursor can skip data.",
          "Counters are useful for dashboards but can drift after retries. Reconcile against source predicates or a verification query before declaring completion. Record enough batch identity to investigate a failure without logging sensitive row contents."
        ],
        code: "BEGIN;\nUPDATE users SET config_version = 2 WHERE id > :last AND id <= :next;\nUPDATE migration_jobs SET last_id = :next WHERE id = :job;\nCOMMIT;",
        note: "If one transaction cannot cover both the data and checkpoint stores, prefer replay-safe work and advance only after durable success."
      },
      {
        title: "Change shape first; backfill second",
        story: "An online migration is staged choreography between old and new application versions. The goal is that old and new versions can safely overlap during rollout.",
        details: [
          "Expand-and-contract: add a compatible nullable field or new structure; deploy code that can read old and new forms; backfill in bounded batches; verify; switch reads; then remove the old shape in a later deploy.",
          "Dual writes can bridge a transition, but they create two sources of failure: one write may succeed while the other fails. Add repair/reconciliation, explicit ownership, and a planned end date so the temporary path does not become permanent ambiguity.",
          "Rollback a data migration is not always a simple reverse UPDATE. If the new representation loses information or users changed it after conversion, a reverse transform may be impossible. Plan a forward-fix, snapshot, or compatibility window before rollout."
        ],
        code: "1. Add new column / table\n2. Deploy compatible readers and writers\n3. Backfill + validate\n4. Switch reads\n5. Remove old field in a later release",
        note: "Schema migration changes what structures exist. Data migration changes existing records. They have different failure modes and rollback plans."
      }
    ],
    fieldNote: "A migration that can pause safely is easier to operate than one that must finish before the maintenance window closes. The cursor and batch semantics are what make that pause real.",
    quiz: [
      q("Warm-up", "What is the main operational trade-off when replacing one huge transaction with batches?", ["Less partial progress, more global atomicity", "Smaller failure and lock units, but intermediate partial progress exists", "No WAL is generated", "Every batch becomes serializable"], 1, "What becomes visible when batch one commits but batch two has not started?", "Batches bound resource use and make pauses/resumes practical, but the overall job is no longer one all-or-nothing transaction. The partial state needs a clear policy."),
      q("Warm-up", "Why is OFFSET often a poor cursor for millions of rows?", ["It may repeatedly walk and discard earlier rows", "It requires a unique index on every column", "It cannot be used with ORDER BY", "It guarantees duplicate records"], 0, "Consider how much earlier data each later page must step over.", "Large offsets can cause repeated work proportional to the skipped prefix. A keyset cursor uses the last stable key to continue forward."),
      q("Warm-up", "What property should the key used for a resumable cursor have?", ["It changes during the backfill", "It gives a stable deterministic order, ideally unique", "It is random for each page", "It is stored only in worker memory"], 1, "A restart needs to know exactly which boundary has already passed.", "A stable unique order prevents page ambiguity. A mutable or non-unique cursor can cause rows to move, repeat, or fall between pages."),
      q("Apply", "A migration should include only users that existed when it started. What can bound that cohort?", ["A maximum id captured at job start", "The worker's current wall-clock time only", "An unbounded cursor that never stops", "An OFFSET that grows with the table"], 0, "A finite set needs an explicit upper edge.", "A captured high-water id bounds the initial population. New arrivals need a stated strategy such as a second sweep or an application-side lazy migration."),
      q("Apply", "The batch UPDATE commits; writing last_id to the job table then fails. What should happen on retry?", ["Skip the batch permanently", "Replay it safely, then persist the checkpoint", "Mark the whole job complete", "Delete the job to avoid duplicates"], 1, "The data is ahead of the bookmark. Can replay preserve correctness?", "Replaying an idempotent batch repairs the checkpoint gap. A conditional update such as config_version < target can make repeated application safe."),
      q("Apply", "When can the row mutation and checkpoint be made strongest together?", ["When both are updated atomically in the same database transaction", "When the checkpoint is saved first in a separate service", "When the worker logs the cursor to stdout", "When each batch has a different id"], 0, "Think about what a crash can interrupt between the two writes.", "A shared transaction makes data progress and checkpoint progress commit or roll back together. Separate stores need replay-safe operations and carefully ordered durable checkpointing."),
      q("Diagnose", "A backfill cursor uses a non-unique timestamp that the migration also updates. What failure is plausible?", ["Rows can shift across the cursor boundary and be repeated or skipped", "Vacuum will enforce a stable ordering", "The queue guarantees a unique cursor", "No issue; SQL order is always deterministic"], 0, "Ask what happens when sort values tie or change while traversal is underway.", "Use an immutable, unique ordering key or a composite cursor with a unique tie-breaker. A changing sort key undermines keyset guarantees."),
      q("Diagnose", "Old and new app versions overlap while a column is being replaced. What is expand-and-contract trying to achieve?", ["A compatible transition where both versions can coexist until cutover", "One transaction that changes all rows atomically", "A forced downtime window", "Automatic reverse migration on every deploy"], 0, "The compatibility window spans rollout, backfill, and eventual cleanup.", "Expand-and-contract adds the new shape compatibly, deploys code that can work across the transition, then removes the old shape only after validation and cutover."),
      q("Design", "A migration persists its cursor before applying the batch. Why is that ordering unsafe?", ["A crash after cursor commit can skip rows whose update never committed", "It produces extra retries only", "It makes the cursor non-unique", "It blocks all reads"], 0, "Imagine the process dies in the gap between those two durable writes.", "The cursor would claim work completed before the data change succeeded. Commit both together, or apply first and checkpoint after, with safe replay."),
      q("Design", "A reverse migration would overwrite user edits made after backfill. What should the rollout plan prefer?", ["Assume every data change is reversible", "Plan a compatibility window, snapshot, or forward-fix before cutover", "Run the reverse UPDATE faster", "Drop both old and new representations"], 1, "Rollback code and rollback data are different problems.", "Once new writes can carry information the old schema cannot represent, a reverse transform may lose user data. Plan a safe rollback/forward-recovery path up front."),
    ]
  },
  {
    id: "queues",
    number: "04",
    title: "Put slow work on a reliable path",
    subtitle: "Queues, workers, acknowledgements, retries, and the outbox",
    duration: "19 min",
    tone: "sky",
    bigIdea: "A queue moves work out of a request's lifetime. It does not remove failures; it gives you a place to manage them deliberately.",
    model: ["Request", "Durable job", "Worker", "Database"],
    goals: ["Separate request latency from background completion", "Know what acknowledgement and at-least-once mean", "Use retries and dead letters without hiding permanent errors"],
    blocks: [
      {
        title: "Return a job receipt; do the long work elsewhere",
        story: "An HTTP request is a short-lived conversation. A ten-minute backfill does not fit naturally inside it. The API can validate intent, create a durable job, and return a job id for tracking.",
        details: [
          "A basic path is client → API → job record/queue → worker → database. The status endpoint can report queued, running, paused, failed, or completed, plus safe progress estimates.",
          "Redis with BullMQ is a practical first learning stack. RabbitMQ, Kafka, SQS, and Pub/Sub have different delivery, retention, routing, and ordering models. Choose around the workload and operational needs rather than the logo.",
          "A queue is not the source of truth for every business invariant. Keep durable job metadata, authorization, and the state being changed in systems designed to protect them. The queue carries work or a reference to work."
        ],
        code: "POST /migrations\n→ validate request\n→ create durable job: job_42\n→ enqueue job_42\n→ 202 Accepted { jobId: 'job_42' }",
        note: "202 Accepted means the request was accepted for processing; it does not mean the migration completed."
      },
      {
        title: "Acknowledgements define when a message can return",
        story: "A queue message is like a library book checked out to a worker. The queue needs to know whether the worker finished or merely disappeared while holding it.",
        details: [
          "In an acknowledgement-based queue, a worker receives a message, performs work, then ACKs. If the worker crashes before the ACK, the message can be delivered again. That is at-least-once delivery: duplicates are possible, so handlers must be repeat-safe.",
          "A visibility timeout hides a message temporarily while a worker processes it. If the task takes longer than the timeout and the worker does not extend visibility, another worker may start the same task concurrently.",
          "At-most-once processing can avoid duplicate delivery by discarding before work, but a crash can lose the task. “Exactly once” usually has a bounded meaning inside one system; it does not magically make a database write and an external side effect commit as one action."
        ],
        code: "receive → process → durable DB commit → acknowledge\n                ↘ crash before ACK → delivery may repeat",
        note: "A queue's delivery guarantee and the application's side-effect guarantee are separate contracts."
      },
      {
        title: "Retry what may heal; isolate what will not",
        story: "A retry is useful when a failure is transient. Repeating invalid input ten thousand times is not resilience; it is a way to make a queue noisy.",
        details: [
          "Use bounded retries with exponential backoff and jitter for transient failures such as a temporary database disconnect. Jitter spreads retries so many workers do not return at the same instant.",
          "Classify errors. A malformed record may be a poison message: it fails every attempt for the same permanent reason. Move it to a dead-letter queue or failed-job record with context, then alert and repair deliberately.",
          "Acknowledge only when work is durable according to your design. If a batch fails halfway, record which unit failed and make the retry boundary match an idempotent unit. Avoid retry storms when the database is already overloaded."
        ],
        code: "attempt 1 → wait 1s\nattempt 2 → wait 2s + jitter\nattempt 3 → wait 4s + jitter\nthen dead-letter / require repair",
        note: "Retries are load. Backoff, caps, circuit breakers, and operator visibility keep recovery traffic from deepening an outage."
      },
      {
        title: "Do not lose the job between database and queue",
        story: "The API writes “migration requested” to the database, then tries to enqueue it. If the process dies between those steps, the record exists but the work may never run.",
        details: [
          "The transactional outbox records the business change and an event row in one database transaction. A separate publisher reads unsent outbox rows and publishes them; it marks delivery afterward. Publishing can repeat, so consumers still deduplicate or act idempotently.",
          "The reverse order has a different gap: enqueue first, then fail to create the durable job record. A worker sees a message it cannot authorize or track. Choose an ordering and recovery mechanism that covers both crash windows.",
          "For a migration, a durable job table plus an outbox can make job creation, ownership, and publication auditable. Simpler systems may use a queue integration with documented transactional behavior, but verify exactly what it guarantees."
        ],
        code: "BEGIN;\nINSERT INTO migration_jobs (...);\nINSERT INTO outbox (event_type, payload);\nCOMMIT;\n-- publisher retries unsent outbox rows",
        note: "An outbox solves an atomic “database state + intent to publish” gap. It does not make downstream processing exactly once."
      }
    ],
    fieldNote: "When the API returns a job id, the system owes the user a trustworthy way to inspect, cancel or pause where safe, and understand failures.",
    quiz: [
      q("Warm-up", "Why return a job id for a long backfill instead of keeping an HTTP request open?", ["The job can outlive the request and expose durable status", "HTTP cannot carry JSON", "The database no longer needs transactions", "A queue guarantees the job succeeds"], 0, "Think about client timeouts, process restarts, and a user checking progress later.", "A durable asynchronous job decouples the request lifetime from the migration. The job id can identify status and recovery; it does not promise success."),
      q("Warm-up", "In at-least-once delivery, which behavior must a worker expect?", ["A task may be delivered more than once", "A task is guaranteed to execute exactly once", "A task cannot fail after dequeue", "A queue cannot lose connectivity"], 0, "The name describes a lower bound on delivery attempts.", "At-least-once systems may redeliver after a crash or lost acknowledgement. Make side effects repeat-safe or deduplicate them."),
      q("Warm-up", "When should a worker normally acknowledge a message for durable database work?", ["Before it starts, to reduce queue depth", "After the work is durable under the chosen contract", "Only after a human approves every row", "Before validating the payload"], 1, "If the worker dies after ACK, what can the queue recover? ", "Acknowledge after the durable operation. ACKing early risks losing work on a crash; waiting too long may create duplicates, which idempotency should handle."),
      q("Apply", "A queue's visibility timeout expires while a long job still runs. What can happen?", ["Another worker may receive the same job", "The database transaction commits automatically", "The job becomes strongly consistent", "The queue pauses all workers"], 0, "Visibility is temporary ownership, not proof the old worker stopped.", "If visibility is not extended, the queue can redeliver while the original process is still active. Use appropriate leases, heartbeats, and idempotent processing."),
      q("Apply", "A database outage may recover in seconds. Which retry approach is most appropriate?", ["Infinite immediate retries", "Bounded exponential backoff with jitter", "Send every retry to a new worker instantly", "Drop the job after the first error"], 1, "Recovery attempts should avoid stampeding the dependency.", "Bounded backoff and jitter space retries and cap load. Alert or pause when the dependency remains unhealthy rather than flooding it."),
      q("Apply", "A malformed job fails identically every attempt. What is the useful role of a dead-letter path?", ["Hide the message forever", "Isolate it with diagnostic context for deliberate repair", "Retry it at higher concurrency", "Mark all future jobs successful"], 1, "This is a permanent poison-message pattern, not a transient outage.", "Dead-letter handling prevents one irreparably invalid item from cycling indefinitely while preserving it for inspection and an explicit recovery path."),
      q("Diagnose", "The API commits a job row, then crashes before enqueueing. What gap remains?", ["The job exists but no worker may ever receive it", "The job can execute twice", "The queue has already acknowledged it", "The database cannot read its own row"], 0, "Consider the crash between two independent systems.", "A durable DB insert and queue publish are not automatically one atomic operation. An outbox or reconciliation poller can publish jobs that remain unsent."),
      q("Diagnose", "Why can retrying a failed external email after a DB commit send it twice?", ["The DB transaction cannot roll back a message already sent", "Queues prohibit idempotency keys", "The email provider reads PostgreSQL WAL", "The worker always commits twice"], 0, "The email service and database do not share one atomic transaction.", "An external side effect may happen before the worker loses its ACK. Use a provider idempotency key, dedupe record, or an outbox-driven delivery contract."),
      q("Design", "A database update and job publication must not get separated by a crash. Which pattern best closes that dual-write gap?", ["Transactional outbox plus a retrying publisher", "Publish first and assume the DB never fails", "A longer HTTP timeout", "A larger batch size"], 0, "The business row and durable intent need one transactional home.", "The transaction writes the business change and outbox event together. The publisher can retry; consumers remain idempotent because publication itself can duplicate."),
      q("Design", "A queue is used to carry a 10-million-user migration. What should the message usually identify?", ["The durable migration job or bounded work unit", "Every user's full personal data", "A promise that all rows committed", "The DB password and all SQL"], 0, "Keep payloads small and rely on an auditable source of truth.", "Queue messages should reference durable job or chunk state. Keeping authorization, progress, and sensitive row data in suitable stores makes replay and audit manageable."),
    ]
  },
  {
    id: "idempotency",
    number: "05",
    title: "Make retries boring",
    subtitle: "Idempotency, deduplication, checkpoints, and crash recovery",
    duration: "21 min",
    tone: "coral",
    bigIdea: "Workers crash at awkward moments. Good job design makes repeating a bounded unit safe, then records enough state to continue without guessing.",
    model: ["Attempt", "Durable effect", "Crash window", "Safe replay"],
    goals: ["Distinguish idempotent state changes from duplicate side effects", "Find the crash windows around a commit", "Build recovery from durable checkpoints and job state"],
    blocks: [
      {
        title: "Idempotency is about the result after repetition",
        story: "A light switch is idempotent when “set to on” leaves it on no matter how many times you repeat it. “Toggle” is not idempotent because repeating it reverses the first action.",
        details: [
          "A state-setting mutation can often be idempotent: set config_version to 2 only where it is less than 2. Repeating the batch converges on the same final state. Incrementing a counter or sending a notification can produce a new effect each time.",
          "At-least-once delivery plus idempotent state change is a useful pairing. But idempotence must cover every side effect: database writes, audit events, emails, billing, and downstream messages can have different duplicate behavior.",
          "Prefer monotonic transitions when possible: pending → running → completed, version 1 → version 2. Validate allowed transitions with conditions or constraints so a retry cannot accidentally move state backward."
        ],
        code: "UPDATE users\nSET config_version = 2\nWHERE id > :last_id AND id <= :next_id\n  AND config_version < 2;",
        note: "A query can be idempotent in final row state while still emitting duplicate triggers, audit events, or queue messages. Inspect the full effect path."
      },
      {
        title: "Idempotency keys name the logical request",
        story: "A retrying client needs the server to recognize that two HTTP attempts represent one request. An idempotency key is a stable label for that logical operation.",
        details: [
          "Store the key with a unique constraint, the request identity or hash, and the resulting job/resource id. If the key appears again with the same input, return the original result; if the payload differs, reject the collision.",
          "Keys need a scope and retention policy. A global key can collide across tenants; a short TTL can expire before a late retry. Authentication and authorization still apply when the existing result is returned.",
          "A batch id or migration id can also deduplicate worker effects. The uniqueness boundary must match the side effect: “once per migration” differs from “once per user per migration.”"
        ],
        code: "UNIQUE (tenant_id, idempotency_key)\n\nkey → request fingerprint → existing job_id\n                 ↘ new request → create once",
        note: "An idempotency key is not a magic network guarantee. It is a durable lookup rule enforced atomically at the chosen boundary."
      },
      {
        title: "Map the crash windows before writing the retry loop",
        story: "The dangerous question is not “can the worker crash?” It is “what durable facts can already be true when it crashes?” Draw the order of effects and acknowledgements.",
        details: [
          "If the DB commit succeeds and the queue ACK is lost, the message may repeat. If ACK happens before the DB commit, a crash can lose the work. If an email sends before a local dedupe record commits, the email may repeat.",
          "When data and checkpoint share a database, update both in one transaction. When they do not, apply the effect first, persist a replay-safe identity, and only then advance the cursor. Recovery should prefer replay over skipping.",
          "Leases help coordinate ownership but can expire while a slow worker is still alive. Fencing tokens or conditional state transitions prevent a stale worker from committing after a newer owner has taken over."
        ],
        code: "claim chunk with lease + generation\napply idempotent chunk\ncommit result and checkpoint\nack message\n\nold generation → rejected after lease takeover",
        note: "A lock prevents some overlap; a fencing condition protects correctness when a lock holder is merely slow rather than dead."
      },
      {
        title: "Recovery is a state machine operators can read",
        story: "A job should not be a black box called “running.” Its durable state should say what can happen next and what a human can safely do.",
        details: [
          "Model queued, running, pausing, paused, retrying, failed, and completed transitions. Store attempt count, lease owner/expiry, checkpoint, timestamps, error category, and version so concurrent workers can reject stale claims.",
          "On restart, find jobs with expired leases or stale heartbeats, verify their last committed cursor, and resume from the last durable boundary. Keep failure details actionable but redact personal data and secrets.",
          "A user-requested cancel is also a state transition. Stop at a batch boundary, record partial completion, and define whether cancellation can be resumed or requires a new job. Do not imply that an already committed batch was rolled back."
        ],
        code: "queued → running → paused → running → completed\n                 ↘ retrying → running\n                 ↘ failed → operator repair → retrying",
        note: "A status field is valuable only when transitions have defined semantics and correspond to durable work."
      }
    ],
    fieldNote: "If replaying batch 317 can corrupt state, the cursor is not your biggest problem yet. Make the batch effect safe to repeat before scaling the number of workers.",
    quiz: [
      q("Warm-up", "Which operation is idempotent when repeated with the same target?", ["Increment attempts by one", "Set config_version to 2 if it is lower", "Toggle the feature flag", "Append another identical event row without a key"], 1, "Does repeating it converge to one target state or create another effect?", "Setting a value to a target state with a condition converges. Increment, toggle, and unbounded append each create a new result when repeated."),
      q("Warm-up", "What does an idempotency key help a service identify?", ["The same logical request retried by a client", "The physical database primary", "The query plan for a SELECT", "The worker's machine name only"], 0, "Two attempts can belong to one intended operation.", "A stable key maps retried attempts to the same logical request. Enforce uniqueness and bind the key to a scope and request fingerprint."),
      q("Warm-up", "When is an ACK-before-DB-commit dangerous?", ["A crash can remove the message before its work is durable", "It creates a duplicate index", "The transaction becomes serializable", "The checkpoint gets a unique key"], 0, "What can the queue redeliver after it has been told the work is done?", "If the worker ACKs and then crashes before committing, the queue may not redeliver. The business work can be lost."),
      q("Apply", "The DB commit succeeds but the queue ACK is lost. What should the worker design expect?", ["The queue may redeliver; the DB effect should tolerate replay", "The queue rolls back the DB commit", "The job is guaranteed to be deleted", "The transaction can still be uncommitted"], 0, "The database and queue do not share a commit record by default.", "The ACK gap can produce duplicate delivery after a successful database effect. Idempotency or dedupe must prevent duplicate business results."),
      q("Apply", "Two requests reuse the same idempotency key with different payloads. What is the safer response?", ["Return the original result as if nothing differed", "Reject the conflicting reuse", "Create two jobs with one key", "Change the key silently"], 1, "A key should not ambiguously name two different operations.", "Store a request fingerprint with the key. A same-key, different-payload request is a conflict and should be rejected rather than silently mapped to an unrelated result."),
      q("Apply", "The migration row update and cursor are in one database. Which transaction plan best prevents cursor/data drift?", ["Advance the cursor, commit, then update the rows", "Update rows and cursor in the same transaction", "Write the cursor to a log only", "Use one transaction for the entire 10M rows"], 1, "The durable data and durable progress marker should share a commit boundary.", "One transaction per bounded batch can commit both row effects and its checkpoint. This avoids separate-store gaps without creating one huge transaction for the entire migration."),
      q("Diagnose", "A lease expires, a second worker takes ownership, then the old slow worker writes anyway. Which mechanism can reject the stale owner?", ["A fencing token or generation check", "A longer OFFSET", "A random sleep only", "A cache TTL"], 0, "A timeout says the old owner may be gone, but cannot prove it stopped.", "A monotonically increasing fencing generation lets the database reject stale writes after a new owner has taken over. A lock lease alone is not enough when a process is slow."),
      q("Diagnose", "A repeat-safe user update also writes a fresh audit event on every attempt. Is the whole operation idempotent?", ["Yes; only the user row matters", "No; the audit side effect duplicates", "Yes if the queue is FIFO", "No, because all database updates must be rolled back"], 1, "Inspect secondary effects, not only the final business row.", "The row state may converge, while audit events accumulate. Give events a stable dedupe key or record them transactionally once per user/migration."),
      q("Design", "An operation spans two independent stores and cannot use a shared transaction. Which recovery bias is generally safer?", ["Advance progress before applying work", "Apply a replay-safe effect, then advance durable progress", "Assume network calls never fail", "Treat missing acknowledgement as success"], 1, "If uncertain, which ordering risks repeating work versus skipping it?", "Apply then checkpoint can cause replay if the checkpoint write fails; idempotency handles that. Checkpoint then apply can permanently skip the effect after a crash."),
      q("Design", "A completed job can be retried by an old queue message. Which state-machine rule helps block it?", ["Allow any worker to set status backward", "Use conditional monotonic transitions and a job version", "Delete all status history", "Treat every message as a new migration"], 1, "A stale message should not undo a later durable state.", "Versioned conditional transitions can reject stale claims or attempts and keep terminal states from moving backward. The queue payload should reference the existing durable job."),
    ]
  },
  {
    id: "scale",
    number: "06",
    title: "Scale workers around the database",
    subtitle: "Concurrency, partitions, connection pools, and backpressure",
    duration: "20 min",
    tone: "sage",
    bigIdea: "The database sets the practical write rate. Worker count is a control knob, not a measure of how much capacity exists.",
    model: ["Queue depth", "Worker slots", "DB pool", "Safe write rate"],
    goals: ["Estimate the end-to-end throughput bottleneck", "Control pressure instead of adding workers blindly", "Partition work without overlapping ownership"],
    blocks: [
      {
        title: "More consumers can mean less useful throughput",
        story: "Adding more checkout clerks helps only while the stockroom can keep up. If every worker opens a database connection and hammers the same rows, the bottleneck moves to the database.",
        details: [
          "Throughput is bounded by the slowest stage: job claim, CPU, storage I/O, WAL, locks, network, or commit latency. Measure rows per second alongside database CPU, write latency, connection usage, and replica lag.",
          "A connection pool caps simultaneous DB sessions. Pool sizing must include web traffic, workers, maintenance, and failover headroom. A common danger is sizing each worker's pool independently and accidentally exceeding the server's safe connection count.",
          "Tune worker concurrency and batch size together. Large batches can reduce per-row overhead but extend lock duration and transaction size; high concurrency can improve utilization until contention or I/O saturation makes all work slower."
        ],
        code: "total possible DB sessions\n= web replicas × web pool\n+ worker replicas × worker pool\n+ admin / maintenance / failover headroom",
        note: "A queue backlog means demand exceeds current service capacity; it does not say whether more capacity is safe to add."
      },
      {
        title: "Backpressure gives the database a voice",
        story: "A pressure valve slows incoming work when the downstream system is hot. Without it, the queue can translate a temporary spike into exhausted pools and a production incident.",
        details: [
          "Limit active workers, per-job concurrency, batch size, and writes per second. Pause or throttle when database latency, connection waits, replication lag, or error rates cross a safe threshold.",
          "Adaptive throttling can increase slowly when headroom is healthy and reduce quickly when it is not. Use a stable signal and dampening; reacting to noisy measurements with large swings can make throughput unstable.",
          "Protect foreground traffic with separate pools, priority rules, and reserved capacity. A background migration should yield when user-facing latency or replica lag is beyond the agreed budget."
        ],
        code: "if db_latency > target or replica_lag > budget:\n    lower worker concurrency\n    shrink batch / pause briefly\nelse:\n    cautiously raise rate",
        note: "Backpressure is a correctness-adjacent operational feature: it keeps a recovery job from causing a second outage."
      },
      {
        title: "Divide ownership, then verify the boundaries",
        story: "Several workers can process a large job in parallel if each owns a clear, non-overlapping slice. Partitioning is a correctness decision before it is a speed trick.",
        details: [
          "Partition by stable id ranges, tenant, hash bucket, or queue partition. Store ownership and checkpoint per partition. Ensure the partition key distributes load; one very large tenant can become a hot partition.",
          "A database claim pattern such as SELECT ... FOR UPDATE SKIP LOCKED can let workers take available rows without waiting on the same claim. It does not guarantee global ordering, fairness, or that a claimed task is completed exactly once.",
          "Distributed locks are coordination aids, not a substitute for idempotency or fencing. A process pause, network partition, or expired lease can leave an old worker alive after a new owner starts."
        ],
        code: "Worker A owns ids 1–1,000,000\nWorker B owns ids 1,000,001–2,000,000\n...\n\nEach range has its own cursor and lease generation.",
        note: "Do not split contiguous ranges if data skew makes one partition much heavier; balance the units by estimated work, not just row count."
      },
      {
        title: "Avoid herd behavior during recovery",
        story: "When a dependency recovers, thousands of synchronized retries can arrive at once. The system must ramp back into service instead of stampeding.",
        details: [
          "Exponential backoff with jitter spreads retries. A circuit breaker can stop launching new work while a dependency is clearly unhealthy, then allow a small number of probes to test recovery.",
          "Rate limits can be global, per tenant, per table, or per job. Global limits protect the database; per-tenant limits keep one large customer from starving others. Include a safe operator override with audit history.",
          "Replica lag is a feedback signal: a fast primary write rate may produce stale reads or delayed failover catch-up. Throttle based on customer-impacting budgets, not only whether the primary accepts writes."
        ],
        code: "shared capacity budget\n→ reserve for foreground traffic\n→ allocate migration rate\n→ reduce on latency / lag / error signals",
        note: "Rate limits should be enforced at the shared bottleneck. Per-process limits multiply when you add replicas."
      }
    ],
    fieldNote: "If 20 workers process at the same rate as 5, the next tuning step is not automatically 40. Check the pool, locks, write latency, and foreground impact first.",
    quiz: [
      q("Warm-up", "Why can doubling worker count reduce useful throughput?", ["Workers may saturate DB connections, I/O, or locks", "The queue changes SQL syntax", "Batches stop being idempotent", "More workers make WAL disappear"], 0, "Look at the shared downstream dependency, not only worker CPU.", "More concurrent writes can raise contention, connection waits, and I/O saturation. Past the database's capacity, extra workers increase queueing and latency rather than throughput."),
      q("Warm-up", "What should determine the migration's safe write rate?", ["The database's measured headroom and foreground service budget", "How many worker machines fit in the cluster", "The largest batch that passes once", "The desired completion date alone"], 0, "The work competes with other users of the same bottleneck.", "A safe rate accounts for measured DB capacity and customer traffic. Schedule pressure is real, but does not create database capacity."),
      q("Warm-up", "A connection pool primarily limits what resource?", ["Simultaneous database sessions", "Total rows in the table", "Queue message retention", "Index cardinality"], 0, "Count every web and worker pool together.", "Pools cap concurrent connections. Aggregate them across replicas and leave capacity for normal traffic, failover, and operators."),
      q("Apply", "The queue is deep, but DB latency and replica lag are already above budget. What is the safer immediate control?", ["Add many workers", "Throttle or pause background writes", "Increase batch size tenfold", "Move all work to the replica"], 1, "Backlog shows demand; the other signals show system stress.", "Protect the database and foreground traffic first. A deep queue can wait; overloaded writes can worsen latency and replication delay."),
      q("Apply", "Per-worker concurrency is 8 across 12 replicas. What can go wrong if you treat 8 as the global limit?", ["Actual concurrency may be 96", "Only one worker will run", "The database pool shrinks automatically", "Queue ordering becomes serial"], 0, "A local cap multiplies across replicas.", "Global capacity needs a shared budget or a correctly calculated per-replica allocation. Also account for web and maintenance pools."),
      q("Apply", "A partition is selected by tenant id, and one tenant owns half the records. What risk follows?", ["A hot partition creates skew and a long tail", "Every partition becomes equal", "The idempotency key stops working", "The table no longer needs indexes"], 0, "Partition count does not guarantee balanced work size.", "A dominant tenant creates a straggler partition. Use finer subdivision or work units based on estimated load, while retaining ownership boundaries."),
      q("Diagnose", "Workers use SKIP LOCKED to claim rows. Which guarantee should you avoid assuming?", ["That workers won't wait on already-locked claim rows", "That all rows finish in global order", "That claims can be committed", "That another worker can claim an unlocked row"], 1, "Skipping contention is not the same as defining fairness or order.", "SKIP LOCKED helps distribute currently unlocked work. It does not guarantee global order, fairness, or successful completion after a worker claim."),
      q("Diagnose", "All workers retry exactly 30 seconds after an outage. The database gets another surge. Which change directly reduces synchronization?", ["Add random jitter to bounded backoff", "Remove all retry limits", "Use one enormous transaction", "Increase message visibility only"], 0, "Same delay plus same failure time makes the retries line up.", "Jitter decorrelates retry timing. Pair it with caps and healthy dependency signals to avoid a second burst."),
      q("Design", "A migration must not harm web requests. Which design control best expresses that requirement?", ["Reserve pool capacity and throttle on user-facing latency", "Give web and workers identical unlimited pools", "Scale workers until queue depth is zero", "Route all writes to a read replica"], 0, "Protect both connections and the latency budget.", "Separate or budget pools, reserve capacity for foreground traffic, and reduce background load when latency rises. A read replica is not a substitute for writes to the primary."),
      q("Design", "A worker lease expires but its old process may still be running. How should a new owner prevent stale writes?", ["Use a lease generation/fencing condition on commits", "Assume expiry kills the old process", "Wait for the entire job timeout", "Change the partition order"], 0, "A lease is a timeout, not remote process termination.", "Fencing lets the database reject commits from an older generation. Idempotent updates and conditional ownership checks provide defense in depth."),
    ]
  },
  {
    id: "observability",
    number: "07",
    title: "See the system while it changes",
    subtitle: "Metrics, logs, traces, completion checks, and stale reads",
    duration: "20 min",
    tone: "sky",
    bigIdea: "Observability tells you what the system is doing, where it is stuck, and whether the resulting state is correct—not just whether a worker is alive.",
    model: ["Measure", "Explain", "Trace", "Verify"],
    goals: ["Choose progress metrics that reveal bottlenecks", "Use logs and traces to follow one batch", "Connect consistency guarantees to caches and replicas"],
    blocks: [
      {
        title: "Metrics answer “how much, how fast, how bad?”",
        story: "A dashboard should act like a pilot's instrument panel. One green worker heartbeat does not tell you whether the migration is progressing or the database is suffering.",
        details: [
          "Track batches attempted/completed/failed, rows processed, rows skipped, processing rate, retry rate, queue depth, oldest-job age, active workers, DB latency, connections, CPU/I/O, WAL volume, and replica lag.",
          "A raw processed count can mislead if retries count twice. Distinguish attempted work from uniquely completed work. A percentage needs a trustworthy denominator and a clear policy for new rows, deleted rows, and rows that do not require mutation.",
          "Look for trends and distributions. Median latency can hide a slow tail; queue depth alone can hide a stuck oldest job. Compare before, during, and after the rollout, and define thresholds that trigger pause or rollback decisions."
        ],
        code: "rows_completed / second\noldest_queued_job_age\nfailed_batches / attempted_batches\nDB p95 write latency\nreplica_lag_seconds",
        note: "Counters need stable semantics across retries and worker restarts. Document whether they count attempts, unique rows, or committed units."
      },
      {
        title: "Logs and traces explain one batch's journey",
        story: "Metrics show a neighborhood is noisy; logs and traces let you follow one package through the streets from API request to queue to database commit.",
        details: [
          "Use structured logs with job_id, batch_id, partition, cursor range, attempt, worker version, duration, rows changed, and error category. Avoid logging secrets or unnecessary personal data.",
          "Distributed tracing can connect API acceptance, outbox publication, queue delivery, worker execution, and database calls using correlation ids. Sampling keeps high-volume traces affordable while preserving errors and slow paths.",
          "A useful failure record says what was attempted, what became durable, and what is safe to retry. “Timeout” alone is not enough if the operator cannot identify whether the database committed first."
        ],
        code: "{ job_id, batch_id, attempt, start_id, end_id,\n  duration_ms, rows_changed, outcome, error_code }",
        note: "Logs support investigation; they are not a reliable replacement for a transactional checkpoint or job state."
      },
      {
        title: "Completion is a claim to verify",
        story: "A progress bar is an estimate while work is running. Completion should be a checked statement about the intended population, not a worker's opinion that it reached the last page.",
        details: [
          "Validate the target predicate: count remaining eligible rows, sample transformed records, compare checksums or aggregate invariants, and confirm that every partition reached its boundary. Choose methods that do not create another production-scale spike.",
          "Check side effects and downstream consumers too. A DB version may be updated while a cache remains stale or replicas are still catching up. Use a completion gate that reflects what customers need to see.",
          "Record who started, paused, resumed, or approved the migration; save the source and target versions, query/release identifier, thresholds, and final verification results. This turns a one-time operation into an auditable change."
        ],
        code: "complete only when:\n- all intended partitions are terminal\n- no eligible rows remain (or exceptions are accounted for)\n- consistency / replica / cache gates pass\n- verification results are stored",
        note: "A processed-row counter can reach 100% while a bug left a gap. Verify the resulting state independently."
      },
      {
        title: "Freshness is a product requirement",
        story: "A user who just changed a setting may expect the next read to show it immediately. Another user may accept a few seconds of delay. Those are different consistency contracts.",
        details: [
          "Strong consistency aims for every read to reflect the latest committed write. Read-after-write consistency guarantees a client can see its own recent write. Eventual consistency allows replicas or caches to converge later; bounded staleness puts a time/lag budget on that delay.",
          "A cache-aside read checks cache, falls back to the database on a miss, then fills cache. Write-through updates the cache alongside the database; write-back delays persistence and changes durability risk. TTL bounds stale time but does not invalidate instantly.",
          "Cache invalidation can use explicit deletes/updates, versioned keys, or short TTLs. Cache warming preloads expected hot keys, but should be paced so warm-up itself does not stampede the database. Cache stampede happens when many misses trigger the same expensive load; single-flight, jittered TTLs, or stale-while-revalidate can reduce the surge.",
          "A read replica can lag behind the primary. After a migration, a dashboard or user read from a replica may temporarily report old state. Design the read path around the promised freshness, not the diagram alone."
        ],
        code: "write primary → invalidate/version cache → replica replays WAL\nread-your-write path: read primary (or wait for replay position)\nordinary read: cache / replica within stated staleness budget",
        note: "Redis can change the path used to read configuration. It does not automatically mutate persistent state for every user."
      }
    ],
    fieldNote: "“The job completed” and “every customer can now observe the intended value” are different claims. Decide which one the status badge means.",
    quiz: [
      q("Warm-up", "Which metric best reveals whether a queue is accumulating work faster than it drains?", ["Queue depth or oldest-job age over time", "The color of the worker dashboard", "Total database table count", "Number of source files"], 0, "A single snapshot is less useful than a trend and the age of the oldest item.", "Queue depth and oldest age show backlog and delay. Relate them to processing rate and downstream health to see whether demand exceeds capacity."),
      q("Warm-up", "What is a structured log field useful for following one batch across systems?", ["batch_id", "A random value generated at each log line", "The full database password", "Only the local clock timezone"], 0, "The same stable identifier should travel across API, queue, and worker boundaries.", "A correlation or batch id ties records together. Log enough identifiers and outcome data to investigate, while avoiding secrets and unnecessary personal data."),
      q("Warm-up", "Why is processed_rows / total_rows not always a reliable completion proof?", ["Retries and changing populations can make the count inaccurate", "Division is slow in PostgreSQL", "A counter cannot be displayed in a UI", "Completed rows cannot be counted"], 0, "Ask what the numerator and denominator actually mean after retries.", "Attempt counters can double-count; the population may grow or include skipped rows. Verify the target predicate and partition state independently."),
      q("Apply", "A progress counter reaches 100%, but a verification query finds eligible rows left. What should the job status say?", ["Completed because the counter is authoritative", "Not completed; investigate the discrepancy", "Completed after clearing the counter", "Paused but with no audit record"], 1, "Completion is a verified property of the intended state.", "A dashboard count is not stronger than the source-of-truth predicate. Account for the remaining rows, then run an explicit verification step."),
      q("Apply", "A user writes a setting then immediately reads through a lagging replica. What consistency behavior may be violated?", ["Read-after-write", "Durability", "Idempotency", "Uniqueness"], 0, "The write committed, but the read path may be behind.", "Read-after-write requires the user to observe their committed change. Route that read to the primary, wait for replay, or use a version/consistency token."),
      q("Apply", "A hot cache key expires and thousands of requests miss at once. What is this pattern called?", ["Deadlock", "Cache stampede", "Lost update", "Expand-and-contract"], 1, "A simultaneous miss can trigger many identical origin loads.", "A cache stampede overwhelms the backing service with duplicate work. Single-flight, jitter, prewarming, or stale-while-revalidate can reduce it."),
      q("Diagnose", "The main dashboard is green, but every database retry is logged as a new success. What is missing?", ["A stable distinction between attempts and unique committed work", "More worker replicas", "A second cache", "A wider schema"], 0, "Metrics need a defined counting unit that survives redelivery.", "Track attempts separately from uniquely completed batches/rows. Otherwise retries inflate progress and hide repeated failures."),
      q("Diagnose", "A completion badge appears before replicas replay the migration WAL. What customer-visible issue can follow?", ["Reads through replicas can still return the old version", "The primary transaction becomes uncommitted", "The queue duplicates every email", "The cache becomes strongly consistent"], 0, "Completion in the primary and freshness on a replica are different points in the path.", "Replica lag can make read paths stale after the primary commits. Include a freshness gate or disclose/route around the lag."),
      q("Design", "A migration needs a safe pause threshold. Which signal is the most direct database-protection trigger?", ["Write latency, connection pressure, or replica lag crossing the budget", "The page's background color", "Total users ever created", "A single worker heartbeat"], 0, "Choose signals that show the shared dependency is losing headroom.", "Database latency, connection pressure, and lag measure downstream stress. A pause gate should use agreed thresholds and hysteresis to avoid rapid toggling."),
      q("Design", "The UI says “finished.” Which evidence best justifies that claim?", ["The worker emitted a final log line", "All intended units are terminal and an independent state verification passed", "The queue is currently empty", "The counter rounded to 100%"], 1, "A queue can be empty while a job is lost; logs can exist without durable state.", "Combine durable job/partition status with independent verification of the target data and any required freshness gates. Persist that evidence for audit."),
    ]
  },
  {
    id: "architecture",
    number: "08",
    title: "Choose the smallest change that works",
    subtitle: "Feature flags, consistency choices, rollout, and the final mental model",
    duration: "24 min",
    tone: "sun",
    bigIdea: "Before migrating ten million records, ask whether the product needs ten million writes. The right architecture depends on what state is truly per-user and when it must become visible.",
    model: ["Clarify intent", "Choose source of truth", "Roll out safely", "Prove the result"],
    goals: ["Compare central flags, per-user state, and versioned configuration", "Choose eager, lazy, or background migration from requirements", "Defend trade-offs without jumping to an answer-shaped phrase"],
    blocks: [
      {
        title: "First ask whether every row needs to change",
        story: "A switchboard can change one global rule for everyone. If ten million users share the same policy, storing the identical value ten million times may create work the product does not need.",
        details: [
          "A central feature flag stores a small shared decision and lets the application evaluate it at read or request time. It can support gradual cohorts, kill switches, and rapid rollback, but adds a runtime dependency, cache/freshness questions, and careful targeting rules.",
          "Per-user state is appropriate when the value truly differs by user, must be audited as an individual choice, or needs a durable snapshot. It creates a larger write workload and can make global policy changes expensive.",
          "Versioned configuration stores a compact version pointer or references a shared configuration bundle. This can avoid rewriting identical settings, but readers must understand the version and old versions must remain available while references exist."
        ],
        code: "central policy: flag = v2\nper-user: users.feature_x_enabled\nversioned: users.config_version → immutable config bundle",
        note: "Feature flags should not replace authorization. A rollout switch decides whether code is active; access control decides who may do what."
      },
      {
        title: "Choose eager, lazy, or background change by need",
        story: "Eager work changes records ahead of use. Lazy migration changes a record when a user next touches it. A background backfill moves steadily behind the scenes. None is universally best.",
        details: [
          "Eager migration is useful when all records must be ready by a deadline or the transformed state must be available for reporting. It creates a large planned write workload that needs batching, throttling, checkpoints, verification, and recovery.",
          "Lazy migration avoids work for inactive users and spreads cost across real traffic. It requires readers to recognize old versions, performs writes in latency-sensitive requests, and may leave a long tail of dormant records unmigrated.",
          "A background backfill gives control over rate and progress but creates queue, worker, consistency, and operational work. A hybrid is common: lazy migration on reads plus a throttled backfill for the long tail, with one shared idempotent transformation.",
          "Consistency requirements decide what users observe. A central flag may make behavior change immediately for reads that consult it; a stored per-user copy may roll forward gradually. State the acceptable staleness and what “done” means."
        ],
        code: "request-time lazy path ─┐\n                         ├─ same version-aware, idempotent transform\nthrottled backfill ────┘",
        note: "If both paths can touch one user concurrently, use an atomic version transition so they cannot overwrite a newer result."
      },
      {
        title: "Roll out in slices with a safe off switch",
        story: "A feature flag is a dimmer as well as a switch: start with a narrow cohort, inspect the result, and widen only while the system stays healthy.",
        details: [
          "Use explicit cohorts, canaries, and staged percentages. Monitor error rate, latency, conversion or domain outcomes, database load, and consistency. Keep the old path available for a defined compatibility period.",
          "A kill switch should stop new work or route readers back safely. It does not undo already committed data. Keep rollback semantics separate: code rollback, flag disablement, and data restoration are different actions.",
          "Dual-write periods need reconciliation and a clear authority for reads. Avoid silently treating two copies as equal forever. Verify counts, samples, invariants, and lag before cutting over and later contracting the old shape."
        ],
        code: "internal cohort → 1% → 10% → 50% → 100%\nwatch thresholds at each step\npause on signal breach; rollback flag or forward-fix data",
        note: "A kill switch limits future exposure. It cannot erase an irreversible external effect or restore a prior row value by itself."
      },
      {
        title: "Build the answer from constraints, not slogans",
        story: "A strong system-design answer is a chain of reasons. Start with what must be true, then compare the simplest ways to make it true and identify the operational cost of each.",
        details: [
          "Clarify source of truth, eligible population, whether new users join the job, visibility deadline, allowed staleness, audit needs, rollback expectations, and what happens when a user changes data during migration.",
          "Estimate work: rows touched, index maintenance, WAL/replica budget, batch size, expected throughput, and traffic headroom. Decide sync versus async from request latency, duration, observability, and cancellation needs.",
          "Then specify batching/cursor, checkpoint ordering, idempotency boundary, concurrency cap, retry classification, dead-letter path, metrics, verification query, and operator controls. Explain which property each mechanism protects.",
          "Compare alternatives fairly. A central flag may avoid row writes but changes runtime reads. A lazy path saves dormant-user work but can prolong mixed versions. A backfill gives progress control but costs database capacity. The constraints tell you which trade-off fits.",
          "Next trail markers: Kafka partitioning explores ordered parallel streams; CDC (change data capture) streams committed database changes; event sourcing stores domain events as the source of truth; consensus coordinates agreement across nodes; CRDTs model mergeable distributed state; sharding splits data across databases and introduces cross-shard trade-offs; multi-region systems add latency and failure-domain choices. These build on the same questions about ownership, ordering, durability, and recovery."
        ],
        code: "intent → source of truth → consistency → migration shape\n      → safe rate → retry model → observability\n      → verification + rollback / forward recovery",
        note: "This field guide intentionally does not reveal or solve the MCQ in your source text. Use the questions to build and defend your own reasoning first."
      }
    ],
    fieldNote: "Write your assumptions down. If the requirements say “all users must see it at the same instant,” that changes the design. If a gradual transition is acceptable, the design space widens.",
    quiz: [
      q("Warm-up", "When is a central feature flag a strong fit?", ["A shared policy should change without storing a duplicate value on every user", "Every user's setting is independently audited and mutable", "The application must never read configuration", "The value is a secret authorization credential"], 0, "Ask whether the value is global policy or genuine user-specific state.", "A shared policy can live centrally and be evaluated at runtime, avoiding duplicate writes. Per-user choices and authorization require different data and control models."),
      q("Warm-up", "What is a feature flag not a substitute for?", ["Authorization and access control", "A staged rollout", "A kill switch", "A central policy value"], 0, "Activation policy and permission to access data answer different questions.", "A flag controls whether a feature path is active. Authorization controls which principal may perform an action; do not rely on a rollout flag as an access boundary."),
      q("Warm-up", "What does a kill switch typically do in a staged rollout?", ["Stop or route away from future feature exposure", "Undo every committed database write", "Restore an old backup automatically", "Guarantee zero replica lag"], 0, "A control on future behavior is not the same as reversing history.", "A kill switch can disable a feature path or new work. Reverting persisted data needs its own safe rollback or forward-recovery plan."),
      q("Apply", "Which requirement most favors a per-user persistent value over a central flag?", ["Each user has a different audited preference", "One shared policy applies to everyone", "A global rule must be changed quickly", "The value is derived from a versioned shared bundle"], 0, "Does the value differ per person, or is it one common decision?", "Individual preferences and audits are user state. A central flag or shared version is better suited to common policy when those individual semantics are absent."),
      q("Apply", "A migration must transform only users who become active, and leaving dormant users old is acceptable. Which path may avoid unnecessary work?", ["Lazy migration on access", "One synchronous request over every row", "Lock the whole table indefinitely", "Disable all reads until completion"], 0, "The requirement says dormant records do not need an immediate change.", "Lazy migration spreads work to active users and can skip untouched records. It requires version-aware reads, request-latency control, and a policy for the long tail."),
      q("Apply", "A reporting system needs every existing row in the new shape by a date. What is a likely fit?", ["A throttled background backfill with progress and verification", "A feature flag alone", "Lazy migration with no long-tail plan", "A cache TTL"], 0, "The requirement includes all rows and a deadline, not only active users.", "A background backfill can guarantee coverage and expose progress while controlling rate. It needs checkpoints, retries, throttling, and independent verification."),
      q("Diagnose", "A rollout flag is disabled, but half the database rows were already converted. What does disabling the flag accomplish?", ["It may route future reads away, but it does not reverse committed row changes", "It rolls the data transaction back across history", "It restores previous user edits automatically", "It deletes the outbox"], 0, "Code/flag rollback and data rollback have different boundaries.", "Disabling future feature exposure does not undo durable writes. Data rollback may be lossy or unsafe; a forward-compatible reader or explicit restoration plan may be needed."),
      q("Diagnose", "Both the lazy read path and backfill can update one user concurrently. Which safeguard best limits a stale overwrite?", ["An atomic version predicate or compare-and-set transition", "A longer queue timeout only", "Separate caches with the same key", "A random order by display name"], 0, "Both actors need a rule for who can move the user's version forward.", "A conditional state transition ensures only a valid older-to-newer move commits. The losing path can reread the latest state and treat the user as complete."),
      q("Design", "A design review asks whether 10 million user rows must be mutated. What is the most useful first analysis?", ["Clarify whether the value is shared policy, per-user state, or a version reference", "Immediately choose the largest worker pool", "Pick Kafka before defining the requirement", "Start with an unbounded UPDATE"], 0, "The data model can eliminate or reshape the write workload.", "Identify the source of truth and whether the information is actually user-specific. That determines whether central evaluation, a version pointer, lazy change, or backfill is needed."),
      q("Design", "Which outline best defends a production migration design?", ["Name a queue and say it is scalable", "State requirements, compare source-of-truth options, bound work, handle retries, protect the DB, and verify completion", "Promise exactly-once delivery", "Choose a batch size without measuring"], 1, "Tie each mechanism to a stated requirement or failure mode.", "A defensible design explains assumptions and trade-offs, then connects batching, idempotency, backpressure, observability, and verification to concrete risks."),
    ]
  }
];

export const totalQuestions = course.reduce((total, module) => total + module.quiz.length, 0);
