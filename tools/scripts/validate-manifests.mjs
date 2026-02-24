import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { REPO_ROOT, listManifestFiles, readJson, rel } from "./lib.mjs";

const widgetManifestDir = path.join(REPO_ROOT, "packages", "ui-manifests", "widgets");
const pageManifestDir = path.join(REPO_ROOT, "packages", "ui-manifests", "pages");
const widgetSchemaPath = path.join(REPO_ROOT, "packages", "ui-schemas", "src", "widget-manifest.schema.json");
const pageSchemaPath = path.join(REPO_ROOT, "packages", "ui-schemas", "src", "page-manifest.schema.json");

const widgetSchema = readJson(widgetSchemaPath);
const pageSchema = readJson(pageSchemaPath);

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateWidget = ajv.compile(widgetSchema);
const validatePage = ajv.compile(pageSchema);

const widgetFiles = listManifestFiles(widgetManifestDir, "widget.manifest.json");
const pageFiles = listManifestFiles(pageManifestDir, "page.manifest.json");

const errors = [];
const widgetIds = new Set();
const pageIds = new Set();
const todayIso = new Date().toISOString().slice(0, 10);

function isPlaceholderReviewer(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return (
    normalized.length === 0 ||
    ["unassigned", "tbd", "unknown", "none", "n/a", "na", "-"].includes(normalized)
  );
}

function enforceValidationConsistency(manifest, file, entityLabel) {
  const validation = manifest.validation || {};
  const { basis, state, reviewed_on: reviewedOn, reviewer } = validation;

  if (typeof reviewedOn === "string" && reviewedOn > todayIso) {
    errors.push(`${rel(file)}: validation.reviewed_on '${reviewedOn}' cannot be in the future`);
  }

  if (state === "unreviewed" && basis === "approved_product_decision") {
    errors.push(
      `${rel(file)}: unreviewed ${entityLabel} cannot use validation.basis = 'approved_product_decision'`
    );
  }

  if (state === "validated_useful" && basis !== "approved_product_decision") {
    errors.push(
      `${rel(file)}: ${entityLabel} with validation.state = 'validated_useful' must use validation.basis = 'approved_product_decision'`
    );
  }

  if (state !== "unreviewed" && isPlaceholderReviewer(reviewer)) {
    errors.push(
      `${rel(file)}: ${entityLabel} with validation.state = '${state}' requires assigned validation.reviewer`
    );
  }

  if (manifest.status === "active" && isPlaceholderReviewer(reviewer)) {
    errors.push(`${rel(file)}: active ${entityLabel} requires assigned validation.reviewer`);
  }

  if (manifest.status === "active" && state !== "validated_useful") {
    errors.push(`${rel(file)}: active ${entityLabel} must have validation.state = 'validated_useful'`);
  }

  if (manifest.status === "active" && basis !== "approved_product_decision") {
    errors.push(
      `${rel(file)}: active ${entityLabel} must have validation.basis = 'approved_product_decision'`
    );
  }

  if (manifest.status === "active" && ["needs_redesign", "remove_candidate"].includes(state)) {
    errors.push(`${rel(file)}: active ${entityLabel} cannot be '${state}'`);
  }
}

for (const file of widgetFiles) {
  const manifest = readJson(file);
  const dirName = path.basename(path.dirname(file));

  if (!validateWidget(manifest)) {
    for (const err of validateWidget.errors || []) {
      errors.push(`${rel(file)}: ${err.instancePath || "(root)"} ${err.message}`);
    }
  }

  if (manifest.id !== dirName) {
    errors.push(`${rel(file)}: id '${manifest.id}' must match directory name '${dirName}'`);
  }

  if (widgetIds.has(manifest.id)) {
    errors.push(`${rel(file)}: duplicate widget id '${manifest.id}'`);
  }
  widgetIds.add(manifest.id);

  enforceValidationConsistency(manifest, file, "widget");
}

for (const file of pageFiles) {
  const manifest = readJson(file);
  const dirName = path.basename(path.dirname(file));

  if (!validatePage(manifest)) {
    for (const err of validatePage.errors || []) {
      errors.push(`${rel(file)}: ${err.instancePath || "(root)"} ${err.message}`);
    }
  }

  if (manifest.id !== dirName) {
    errors.push(`${rel(file)}: id '${manifest.id}' must match directory name '${dirName}'`);
  }

  if (pageIds.has(manifest.id)) {
    errors.push(`${rel(file)}: duplicate page id '${manifest.id}'`);
  }
  pageIds.add(manifest.id);

  enforceValidationConsistency(manifest, file, "page");

  for (const widgetId of manifest.widgets || []) {
    if (!widgetIds.has(widgetId)) {
      errors.push(`${rel(file)}: unknown widget id '${widgetId}' in widgets[]`);
    }
  }
}

if (widgetFiles.length < 2) {
  errors.push(`Expected at least 2 widget manifests, found ${widgetFiles.length}`);
}

if (pageFiles.length < 5) {
  errors.push(`Expected at least 5 page manifests, found ${pageFiles.length}`);
}

if (errors.length > 0) {
  console.error("Manifest validation failed:\n");
  for (const item of errors) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Manifest validation passed (${widgetFiles.length} widgets, ${pageFiles.length} pages).`);
