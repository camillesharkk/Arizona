import { ctPaths } from "./ct-site";
import { nyPaths } from "./ny-site.ts";
import { paPaths } from "./pa-site.ts";
import { laPaths } from "./la-site.ts";
import { stateByCode } from "./states.ts";

export type PrepCode = "NY" | "PA" | "LA" | "CT";

export type PrepPaths = {
  home: string;
  practice: string;
  questions: string;
  study: string;
  studyCards: string;
  mistakes: string;
  daily: string;
  resources: string;
  examGuide: string;
  passingScore: string;
  laws: string;
  become: string;
  pricing: string;
  login: string;
};

/** Navigation stays small enough for login, guides and the shared header. */
export const prepNavigation = {
  CT: { code: "CT", name: "Connecticut", slug: "connecticut", available: stateByCode("CT")?.status === "available", paths: ctPaths },
  PA: { code: "PA", name: "Pennsylvania", slug: "pennsylvania", available: stateByCode("PA")?.status === "available", paths: paPaths },
  NY: { code: "NY", name: "New York", slug: "new-york", available: stateByCode("NY")?.status === "available", paths: nyPaths },
  LA: { code: "LA", name: "Louisiana", slug: "louisiana", available: stateByCode("LA")?.status === "available", paths: laPaths },
} satisfies Record<PrepCode, { code: PrepCode; name: string; slug: string; available: boolean; paths: PrepPaths }>;

export function packNavigationFor(state: string | null | undefined) {
  return state === "NY" || state === "PA" || state === "LA" || state === "CT" ? prepNavigation[state] : null;
}
