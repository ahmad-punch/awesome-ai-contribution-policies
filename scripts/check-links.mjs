#!/usr/bin/env node
// Checks every source_url in policies.json and reports dead links.
// Usage: node scripts/check-links.mjs [--timeout=15000] [--concurrency=8]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function option(name, fallback) {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? Number(arg.split("=")[1]) : fallback;
}

async function probe(url, timeoutMs) {
  const headers = { "user-agent": "awesome-ai-contribution-policies link checker" };
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, { method, headers, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) return { ok: true, status: res.status };
      // Some servers reject HEAD or bots; retry with GET before giving up.
      if (method === "GET" || ![403, 405, 429, 501].includes(res.status)) return { ok: false, status: res.status };
    } catch (err) {
      if (method === "GET") return { ok: false, status: err.name === "TimeoutError" ? "timeout" : err.message };
    }
  }
  return { ok: false, status: "unknown" };
}

async function runPool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  const lanes = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(lanes);
  return results;
}

async function main() {
  const policies = JSON.parse(readFileSync(join(root, "policies.json"), "utf8"));
  const timeoutMs = option("timeout", 15000);
  const results = await runPool(policies, option("concurrency", 8), async (p) => ({
    repo: p.repo,
    url: p.source_url,
    ...(await probe(p.source_url, timeoutMs)),
  }));
  const dead = results.filter((r) => !r.ok);
  console.log(`Checked ${results.length} source links, ${dead.length} failed.`);
  for (const r of dead) console.log(`  - ${r.repo}: ${r.status} ${r.url}`);
  if (dead.length) {
    console.log("Update source_url (and last_verified) for each failure, or open a policy-change issue.");
    process.exit(1);
  }
}

main();
