import { prepStates as liveStates, recommendStates, type PrepState } from "../lib/states.ts";
import { releasedFreeStates } from '../lib/free-state-catalog.ts';

// Keep deterministic recommendation fixtures as the live catalog expands.
const prepStates: PrepState[] = liveStates.map(state => ['AZ', 'CA', 'HI'].includes(state.code) ? state : { ...state, status: 'comingSoon', homePath: null });

function fail(message: string): never {
  throw new Error(message);
}

function codes(states: { code: string }[]) {
  return states.map((state) => state.code).join(",");
}

const ny = prepStates.find((state) => state.code === "NY");
const hi = prepStates.find((state) => state.code === "HI");
const co = prepStates.find((state) => state.code === "CO");
const tx = prepStates.find((state) => state.code === "TX");
const ri = prepStates.find((state) => state.code === "RI");
if (!ny || !hi || !co || !tx || !ri) fail("missing sample states");

for (const state of [ny, hi, prepStates.find((item) => item.code === "LA")!, prepStates.find((item) => item.code === "PA")!]) {
  const result = recommendStates(state, prepStates, () => 0);
  if (!result.similar || codes(result.primary) !== "AZ,CA" || codes(result.others) !== "HI") fail(`${state.code} similar ${codes(result.primary)} ${codes(result.others)}`);
}

let seen = new Set<string>();
for (let i = 0; i < 20; i += 1) {
  const result = recommendStates(co, prepStates, () => i / 20);
  if (result.similar || result.primary.length !== 1) fail("colorado primary");
  const primary = result.primary[0]?.code;
  if (primary !== "AZ" && primary !== "CA" && primary !== "HI") fail("colorado candidate");
  if (result.others.length !== 2 || result.others.some((item) => item.code === primary)) fail("colorado other");
  if (primary) seen.add(primary);
}
if (seen.size < 2) fail("colorado random did not reach both states");

for (const state of [tx, ri]) {
  const result = recommendStates(state, prepStates, () => 0);
  if (result.similar || result.primary.length !== 1 || result.others.length !== 2) fail(`${state.code} random`);
}

const extra: PrepState = {
  code: "HI",
  name: "Hawaii",
  slug: "hawaii",
  status: "available",
  homePath: "/hawaii/",
  examGroup: "formalExam",
  developmentProgress: null,
};
const withHawaii = prepStates.map((state) => (state.code === "HI" ? extra : state));
const expanded = recommendStates(ny, withHawaii, () => 0);
if (codes(expanded.primary) !== "AZ,CA" || codes(expanded.others) !== "HI") fail(`expanded ${codes(expanded.primary)} ${codes(expanded.others)}`);

const none = prepStates.map((state) => ({ ...state, status: "comingSoon" as const, homePath: null }));
const empty = recommendStates(ny, none, () => 0);
if (empty.primary.length || empty.others.length) fail("zero available");

const onlyAz = prepStates.map((state) => state.code === "AZ" ? state : { ...state, status: "comingSoon" as const, homePath: null });
const oneSame = recommendStates(ny, onlyAz, () => 0);
if (codes(oneSame.primary) !== "AZ" || !oneSame.similar || oneSame.others.length) fail("one similar");
const oneOther = recommendStates(co, onlyAz, () => 0.9);
if (codes(oneOther.primary) !== "AZ" || oneOther.similar || oneOther.others.length) fail("one other");

if (prepStates.length !== 28) fail(`count ${prepStates.length}`);
if (prepStates.filter((state) => state.status === "available").map((state) => state.code).sort().join() !== "AZ,CA,HI") fail("available");
for (const code of releasedFreeStates) {
  const state = liveStates.find(state => state.code === code);
  if (state?.status !== 'available' || !state.homePath) fail(`released ${code}`);
}
if (liveStates.filter(state => state.status === 'available').length !== 9 + releasedFreeStates.length) fail('live state count');
console.log("state-recommend-verify ok");
