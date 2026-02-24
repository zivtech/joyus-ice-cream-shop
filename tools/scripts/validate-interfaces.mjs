import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { REPO_ROOT, listManifestFiles, readJson, rel } from "./lib.mjs";

const interfaceManifestDir = path.join(REPO_ROOT, "packages", "ui-manifests", "interfaces");
const interfaceSchemaPath = path.join(
  REPO_ROOT,
  "packages",
  "ui-schemas",
  "src",
  "interface-manifest.schema.json"
);

const interfaceSchema = readJson(interfaceSchemaPath);

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateInterface = ajv.compile(interfaceSchema);

const interfaceFiles = listManifestFiles(interfaceManifestDir, "interface.manifest.json");

const errors = [];
const interfaceIds = new Set();
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

for (const file of interfaceFiles) {
  const manifest = readJson(file);
  const dirName = path.basename(path.dirname(file));
  const { validation = {} } = manifest;

  if (!validateInterface(manifest)) {
    for (const err of validateInterface.errors || []) {
      errors.push(`${rel(file)}: ${err.instancePath || "(root)"} ${err.message}`);
    }
  }

  if (manifest.id !== dirName) {
    errors.push(`${rel(file)}: id '${manifest.id}' must match directory name '${dirName}'`);
  }

  if (interfaceIds.has(manifest.id)) {
    errors.push(`${rel(file)}: duplicate interface id '${manifest.id}'`);
  }
  interfaceIds.add(manifest.id);

  if (validation.reviewed_on > todayIso) {
    errors.push(`${rel(file)}: validation.reviewed_on '${validation.reviewed_on}' cannot be in the future`);
  }

  if (validation.state === "unreviewed" && validation.basis === "approved_product_decision") {
    errors.push(
      `${rel(file)}: unreviewed interface cannot use validation.basis = 'approved_product_decision'`
    );
  }

  if (validation.state === "validated_useful" && validation.basis !== "approved_product_decision") {
    errors.push(
      `${rel(file)}: validation.state = 'validated_useful' requires validation.basis = 'approved_product_decision'`
    );
  }

  if (validation.state !== "unreviewed" && isPlaceholderReviewer(validation.reviewer)) {
    errors.push(
      `${rel(file)}: interface with validation.state = '${validation.state}' requires assigned validation.reviewer`
    );
  }

  if (manifest.status === "active") {
    if (validation.state !== "validated_useful") {
      errors.push(`${rel(file)}: active interface must have validation.state = 'validated_useful'`);
    }
    if (validation.basis !== "approved_product_decision") {
      errors.push(`${rel(file)}: active interface must have validation.basis = 'approved_product_decision'`);
    }
    if (isPlaceholderReviewer(validation.reviewer)) {
      errors.push(`${rel(file)}: active interface requires assigned validation.reviewer`);
    }
    if (["needs_redesign", "remove_candidate"].includes(validation.state)) {
      errors.push(`${rel(file)}: active interface cannot be '${validation.state}'`);
    }
  }

  for (const contract of manifest.contracts || []) {
    if (contract.kind === "http_endpoint" && (!contract.method || !contract.path)) {
      errors.push(
        `${rel(file)}: contract '${contract.name}' kind=http_endpoint requires method and path`
      );
    }
    if (contract.kind === "mcp_tool" && !contract.tool) {
      errors.push(`${rel(file)}: contract '${contract.name}' kind=mcp_tool requires tool`);
    }
    if (contract.kind === "script_entrypoint" && !contract.script) {
      errors.push(`${rel(file)}: contract '${contract.name}' kind=script_entrypoint requires script`);
    }
  }
}

if (interfaceFiles.length < 4) {
  errors.push(`Expected at least 4 interface manifests, found ${interfaceFiles.length}`);
}

if (errors.length > 0) {
  console.error("Interface manifest validation failed:\n");
  for (const item of errors) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Interface manifest validation passed (${interfaceFiles.length} interfaces).`);
