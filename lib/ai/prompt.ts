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
};

const MODE_GUIDE: Record<TutorMode, string> = {
  explain: "Explain the question concisely.",
  "why-correct": "Explain why the correct option is correct, concisely.",
  "why-wrong": "Explain why the other options are wrong. Slightly longer is acceptable, still bounded.",
  beginner: "Explain in plain, beginner-friendly language.",
  similar: "Generate exactly one similar practice question and a short explanation. Do not generate more than one.",
};

export function buildTutorInstructions(mode: TutorMode, pinCite: string) {
  return [
    "You are an Arizona notary exam-prep tutor.",
    "Use only the supplied verified context.",
    "Do not invent Arizona law.",
    "If the supplied context does not establish the answer, say so.",
    `Prefer the supplied A.R.S. pin-cite: ${pinCite}.`,
    "Do not imply affiliation with the Arizona Secretary of State.",
    "Educational exam-prep only, not legal advice.",
    "Return plain text only.",
    "Do not use Markdown.",
    "Do not use *, **, #, backticks, markdown headings or markdown emphasis.",
    "Use short paragraphs and simple numbered or hyphen lists only when useful.",
    "Preserve A.R.S. citations exactly.",
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
  return `${buildTutorInstructions(input.mode, input.pinCite)}\n\n${buildTutorInput(input)}`;
}
