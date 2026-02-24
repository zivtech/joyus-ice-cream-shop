import path from "node:path";
import { REPO_ROOT, listFilesRecursive, readText, rel } from "./lib.mjs";

const componentDir = path.join(REPO_ROOT, "packages", "ui-components", "src");
const files = listFilesRecursive(componentDir, new Set([".ts", ".tsx", ".css"]));

const colorLiteralPattern = /#[0-9a-fA-F]{3,8}\b|rgba?\([^\)]*\)|hsla?\([^\)]*\)/g;
const violations = [];

for (const file of files) {
  const lines = readText(file).split(/\r?\n/);
  lines.forEach((line, index) => {
    const matches = line.match(colorLiteralPattern);
    if (!matches) return;
    if (line.includes("var(--")) return;
    for (const match of matches) {
      violations.push(`${rel(file)}:${index + 1}: unmanaged color literal '${match}'`);
    }
  });
}

if (violations.length > 0) {
  console.error("Token audit failed:\n");
  for (const item of violations) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Token audit passed (${files.length} files scanned).`);
