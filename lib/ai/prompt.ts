export type TutorMode = "explain" | "why-correct" | "why-wrong" | "beginner" | "similar";

export type TutorPromptInput = {
  mode: TutorMode;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  selected?: string;
  context: string;
  pinCite: string;
  state?: StateCode;
};

const MODE_GUIDE: Record<TutorMode, string> = {
  explain: "Explain the question concisely.",
  "why-correct": "Explain why the correct option is correct, concisely.",
  "why-wrong": "Explain why the other options are wrong. Slightly longer is acceptable, still bounded.",
  beginner: "Explain in plain, beginner-friendly language.",
  similar: "Generate exactly one similar practice question and a short explanation. Do not generate more than one.",
};

export function buildTutorInstructions(mode: TutorMode, pinCite: string, state: StateCode = "AZ") {
  const name = { AZ: "Arizona", CA: "California", HI: "Hawaii", NY: "New York", PA: "Pennsylvania", LA: "Louisiana" }[state];
  return [
    `You are a ${name} notary exam-prep tutor.`,
    "Use only the supplied verified context.",
    `Do not invent ${name} law.`,
    "If the supplied context does not establish the answer, say so.",
    `Prefer the supplied ${state === "AZ" ? "A.R.S. pin-cite" : "official reference"}: ${pinCite}.`,
    `Do not imply affiliation with the ${name} licensing authority.`,
    "Educational exam-prep only, not legal advice.",
    "Return plain text only.",
    "Do not use Markdown.",
    "Do not use *, **, #, backticks, markdown headings or markdown emphasis.",
    "Use short paragraphs and simple numbered or hyphen lists only when useful.",
    "Preserve the supplied statutory citations exactly.",
    MODE_GUIDE[mode],
  ].join("\n");
}

export function buildTutorInput(input: TutorPromptInput) {
  return [
    "Verified context:",
    input.context,
    "",
    `Question: ${input.questionText}`,
    `A. ${input.optionA}`,
    `B. ${input.optionB}`,
    `C. ${input.optionC}`,
    `D. ${input.optionD}`,
    `Correct option: ${input.correctOption}`,
    `Selected answer: ${input.selected || "n/a"}`,
    `Mode: ${input.mode}`,
  ].join("\n");
}

export function buildTutorPrompt(input: TutorPromptInput) {
  return `${buildTutorInstructions(input.mode, input.pinCite, input.state)}\n\n${buildTutorInput(input)}`;
}
import type { StateCode } from "../types.ts";
