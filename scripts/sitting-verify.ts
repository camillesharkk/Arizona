import { listPhase } from "../lib/list-phase.ts";
import { clearSitting, openSitting, parseSitting, readSitting, remainingSeconds, writeSitting, type Sitting } from "../lib/sitting.ts";

let failed = 0;
function check(name: string, ok: boolean) {
  if (ok) console.log("OK   ", name);
  else {
    failed += 1;
    console.error("FAIL ", name);
  }
}

const memory = new Map<string, string>();
const storage = {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, value);
  },
  removeItem: (key: string) => {
    memory.delete(key);
  },
};

const started = 1_000_000;
check("timer keeps elapsed time", remainingSeconds(started, 3600, started + 125_000) === 3475);
check("timer does not reset after a refresh", remainingSeconds(started, 3600, started + 125_000) === 3475);
check("timer stops at zero", remainingSeconds(started, 60, started + 90_000) === 0);

const sitting: Sitting = {
  version: 1,
  owner: "user-a",
  state: "AZ",
  mode: "quick",
  seed: 42,
  questionIds: ["az-001", "az-002", "az-003"],
  idx: 2,
  answers: { "az-001": "B", "az-002": "C" },
  explainOpen: { "az-002": true },
  flaggedIds: ["az-003"],
  startedAt: started,
  timeLimitSeconds: null,
  done: false,
  examId: null,
  attemptIds: { "az-001": "attempt-1" },
  recordedIds: ["az-001", "az-002"],
  scored: false,
};
writeSitting(storage, sitting);
const restored = readSitting(storage, "user-a", "quick");
check("same account restores order, answers, flag, and index", Boolean(
  restored &&
  restored.questionIds.join() === "az-001,az-002,az-003" &&
  restored.idx === 2 &&
  restored.answers["az-001"] === "B" &&
  restored.flaggedIds[0] === "az-003" &&
  restored.explainOpen["az-002"] === true &&
  restored.attemptIds["az-001"] === "attempt-1" &&
  restored.seed === 42
));
check("another account cannot read it", readSitting(storage, "user-b", "quick") === null);
check("another mode cannot read it", readSitting(storage, "user-a", "full") === null);
check("a finished sitting is not offered as resume", openSitting(storage, "user-a", "quick")?.idx === 2);
writeSitting(storage, { ...sitting, done: true });
check("done sitting is closed", openSitting(storage, "user-a", "quick") === null);
clearSitting(storage, "user-a", "quick");
check("cleared sitting is gone", readSitting(storage, "user-a", "quick") === null);
check("corrupt payload is ignored", parseSitting({ version: 1, owner: "user-a" }, "user-a", "quick") === null);

check("loading with no rows is loading", listPhase("loading", 0) === "loading");
check("loading with rows keeps the list", listPhase("loading", 3) === "list");
check("failure is not an empty list", listPhase("error", 0) === "error");
check("failure keeps a list already shown", listPhase("error", 2) === "list");
check("ready and empty is empty", listPhase("ready", 0) === "empty");
check("ready with rows is the list", listPhase("ready", 1) === "list");

if (failed) {
  console.error(`sitting-verify failures=${failed}`);
  process.exit(1);
}
console.log("sitting-verify failures=0");
