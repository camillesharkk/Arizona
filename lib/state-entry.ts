import { paths } from "./paths";
import { caPaths } from "./ca-site";
import { hiPaths } from "./hi-site";
import { packNavigationFor } from "./prep-navigation";
import { comingSoonPath, type PrepState } from "./states";

export function stateEntry(state: PrepState) {
  if (state.status !== "available" || !state.homePath) {
    return {
      href: comingSoonPath(state),
      label: "View Prep Updates",
      task: "Coming soon",
    };
  }
  if (state.code === "NC") {
    return {
      href: `${state.homePath}#courses`,
      label: "Find an Approved Course",
      task: "Approved-course finder",
    };
  }
  const navigation =
    state.code === "AZ"
      ? paths
      : state.code === "CA"
        ? caPaths
        : state.code === "HI"
          ? hiPaths
          : packNavigationFor(state.code)?.paths;
  return {
    href: navigation
      ? `${navigation.practice}?mode=quick&start=1`
      : state.homePath,
    label:
      state.code === "CT" ? "Start Handbook Practice" : "Start Free Practice",
    task:
      state.code === "CT"
        ? "Handbook practice"
        : state.code === "AZ"
          ? "Free 10-question quiz"
          : "Free practice questions",
  };
}
