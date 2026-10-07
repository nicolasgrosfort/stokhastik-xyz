// Permet à Node de charger les libs du projet (alias `@/` + extensions .ts)
// depuis les scripts hors Next. Usage : node --import ./tools/eval/register.mjs …
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SRC = path.join(process.cwd(), "src");
const SUFFIXES = [".ts", ".tsx", "/index.ts"];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = path.join(SRC, specifier.slice(2));
      const found = SUFFIXES.map((suffix) => base + suffix).find(existsSync);
      if (found) return nextResolve(pathToFileURL(found).href, context);
    }
    return nextResolve(specifier, context);
  },
});
