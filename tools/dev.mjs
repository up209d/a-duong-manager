#!/usr/bin/env node
/**
 * Dev orchestrator: starts backend + web + gateway, prefixes logs, kills all on exit.
 * Usage: node tools/dev.mjs   (or: npm run dev at repo root)
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const children = [];

function start(name, cwd, cmd, args, color) {
  const p = spawn(cmd, args, { cwd, env: { ...process.env, FORCE_COLOR: "1" } });
  children.push(p);
  const prefix = `\x1b[${color}m[${name}]\x1b[0m `;
  const pipe = (stream, out) => {
    let buf = "";
    stream.on("data", (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, i);
        buf = buf.slice(i + 1);
        if (line.trim()) out.write(prefix + line + "\n");
      }
    });
  };
  pipe(p.stdout, process.stdout);
  pipe(p.stderr, process.stderr);
  p.on("exit", (code) => {
    console.log(`\n[${name}] exited (${code})`);
    shutdown();
  });
}

function shutdown() {
  for (const p of children) {
    try { p.kill("SIGTERM"); } catch {}
  }
  setTimeout(() => process.exit(0), 300);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start("api", join(root, "server"), "npm", ["run", "dev"], "36");
start("web", join(root, "app"), "npx", ["expo", "start", "--web", "--port", "26262"], "35");
start("gw", root, "node", ["gateway/server.mjs"], "33");
