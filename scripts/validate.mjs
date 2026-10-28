#!/usr/bin/env node
// Validates policies.json: JSON Schema, unique repos, sort order and URLs.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function loadJson(relativePath) {
  const path = join(root, relativePath);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new Error(`Could not parse ${relativePath}: ${err.message}. Fix the JSON syntax and rerun.`);
  }
}

export function compareEntries(a, b) {
  return (
    a.project.localeCompare(b.project, "en", { sensitivity: "base" }) ||
    a.repo.localeCompare(b.repo, "en", { sensitivity: "base" })
  );
}

function schemaErrors(policies, schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
  const validate = ajv.compile(schema);
  if (validate(policies)) return [];
  return validate.errors.map((err) => {
    const index = Number(err.instancePath.split("/")[1]);
    const label = policies[index]?.repo ?? `entry ${index}`;
    return `${label}${err.instancePath.replace(/^\/\d+/, "")}: ${err.message}`;
  });
}

function duplicateErrors(policies) {
  const seen = new Map();
  const errors = [];
  for (const { repo } of policies) {
    const key = repo.toLowerCase();
    if (seen.has(key)) errors.push(`${repo}: duplicate repo (also listed as ${seen.get(key)}). Merge the two entries.`);
    else seen.set(key, repo);
  }
  return errors;
}

function orderErrors(policies) {
  const errors = [];
  for (let i = 1; i < policies.length; i++) {
    if (compareEntries(policies[i - 1], policies[i]) > 0) {
      errors.push(
        `${policies[i].repo}: out of order. "${policies[i].project}" must come before "${policies[i - 1].project}" (sort by project name, case-insensitive).`,
      );
    }
  }
  return errors;
}

function urlErrors(policies) {
  return policies.flatMap(({ repo, source_url }) => {
    try {
      new URL(source_url);
      return [];
    } catch {
      return [`${repo}: source_url is not a valid URL.`];
    }
  });
}

export function validatePolicies(policies, schema) {
  const errors = schemaErrors(policies, schema);
  if (errors.length) return errors;
  return [...duplicateErrors(policies), ...orderErrors(policies), ...urlErrors(policies)];
}

function main() {
  const policies = loadJson("policies.json");
  const schema = loadJson("schema/policy.schema.json");
  const errors = validatePolicies(policies, schema);
  if (errors.length) {
    console.error(`policies.json has ${errors.length} problem(s):`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }
  console.log(`policies.json OK: ${policies.length} entries, schema valid, no duplicates, sorted.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
