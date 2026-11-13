import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

test("release archive includes complete third-party license texts for the bundled renderer", () => {
  execFileSync(process.execPath, ["scripts/build.mjs"], {stdio:"pipe"});
  assert.equal(existsSync("THIRD_PARTY_LICENSES.txt"), true, "the prebuilt bundle must ship full redistribution license material");
  const text=readFileSync("THIRD_PARTY_LICENSES.txt","utf8");
  // Independently inspected package inventory for the pinned browser bundle.
  const packages=["@a2ui/lit","@a2ui/web_core","@lit/context","@lit/reactive-element","@preact/signals-core","lit","lit-element","lit-html","redos-detector","signal-polyfill","signal-utils","validate-color","zod","zod-to-json-schema"];
  for (const name of packages) {
    const metadata=JSON.parse(readFileSync(`node_modules/${name}/package.json`,"utf8"));
    assert.ok(text.includes(`${name}@${metadata.version}`), `missing attribution for ${name}`);
    assert.ok(text.includes(readFileSync(`node_modules/${name}/LICENSE`,"utf8").trim()), `incomplete license text for ${name}`);
  }
  const packed=JSON.parse(execFileSync("npm",["pack","--dry-run","--ignore-scripts","--json"],{encoding:"utf8"}));
  assert.ok(packed[0].files.some((file:{path:string})=>file.path==="THIRD_PARTY_LICENSES.txt"),"npm distribution must include the legal material");
});
