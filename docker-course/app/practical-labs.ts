export type PracticalLab = {
  environment: string;
  mission: string;
  codeFile: string;
  starterCode: string;
  runInstructions: string;
  checkpoints: string[];
  expectedResult: string;
  hint: string;
  solution: string;
  stretch: string;
};

export const practicalLabs: Record<string, PracticalLab> = {
  "command-line-foundations": {
    environment: "Bash on Linux or WSL. This exercise creates files only in ~/cli-lab.",
    mission: "Turn the chapter's path and quoting ideas into a repeatable setup script. Run it twice and confirm it is safe to repeat.",
    codeFile: "bench.sh",
    starterCode: `#!/usr/bin/env bash
set -euo pipefail

root="$HOME/cli-lab"
# TODO: create drafts/ and logs/ under root in one command

# TODO: create a file named notes with spaces.txt under root

printf 'workspace: %s\\n' "$root"
printf 'current directory: '
pwd
find "$root" -maxdepth 2 -type f -print`,
    runInstructions: "Save as bench.sh, then run: bash bench.sh",
    checkpoints: ["Use mkdir -p with a quoted path.", "Create and find a filename containing spaces.", "Run the script twice without errors."],
    expectedResult: "The output prints your current directory and lists ~/cli-lab/notes with spaces.txt. The drafts and logs directories exist after either run.",
    hint: "Keep the base path in one variable, then quote every expansion. mkdir -p is designed to tolerate directories that already exist.",
    solution: `#!/usr/bin/env bash
set -euo pipefail
root="$HOME/cli-lab"
mkdir -p "$root/drafts" "$root/logs"
touch "$root/notes with spaces.txt"
printf 'workspace: %s\\n' "$root"
printf 'current directory: '
pwd
find "$root" -maxdepth 2 -type f -print
command -v bash
type cd`,
    stretch: "Add a third directory named archived/ and make the script accept a different workspace path as its first argument, defaulting to ~/cli-lab.",
  },
  "pipes-and-text-tools": {
    environment: "Bash on Linux, macOS, or WSL; uses the standard grep, cut, sort, uniq, and wc tools.",
    mission: "Create a small log report with a pipeline, save machine-readable results separately, and keep the raw log unchanged.",
    codeFile: "bench.sh",
    starterCode: `#!/usr/bin/env bash
set -euo pipefail

cat > access.log <<'LOG'
10:00 INFO web started
10:01 ERROR api timeout
10:02 ERROR auth rejected
10:03 ERROR api reset
10:04 INFO web ready
LOG

# TODO: count ERROR events by service (the service is field 4)
grep -F 'ERROR' access.log | cut -d' ' -f4 | sort | uniq -c

# TODO: save the summary to error-counts.txt and print the number of errors`,
    runInstructions: "Save as bench.sh, then run: bash bench.sh",
    checkpoints: ["Filter only ERROR rows.", "Count by service after sorting the service field.", "Redirect the summary to a file and report the number of errors."],
    expectedResult: "The summary contains api 2 and auth 1 (spacing can vary). The total error count is 3. access.log still contains all five input lines.",
    hint: "A pipe connects stdout to the next command's stdin. Use tee when you want to save a result and still display it; use wc -l for a line count.",
    solution: `#!/usr/bin/env bash
set -euo pipefail
cat > access.log <<'LOG'
10:00 INFO web started
10:01 ERROR api timeout
10:02 ERROR auth rejected
10:03 ERROR api reset
10:04 INFO web ready
LOG
grep -F 'ERROR' access.log | cut -d' ' -f4 | sort | uniq -c | tee error-counts.txt
printf 'total errors: '
grep -cF 'ERROR' access.log`,
    stretch: "Send a deliberate diagnostic to stderr, redirect it to errors.log, and use set -o pipefail to make the pipeline fail when an earlier stage fails.",
  },
  "bash-scripting-processes": {
    environment: "Bash on Linux, macOS, or WSL. The script reads a file you pass to it and does not modify that file.",
    mission: "Complete a reusable log-counting script with argument validation, quoted paths, a clear error stream, and a reliable exit status.",
    codeFile: "count-errors.sh",
    starterCode: `#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  printf 'TODO: show usage on stderr\\n' >&2
  exit 2
fi

file="$1"
# TODO: reject a missing or unreadable file with a non-zero status

printf 'lines: %s\\n' "$(wc -l < "$file")"
# TODO: print the number of ERROR lines; zero errors must not abort the script`,
    runInstructions: "Copy access.log from the previous lab to 'sample log.txt', then run: bash count-errors.sh 'sample log.txt'. Also try it with no arguments.",
    checkpoints: ["No-argument and two-argument calls print usage and fail.", "A missing file prints a useful error to stderr.", "A spaced filename works; a file with no ERROR lines prints zero."],
    expectedResult: "For the five-line sample from the previous lab, the script prints lines: 5 and errors: 3. Invalid input exits non-zero instead of producing a misleading count.",
    hint: "Use [[ -r $file ]] for readability. grep -c returns status 1 when there are no matches, so handle that expected case explicitly under set -e.",
    solution: `#!/usr/bin/env bash
set -euo pipefail
if [[ $# -ne 1 ]]; then
  printf 'usage: %s FILE\\n' "$0" >&2
  exit 2
fi
file="$1"
if [[ ! -r "$file" ]]; then
  printf 'error: cannot read %s\\n' "$file" >&2
  exit 1
fi
lines=$(wc -l < "$file")
errors=$(grep -cF 'ERROR' "$file" || true)
printf 'lines: %s\\nerrors: %s\\n' "$lines" "$errors"`,
    stretch: "Add a temporary output file and an EXIT trap that removes it on both success and failure. Test with a filename containing spaces.",
  },
  "linux-operating-system": {
    environment: "Linux or WSL. This starts one harmless sleep process and terminates it automatically when the script exits.",
    mission: "Use a short script to inspect a process, its parent, owner, state, executable, and the kernel's process view.",
    codeFile: "inspect-process.sh",
    starterCode: `#!/usr/bin/env bash
set -euo pipefail

sleep 90 &
child=$!
trap 'kill "$child" 2>/dev/null || true; wait "$child" 2>/dev/null || true' EXIT

printf 'shell pid: %s\\nchild pid: %s\\n' "$$" "$child"
# TODO: show PID, PPID, user, state, and command for the child with ps
# TODO: inspect /proc/CHILD_PID/status and /proc/CHILD_PID/exe`,
    runInstructions: "Save as inspect-process.sh, then run: bash inspect-process.sh",
    checkpoints: ["The child PID differs from the shell PID.", "ps shows the parent and state while sleep is running.", "The EXIT trap leaves no sleep process behind."],
    expectedResult: "You see the child process with the script's PID as its parent, then the trap terminates it. /proc contains the live process details while the script is running.",
    hint: 'The special parameter $! captures the last background PID. Use ps -o pid,ppid,user,stat,cmd -p "$child" and build the /proc path from that same variable.',
    solution: `#!/usr/bin/env bash
set -euo pipefail
sleep 90 &
child=$!
trap 'kill "$child" 2>/dev/null || true; wait "$child" 2>/dev/null || true' EXIT
ps -o pid,ppid,user,stat,cmd -p "$child"
head -n 8 "/proc/$child/status"
readlink "/proc/$child/exe"`,
    stretch: "Run the script twice in separate terminals and compare PPID values. Explain why the PID is an identity for this process instance, not a permanent service name.",
  },
  "network-fundamentals": {
    environment: "Linux or WSL with Python 3 and curl. The server binds only to 127.0.0.1 and is not exposed to your network.",
    mission: "Start a local HTTP server, write a small probe, and distinguish a TCP connection from an HTTP response.",
    codeFile: "probe-local.sh",
    starterCode: `#!/usr/bin/env bash
set -euo pipefail
url='http://127.0.0.1:8000/'

# TODO: print the resolved address for 127.0.0.1
getent ahosts 127.0.0.1

# TODO: make curl show the HTTP status and fail on HTTP errors
curl -sS -o /dev/null -w 'http=%{http_code}\\n' "$url"`,
    runInstructions: "In terminal 1 run: python3 -m http.server 8000 --bind 127.0.0.1. Save as probe-local.sh and run bash probe-local.sh in terminal 2.",
    checkpoints: ["Resolve the loopback name/address.", "Observe a successful HTTP status from the local server.", "Stop the server and rerun the probe; explain which layer now fails."],
    expectedResult: "With the server running, curl reports http=200 and the server logs a GET request. After it stops, name resolution can still succeed while the TCP connection fails.",
    hint: "DNS/name lookup, routing, TCP connection, and HTTP are separate stages. curl -v shows connection details; --fail treats HTTP 4xx/5xx as failure.",
    solution: `#!/usr/bin/env bash
set -euo pipefail
target=127.0.0.1
url='http://127.0.0.1:8000/'
printf 'name result: '
getent ahosts "$target"
printf 'route: '
ip route get "$target" 2>/dev/null || true
curl --fail --silent --show-error --max-time 3 -o /dev/null -w 'http=%{http_code} peer=%{remote_ip}\\n' "$url"`,
    stretch: "Change the URL to /missing-file and compare HTTP 404 with a stopped server's connection error. State why these are different diagnoses.",
  },
  "network-diagnostics": {
    environment: "Linux or WSL with iproute2, getent, curl, and netcat (nc). Probe the local Python server from the previous lab.",
    mission: "Write a compact incident probe that gathers evidence in order instead of guessing which network layer failed.",
    codeFile: "network-report.sh",
    starterCode: `#!/usr/bin/env bash
set -u
host=127.0.0.1
port=8000

printf '== DNS ==\\n'
# TODO: resolve host and preserve a readable failure message
getent ahosts "$host" 2>&1 || true
printf '== ROUTE ==\\n'
# TODO: inspect route selection
ip route get "$host" 2>&1 || true
printf '== TCP ==\\n'
# TODO: test the port with a bounded timeout
nc -vz -w 2 "$host" "$port" 2>&1 || true
printf '== HTTP ==\\n'
# TODO: print HTTP status and total time with curl`,
    runInstructions: "Save as network-report.sh, start the local Python server on 127.0.0.1:8000, then run: bash network-report.sh",
    checkpoints: ["The report labels each layer and does not stop at the first failed probe.", "A live server gives a successful TCP test and HTTP status.", "A stopped server leaves DNS intact but makes TCP/HTTP fail."],
    expectedResult: "A live local server shows loopback resolution, a local route, an open TCP port, and HTTP 200. The stopped-server report preserves earlier evidence and identifies the connection boundary that failed.",
    hint: "Use curl -sS -o /dev/null -w 'http=%{http_code} time=%{time_total}\\n' URL. Keep each probe's output under its own heading.",
    solution: `#!/usr/bin/env bash
set -u
host=127.0.0.1
port=8000
printf '== DNS ==\\n'
getent ahosts "$host" 2>&1 || true
printf '== ROUTE ==\\n'
ip route get "$host" 2>&1 || true
printf '== TCP ==\\n'
nc -vz -w 2 "$host" "$port" 2>&1 || true
printf '== HTTP ==\\n'
curl --max-time 3 -sS -o /dev/null -w 'http=%{http_code} time=%{time_total}\\n' "http://$host:$port/" 2>&1 || true`,
    stretch: "Run the report against localhost port 8001 with no server. Write a three-line incident note separating observed evidence from your next hypothesis.",
  },
  "container-mental-model": {
    environment: "Docker Engine or Docker Desktop with a local Linux container image available; the first run may download BusyBox.",
    mission: "Compare two short-lived containers from one image, then inspect the difference between a process, a container, and its image.",
    codeFile: "container-observe.sh",
    starterCode: `#!/usr/bin/env bash
set -euo pipefail
image=busybox:1.36

# TODO: run one named, auto-removed container that prints its hostname and process list
docker run --rm --name reel-process-a "$image" sh -c 'hostname; ps'

# TODO: start a second container from the same image and compare its hostname
docker run --rm --name reel-process-b "$image" hostname

# TODO: inspect the image ID and list any remaining named containers
docker image inspect "$image" --format '{{.Id}}'`,
    runInstructions: "Save as container-observe.sh, then run: bash container-observe.sh",
    checkpoints: ["Each container starts one foreground command and exits when it finishes.", "The two container IDs are distinct even though both use one image.", "--rm removes the stopped container while the image remains."],
    expectedResult: "Both commands print container hostnames; Docker reports one image ID. No reel-process-a or reel-process-b container remains after the script finishes.",
    hint: "An image is the template; each docker run creates a container instance with its own writable layer and process namespace. Use docker ps -a to inspect stopped containers.",
    solution: `#!/usr/bin/env bash
set -euo pipefail
image=busybox:1.36
docker run --rm --name reel-process-a "$image" sh -c 'printf "hostname: "; hostname; ps'
docker run --rm --name reel-process-b "$image" hostname
docker image inspect "$image" --format '{{.Id}}'
docker ps -a --filter name=reel-process`,
    stretch: "Run a container without --rm, inspect it after exit, then remove only that named container. Verify its image still exists.",
  },
  "docker-images-builds": {
    environment: "Docker Engine or Docker Desktop. Building may pull BusyBox from its image registry; the built image and container stay local.",
    mission: "Write a small Dockerfile, build it, run it, and use image history to connect each instruction to a resulting layer.",
    codeFile: "Dockerfile",
    starterCode: `# Try a pinned, small base image; then change the greeting and rebuild.
FROM busybox:1.36

# TODO: create and use a working directory
WORKDIR /lesson

# TODO: put a short greeting in /lesson/message.txt during the build
RUN printf 'hello from the image\\n' > /lesson/message.txt

# TODO: make the container print the message when it starts
CMD ["cat", "/lesson/message.txt"]`,
    runInstructions: "Save as Dockerfile in an empty directory, then run: docker build -t bench-hello:local .; docker run --rm bench-hello:local; docker history bench-hello:local",
    checkpoints: ["Build succeeds with the intended current directory as its context.", "Running the image prints the greeting and exits.", "docker history shows the instructions that created image layers."],
    expectedResult: "The container prints hello from the image. A second unchanged build can reuse cached steps; changing the RUN instruction invalidates that layer and later layers.",
    hint: "The build context is the final dot in docker build. CMD describes the default process; it runs when a container starts, not when the image is built.",
    solution: `FROM busybox:1.36
WORKDIR /lesson
RUN printf 'hello from the image\\n' > /lesson/message.txt
CMD ["cat", "/lesson/message.txt"]`,
    stretch: "Add a .dockerignore, rebuild after changing only a file excluded by it, and compare the build output. Explain which inputs can affect cache reuse.",
  },
  "docker-runtime-compose": {
    environment: "Docker Compose v2 running locally. The web and Redis images may be pulled, but both services and the named volume remain on your machine.",
    mission: "Create a local two-service stack, resolve one service by its Compose DNS name, and prove that named-volume data survives a container restart.",
    codeFile: "compose.yaml",
    starterCode: `services:
  web:
    image: nginx:alpine
    # TODO: publish only on loopback, host 8088 to container 80
    # ports:
    #   - "127.0.0.1:8088:80"
    depends_on:
      - cache
  cache:
    image: redis:7-alpine
    command: ["redis-server", "--appendonly", "yes"]
    # TODO: add a named volume mount at Redis's data directory
    # volumes:
    #   - cache-data:/data
# TODO: declare the named volume at the top level`,
    runInstructions: "Finish the port and volume TODOs, then run docker compose up -d; curl -fsS http://127.0.0.1:8088/; docker compose exec web ping -c 1 cache. Set a value with docker compose exec cache redis-cli SET lesson keep-me, restart cache, and read it back with GET.",
    checkpoints: ["docker compose ps shows both services running.", "The web service resolves and reaches cache by its service name.", "The Redis key remains after a restart; docker compose down keeps the named volume unless you add -v."],
    expectedResult: "The web service answers at 127.0.0.1:8088, Compose DNS resolves cache, and Redis returns keep-me after a restart. The database port is not published to the host.",
    hint: "Compose creates a project network and DNS names from service names. A named volume has a lifecycle separate from the container writable layer.",
    solution: `services:
  web:
    image: nginx:alpine
    ports:
      - "127.0.0.1:8088:80"
    depends_on:
      - cache
  cache:
    image: redis:7-alpine
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - cache-data:/data
volumes:
  cache-data:`,
    stretch: "Run docker compose down, bring the stack back up, and check the Redis value again. Then use docker compose down -v in this disposable project and explain what data that removes.",
  },
  "cicd-principles": {
    environment: "Bash and Git in a local repository. The pipeline script runs locally and requires no hosting account, deployment credentials, or external service.",
    mission: "Turn a local verification sequence into a fail-fast CI script that checks syntax, behavior, and a traceable artifact.",
    codeFile: "verify.sh",
    starterCode: `#!/usr/bin/env bash
set -euo pipefail

printf '[1/3] syntax check\\n'
# TODO: run bash -n on hello.sh

printf '[2/3] behavior check\\n'
# TODO: capture hello.sh output and compare it with the expected line

printf '[3/3] package artifact\\n'
# TODO: create a tar.gz containing the checked script

printf 'all local checks passed\\n'`,
    runInstructions: "Create hello.sh that prints exactly hello, save this as verify.sh, chmod +x both files, then run: ./verify.sh",
    checkpoints: ["A syntax error causes the script to stop at stage 1.", "A wrong program output fails the behavior check.", "A passing run creates an artifact and prints a clear final status."],
    expectedResult: "A successful run labels all three stages and creates hello-artifact.tar.gz. A failure exits non-zero at the stage that found it.",
    hint: "Capture command output with output=$(./hello.sh), then compare it with [[ $output == hello ]]. set -e makes a failed check stop the job.",
    solution: `#!/usr/bin/env bash
set -euo pipefail
printf '[1/3] syntax check\\n'
bash -n hello.sh
printf '[2/3] behavior check\\n'
output=$(bash hello.sh)
[[ "$output" == hello ]]
printf '[3/3] package artifact\\n'
tar -czf hello-artifact.tar.gz hello.sh
printf 'all local checks passed\\n'`,
    stretch: "Add a second test that checks a failure case, and print the Git commit SHA in the report when the directory is a repository.",
  },
  "workflow-mechanics": {
    environment: "A Git repository and the local verify.sh exercise from the previous chapter. This workflow describes CI checks; it contains no deploy step.",
    mission: "Write a pull-request verification workflow with explicit triggers, least-privilege permissions, named checks, and a retained report.",
    codeFile: ".github/workflows/verify.yml",
    starterCode: `name: verify
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Check out the revision
        uses: actions/checkout@v7
      - name: Validate shell syntax
        run: bash -n verify.sh
      - name: Run local checks
        run: bash verify.sh
      # TODO: upload hello-artifact.tar.gz only after checks pass`,
    runInstructions: "Save at .github/workflows/verify.yml and run bash verify.sh locally. Review the trigger, checkout revision, permissions, and artifact step before using this workflow in a repository.",
    checkpoints: ["Both pull requests and pushes to main trigger verification.", "The workflow has only read access to repository contents.", "The artifact is uploaded after checks and only exists if the package step produced it."],
    expectedResult: "The YAML describes one verify job that checks the checked-out revision, stops on failed commands, and exposes the generated artifact for inspection. No publish or deploy step runs.",
    hint: "Add actions/upload-artifact@v7 as a named step with path: hello-artifact.tar.gz. A cache is optional speed-up state; an artifact is a result someone may inspect or pass onward.",
    solution: `name: verify
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Check out the revision
        uses: actions/checkout@v7
      - name: Validate shell syntax
        run: bash -n verify.sh
      - name: Run local checks
        run: bash verify.sh
      - name: Keep the checked artifact
        uses: actions/upload-artifact@v7
        with:
          name: hello-artifact
          path: hello-artifact.tar.gz`,
    stretch: "Add a test-report artifact that uploads even when tests fail, while ensuring the workflow itself still reports failure. Explain the difference between keeping evidence and making a failed check green.",
  },
  "container-ci-pipeline": {
    environment: "Docker Engine or Docker Desktop plus Bash and curl. Everything builds and runs on the local machine; the smoke-test port binds only to 127.0.0.1.",
    mission: "Write a local CI pipeline that builds a container, starts it with a bounded health check, captures logs, and cleans up after success or failure.",
    codeFile: "container-ci.sh",
    starterCode: `#!/usr/bin/env bash
set -euo pipefail
workdir=$(mktemp -d)
cd "$workdir"
image='bench-health:local'
name="bench-health-$$"
port=18080

cleanup() {
  # TODO: preserve useful logs, remove the container, and remove workdir
  :
}
trap cleanup EXIT

# TODO: write a tiny local HTTP app and Dockerfile here
# TODO: build the image, run on 127.0.0.1:$port, and poll /health up to 15 times
# TODO: print a clear pass or fail; never retry forever
exit 1 # Remove after you have implemented and verified the TODOs.`,
    runInstructions: "Save as container-ci.sh and run: bash container-ci.sh. The completed script creates a temporary build context and removes it at exit.",
    checkpoints: ["The image tag identifies the local build; no registry login is needed.", "The host port is bound to loopback and health polling has a fixed deadline.", "Container logs are available on failure and cleanup runs on both pass and fail."],
    expectedResult: "The pipeline prints named build and smoke stages, reaches HTTP 200 from /health, reports pass, and removes the temporary container and files when it exits.",
    hint: "Use a trap cleanup EXIT. In a bounded for loop, use curl in an if condition; after the deadline, print docker logs and exit 1. Bind with -p 127.0.0.1:18080:8080.",
    solution: `#!/usr/bin/env bash
set -euo pipefail
workdir=$(mktemp -d)
cd "$workdir"
image='bench-health:local'
name="bench-health-$$"
port=18080
cleanup() {
  docker logs "$name" 2>/dev/null || true
  docker rm -f "$name" >/dev/null 2>&1 || true
  rm -rf "$workdir"
}
trap cleanup EXIT
cat > app.py <<'PY'
from http.server import BaseHTTPRequestHandler, HTTPServer
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        code = 200 if self.path == "/health" else 404
        self.send_response(code)
        self.end_headers()
        self.wfile.write(b"ok\\n" if code == 200 else b"not found\\n")
HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
PY
cat > Dockerfile <<'DOCKER'
FROM python:3.12-alpine
WORKDIR /app
COPY app.py .
EXPOSE 8080
CMD ["python", "app.py"]
DOCKER
printf '[1/2] build image\\n'
docker build -t "$image" .
printf '[2/2] start and smoke-test\\n'
docker run -d --name "$name" -p "127.0.0.1:$port:8080" "$image" >/dev/null
for attempt in {1..15}; do
  if curl --fail --silent "http://127.0.0.1:$port/health"; then
    printf 'smoke test passed on attempt %s\\n' "$attempt"
    exit 0
  fi
  sleep 1
done
docker logs "$name"
printf 'smoke test failed after 15 seconds\\n' >&2
exit 1`,
    stretch: "Make the smoke test assert the response body as well as the status. Force the endpoint to return 500 and verify the pipeline fails but still captures logs and removes its container.",
  },
};
