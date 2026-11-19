export function memberActionLabel(label: string) {
  if (/\bfree\b/i.test(label) && /\b(?:quick 10|10 questions|10-question)\b/i.test(label)) return "Start Member Quick 10";
  if (/^start free practice$/i.test(label)) return "Start Member Practice";
  return label;
}
