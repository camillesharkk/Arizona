import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function withExtension(file) {
  if (existsSync(file)) return file;
  if (existsSync(`${file}.ts`)) return `${file}.ts`;
  if (existsSync(`${file}.tsx`)) return `${file}.tsx`;
  if (existsSync(join(file, "index.ts"))) return join(file, "index.ts");
  return file;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const file = withExtension(join(root, specifier.slice(2)));
    return nextResolve(pathToFileURL(file).href, context);
  }
  if (specifier.startsWith(".") && context.parentURL) {
    const parent = fileURLToPath(context.parentURL);
    const file = withExtension(join(dirname(parent), specifier));
    if (file !== join(dirname(parent), specifier)) return nextResolve(pathToFileURL(file).href, context);
  }
  return nextResolve(specifier, context);
}
