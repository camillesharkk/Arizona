import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { googlebotHostname, verifyGooglebot } from "../lib/googlebot.ts";

const root = process.cwd();
const forbidden = [
  "@/data/questions",
  "@/data/ca-questions",
  "@/data/hi-questions",
  "@/data/full-state-public-questions",
  "@/data/full-state-summary",
  "@/lib/prep-pack",
  "@/lib/quiz\"",
  "@/lib/study-cards\"",
  "@/data/flashcards",
  "@/lib/practice-draw",
];

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const path = join(dir, name);
    const info = statSync(path);
    if (info.isDirectory()) walk(path, out);
    else if (name.endsWith(".tsx") || name.endsWith(".ts")) out.push(path);
  }
  return out;
}

let failed = false;
function fail(message: string) {
  failed = true;
  console.error(message);
}

const stem = readFileSync(join(root, "lib/question-stem.ts"), "utf8");
if (!stem.includes('correct_option: ""')) fail("stem payload still carries a correct option");

if (!googlebotHostname("crawl-1.googlebot.com") || !googlebotHostname("crawl-1.geo.googlebot.com")) fail("googlebot hostname");
if (googlebotHostname("googleusercontent.com") || googlebotHostname("evil.googlebot.com.example")) fail("untrusted hostname");

const lookup = {
  async reverse(ip: string) {
    if (ip === "1.2.3.4") return ["crawl-66-249-66-1.googlebot.com"];
    if (ip === "8.8.8.8") return ["rate-limited-proxy-1.googleusercontent.com"];
    return ["forged.example"];
  },
  async resolve4(host: string) {
    return host.endsWith(".googlebot.com") ? ["1.2.3.4"] : ["8.8.8.8"];
  },
  async resolve6() {
    return [];
  },
} as unknown as Pick<typeof import("node:dns/promises"), "reverse" | "resolve4" | "resolve6">;
if (!(await verifyGooglebot("1.2.3.4", lookup))) fail("verified googlebot was rejected");
if (await verifyGooglebot("8.8.8.8", lookup)) fail("googleusercontent was accepted");
if (await verifyGooglebot("9.9.9.9", lookup)) fail("forged address was accepted");

for (const file of walk(join(root, "components"))) {
  const text = readFileSync(file, "utf8");
  if (!text.startsWith('"use client"') && !text.startsWith("'use client'")) continue;
  for (const line of text.split(/\r?\n/)) {
    if (line.includes("import type ")) continue;
    for (const token of forbidden) {
      if (line.includes(token)) fail(`${file} imports ${token}`);
    }
  }
}

if (failed) process.exit(1);
console.log("access boundary ok");
