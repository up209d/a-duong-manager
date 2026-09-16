import express from "express";
import { db } from "./db.js";
import productsRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
import { makePartyRouter } from "./routes/parties.js";
import transactionsRouter from "./routes/transactions.js";
import reportsRouter from "./routes/reports.js";

const PORT = process.env.PORT || 26260;

const app = express();

// CORS: local dev + AWS tunnel domain
const CORS_ALLOWED = [/.tunnel\.aws\.ducup\.dev$/i, /localhost$/, /127\.0\.0\.1$/];
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  const allowed = origin && CORS_ALLOWED.some((re) => re.test(new URL(origin).hostname));
  res.setHeader("Access-Control-Allow-Origin", allowed ? origin : "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "2mb" }));

// Tiny request log
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.get("/api/v1/health", (req, res) => {
  const products = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
  const transactions = db.prepare("SELECT COUNT(*) AS n FROM transactions").get().n;
  res.json({ ok: true, name: "A+Manager API", products, transactions });
});

app.use("/api/v1/products", productsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/customers", makePartyRouter("customers", "CUSTOMER"));
app.use("/api/v1/suppliers", makePartyRouter("suppliers", "SUPPLIER"));
app.use("/api/v1/transactions", transactionsRouter);
app.use("/api/v1/reports", reportsRouter);

// 404 + error handlers
app.use((req, res) => res.status(404).json({ error: "not_found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "server_error" });
});

app.listen(PORT, () => {
  console.log(`A+Manager API listening on http://localhost:${PORT} (routes under /api/v1)`);
});
