#!/usr/bin/env node
/**
 * +Manage UI screenshot tool (Playwright).
 *
 * Usage:
 *   node tools/screenshot.mjs                     # full-page shot of home (localhost:26262)
 *   node tools/screenshot.mjs --url /products     # shot a specific route
 *   node tools/screenshot.mjs --mobile            # iPhone 16 Pro viewport (430x932, the golden size)
 *   node tools/screenshot.mjs --wait 3000         # extra wait for data to load (ms)
 *   node tools/screenshot.mjs --out my-shot.png   # custom output file
 *
 * Output goes to tools/shots/ by default. Open the PNG to visually analyze the UI.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const hasFlag = (name) => process.argv.includes(`--${name}`);

const base = arg("base", "http://localhost:26261"); // gateway (single address)
const url = arg("url", "/");
const out = arg("out", join(__dirname, "shots", `manage-${Date.now()}.png`));
const extraWait = parseInt(arg("wait", "1500"), 10);
const mobile = hasFlag("mobile");

const viewport = mobile ? { width: 430, height: 932 } : { width: 1280, height: 900 };

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport,
  deviceScaleFactor: mobile ? 3 : 2,
  isMobile: mobile,
  hasTouch: mobile,
});
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

try {
  await page.goto(base + url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(extraWait);
  mkdirSync(dirname(out), { recursive: true });
  await page.screenshot({ path: out, fullPage: true });
  console.log(`screenshot: ${out}`);
  if (errors.length) {
    console.log("JS errors detected:");
    for (const e of errors) console.log("  - " + e);
    process.exitCode = 2;
  }
} finally {
  await browser.close();
}
