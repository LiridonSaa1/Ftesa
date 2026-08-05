// Post-codegen patch: removes the auto-generated `export * from './generated/types'`
// line from lib/api-zod/src/index.ts to prevent TS2308 name collisions between
// Zod schema exports and TypeScript interface exports.
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(__dirname, "..", "lib", "api-zod", "src", "index.ts");
const content = readFileSync(indexPath, "utf8");
const patched = content.replace(/export \* from ['"]\.\/generated\/types['"];\n?/g, "");
writeFileSync(indexPath, patched);
console.log("Patched lib/api-zod/src/index.ts - removed types barrel export");
