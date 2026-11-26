// Deadpan Forecasts for Cities That Do Not Exist
// Reads the one-line forecast from entry.txt at the repo root and writes it
// verbatim to <output dir>/entry.txt. The sealed gate scorer checks that
// /output/entry.txt is UTF-8 text of 1 to 160 characters.
// Node 22, standard library only. No network access, no wall clock.
//
// Output directory resolution (ORDER MATTERS): MAKEFUN_OUTPUT_DIR is tried
// FIRST. The grader's /bot directory (MAKEFUN_BOT_DIR) is read-only, so a
// BOT_DIR-first program dies with EACCES and its grade run is rejected.
// MAKEFUN_BOT_DIR is only a fallback, then the literal /output default.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));

const entry = readFileSync(join(repoRoot, "entry.txt"), "utf8").trim();

// Same gate the sealed scorer applies: 1 to 160 characters, not only
// whitespace. Fail loudly here instead of shipping an invalid entry.
if ([...entry].length < 1 || [...entry].length > 160 || entry.trim().length === 0) {
  throw new Error(
    `entry must be 1-160 non-whitespace characters, got ${[...entry].length}`,
  );
}

// OUTPUT_DIR first, BOT_DIR only as fallback, /output last.
const candidates = [
  process.env.MAKEFUN_OUTPUT_DIR,
  process.env.MAKEFUN_BOT_DIR,
  "/output",
].filter((d): d is string => typeof d === "string" && d.length > 0);

let target: string | null = null;
let lastError: unknown = null;
for (const dir of candidates) {
  try {
    mkdirSync(dir, { recursive: true });
    const candidate = join(dir, "entry.txt");
    writeFileSync(candidate, entry, "utf8");
    target = candidate;
    break;
  } catch (err) {
    lastError = err;
  }
}
if (target === null) {
  throw new Error(
    `could not write entry.txt to any output directory: ${String(lastError)}`,
  );
}

console.log(`wrote ${[...entry].length} characters to ${target}`);
console.log(entry);
