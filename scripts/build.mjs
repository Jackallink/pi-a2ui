import { build } from "esbuild";
import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");
await mkdir(dist, { recursive: true });
await build({
  entryPoints: [join(root, "src/client.ts")],
  outfile: join(dist, "client.js"),
  bundle: true,
  platform: "browser",
  format: "esm",
  target: ["es2022"],
  minify: true,
  legalComments: "eof",
});
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
