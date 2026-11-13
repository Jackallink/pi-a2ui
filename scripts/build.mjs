import { build } from "esbuild";
import { mkdir, copyFile, writeFile, readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");
await mkdir(dist, { recursive: true });
const bundle = await build({
  entryPoints: [join(root, "src/client.ts")],
  outfile: join(dist, "client.js"),
  bundle: true,
  platform: "browser",
  format: "esm",
  target: ["es2022"],
  minify: true,
  legalComments: "eof",
  metafile: true,
});

// The prebuilt browser distribution must carry complete dependency licenses,
// including notices, rather than relying only on short minified SPDX comments.
const packages = new Map();
for (const input of Object.keys(bundle.metafile.inputs)) {
  const absolute = resolve(root, input).replaceAll("\\", "/");
  const separator = absolute.lastIndexOf("/node_modules/");
  if (separator < 0) continue;
  const suffix = absolute.slice(separator + "/node_modules/".length);
  const parts = suffix.split("/");
  const name = parts[0].startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
  const packageRoot = absolute.slice(0, separator) + "/node_modules/" + name;
  const metadata = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
  packages.set(`${metadata.name}@${metadata.version}`, {packageRoot, metadata});
}
const licenseSections = ["Third-party licenses for the pi-a2ui browser bundle\nGenerated from the actual esbuild input packages. Full upstream license/notice texts follow.\n"];
for (const [identity, {packageRoot, metadata}] of [...packages.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const files = (await readdir(packageRoot, {withFileTypes:true}))
    .filter(entry => entry.isFile() && /^(?:licen[cs]e|notice|copyright)(?:$|[.\-_])/i.test(entry.name))
    .map(entry => entry.name).sort();
  if (!files.some(file => /^licen[cs]e(?:$|[.\-_])/i.test(file))) throw new Error(`Missing full upstream license for bundled package ${identity}`);
  licenseSections.push(`\n${"=".repeat(72)}\n${identity}\nDeclared license: ${metadata.license ?? "see upstream text"}\n`);
  for (const file of files) licenseSections.push(`\n--- ${file} ---\n${(await readFile(join(packageRoot, file), "utf8")).trim()}\n`);
}
await writeFile(join(root, "THIRD_PARTY_LICENSES.txt"), licenseSections.join(""));
await copyFile(join(root, "src/client.css"), join(dist, "client.css"));
await writeFile(join(dist, "index.html"), `<!doctype html>
<html lang="en" class="a2ui-light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Pi / A2UI — Your agent, in view.</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="/client.css">
  <script type="module" src="/client.js"></script>
</head>
<body>
  <header class="site-header">
    <div class="brand"><span class="brand-mark" aria-hidden="true">π</span>Pi / A2UI</div>
    <div id="connection" data-state="waiting" role="status">Connecting</div>
  </header>
  <main>
    <p class="eyebrow">A space to work together</p>
    <h1>Your agent, in view.</h1>
    <p class="intro">A little more canvas for your conversation.</p>
    <div class="canvas-bar">
      <div class="canvas-label" id="status" role="status">Waiting for Pi</div>
      <span id="surface-count">0 surfaces</span>
    </div>
    <div id="surfaces" aria-busy="false"></div>
    <section id="empty">
      <div class="empty-symbol" aria-hidden="true">⌑</div>
      <h2>Room for your next idea.</h2>
      <p>Ask Pi to show a form, a choice, or a plan.<br>It will appear right here.</p>
    </section>
    <p id="notice" role="status" aria-live="polite" hidden></p>
    <p class="footer-note">Your responses return to this Pi conversation.</p>
  </main>
</body>
</html>
`);
