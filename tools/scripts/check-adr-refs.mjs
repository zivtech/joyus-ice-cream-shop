import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./lib.mjs";

function runGit(command) {
  return execSync(command, {
    cwd: REPO_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8"
  }).trim();
}

function tryRunGit(command) {
  try {
    return runGit(command);
  } catch {
    return "";
  }
}

const diffBase = process.env.GOVERNANCE_DIFF_BASE || "HEAD~1";
let changedFilesOutput = tryRunGit(
  `git diff --name-only ${diffBase}...HEAD -- packages/ui-manifests/widgets/*/widget.manifest.json`
);

if (!changedFilesOutput) {
  changedFilesOutput = tryRunGit("git diff --name-only -- packages/ui-manifests/widgets/*/widget.manifest.json");
}

const changedFiles = changedFilesOutput
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .sort();

if (changedFiles.length === 0) {
  console.log("ADR/version check skipped (no changed widget manifests in git diff).");
  process.exit(0);
}

const errors = [];

for (const relPath of changedFiles) {
  const absPath = path.join(REPO_ROOT, relPath);
  if (!fs.existsSync(absPath)) continue;

  const nextManifest = JSON.parse(fs.readFileSync(absPath, "utf8"));
  const diffText = tryRunGit(`git diff ${diffBase}...HEAD -- ${relPath}`) || tryRunGit(`git diff -- ${relPath}`);
  const logicTouched = /"calculation_rules"|"visual_rules"/.test(diffText);

  if (!logicTouched) continue;

  if (!Array.isArray(nextManifest.adr_refs) || nextManifest.adr_refs.length === 0) {
    errors.push(`${relPath}: logic rules changed but adr_refs is empty`);
  }

  const prevRaw = tryRunGit(`git show ${diffBase}:${relPath}`);
  if (prevRaw) {
    try {
      const prevManifest = JSON.parse(prevRaw);
      if (String(prevManifest.version || "") === String(nextManifest.version || "")) {
        errors.push(`${relPath}: logic rules changed but version was not bumped`);
      }
    } catch {
      errors.push(`${relPath}: could not parse previous manifest version for comparison`);
    }
  }
}

if (errors.length > 0) {
  console.error("ADR/version checks failed:\n");
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log(`ADR/version checks passed (${changedFiles.length} changed widget manifest file(s)).`);
