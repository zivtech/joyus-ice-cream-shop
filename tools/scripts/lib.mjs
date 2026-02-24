import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export function readJson(absPath) {
  return JSON.parse(fs.readFileSync(absPath, "utf8"));
}

export function readText(absPath) {
  return fs.readFileSync(absPath, "utf8");
}

export function listManifestFiles(baseDir, filename) {
  if (!fs.existsSync(baseDir)) return [];
  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(baseDir, entry.name, filename))
    .filter((filePath) => fs.existsSync(filePath))
    .sort();
}

export function listFilesRecursive(baseDir, includeExtensions) {
  const output = [];

  function walk(dirPath) {
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      const absPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        walk(absPath);
        continue;
      }
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (includeExtensions.has(ext)) output.push(absPath);
    }
  }

  if (fs.existsSync(baseDir)) walk(baseDir);
  return output.sort();
}

export function rel(absPath) {
  return path.relative(REPO_ROOT, absPath);
}
