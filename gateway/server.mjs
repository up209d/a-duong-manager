/**
 * A+Manager gateway - single address for the whole app.
 *
 *   http://localhost:26261
 *     /api/*        -> backend API   (127.0.0.1:26260)
 *     /api/v1/...   -> backend API   (same, versioned routes)
 *     everything else -> web app    (127.0.0.1:26262, Expo dev server)
 *
 * Zero dependencies (node:http). Supports:
 *   - streaming request/response (file uploads work)
 *   - websocket upgrades (Expo HMR in dev)
 *   - production mode: if NODE_ENV=production and app/dist exists,
 *     serves the static web build directly (no Expo dev server needed)
 *
 * Run: node gateway/server.mjs
 */
import http from "node:http";
import { existsSync, statSync, createReadStream } from "node:fs";
import { join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const PORT = parseInt(process.env.PORT || "26261", 10);
const API_TARGET = { host: "127.0.0.1", port: parseInt(process.env.API_PORT || "26260", 10) };
const WEB_TARGET = { host: "127.0.0.1", port: parseInt(process.env.WEB_PORT || "26262", 10) };
const DIST_DIR = join(ROOT, "app", "dist");
const PRODUCTION = process.env.NODE_ENV === "production";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".txt": "text/plain; charset=utf-8",
};

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = normalize(join(DIST_DIR, urlPath === "/" ? "index.html" : urlPath));
  if (!file.startsWith(DIST_DIR)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  if (!existsSync(file) || statSync(file).isDirectory()) {
    // SPA fallback
    file = join(DIST_DIR, "index.html");
    if (!existsSync(file)) {
      res.writeHead(404).end("not found (run: npx expo export)");
      return;
    }
  }
  res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(res);
}

function proxyTo(target, req, res, path) {
  // Pass Host through untouched (like nginx `proxy_set_header Host $host`).
  // Rewriting it to the upstream address breaks Expo's Origin-vs-Host check
  // (non-loopback Origin must match Host) and produces 500s through the tunnel.
  const headers = { ...req.headers };
  delete headers["connection"];
  const proxyReq = http.request(
    { host: target.host, port: target.port, method: req.method, path, headers },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );
  proxyReq.on("error", (e) => {
    if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain" });
    res.end(`502 Bad Gateway: ${e.message} (target ${target.host}:${target.port})`);
  });
  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  const isApi = req.url.startsWith("/api/");
  if (isApi) {
    proxyTo(API_TARGET, req, res, req.url);
    return;
  }
  if (PRODUCTION && existsSync(DIST_DIR)) {
    serveStatic(req, res);
    return;
  }
  proxyTo(WEB_TARGET, req, res, req.url);
});

// websocket upgrades (Expo dev HMR)
server.on("upgrade", (req, socket, head) => {
  const isApi = req.url.startsWith("/api/");
  const target = isApi ? API_TARGET : WEB_TARGET;
  const headers = { ...req.headers }; // keep original Host (see proxyTo comment)
  const proxyReq = http.request({
    host: target.host,
    port: target.port,
    method: "GET",
    path: req.url,
    headers,
  });
  proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
    let buf = `HTTP/1.1 101 Switching Protocols\r\n`;
    for (const [k, v] of Object.entries(proxyRes.headers)) buf += `${k}: ${v}\r\n`;
    buf += `\r\n`;
    socket.write(buf);
    if (proxyHead && proxyHead.length) socket.write(proxyHead);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
    proxySocket.on("error", () => socket.destroy());
    socket.on("error", () => proxySocket.destroy());
  });
  proxyReq.on("error", () => socket.destroy());
  proxyReq.end();
});

server.listen(PORT, () => {
  console.log(`A+Manager gateway on http://localhost:${PORT}`);
  console.log(`  /api/*        -> ${API_TARGET.host}:${API_TARGET.port}`);
  console.log(`  * (everything)-> ${PRODUCTION && existsSync(DIST_DIR) ? "static app/dist" : WEB_TARGET.host + ":" + WEB_TARGET.port}`);
});
