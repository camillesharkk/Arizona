export function normalizeTutorText(text: string) {
  let s = String(text || "").replace(/\r\n/g, "\n");
  s = s.replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, "").trim());
  s = s.replace(/\*\*([^*\n]+)\*\*/g, "$1");
  s = s.replace(/__([^_\n]+)__/g, "$1");
  s = s.replace(/`([^`\n]+)`/g, "$1");
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/^[ \t]*\*[ \t]+/gm, "- ");
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, "$1$2");
  s = s.replace(/\*+/g, "");
  s = s.replace(/`+/g, "");
  s = s.replace(/^#{1,6}\s*/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}
