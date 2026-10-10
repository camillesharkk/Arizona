import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mockUrl = pathToFileURL(path.join(root, "scripts/session-cookie-mock.mjs")).href;

function aliasFile(specifier) {
  const abs = path.join(root, specifier.slice(2));
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  if (fs.existsSync(`${abs}.ts`)) return `${abs}.ts`;
  if (fs.existsSync(path.join(abs, "index.ts"))) return path.join(abs, "index.ts");
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/headers" || specifier === "@/lib/devices" || specifier === "@/lib/store") {
    return { url: mockUrl, shortCircuit: true };
  }
  if (specifier.startsWith("@/")) {
    const file = aliasFile(specifier);
    if (!file) throw new Error(`Cannot resolve ${specifier}`);
    return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
