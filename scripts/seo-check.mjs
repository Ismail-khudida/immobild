// SEO-/Qualitäts-Check für alle HTML-Seiten im Projekt-Root. Keine Abhängigkeiten.
// Aufruf: node scripts/seo-check.mjs   (Exit-Code 1 bei Fehlern)
//
// Prüft je Seite: lang, Title/Description-Länge, genau ein H1, Canonical,
// JSON-LD-Validität, FAQ-Sync (sichtbar <-> FAQPage-Schema, zeichengleich),
// Breadcrumb-Ziele, Bilder (alt/width/height), interne Links inkl. #Anker,
// target="_blank" ohne rel="noopener" sowie Sitemap-Konsistenz.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://immobild.ai/";
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function decode(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}
// Block-Elemente trennen Wörter, Inline-Elemente (a, strong …) nicht – wie im Browser.
const text = (html) =>
  decode(
    html
      .replace(/<\/?(p|div|li|ul|ol|br|h[1-6]|section|article|table|tr|td|th)\b[^>]*>/gi, " ")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\s+/g, " ")
    .trim();

const pageUrl = (file) => (file === "index.html" ? ORIGIN : ORIGIN + file);
const fileFromUrl = (url) => {
  const path = url.replace(ORIGIN, "").split("#")[0];
  return path === "" ? "index.html" : path;
};

const files = readdirSync(ROOT).filter((f) => f.endsWith(".html")).sort();
const pages = Object.fromEntries(files.map((f) => [f, readFileSync(join(ROOT, f), "utf8")]));
const ids = Object.fromEntries(
  files.map((f) => [f, new Set([...pages[f].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))])
);

function jsonLdNodes(file, html) {
  const nodes = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      const graph = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
      nodes.push(...graph);
    } catch (e) {
      err(file, `JSON-LD nicht parsebar: ${e.message}`);
    }
  }
  return nodes;
}
const hasType = (node, t) => [].concat(node["@type"] || []).includes(t);

for (const file of files) {
  const html = pages[file];
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);

  if (!/<html lang="de">/.test(html)) err(file, 'fehlt <html lang="de">');
  if (!/<meta charset="utf-8">/i.test(html)) err(file, "fehlt <meta charset=utf-8>");

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) err(file, "kein <title>");
  else if (decode(title).length > TITLE_MAX) warn(file, `Title ${decode(title).length} Z. > ${TITLE_MAX}: "${decode(title)}"`);

  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!desc) err(file, "keine Meta-Description");
  else if (!noindex) {
    const n = decode(desc).length;
    if (n > DESC_MAX || n < DESC_MIN) warn(file, `Description ${n} Z. (Ziel ${DESC_MIN}–${DESC_MAX})`);
  }

  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(file, `${h1} × <h1> (erwartet genau 1)`);

  const canonical = (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
  if (!noindex) {
    if (!canonical) err(file, "kein Canonical");
    else if (canonical !== pageUrl(file)) err(file, `Canonical ${canonical} ≠ ${pageUrl(file)}`);
  }

  // JSON-LD + FAQ-Sync
  const nodes = jsonLdNodes(file, html);
  const faqNodes = nodes.filter((n) => hasType(n, "FAQPage"));
  const visibleFaq = [...html.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map(
    (m) => [text(m[1]), text(m[2])]
  );
  const schemaFaq = faqNodes.flatMap((n) => (n.mainEntity || []).map((q) => [q.name, q.acceptedAnswer?.text]));
  if (visibleFaq.length || schemaFaq.length) {
    const vis = new Map(visibleFaq);
    const sch = new Map(schemaFaq);
    for (const [q, a] of vis) {
      if (!sch.has(q)) err(file, `FAQ sichtbar, aber nicht im Schema: "${q}"`);
      else if (sch.get(q) !== a) err(file, `FAQ-Antwort weicht ab: "${q}"\n      HTML:   ${a}\n      Schema: ${sch.get(q)}`);
    }
    for (const q of sch.keys()) if (!vis.has(q)) err(file, `FAQ im Schema, aber nicht sichtbar: "${q}"`);
  }

  // Breadcrumbs
  for (const bc of nodes.filter((n) => hasType(n, "BreadcrumbList"))) {
    for (const item of bc.itemListElement || []) {
      const target = fileFromUrl(item.item || "");
      if (!pages[target]) err(file, `Breadcrumb-Ziel existiert nicht: ${item.item}`);
    }
  }
  if (!noindex && file !== "index.html" && !nodes.some((n) => hasType(n, "BreadcrumbList"))) {
    warn(file, "keine BreadcrumbList");
  }

  // Bilder
  for (const img of html.match(/<img\b[^>]*>/g) || []) {
    const src = (img.match(/src="([^"]+)"/) || [])[1] || "?";
    if (!/\balt=/.test(img)) err(file, `Bild ohne alt: ${src}`);
    if (!/\bwidth=/.test(img) || !/\bheight=/.test(img)) warn(file, `Bild ohne width/height (CLS): ${src}`);
    if (/^assets\//.test(src) && !existsSync(join(ROOT, src))) err(file, `Bilddatei fehlt: ${src}`);
  }

  // Interne Links inkl. Anker
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|\/\/)/.test(href) || href.endsWith(".css") || href.endsWith(".ico") || href.endsWith(".svg") || href.endsWith(".png") || href.endsWith(".woff2")) continue;
    const [path, anchor] = href.split("#");
    const target = path === "" ? file : path;
    if (!pages[target]) {
      if (!existsSync(join(ROOT, target))) err(file, `Link-Ziel existiert nicht: ${href}`);
      continue;
    }
    if (anchor && !ids[target].has(anchor)) err(file, `Anker fehlt: ${href} (kein id="${anchor}" in ${target})`);
  }

  for (const a of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) || []) {
    if (!/rel="[^"]*noopener/.test(a)) warn(file, `target=_blank ohne rel=noopener: ${a.slice(0, 80)}`);
  }
}

// Sitemap-Konsistenz
const sitemap = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
const sitemapFiles = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => fileFromUrl(m[1]));
for (const f of sitemapFiles) if (!pages[f]) err("sitemap.xml", `URL ohne Datei: ${f}`);
for (const f of files) {
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(pages[f]);
  if (noindex && sitemapFiles.includes(f)) err("sitemap.xml", `noindex-Seite in Sitemap: ${f}`);
  if (!noindex && !sitemapFiles.includes(f)) err("sitemap.xml", `indexierbare Seite fehlt: ${f}`);
}

for (const w of warnings) console.log("WARN  " + w);
for (const e of errors) console.log("ERROR " + e);
console.log(`\n${files.length} Seiten geprüft · ${errors.length} Fehler · ${warnings.length} Warnungen`);
process.exit(errors.length ? 1 : 0);
