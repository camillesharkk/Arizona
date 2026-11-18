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
  /Last verified 2026-09-01/,
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
console.log(
  "Answer rendering keeps the rule visible, separates reasoning and option feedback, honors expanded, and preserves official evidence.",
);
