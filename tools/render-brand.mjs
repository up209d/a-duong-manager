#!/usr/bin/env node
/**
 * Renders brand SVGs to PNGs (app icons, favicon, splash, adaptive icon parts).
 * Usage: node tools/render-brand.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const brand = join(__dirname, "..", "brand");
const outDir = join(__dirname, "..", "app", "assets", "images");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1400 }, deviceScaleFactor: 2 });

async function render(svgFile, pngFile, w, h) {
  // NOTE: file:// SVGs inside <img> fail to load in headless Chromium (naturalWidth 0).
  // Inline the SVG markup instead; the viewBox makes it scale to the container.
  const svg = readFileSync(join(brand, svgFile), "utf8").replace(
    "<svg ",
    '<svg width="100%" height="100%" '
  );
  await page.goto("about:blank");
  await page.setContent(
    `<body style="margin:0;padding:0;background:transparent">
       <div id="shot" style="width:${w}px;height:${h}px">${svg}</div>
     </body>`
  );
  await page.waitForTimeout(250);
  const el = await page.$("#shot");
  await el.screenshot({ path: join(outDir, pngFile), omitBackground: true });
  console.log(`  ${pngFile} (${w}x${h} @2x)`);
}

console.log("rendering brand PNGs ->", outDir);
await render("icon.svg", "icon.png", 1024, 1024);
await render("icon.svg", "favicon.png", 48, 48);
await render("icon.svg", "splash-icon.png", 512, 512);
await render("icon.svg", "logo-mark.png", 256, 256);
await render("bg-gradient.svg", "android-icon-background.png", 512, 512);
await render("adaptive-foreground.svg", "android-icon-foreground.png", 512, 512);
await render("mark-white.svg", "android-icon-monochrome.png", 512, 512);
await render("wordmark.svg", "wordmark.png", 920, 256);

await browser.close();
console.log("done");
