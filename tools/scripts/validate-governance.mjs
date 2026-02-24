import path from "node:path";
import { spawnSync } from "node:child_process";
import { REPO_ROOT } from "./lib.mjs";

const scripts = [
  "validate-manifests.mjs",
  "check-routes.mjs",
  "check-adr-refs.mjs",
  "token-audit.mjs",
  "report-usefulness-backlog.mjs"
];

for (const script of scripts) {
  const absPath = path.join(REPO_ROOT, "tools", "scripts", script);
  const result = spawnSync(process.execPath, [absPath], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log("All governance checks passed.");
