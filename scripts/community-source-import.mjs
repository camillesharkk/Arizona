import { readFile, rename, writeFile } from "node:fs/promises";
import { mergeExternalSources, parseExternalSources, sourceKey } from "../lib/community-source.ts";
import { testLoader } from "./pack-test-utils.mjs";

const catalog = new URL("../data/community-external-sources.json", import.meta.url);
const [command, argument] = process.argv.slice(2);
const current = parseExternalSources(JSON.parse(await readFile(catalog, "utf8")));
let next;

if (command === "import" && argument) {
  next = mergeExternalSources(current, JSON.parse(await readFile(argument, "utf8")));
} else if ((command === "hide" || command === "restore") && argument && current.some(row => row.id === argument)) {
  const status = command === "hide" ? "hidden" : "published";
  next = current.map(row => row.id === argument ? { ...row, status } : row);
} else {
  throw new Error("Usage: node scripts/community-source-import.mjs import <json> | hide <id> | restore <id>");
}

const { legacyCommunityInsights } = testLoader()("data/community-insights.ts");
const old = new Set(legacyCommunityInsights.map(row => sourceKey(row.platform, row.postUrl)));
for (const row of next) {
  if (old.has(sourceKey(row.platform, row.postUrl))) throw new Error("Already in the legacy catalog: " + row.id);
}
const output = JSON.stringify(parseExternalSources(next), null, 2) + "\n";
const previous = await readFile(catalog, "utf8");
if (output !== previous) {
  const temp = new URL(catalog.href + ".tmp");
  await writeFile(temp, output);
  await rename(temp, catalog);
}
console.log(JSON.stringify({ published: next.filter(row => row.status === "published").length, hidden: next.filter(row => row.status === "hidden").length, changed: output !== previous }));
