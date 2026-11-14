import { isFreeState, freeStateGroups, releasedFreeStates } from "./free-state-catalog.ts";

export type StateStatus = "available" | "comingSoon";
export type ExamGroup = "formalExam" | "onlineApplicationOrTraining" | "courseQuiz" | "recommendedAssessment";

export type PrepState = {
  code: string;
  name: string;
  slug: string;
  status: StateStatus;
  /** Live study home. Only available states have one. */
  homePath: string | null;
  examGroup: ExamGroup;
  /** Manual display value for coming-soon pages. */
  developmentProgress: number | null;
};

const catalog: PrepState[] = [
  { code: "AZ", name: "Arizona", slug: "arizona", status: "available", homePath: "/arizona-notary-exam/", examGroup: "formalExam", developmentProgress: null },
  { code: "AR", name: "Arkansas", slug: "arkansas", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "CA", name: "California", slug: "california", status: "available", homePath: "/california/", examGroup: "formalExam", developmentProgress: null },
  { code: "CO", name: "Colorado", slug: "colorado", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "CT", name: "Connecticut", slug: "connecticut", status: "available", homePath: "/connecticut/", examGroup: "onlineApplicationOrTraining", developmentProgress: null },
  { code: "HI", name: "Hawaii", slug: "hawaii", status: "available", homePath: "/hawaii/", examGroup: "formalExam", developmentProgress: null },
  { code: "IL", name: "Illinois", slug: "illinois", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "IN", name: "Indiana", slug: "indiana", status: "available", homePath: "/indiana/", examGroup: "onlineApplicationOrTraining", developmentProgress: null },
  { code: "LA", name: "Louisiana", slug: "louisiana", status: "available", homePath: "/louisiana/", examGroup: "formalExam", developmentProgress: null },
  { code: "ME", name: "Maine", slug: "maine", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "MD", name: "Maryland", slug: "maryland", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "MO", name: "Missouri", slug: "missouri", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "MT", name: "Montana", slug: "montana", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "NE", name: "Nebraska", slug: "nebraska", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "NV", name: "Nevada", slug: "nevada", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "NJ", name: "New Jersey", slug: "new-jersey", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "NM", name: "New Mexico", slug: "new-mexico", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "NY", name: "New York", slug: "new-york", status: "available", homePath: "/new-york/", examGroup: "formalExam", developmentProgress: null },
  { code: "NC", name: "North Carolina", slug: "north-carolina", status: "available", homePath: "/north-carolina/", examGroup: "onlineApplicationOrTraining", developmentProgress: null },
  { code: "OH", name: "Ohio", slug: "ohio", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "OR", name: "Oregon", slug: "oregon", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "PA", name: "Pennsylvania", slug: "pennsylvania", status: "available", homePath: "/pennsylvania/", examGroup: "formalExam", developmentProgress: null },
  { code: "RI", name: "Rhode Island", slug: "rhode-island", status: "comingSoon", homePath: null, examGroup: "recommendedAssessment", developmentProgress: 50 },
  { code: "TX", name: "Texas", slug: "texas", status: "comingSoon", homePath: null, examGroup: "courseQuiz", developmentProgress: 50 },
  { code: "UT", name: "Utah", slug: "utah", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "VT", name: "Vermont", slug: "vermont", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "WI", name: "Wisconsin", slug: "wisconsin", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
  { code: "WY", name: "Wyoming", slug: "wyoming", status: "comingSoon", homePath: null, examGroup: "onlineApplicationOrTraining", developmentProgress: 50 },
];

export const prepStates: PrepState[] = catalog.map(state => isFreeState(state.code) ? {
  ...state,
  examGroup: freeStateGroups[state.code],
  status: releasedFreeStates.includes(state.code) ? "available" : "comingSoon",
  homePath: releasedFreeStates.includes(state.code) ? `/${state.slug}/` : null,
  developmentProgress: releasedFreeStates.includes(state.code) ? null : state.developmentProgress,
} : state);

export function stateLabel(state: { name: string; code: string }) {
  return `${state.name} (${state.code})`;
}

export function statesByName(catalog: PrepState[] = prepStates) {
  return [...catalog].sort((a, b) => a.name.localeCompare(b.name));
}

export function availableStates(catalog: PrepState[] = prepStates) {
  return statesByName(catalog).filter((state) => state.status === "available" && Boolean(state.homePath));
}

export function stateByCode(code: string, catalog: PrepState[] = prepStates) {
  return catalog.find((state) => state.code === code) ?? null;
}

export function stateBySlug(slug: string, catalog: PrepState[] = prepStates) {
  return catalog.find((state) => state.slug === slug) ?? null;
}

export function comingSoonPath(state: PrepState) {
  return `/${state.slug}/`;
}

export function isComingSoonPath(pathname: string, catalog: PrepState[] = prepStates) {
  const slug = pathname.replace(/^\/|\/$/g, "");
  if (!slug || slug.includes("/")) return false;
  const state = stateBySlug(slug, catalog);
  return state?.status === "comingSoon";
}

export type StateRecommendation = {
  primary: PrepState[];
  others: PrepState[];
  similar: boolean;
};

/** Same exam group first, at most two, ordered by name. Otherwise one random available state. */
export function recommendStates(detected: PrepState, catalog: PrepState[] = prepStates, random: () => number = Math.random): StateRecommendation {
  const available = availableStates(catalog);
  const same = available.filter((state) => state.examGroup === detected.examGroup);
  let primary: PrepState[] = [];
  let similar = false;
  if (same.length) {
    primary = same.slice(0, 2);
    similar = true;
  } else if (available.length) {
    const index = Math.min(available.length - 1, Math.max(0, Math.floor(random() * available.length)));
    const picked = available[index];
    if (picked) primary = [picked];
  }
  const chosen = new Set(primary.map((state) => state.code));
  return { primary, others: available.filter((state) => !chosen.has(state.code)), similar };
}
