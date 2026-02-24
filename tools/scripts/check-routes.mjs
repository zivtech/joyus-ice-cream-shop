import path from "node:path";
import yaml from "js-yaml";
import { REPO_ROOT, listManifestFiles, readJson, readText, rel } from "./lib.mjs";

const pageManifestDir = path.join(REPO_ROOT, "packages", "ui-manifests", "pages");
const sitemapPath = path.join(REPO_ROOT, "packages", "ui-sitemap", "sitemap.yaml");
const routeMapPath = path.join(REPO_ROOT, "packages", "ui-sitemap", "route-map.json");

const pageFiles = listManifestFiles(pageManifestDir, "page.manifest.json");
const sitemap = yaml.load(readText(sitemapPath));
const routeMap = readJson(routeMapPath);

const nodes = Array.isArray(sitemap?.nodes) ? sitemap.nodes : [];
const nodeById = new Map(nodes.map((node) => [node.node_id, node]));
const routeMapRows = Array.isArray(routeMap?.routes) ? routeMap.routes : [];
const routeByPageId = new Map(routeMapRows.map((row) => [row.page_id, row.route]));

const errors = [];
const requiredPages = new Set([
  "dashboard",
  "shift_planner",
  "shift_analysis",
  "seasonal_playbook",
  "settings"
]);

const seenPageIds = new Set();

for (const file of pageFiles) {
  const page = readJson(file);
  seenPageIds.add(page.id);

  if (!nodeById.has(page.sitemap_node_id)) {
    errors.push(`${rel(file)}: sitemap node '${page.sitemap_node_id}' not found in sitemap.yaml`);
    continue;
  }

  const sitemapNode = nodeById.get(page.sitemap_node_id);
  if (String(sitemapNode.route || "") !== String(page.route || "")) {
    errors.push(
      `${rel(file)}: route '${page.route}' does not match sitemap route '${sitemapNode.route}' for node '${page.sitemap_node_id}'`
    );
  }

  const routeMapRoute = routeByPageId.get(page.id);
  if (!routeMapRoute) {
    errors.push(`${rel(file)}: missing page '${page.id}' in route-map.json`);
  } else if (String(routeMapRoute) !== String(page.route || "")) {
    errors.push(`${rel(file)}: route-map route '${routeMapRoute}' mismatches manifest route '${page.route}'`);
  }
}

for (const requiredPage of requiredPages) {
  if (!seenPageIds.has(requiredPage)) {
    errors.push(`missing required page manifest for '${requiredPage}'`);
  }
}

if (errors.length > 0) {
  console.error("Route integrity checks failed:\n");
  for (const item of errors) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Route integrity checks passed (${pageFiles.length} pages).`);
