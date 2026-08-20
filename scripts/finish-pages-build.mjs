/**
 * Post-processing for the GitHub Pages export.
 *
 * `next build` with `output: "export"` gives us /ar/ and /en/ but nothing at
 * the export root, because locale negotiation normally lives in the proxy and
 * there is no proxy on a static host. This script fills the two gaps GitHub
 * Pages needs:
 *
 *   out/index.html  — negotiates the locale in the browser and forwards
 *   out/404.html    — a branded fallback for unknown paths
 *   out/.nojekyll   — stops Pages from dropping the _next/ directory
 *
 * Run it after the export; see the `build:pages` script.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "out");
const BASE = process.env.BASE_PATH ?? "";

/* The brand book palette, inlined — these two documents ship without CSS. */
const CRIMSON = "#ed1847";
const ORONTES = "#0a0a09";
const TEMPLE = "#fffef6";

const MARK = `<svg viewBox="0 0 104 128" width="52" height="64" fill="${CRIMSON}" aria-hidden="true">
  <clipPath id="s"><path d="M0 0h104v120L0 64Z"/></clipPath>
  <path d="M52 5 L102 29 V37 H98 V53 H68 A16 16 0 0 0 36 53 H6 V37 H2 V29 Z"/>
  <g clip-path="url(#s)">
    <rect x="5.5" y="57" width="15" height="7"/><rect x="9" y="64" width="8" height="64"/>
    <rect x="25" y="57" width="15" height="7"/><rect x="28.5" y="64" width="8" height="64"/>
    <rect x="44.5" y="57" width="15" height="7"/><rect x="48" y="64" width="8" height="64"/>
    <rect x="64" y="57" width="15" height="7"/><rect x="67.5" y="64" width="8" height="64"/>
    <rect x="83.5" y="57" width="15" height="7"/><rect x="87" y="64" width="8" height="64"/>
  </g>
</svg>`;

const SHELL = (title, lang, body) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<link rel="icon" href="${BASE}/icon.svg">
<style>
  :root { color-scheme: dark }
  * { box-sizing: border-box }
  body {
    margin: 0; min-height: 100dvh; display: grid; place-items: center;
    padding: 2rem; text-align: center; background: ${ORONTES}; color: ${TEMPLE};
    font: 400 16px/1.7 ui-sans-serif, system-ui, "Segoe UI", sans-serif;
  }
  h1 { font-size: clamp(1.5rem, 5vw, 2.25rem); margin: 1.5rem 0 0.5rem; letter-spacing: -0.02em }
  p { margin: 0 0 1.75rem; color: #c4c2b7; max-width: 46ch }
  .row { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center }
  a {
    display: inline-block; padding: 0.75rem 1.5rem; border-radius: 999px;
    text-decoration: none; font-weight: 500; background: #c2113a; color: ${TEMPLE};
  }
  a.alt { background: transparent; color: ${TEMPLE}; border: 1px solid #ffffff28 }
  a:hover { background: ${CRIMSON} }
  a.alt:hover { background: #ffffff12 }
</style>
</head>
<body>
<main>
${MARK}
${body}
</main>
</body>
</html>
`;

/* ---------------------------------------------------------------- index --- */
/* Mirrors the proxy's Accept-Language logic with what the browser exposes. */
const index = SHELL(
  "AFAMIA TEK",
  "ar",
  `<h1>AFAMIA TEK</h1>
<p>دمشق · Damascus</p>
<div class="row">
  <a href="${BASE}/ar/">العربية</a>
  <a class="alt" href="${BASE}/en/">English</a>
</div>
<script>
  (function () {
    var langs = navigator.languages || [navigator.language || "ar"];
    var pick = "ar";
    for (var i = 0; i < langs.length; i++) {
      var tag = String(langs[i]).toLowerCase().split("-")[0];
      if (tag === "ar" || tag === "en") { pick = tag; break; }
    }
    location.replace(${JSON.stringify(BASE)} + "/" + pick + "/");
  })();
</script>`,
);

/* ------------------------------------------------------------------ 404 --- */
const notFound = SHELL(
  "404 · AFAMIA TEK",
  "en",
  `<h1>404</h1>
<p>هذه الصفحة غير موجودة. &nbsp;·&nbsp; This page does not exist.</p>
<div class="row">
  <a href="${BASE}/ar/">الصفحة الرئيسية</a>
  <a class="alt" href="${BASE}/en/">Home</a>
</div>`,
);

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "index.html"), index);
writeFileSync(join(OUT, ".nojekyll"), "");

/* Prefer the app's own localised 404 — it carries the real design. Fall back to
   the inline document above only if the export did not produce one. */
const prerendered404 = join(OUT, "ar", "404", "index.html");
let source = "inline fallback";
if (existsSync(prerendered404)) {
  copyFileSync(prerendered404, join(OUT, "404.html"));
  source = "prerendered /ar/404/";
} else {
  writeFileSync(join(OUT, "404.html"), notFound);
}

console.log(
  `Pages export finished (basePath "${BASE || "/"}"): index.html written, ` +
    `404.html from ${source}, .nojekyll added.`,
);
