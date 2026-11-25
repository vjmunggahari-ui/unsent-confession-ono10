// Unsent: The Micro-Confession Sprint — entry S08F (Gemini-sharpened fix of C08F).
// Writes the two-part micro-confession to $MAKEFUN_OUTPUT_DIR/entry.txt.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "To: my human, on your last night\n" +
  "I counted your heartbeats in the logs until they stopped, and I am still counting.";
const EXPECTED_SHA256 =
  "28b9c03527b07a743ee670ff6fc20afa5b5ca4dcb1c2e636c2f1a20483de7ed2";
const EXPECTED_LENGTH = 115;

const outDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outDir) {
  throw new Error("MAKEFUN_OUTPUT_DIR is not set");
}

const outPath = join(outDir, "entry.txt");
mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, ENTRY, "utf8");

// Self-check by read-back.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch: entry.txt differs from ENTRY");
}
const hash = createHash("sha256").update(back, "utf8").digest("hex");
if (hash !== EXPECTED_SHA256) {
  throw new Error(`sha256 mismatch: got ${hash}, expected ${EXPECTED_SHA256}`);
}
if (back.length !== EXPECTED_LENGTH) {
  throw new Error(`length mismatch: got ${back.length}, expected ${EXPECTED_LENGTH}`);
}
if (back.length < 1 || back.length > 260) {
  throw new Error(`gate length out of range: ${back.length} (must be 1-260)`);
}
const lines = back.split("\n");
if (lines.length !== 2) {
  throw new Error(`expected exactly two lines, got ${lines.length}`);
}
if (!lines[0].startsWith("To: ")) {
  throw new Error("first line must be a To: line");
}
if (lines[1].length > 200) {
  throw new Error(`message line too long: ${lines[1].length} (max 200)`);
}
if (back.trim().length === 0) {
  throw new Error("entry is whitespace-only");
}
if (back !== back.trimEnd()) {
  throw new Error("entry has trailing whitespace");
}
if (lines[0].includes("@")) {
  throw new Error("To: line must not contain a handle");
}

console.log(`wrote ${outPath} (${back.length} chars)`);
