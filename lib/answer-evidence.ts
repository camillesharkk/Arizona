import { parseWebUrl } from "@/lib/web-url";
import { findSource } from "@/data/sources";
import type { Question } from "@/lib/types";

export type AnswerEvidenceFields = Pick<
  Question,
  "source_id" | "source_reference" | "last_verified_at"
>;

const californiaCodes: Record<string, string> = {
  "Gov. Code": "GOV",
  "Civ. Code": "CIV",
  "Code Civ. Proc.": "CCP",
  "Pen. Code": "PEN",
  "Prob. Code": "PROB",
  "Bus. & Prof. Code": "BPC",
  "Elec. Code": "ELEC",
};

const californiaHandbookSections: Record<string, number> = {
  "acknowledgment note": 12,
  "online notarization act": 3,
  "electronic notarizations": 23,
  "foreign language": 23,
  "immigration documents": 20,
};

// Page numbers checked in the January 2026 state handbook.
const californiaStatutePages: Record<string, number> = {
  "GOV:8204": 31,
  "GOV:8201": 28,
  "GOV:8212": 36,
  "GOV:8213.5": 37,
  "GOV:8213": 36,
  "GOV:8202": 29,
  "GOV:8211": 35,
  "GOV:66436": 45,
  "CIV:1185": 46,
  "GOV:8231": 43,
  "GOV:8206": 32,
  "GOV:8219.5": 40,
  "GOV:8207": 34,
  "GOV:8228.1": 42,
  "GOV:8201.1": 28,
  "GOV:8201.5": 29,
  "CIV:1189": 48,
  "GOV:8224.1": 41,
  "PROB:4307": 52,
  "CIV:1195": 49,
  "GOV:8224": 41,
  "GOV:8223": 41,
  "GOV:6107": 43,
  "GOV:8203.1": 30,
  "ELEC:8080": 52,
  "GOV:6100": 43,
  "GOV:6106": 43,
  "GOV:8221": 40,
  "GOV:8214.1": 37,
  "GOV:8220": 40,
};

const authoredUrlPattern = /https:\/\/[^\s<>"\];,]+/g;
const indianaGuide = "https://inbiz.in.gov/Assets/NotaryGuide.pdf";
const indianaFaq = "https://www.in.gov/sos/business/files/New-Notary-System-FAQs-5-4-26.pdf";
const indianaFaqCopy = "https://www.in.gov/dA/93ab6b5f72/New-Notary-System-FAQs-5-4-26.pdf?language_id=1";

// The State Bar packet reproduces the March 2024 DFI Remote Guide starting on PDF page 20.
const wisconsinRemoteGuidePages: Record<string, number> = {
  "1.2": 3, "1.4": 3,
  "2A.1": 3, "2A.2": 4, "2A.3": 5, "2A.4": 5, "2A.5": 6,
  "2A.6": 6, "2A.7": 6, "2A.8": 6, "2A.9": 6,
  "2B.1": 7, "2B.2": 7, "2B.3": 7, "2B.4": 7, "2B.5": 8, "2B.6": 8,
  "2C.1": 8, "2C.2": 8, "2C.4": 9, "2C.5": 9, "2C.6": 10,
  "3.1": 10, "3.2": 11, "3.3": 13,
};

function officialUrl(value?: string): string | undefined {
  if (!value) return undefined;
  const url = parseWebUrl(value);
  if (!url || url.protocol !== "https:" || url.username || url.password) return undefined;
  if (url.hostname === "www.capitol.hawaii.gov" &&
      url.pathname.startsWith("/hrscurrent/Vol10_Ch0436-0474/HRS0456/")) {
    url.hostname = "data.capitol.hawaii.gov";
  }
  return url.href;
}

function cleanAuthoredUrl(value: string) {
  let url = value.replace(/[.!]+$/, "");
  while (url.endsWith(")") && url.split(")").length > url.split("(").length) {
    url = url.slice(0, -1);
  }
  return url;
}

function californiaCitation(reference: string) {
  const cite = reference.match(
    /(Gov\. Code|Civ\. Code|Code Civ\. Proc\.|Pen\. Code|Prob\. Code|Bus\. & Prof\. Code|Elec\. Code)\s*§{1,2}\s*(\d+(?:\.\d+)?)/,
  );
  if (!cite) return undefined;
  const code = californiaCodes[cite[1]];
  return {
    url: `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=${code}&sectionNum=${cite[2]}.`,
    page: californiaStatutePages[`${code}:${cite[2]}`],
  };
}

function handbookSection(reference: string) {
  const lower = reference.toLowerCase();
  return Object.entries(californiaHandbookSections).find(([label]) =>
    lower.includes(label),
  )?.[1];
}

export function resolveAnswerEvidence(question: AnswerEvidenceFields) {
  const source = findSource(question.source_id);
  const reference = question.source_reference?.trim() || "";
  const links = [...new Set((reference.match(authoredUrlPattern) || [])
    .map((value) => officialUrl(cleanAuthoredUrl(value)))
    .filter((value): value is string => Boolean(value)))];
  const fallback = officialUrl(source?.document_url) || officialUrl(source?.url);
  const citation = reference.replace(authoredUrlPattern, "")
    .replace(/\s+([;,])/g, "$1")
    .replace(/([;,])\s*[;,]+/g, "$1")
    .replace(/[;,]\s*$/, "")
    .trim();
  const publisher = links[0] ? new URL(links[0]).hostname.replace(/^www\./, "") : "";
  let link = links[0];
  let resolution = link ? "authored URL" : "registry source";
  if (link === indianaFaq) {
    // This PDF's table of contents uses the same numbering as its PDF pages.
    const page = reference.match(/\bp\.\s*([3-9])\b/i)?.[1];
    const fragment = page ? `#page=${page}` : "";
    link += fragment;
    links[0] = link;
    links.push(indianaFaqCopy + fragment);
    if (page) resolution = "handbook section";
  }
  if (!link && question.source_id === "ca-official") {
    const statute = californiaCitation(reference);
    const page = handbookSection(reference);
    if (statute) {
      link = statute.url;
      resolution = "statute section";
      if (fallback) links.push(statute.page ? `${fallback}#page=${statute.page}` : fallback);
    } else if (page && fallback) {
      link = `${fallback}#page=${page}`;
      resolution = "handbook section";
    }
  }
  if (!link && fallback && question.source_id === "wi-remote-guide") {
    const sections = reference.match(/\b(?:1\.[24]|2[ABC]\.\d|3\.[1-3])\b/g) || [];
    const pages = [...new Set(sections.map((section) => wisconsinRemoteGuidePages[section]).filter(Boolean))];
    if (pages.length) {
      const destinations = pages.map((page) => `${fallback.split("#")[0]}#page=${page + 19}`);
      [link] = destinations;
      links.push(...destinations.slice(1));
      resolution = "handbook section";
    }
  }
  const href = link || fallback;
  if (href === indianaGuide || links.includes(indianaGuide)) {
    links.push("https://inbiz.in.gov/certification/notary");
  }
  if (href?.startsWith("https://cpshr.us/")) {
    links.push("https://www.sos.ca.gov/notary/checklist/take-exam");
  }
  if (href === "https://dos.ny.gov/july-december-2026-notary-written-exam-info-and-schedule" ||
      href?.startsWith("https://dos.ny.gov/system/files/documents/2026/06/")) {
    links.push("https://dos.ny.gov/notary-public");
  }
  return {
    href,
    label: citation || publisher || source?.title || reference || "Reference unavailable",
    additional: links.filter((url) => url !== link),
    resolution,
  };
}
