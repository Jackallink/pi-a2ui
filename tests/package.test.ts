import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { parseChangelog } from "../node_modules/@earendil-works/pi-coding-agent/dist/utils/changelog.js";

const metadata = JSON.parse(readFileSync("package.json", "utf8"));

test("P01 all approved feature slices ship in the current0.1.4 candidate with matching lockfile identity", () => {
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  assert.equal(metadata.version, "0.1.4");
  assert.equal(lock.version, metadata.version);
  assert.equal(lock.packages[""].version, metadata.version);
});

test("P03 explicit Pi discovery uses declared runtime dependencies and wildcard host peers", () => {
  assert.deepEqual(metadata.pi.extensions, ["./extension.ts"]);
  assert.ok(metadata.keywords.includes("pi-package"));
  for (const host of ["@earendil-works/pi-coding-agent", "typebox"]) {
    assert.equal(metadata.peerDependencies[host], "*");
    assert.equal(metadata.peerDependenciesMeta[host].optional, true);
    assert.equal(metadata.dependencies[host], undefined);
  }
  for (const entry of metadata.pi.extensions) assert.ok(existsSync(entry));
});

test("P02 fresh Git distribution contains ready assets and complete legal material without a build", () => {
  const tracked = new Set(execFileSync("git", ["ls-files"], { encoding: "utf8" }).trim().split("\n"));
  for (const file of ["dist/index.html", "dist/client.js", "dist/client.css", "THIRD_PARTY_LICENSES.txt"]) {
    assert.ok(tracked.has(file), `fresh Git clone must include ${file}`);
    assert.ok(readFileSync(file).length > 0);
  }
});

test("P05 distribution includes a current0.1.4 changelog while preserving delivered0.1.1 history", () => {
  const packed = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--ignore-scripts", "--json"], { encoding: "utf8" }));
  assert.ok(packed[0].files.some((file: { path: string }) => file.path === "CHANGELOG.md"));
  const entries = parseChangelog("CHANGELOG.md");
  assert.deepEqual([entries[0]?.major, entries[0]?.minor, entries[0]?.patch], [0, 1, 4]);
  assert.ok(entries.some(entry => entry.major === 0 && entry.minor === 1 && entry.patch === 1));
  assert.ok(!entries.some(entry => entry.major === 0 && entry.minor === 1 && entry.patch === 2));
  const current = readFileSync("CHANGELOG.md", "utf8").split(/^## 0\.1\.0/m)[0];
  for (const component of ["CheckBox", "CodeDiff", "TestResults", "LogView", "Chart"]) assert.ok(current.includes(component));
});

// Explicit user support contract; historical releases may have older engine claims.
test("V06 only Node24 is supported and current installation guidance pins that major", () => {
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  assert.equal(metadata.engines.node, ">=24.0.0 <25.0.0");
  assert.equal(lock.packages[""].engines.node, metadata.engines.node);
  assert.equal(readFileSync(".nvmrc", "utf8").trim(), "24");
  for (const file of ["README.md", "docs/releases/v0.1.3.md"]) {
    const guidance = readFileSync(file, "utf8");
    assert.match(guidance, /Node 24\.x/);
    assert.match(guidance, /nvm use 24/);
    assert.doesNotMatch(guidance, /Node\s*(?:>=\s*)?22(?:\b|\.)/i);
  }
});
