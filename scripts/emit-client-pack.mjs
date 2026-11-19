import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./alias-hook.mjs", import.meta.url);
await import("./emit-client-pack-run.mjs");
