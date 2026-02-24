import path from "node:path";
import { REPO_ROOT, listManifestFiles, readJson, rel } from "./lib.mjs";

const widgetManifestDir = path.join(REPO_ROOT, "packages", "ui-manifests", "widgets");
const pageManifestDir = path.join(REPO_ROOT, "packages", "ui-manifests", "pages");
const interfaceManifestDir = path.join(REPO_ROOT, "packages", "ui-manifests", "interfaces");

const widgetFiles = listManifestFiles(widgetManifestDir, "widget.manifest.json");
const pageFiles = listManifestFiles(pageManifestDir, "page.manifest.json");
const interfaceFiles = listManifestFiles(interfaceManifestDir, "interface.manifest.json");

function summarize(kind, file) {
  const manifest = readJson(file);
  return {
    kind,
    id: manifest.id || "(missing-id)",
    title: manifest.title || "(missing-title)",
    status: manifest.status || "(missing-status)",
    basis: manifest.validation?.basis || "(missing-basis)",
    state: manifest.validation?.state || "(missing-state)",
    reviewer: manifest.validation?.reviewer || "(missing-reviewer)",
    file: rel(file)
  };
}

const allItems = [
  ...widgetFiles.map((file) => summarize("widget", file)),
  ...pageFiles.map((file) => summarize("page", file)),
  ...interfaceFiles.map((file) => summarize("interface", file))
];

const pending = allItems.filter((item) => item.state !== "validated_useful");

console.log(
  `Usefulness backlog report: ${pending.length} pending of ${allItems.length} total manifest item(s).`
);

if (pending.length === 0) {
  console.log("All manifest items are marked validated_useful.");
  process.exit(0);
}

for (const item of pending) {
  console.log(
    `- ${item.kind}:${item.id} | status=${item.status} | state=${item.state} | basis=${item.basis} | reviewer=${item.reviewer} | ${item.file}`
  );
}
