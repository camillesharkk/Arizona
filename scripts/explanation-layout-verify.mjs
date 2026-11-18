import assert from "node:assert/strict";
import { testLoader } from "./pack-test-utils.mjs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const load = testLoader();
const { explanationParts } = load("lib/explanation.ts");
assert.equal(
  typeof explanationParts,
  "function",
  "Structured explanations need a reusable content projection",
);
const parts = explanationParts(
  "A.R.S. § 41-269(E) sets a four-year term. Renewal requires another application. This item tests the term only.",
);
assert.equal(parts.rule, "A.R.S. § 41-269(E) sets a four-year term.");
assert.deepEqual(
  [...parts.reasoning],
  ["Renewal requires another application."],
);
const exception = explanationParts(
  "The signer must appear in person. A phone call does not count. Mail does not count. A later exception stays in the detail.",
);
assert.equal(
  exception.reasoning.length,
  3,
  "Every authored explanation detail remains available",
);
assert.ok(exception.reasoning.at(-1).includes("later exception"));
assert.deepEqual(JSON.parse(JSON.stringify(explanationParts(""))), {
  rule: "",
  reasoning: [],
});
console.log(
  "Explanation content projection preserves the rule, supporting reasoning and later exceptions.",
);

const componentLoader = testLoader({
  "@/components/TutorPanel": { TutorPanel: () => null },
});
const q = componentLoader("data/questions.ts")
  .publishedQuestions()
  .find((item) => item.question_id === "az-001");
const { AnswerResult } = componentLoader("components/AnswerResult.tsx");
const result = renderToStaticMarkup(
  React.createElement(AnswerResult, {
    q,
    selected: "A",
    open: false,
    onToggle() {},
  }),
);
assert.match(
  result,
  /<dt>The rule<\/dt>/,
  "The rule must be visible immediately after answering",
);
assert.match(
  result,
  /<dt>Why it applies<\/dt>/,
  "Supporting reasons need their own visible section",
);
assert.match(result, /Four years/);
assert.match(
  result,
  /Last verified <time dateTime="2026-09-01">2026-09-01<\/time>/,
  "Recorded verification dates remain intact",
);
const expanded = renderToStaticMarkup(
  React.createElement(AnswerResult, {
    q,
    selected: "A",
    open: true,
    onToggle() {},
  }),
);
assert.match(expanded, /Why the other options are incorrect/);
assert.match(expanded, /Your choice/);
assert.match(expanded, /Two years is shorter/);

const compactResult = (open) => renderToStaticMarkup(React.createElement(AnswerResult, {
  q,
  selected: "A",
  compactFeedback: true,
  open,
  onToggle() {},
}));
const compactClosed = compactResult(false);
const closedDetails = compactClosed.match(/<div class="explain answer-option-comparison"[^>]* hidden=""[^>]*>([\s\S]*?)<div class="answer-source">/);
assert.ok(closedDetails, "Quick feedback starts with the detail region hidden");
const compactSummary = compactClosed.slice(0, closedDetails.index);
assert.match(compactSummary, /Correct answer.*Four years/);
assert.match(compactSummary, /class="answer-brief-rule"/);
assert.match(compactSummary, /aria-expanded="false".*aria-describedby=/);
assert.match(compactSummary, /View detailed explanation/);
assert.match(compactSummary, /See the reasoning and why the other choices are incorrect/);
assert.doesNotMatch(compactSummary, /Why it applies|Two years is shorter/);
assert.match(closedDetails[1], /Why it applies/);
assert.match(closedDetails[1], /Two years is shorter/);
const compactOpen = compactResult(true);
assert.match(compactOpen, /aria-expanded="true"/);
assert.match(compactOpen, /Hide detailed explanation/);
assert.doesNotMatch(compactOpen, /answer-option-comparison"[^>]* hidden=""/);
assert.match(compactOpen, /Official source/);
assert.match(compactOpen, /Last verified <time dateTime="2026-09-01">2026-09-01<\/time>/);

const { AnswerExplain } = componentLoader("components/AnswerExplain.tsx");
const staticAnswer = renderToStaticMarkup(
  React.createElement(AnswerExplain, {
    question: q,
    explanation: q.explanation,
    expanded: true,
  }),
);
assert.match(
  staticAnswer,
  /<details[^>]*open/,
  "The existing expanded prop must actually open the explanation",
);
assert.match(staticAnswer, /<dt>The rule<\/dt>/);

const { resolveAnswerEvidence } = componentLoader("lib/answer-evidence.ts");
const ca = resolveAnswerEvidence({
  source_id: "ca-official",
  source_reference: "Gov. Code § 8201(a)(3), (b)",
  last_verified_at: "2026-11-05",
});
assert.match(ca.href, /lawCode=GOV&sectionNum=8201\.$/);
assert.ok(ca.additional.includes("https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=28"));
const caHandbook = resolveAnswerEvidence({
  source_id: "ca-official",
  source_reference: "2026 California Notary Public Handbook, Electronic Notarizations",
  last_verified_at: "2026-11-05",
});
assert.match(caHandbook.href, /notary-handbook-current\.pdf#page=23$/);
const { AnswerSource } = componentLoader("components/AnswerSource.tsx");
const nySource = renderToStaticMarkup(React.createElement(AnswerSource, {
  question: {
    source_id: "ny-official",
    source_reference: "Executive Law §135-c (https://www.nysenate.gov/legislation/laws/EXC/135-C).",
    last_verified_at: "2026-11-09",
  },
}));
assert.match(nySource, /href="https:\/\/www\.nysenate\.gov\/legislation\/laws\/EXC\/135-C"/);
assert.match(nySource, /<time dateTime="2026-11-09">2026-11-09<\/time>/);
assert.doesNotMatch(nySource, /href="https:\/\/dos\.ny\.gov/);
const unresolved = renderToStaticMarkup(React.createElement(AnswerSource, {
  question: { source_id: "unknown", source_reference: "", last_verified_at: "" },
}));
assert.match(unresolved, /Official source.*Reference unavailable · Link unavailable/);
assert.match(unresolved, /Last verified Date unavailable/);
console.log(
  "Answer rendering keeps the rule visible, separates reasoning and option feedback, honors expanded, and preserves official evidence.",
);
