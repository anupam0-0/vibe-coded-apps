import type { ReactNode } from "react";

export type Lesson = { title: string; body: ReactNode };
export type Chapter = { id: string; phase: string; time: string; title: string; deck: string; goals: string[]; lessons: Lesson[]; resources: { label: string; url: string }[] };

export function Code({ children, label = "FIELD NOTES" }: { children: string; label?: string }) {
  return <div className="code-card"><div className="code-top"><span><i/><i/><i/></span><b>{label}</b><span>⌘ C</span></div><pre><code>{children}</code></pre></div>;
}

export function Diagram({ kind }: { kind: "ownership" | "middleware" | "services" | "dp" | "redis" | "ttl" }) {
  const diagrams = {
    ownership: <><rect x="34" y="44" width="135" height="58" rx="10"/><text x="101" y="68">String owner</text><text x="101" y="87" className="sub">heap allocation</text><path d="M169 73h45"/><path d="m205 66 9 7-9 7"/><rect x="216" y="44" width="135" height="58" rx="10"/><text x="283" y="68">&amp;str borrow</text><text x="283" y="87" className="sub">read-only view</text><path d="M283 103v24H101v-24"/><text x="190" y="145" className="sub">borrow ends before owner drops</text></>,
    middleware: <><rect x="15" y="53" width="72" height="48" rx="8"/><text x="51" y="82">CLIENT</text><path d="M88 77h22"/><rect x="111" y="42" width="93" height="70" rx="8"/><text x="157" y="66">REQUEST ID</text><text x="157" y="87" className="sub">trace context</text><path d="M205 77h21"/><rect x="227" y="42" width="93" height="70" rx="8"/><text x="273" y="66">LOGGER</text><text x="273" y="87" className="sub">latency + status</text><path d="M321 77h19"/><rect x="340" y="53" width="72" height="48" rx="8"/><text x="376" y="82">HANDLER</text><path d="M376 105v25H157v-14"/><text x="265" y="148" className="sub">response travels back through the stack</text></>,
    services: <><rect x="161" y="12" width="116" height="42" rx="8"/><text x="219" y="38">CLIENT</text><path d="M219 55v15"/><rect x="161" y="72" width="116" height="42" rx="8"/><text x="219" y="98">GATEWAY · TS</text><path d="M187 115l-72 28M250 115l71 28"/><rect x="29" y="145" width="147" height="43" rx="8"/><text x="102" y="171">USERS · RUST</text><rect x="262" y="145" width="147" height="43" rx="8"/><text x="335" y="171">NOTIFICATIONS · TS</text><path d="M103 189v12h110M336 189v12H226"/><rect x="161" y="204" width="116" height="37" rx="8"/><text x="219" y="228">POSTGRES</text></>,
    dp: <><text x="35" y="31" className="sub">nums = [2, 3, 1, 1, 4]</text>{[0,1,2,3,4].map((n) => <g key={n}><circle cx={57+n*79} cy="91" r="23"/><text x={57+n*79} y="96">{[2,3,1,1,4][n]}</text><text x={57+n*79} y="135" className="sub">dp[{n}]</text></g>)}<path d="M65 67 130 67M137 70 205 70M215 75 280 75M295 88h53"/><text x="202" y="178" className="sub">green frontier = farthest reachable index</text></>,
    redis: <><rect x="15" y="67" width="85" height="57" rx="8"/><text x="57" y="91">TCP</text><text x="57" y="108" className="sub">bytes</text><path d="M101 95h27"/><rect x="130" y="67" width="91" height="57" rx="8"/><text x="175" y="91">RESP</text><text x="175" y="108" className="sub">parser</text><path d="M222 95h27"/><rect x="251" y="67" width="91" height="57" rx="8"/><text x="296" y="91">COMMAND</text><text x="296" y="108" className="sub">dispatcher</text><path d="M343 95h25"/><rect x="369" y="67" width="72" height="57" rx="8"/><text x="405" y="91">STORE</text><text x="405" y="108" className="sub">HashMap</text><path d="M405 125v30H57v-29"/><text x="230" y="178" className="sub">encode reply → framed bytes → same connection</text></>,
    ttl: <><rect x="23" y="65" width="105" height="66" rx="9"/><text x="75" y="90">GET key</text><text x="75" y="110" className="sub">lookup entry</text><path d="M129 98h40"/><path d="m160 91 9 7-9 7"/><path d="M205 78l26 20-26 20-26-20z"/><text x="205" y="101">expired?</text><path d="M231 91l56-28"/><path d="M231 105l56 30"/><rect x="290" y="38" width="119" height="45" rx="8"/><text x="349" y="66">delete · nil</text><rect x="290" y="116" width="119" height="45" rx="8"/><text x="349" y="144">return value</text><text x="263" y="65" className="sub">YES</text><text x="264" y="131" className="sub">NO</text></>,
  };
  return <figure className="diagram"><svg viewBox="0 0 460 255" role="img" aria-label={`${kind} concept diagram`}>{diagrams[kind]}</svg><figcaption>FIELD SKETCH <span>/{kind.toUpperCase()}</span></figcaption></figure>;
}

const quiz = [
  { q: "A function receives &String. What does it receive?", a: ["Ownership of the allocation", "A temporary shared borrow", "A copied heap buffer", "A mutable reference"], correct: 1, why: "&String borrows the String. Prefer &str for many read-only string parameters because it accepts both String and string slices." },
  { q: "Which type represents a recoverable success or error?", a: ["Option<T>", "Result<T, E>", "panic!", "Arc<T>"], correct: 1, why: "Result<T,E> is either Ok(T) or Err(E). Option<T> models presence or absence." },
  { q: "Where should a request ID be assigned in a service stack?", a: ["Only inside the database", "Before logging and handlers", "After the response is sent", "In every handler separately"], correct: 1, why: "An outer layer can preserve or create the ID so logs and downstream calls share it." },
  { q: "For nums=[3,2,1,0,4], why does Jump Game fail?", a: ["Index 0 is zero", "The reachable frontier stops at index 3", "The array is not sorted", "DP requires negative values"], correct: 1, why: "Index 3 is reachable but has jump length 0, so the final index cannot be reached." },
  { q: "What does a Redis RESP array start with?", a: ["+", "$", "*", ":"], correct: 2, why: "RESP arrays use * followed by the element count and CRLF-delimited values." },
  { q: "Why does an HTTP gateway exist in this plan?", a: ["To own every service's database", "To provide one client entry point and route requests", "To replace service health checks", "To make all code one language"], correct: 1, why: "The gateway exposes a stable public surface and forwards to focused services." },
  { q: "What is the purpose of Docker Compose service DNS?", a: ["Containers discover each other by service name", "It assigns fixed public IPs", "It replaces HTTP", "It compiles the Rust binary"], correct: 0, why: "Services on the Compose network can connect using service names as hostnames." },
  { q: "What does Arc<T> provide?", a: ["A lock around every access", "Thread-safe shared ownership", "A database transaction", "Automatic async execution"], correct: 1, why: "Arc shares ownership atomically; interior mutation still needs a synchronization strategy." },
  { q: "What does a transaction promise at its core?", a: ["Every query is parallel", "A grouped change is all-or-nothing", "Indexes never become stale", "No operation can fail"], correct: 1, why: "A transaction groups steps so they commit as a unit or can be rolled back." },
  { q: "Which Jump Game scan runs in O(n) time and O(1) space?", a: ["Try every path recursively", "Compute every dp[i] from all later states", "Track the farthest reachable index", "Sort the input"], correct: 2, why: "The frontier contains enough information to decide whether the scan is stuck." },
];

const lessons: Chapter[] = [
  { id: "rust", phase: "01", time: "00:00 — 03:00", title: "Rust, back in your hands", deck: "Refresh only the language pieces this backend needs. The borrow checker is a design partner: ownership makes resource cleanup predictable, while borrowing lets functions use data without taking it away.", goals: ["Explain moves, shared and mutable borrows", "Model absence and failure with Option and Result", "Read async handler code without fighting syntax"], resources: [{ label: "The Rust Book · ownership", url: "https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html" }, { label: "The Rust Book · error handling", url: "https://doc.rust-lang.org/book/ch09-00-error-handling.html" }, { label: "Tokio tutorial", url: "https://tokio.rs/tokio/tutorial" }], lessons: [
    { title: "01 / Values, moves, and borrows", body: <><p>A value has one owner. When an owned <code>String</code> moves into another binding, the old binding is no longer usable; at the new owner’s end of scope, its allocation is dropped. A borrow lends access for a bounded lifetime without transferring ownership.</p><Diagram kind="ownership"/><Code label="RUST · OWNERSHIP">{`fn word_count(text: &str) -> usize {
    text.split_whitespace().count()
}

fn main() {
    let name = String::from("Vice City");
    let count = word_count(&name); // borrow
    println!("{name}: {count}"); // owner still usable
}`}</Code><p>Rules of thumb: use <code>&T</code> for shared reads, one <code>&mut T</code> for exclusive mutation, and take an owned value when your function must keep it. <code>String</code> owns UTF‑8 bytes; <code>&str</code> views UTF‑8 text. <code>Vec&lt;T&gt;</code> grows a sequence, <code>HashMap&lt;K,V&gt;</code> maps keys to values.</p><div className="practice"><b>TRY IT</b><span>Change <code>word_count(&name)</code> to pass <code>name</code>. Predict the compiler message, then restore the borrow.</span></div></> },
    { title: "02 / Types that make states clear", body: <><p><code>let</code> bindings are immutable by default; use <code>let mut</code> when the binding itself must change. <code>Option&lt;T&gt;</code> means a value may be absent. <code>Result&lt;T,E&gt;</code> means an operation can succeed or fail. Match both explicitly; use <code>if let Some(value) = option</code> when one variant is the only case you care about. Use <code>?</code> to return an error early when the caller can handle it.</p><Code label="RUST · DOMAIN TYPES">{`#[derive(Debug)]
struct User { id: u64, name: String }

enum UserError { NotFound, InvalidName }

fn find_user(id: u64) -> Result<User, UserError> {
    if id == 0 { return Err(UserError::NotFound); }
    Ok(User { id, name: "Anupam".into() })
}

fn display_name(user: Option<User>) -> String {
    if let Some(user) = user { user.name } else { "Guest".into() }
}

// Inside a function:
    let mut ids = vec![1, 2, 3];
    ids.push(4); // Vec<T> grows as needed
    let mut names = std::collections::HashMap::new();
names.insert(1, "Anupam"); // HashMap<K, V>`}</Code><p>Use <code>struct</code> for a record, <code>enum</code> for a closed set of variants, <code>impl</code> for methods, and traits for shared behavior. Generics keep functions reusable; modules define visibility with <code>pub</code> and imports with <code>use</code>. Reach for lifetimes only to describe how borrowed inputs and outputs relate; they do not extend data’s life.</p><Code label="RUST · METHODS + GENERICS">{`trait Named { fn name(&self) -> &str; }

impl Named for User {
    fn name(&self) -> &str { &self.name }
}

fn first<T>(items: &[T]) -> Option<&T> {
    items.first()
}`}</Code><p>The method borrows <code>self</code>; the generic function works for any slice element type without copying it.</p><div className="callout"><b>DON’T TURN ERRORS INTO PANICS</b><p>Use <code>Result</code> for expected failures like invalid input or unavailable storage. Reserve panics for broken assumptions; at the HTTP boundary, map internal details to a safe response.</p></div></> },
    { title: "03 / Async service muscles", body: <><p>An <code>async fn</code> creates a future. <code>.await</code> yields while I/O is pending so Tokio can run other tasks. It does not make CPU-heavy work faster. <code>Arc&lt;T&gt;</code> allows shared ownership across tasks; add a mutex only when mutable shared state truly requires it.</p><Code label="RUST · ASYNC FLOW">{`async fn load_user(id: UserId) -> Result<User, AppError> {
    let row = repository::find(id).await?;
    Ok(row.into())
}`}</Code><p>For this lab, use Tokio for the runtime and TCP basics, Axum for routing and handlers, and Tower layers for middleware. Read the function signature first: it tells you what can fail, what is borrowed, and which values cross an await point.</p><div className="practice"><b>EXIT CHECK</b><span>Explain ownership, mutable borrow, String vs &amp;str, Option vs Result, <code>?</code>, Arc, async, and one Tokio task in your own words.</span></div></> },
  ] },
  { id: "middleware", phase: "02", time: "03:00 — 05:00", title: "Middleware: trace the request", deck: "Build the production habits around a tiny HTTP API. A request ID, structured log, safe error response, and clear boundary turn a handler into a service you can operate.", goals: ["Build health and user routes", "Propagate one request ID across hops", "Separate expected errors from panic recovery"], resources: [{ label: "Axum middleware guide", url: "https://docs.rs/axum/latest/axum/middleware/" }, { label: "Tower HTTP TraceLayer", url: "https://docs.rs/tower-http/latest/tower_http/trace/struct.TraceLayer.html" }, { label: "Rust error handling", url: "https://doc.rust-lang.org/book/ch09-00-error-handling.html" }], lessons: [
    { title: "01 / The round trip", body: <><p>Middleware wraps a handler. The request flows inward through layers; the response flows back outward. Put request-ID creation outside logging so every completion event includes the identifier. Keep authentication before protected handlers; recovery belongs at a boundary that can produce a generic 500.</p><Diagram kind="middleware"/><p>Routes for the exercise: <code>GET /health</code>, <code>GET /users/:id</code>, and <code>POST /users</code>. Health should report process readiness simply. Validate input before touching storage.</p><Code label="AXUM · ROUTE SKELETON">{`use axum::{routing::{get, post}, Router};

async fn health() -> &'static str { "ok" }
async fn get_user() { /* extract path ID; return Result */ }
async fn create_user() { /* validate JSON; persist */ }

fn app() -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/users/{id}", get(get_user))
        .route("/users", post(create_user))
}`}</Code><p>Axum composes Tower middleware with a router. Use <code>ServiceBuilder</code> or Axum’s middleware helpers; verify layer order from the outside inward. Handlers return responses, while typed application errors map to status codes and response bodies.</p></> },
    { title: "02 / Correlation and useful logs", body: <><p>If a client supplies a valid <code>X-Request-ID</code>, preserve it; otherwise generate an opaque ID. Return it in the response and forward it to downstream services. Treat caller-provided IDs as untrusted text: cap length and avoid control characters.</p><Code label="LOG EVENT · JSON SHAPE">{`{
  "level": "info",
  "request_id": "req_abc123",
  "service": "user-service",
  "method": "GET",
  "path": "/users/42",
  "status": 200,
  "duration_ms": 7
}`}</Code><p>Log stable fields, not entire request bodies or secrets. Use levels intentionally: debug for local detail, info for normal request completion, warn for recoverable oddities, error for failures needing attention.</p></> },
    { title: "03 / Errors and recovery", body: <><p>Return a typed application error from handlers and map it to a consistent response. A panic is an unexpected bug; recovery prevents internal panic text from leaking and emits a generic response with the same request ID. Recovery is not a substitute for fixing the bug, and it cannot guarantee a process is healthy after every panic.</p><Code label="SAFE API ERROR">{`{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error",
    "request_id": "req_abc123"
  }
}`}</Code><div className="callout"><b>HANDS-ON CHECK</b><p>Force one expected not-found error and one deliberate panic in a development route. Confirm 404 vs 500 behavior, a shared ID in logs and response headers, and that secret values never appear in client output.</p></div></> },
  ] },
  { id: "break", phase: "03", time: "05:00 — 05:30", title: "Reset the pilot", deck: "A break is part of the execution plan, not an invitation to open another tutorial. Step away so the next design block starts with a clear head.", goals: ["Walk away from the screen", "Eat and drink water", "Return without adding a new side quest"], resources: [{ label: "Back to the top", url: "#top" }], lessons: [{ title: "30 minutes off-screen", body: <><div className="rest-card"><span className="rest-icon">☾</span><div><b>REFUEL / 00:30</b><p>Walk. Eat. No YouTube. Come back ready to sketch a small system.</p></div></div><p>Before you return, name the one thing the gateway owns and one thing it delegates. That’s the opening question for the architecture block.</p></> }] },
  { id: "services", phase: "04", time: "05:30 — 10:00", title: "Polyglot backend, one boundary at a time", deck: "Use a small system to learn service boundaries. TypeScript at the edge, Rust for users, TypeScript notifications, and PostgreSQL for user data. Every extra service needs a reason.", goals: ["Draw the request and ownership boundaries", "Build a runnable skeleton for each service", "Bring the stack up locally and checkpoint it in GitHub"], resources: [{ label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/" }, { label: "Docker Compose overview", url: "https://docs.docker.com/compose/" }, { label: "Compose networking", url: "https://docs.docker.com/compose/how-tos/networking/" }, { label: "PostgreSQL transactions", url: "https://www.postgresql.org/docs/current/tutorial-transactions.html" }, { label: "GitHub Actions workflows", url: "https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows" }], lessons: [
    { title: "01 / A system small enough to understand", body: <><p>The gateway is the client’s stable entry point. It routes <code>/api/users/*</code> to the Rust user service and <code>/api/notifications/*</code> to the TypeScript notification service. The user service owns user validation and persistence. Notifications initially accept an event and log it; they do not need a queue yet.</p><Diagram kind="services"/><div className="callout"><b>BOUNDARIES ARE OWNERSHIP</b><p>A service owns its business rules and data contract. A gateway handles edge concerns and routing. Avoid shared database writes from multiple services; avoid Kafka, Kubernetes, service mesh, and extra services in this learning slice.</p></div></> },
    { title: "02 / Contracts, routes, and data", body: <><p>Agree on JSON at the boundary. A user response might be <code>{'{ "id": "u_123", "name": "Anupam" }'}</code>. A notification request might be <code>{'{ "userId": "u_123", "message": "Welcome" }'}</code>. Validate required fields and return stable error codes. Share a written contract first; generate SDKs only when there is a real need.</p><Code label="TYPESCRIPT · CONTRACT FIRST">{`type CreateUser = { name: string };
type User = { id: string; name: string };

type ApiError = {
  error: { code: string; message: string; requestId: string };
};

function isCreateUser(value: unknown): value is CreateUser {
  return typeof value === "object" && value !== null &&
    "name" in value && typeof value.name === "string";
}`}</Code><p>PostgreSQL stores durable user records. Learn the minimum SQL: create a table with a primary key, insert, select by ID, and use a transaction when multiple writes must succeed together. Keep schema migration strategy visible in the README.</p></> },
    { title: "03 / Compose, local development, and Git", body: <><p>Compose starts the gateway, both services, and Postgres. Put services on the default network and connect by service name (for example, <code>postgres:5432</code>), not a container IP. Add health checks and environment-based configuration. Keep secrets out of committed files.</p><Code label="DOCKER COMPOSE · SHAPE">{`services:
  gateway:
    build: ./services/gateway
    ports: ["3000:3000"]
    depends_on: [user-service, notification-service]
  user-service:
    build: ./services/user-service
    environment:
      DATABASE_URL: postgres://app:local@postgres:5432/app
  notification-service:
    build: ./services/notification-service
  postgres:
    image: postgres:18
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: local`}</Code><p>Checkpoint with a focused commit such as <code>feat: add polyglot service architecture</code>. README sections: architecture, services, run instructions, environment variables, endpoints, request flow. A GitHub Actions workflow can build and test on pull requests; keep it small and reproducible.</p><div className="practice"><b>BUILD CHECK</b><span>Trace one <code>POST /api/users</code> from client to database and back. Verify the same request ID appears at the gateway and user service.</span></div></> },
  ] },
  { id: "dp", phase: "05", time: "10:00 — 13:00", title: "Jump Game: from choices to a frontier", deck: "Learn the reasoning pattern, not just the answer. Define a state, derive a recurrence, compute it in a valid order, then ask whether the decision needs all that information.", goals: ["Explain brute force and overlapping subproblems", "Implement O(n²) bottom-up DP", "Prove the O(n) greedy frontier"], resources: [{ label: "Jump Game · problem statement", url: "https://leetcode.com/problems/jump-game/" }], lessons: [
    { title: "01 / Start with the question", body: <><p>Given <code>nums[i]</code>, the maximum forward jump from index <code>i</code>, decide whether index <code>n−1</code> is reachable. For <code>[2,3,1,1,4]</code>, yes: <code>0 → 1 → 4</code>. For <code>[3,2,1,0,4]</code>, no: the frontier ends at index 3.</p><p>Brute force at index <code>i</code> tries each next index in <code>i+1 ..= i+nums[i]</code>. It is a useful definition but repeats many suffix questions. Memoization caches those answers; tabulation makes the dependency order explicit.</p><div className="formula"><small>STATE</small><b>dp[i] = can index i reach the final index?</b><small>BASE · TRANSITION · ORDER</small><b>dp[n−1] = true<br/>dp[i] = any(dp[j]) for reachable j &gt; i<br/>compute i from right to left</b></div></> },
    { title: "02 / Write the honest DP first", body: <><p>For each position, inspect reachable later states. This is O(n²) time and O(n) space. The last index is the base case; a single-element input is already successful. Clamp the jump endpoint to <code>n−1</code>.</p><Diagram kind="dp"/><Code label="RUST · O(N²) DP">{`fn can_jump(nums: &[usize]) -> bool {
    let n = nums.len();
    if n == 0 { return false; }
    let mut dp = vec![false; n];
    dp[n - 1] = true;

    for i in (0..n - 1).rev() {
        let end = (i + nums[i]).min(n - 1);
        dp[i] = (i + 1..=end).any(|j| dp[j]);
    }
    dp[0]
}`}</Code><p>Trace <code>[3,2,1,0,4]</code> backward: <code>dp[4]=true</code>; index 3 reaches only 3; index 2 can reach 3 but not 4; index 1 reaches 3; index 0 can reach 1–3, all false. Result: false.</p></> },
    { title: "03 / Compress the state into a greedy frontier", body: <><p>For the yes/no answer, we do not need each position’s full truth value. Scan left to right while tracking the farthest reachable index. If the current index is beyond that frontier, we are stuck. Otherwise extend the frontier with <code>max(farthest, i + nums[i])</code>.</p><Code label="RUST · O(N) TIME / O(1) SPACE">{`fn can_jump_greedy(nums: &[usize]) -> bool {
    if nums.is_empty() { return false; }
    let mut farthest = 0;
    for (i, &jump) in nums.iter().enumerate() {
        if i > farthest { return false; }
        farthest = farthest.max(i.saturating_add(jump));
        if farthest >= nums.len() - 1 { return true; }
    }
    true
}`}</Code><p><b>Why it works:</b> every index at or before the frontier is reachable. Any such index can extend the frontier. If the scan reaches an index beyond it, no prior choice can get there. This proves the same reachability decision while keeping only one summary value.</p><div className="practice"><b>EDGE CASES</b><span><code>[0]</code> → true · <code>[0,1]</code> → false · <code>[2,0,0]</code> → true · very large jump lengths must not overflow.</span></div></> },
  ] },
  { id: "redis", phase: "06", time: "13:00 — 20:30", title: "Mini Redis: a protocol with a tiny store", deck: "The target is design, a documented implementation plan, and a first skeleton. Follow bytes from TCP to a parsed command to a HashMap result and back. Stop before persistence and clustering.", goals: ["Describe TCP framing and RESP", "Design commands and a shared in-memory store", "Specify lazy TTL and a test plan"], resources: [{ label: "Tokio · Mini-Redis tutorial", url: "https://tokio.rs/tokio/tutorial" }, { label: "Tokio · framing", url: "https://tokio.rs/tokio/tutorial/framing" }, { label: "RESP protocol specification", url: "https://redis.io/docs/latest/develop/reference/protocol-spec/" }], lessons: [
    { title: "01 / The byte-to-command pipeline", body: <><p>TCP is a byte stream: one read can contain part of a command, exactly one command, or several commands. Your connection layer must buffer bytes and find complete protocol frames. RESP uses typed markers and CRLF framing; a simple string begins with <code>+</code>, an error with <code>-</code>, an integer with <code>:</code>, a bulk string with <code>$</code>, and an array with <code>*</code>.</p><Diagram kind="redis"/><Code label="RESP · ARRAY OF BULK STRINGS">{`*3\r\n$3\r\nSET\r\n$4\r\nname\r\n$6\r\nanupam\r\n

// Conceptual parse result:
Command::Set("name", "anupam")`}</Code><p>Keep framing separate from meaning: connection reads a complete frame; parser converts a frame to a command; dispatcher runs it; encoder writes the response frame. Reject malformed input without panicking.</p></> },
    { title: "02 / Command model and storage", body: <><p>Start with <code>PING</code>, <code>SET key value</code>, <code>GET key</code>, <code>DEL key</code>, and <code>EXISTS key</code>. Define an enum so invalid combinations are hard to express. Use a shared <code>HashMap&lt;String, Entry&gt;</code> behind a mutex for the first single-process version.</p><Code label="RUST · COMMAND + ENTRY">{`enum Command {
    Ping,
    Get(String),
    Set(String, String),
    Del(String),
    Exists(String),
}

struct Entry {
    value: String,
    expires_at: Option<std::time::Instant>,
}

type Store = std::collections::HashMap<String, Entry>;`}</Code><p>Store methods should own the rules: <code>get</code> checks expiry, <code>set</code> replaces, <code>del</code> returns a count, and <code>exists</code> returns a boolean/integer response. A mutex is a learning baseline; later, consider a single owner task and message passing to avoid holding a lock across I/O.</p></> },
    { title: "03 / TTL, errors, and concurrency", body: <><p>For <code>SET key value EX 30</code>, store an absolute monotonic deadline. On <code>GET</code>, check existence, compare deadline, delete if expired, otherwise return the value. This is lazy expiration. A background sweep is active expiration; it reduces stale memory but needs a bounded work budget.</p><Diagram kind="ttl"/><p>Keep each connection task independent, but share store state safely. Never hold a store lock while waiting on a socket. Bound frame size and command arguments. Decide what happens on EOF, malformed frames, unknown commands, and client disconnects. Return protocol-level errors for bad commands; reserve panics for bugs.</p><div className="callout"><b>NON-GOALS FOR THIS SPRINT</b><p>No persistence, replication, clustering, transactions, pub/sub, streams, or claim of wire compatibility. Later extensions: INCR, EXPIRE, TTL, lists, AOF, snapshots.</p></div></> },
    { title: "04 / Skeleton plan and manual acceptance", body: <><p>Suggested files: <code>src/main.rs</code> binds Tokio TCP; <code>server.rs</code> accepts connections; <code>connection.rs</code> buffers and encodes frames; <code>parser.rs</code> validates arguments; <code>command.rs</code> defines the enum; <code>store.rs</code> owns values and TTL; <code>docs/design.md</code> records tradeoffs.</p><Code label="MINI REDIS · BUILD ORDER">{`1. PING → +PONG\r\n
2. Parse one complete RESP array
3. GET missing key → nil bulk reply
4. SET then GET returns stored bytes
5. DEL removes; EXISTS reflects removal
6. Add EX option and lazy TTL
7. Test fragmented and multiple frames`}</Code><p>Write design sections for goals, non-goals, architecture, protocol, command parser, data model, TTL, concurrency, error handling, and testing strategy. Manual check: connect with a RESP-capable client; send PING, SET, GET, DEL, then confirm GET returns nil.</p></> },
  ] },
  { id: "ship", phase: "07", time: "20:30 — 23:00", title: "Integration: operate the services", deck: "Return to the polyglot stack. Add the operational basics to every service, then prove the request ID survives the gateway hop and failures are understandable.", goals: ["Add consistent config, health, and shutdown", "Trace one request across services", "Test the important happy and failure paths"], resources: [{ label: "Axum middleware guide", url: "https://docs.rs/axum/latest/axum/middleware/" }, { label: "Compose networking", url: "https://docs.docker.com/compose/how-tos/networking/" }, { label: "PostgreSQL transactions", url: "https://www.postgresql.org/docs/current/tutorial-transactions.html" }], lessons: [
    { title: "01 / Production-minded service checklist", body: <><p>Every service should expose <code>/health</code>, load configuration from environment variables, log structured request fields, return a consistent error envelope, and shut down gracefully on termination. The gateway forwards <code>X-Request-ID</code>; downstream services reuse it.</p><div className="check-grid"><span>01 <b>Health route</b><small>process + dependency readiness</small></span><span>02 <b>Request ID</b><small>generate once, propagate everywhere</small></span><span>03 <b>Safe errors</b><small>stable public code, private detail in logs</small></span><span>04 <b>Graceful stop</b><small>stop accepting, finish bounded work</small></span></div></> },
    { title: "02 / Test the system at three levels", body: <><p>Unit tests cover parser, store, error mapping, and both Jump Game solutions. Integration tests exercise gateway → user service and verify the contract. Manual smoke checks use HTTP and a RESP client.</p><ul className="field-list"><li><b>HTTP:</b> GET /health; POST /users; GET /users/:id; preserve request ID.</li><li><b>Failure:</b> unknown user; invalid body; downstream unavailable; safe 500 recovery.</li><li><b>Redis:</b> PING; SET/GET; DEL/missing GET; EXISTS; expiry boundary.</li><li><b>Compose:</b> dependencies start; app reaches Postgres by service name; logs identify each service.</li></ul><div className="callout"><b>WRITE THE EXPECTED RESULT FIRST</b><p>For each smoke check, record request, expected status/body/header, and one log field to inspect. A test is useful when failure tells you which boundary broke.</p></div></> },
    { title: "03 / GitHub polish and engineering decisions", body: <><p>README order: purpose, architecture diagram, services, request lifecycle, run instructions, environment variables, API endpoints, tests, and decisions. Use honest language: a learning lab, not production-ready. Keep a small <code>docs/decisions.md</code> with choices such as why the gateway is TypeScript and why Mini Redis excludes persistence.</p><p>Commit coherent slices. GitHub Actions can run lint, unit tests, and build steps on pull requests. Review the diff before pushing; the PR page gives reviewers a place to discuss changes and see checks.</p><div className="practice"><b>SHIP CHECK</b><span>Can a new person explain the service boundaries, run the stack, trace a request, and understand what is intentionally unfinished?</span></div></> },
  ] },
  { id: "review", phase: "08", time: "23:00 — 24:00", title: "Final review & question deck", deck: "Close the loop. Rebuild Jump Game without notes, explain your design choices, and use the questions to find the next focused practice session.", goals: ["Consolidate the core explanations", "Answer 10 multiple-choice questions", "Complete five coding and five interview prompts"], resources: [{ label: "Jump Game · problem statement", url: "https://leetcode.com/problems/jump-game/" }, { label: "Rust Book", url: "https://doc.rust-lang.org/book/" }, { label: "RESP protocol", url: "https://redis.io/docs/latest/develop/reference/protocol-spec/" }], lessons: [
    { title: "01 / Ten multiple-choice questions", body: <><p>Choose an answer to reveal the explanation. Score yourself honestly; revisit the linked chapter when a concept feels fuzzy.</p><div className="quiz">{quiz.map((item, index) => <details className="quiz-item" key={item.q}><summary><span>Q{String(index+1).padStart(2,"0")}</span>{item.q}</summary><div className="answers">{item.a.map((answer, a) => <p className={a === item.correct ? "right-answer" : ""} key={answer}><b>{String.fromCharCode(65+a)}.</b> {answer}</p>)}<p className="explanation">{item.why}</p></div></details>)}</div></> },
    { title: "02 / Five coding questions", body: <><ol className="question-list"><li><b>Rust · ownership:</b> Write <code>normalize_name(&amp;str) -&gt; Result&lt;String, NameError&gt;</code>. Trim whitespace, reject empty input, and return owned lowercase text.</li><li><b>Rust · middleware:</b> Implement a function that accepts or generates a bounded request ID and adds it to request and response headers.</li><li><b>Algorithms:</b> Implement Jump Game using backward O(n²) DP, then greedy O(n). State invariants and test empty/singleton/zero-frontier inputs.</li><li><b>TypeScript:</b> Validate <code>unknown</code> JSON for <code>{'{ userId: string, message: string }'}</code> without using <code>any</code>.</li><li><b>Rust · Mini Redis:</b> Implement <code>Store::get</code> with lazy expiry and a fakeable clock so expiry boundary tests are deterministic.</li></ol><p className="small-note">For each: define inputs, edge cases, error behavior, and complexity before coding.</p></> },
    { title: "03 / Five interview questions", body: <><ol className="question-list"><li><b>Ownership:</b> Why does Rust move a <code>String</code> by default, and when would you borrow instead?</li><li><b>Operations:</b> How does one request ID help debug a request crossing a gateway and two services? What should never be logged?</li><li><b>Architecture:</b> Which responsibilities belong in the gateway, and what failure modes appear when the user service is unavailable?</li><li><b>Algorithms:</b> Explain the Jump Game DP state and prove why the farthest-reachable greedy scan is sufficient.</li><li><b>Systems:</b> Walk through <code>SET key value</code> from TCP bytes to a store mutation and RESP reply. How would TTL and concurrent clients change the design?</li></ol><div className="final-card"><span>THE LAST QUESTION</span><b>What did you build that you can explain without opening a tutorial?</b><small>Write that answer in your README.</small></div></> },
  ] },
];

export { lessons as chapters };
