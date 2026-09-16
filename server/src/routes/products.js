import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// ---- category helpers (M2M) ----

// Array of category names linked to a product.
function productCategories(productId) {
  return db
    .prepare(
      `SELECT c.name FROM categories c
       JOIN product_categories pc ON pc.category_id = c.id
       WHERE pc.product_id = ?
       ORDER BY c.name COLLATE NOCASE`
    )
    .all(productId)
    .map((r) => r.name);
}

// Resolve a list of category NAMES to ids, creating missing categories.
function ensureCategoryIds(names) {
  const out = [];
  const ensure = db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)");
  const getId = db.prepare("SELECT id FROM categories WHERE name = ?");
  for (const raw of names || []) {
    const name = String(raw || "").trim();
    if (!name) continue;
    ensure.run(name);
    const row = getId.get(name);
    if (row) out.push(row.id);
  }
  return out;
}

// Replace the set of categories linked to a product.
function setProductCategories(productId, names) {
  const ids = ensureCategoryIds(names);
  db.prepare("DELETE FROM product_categories WHERE product_id = ?").run(productId);
  const ins = db.prepare(
    "INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)"
  );
  for (const cid of ids) ins.run(productId, cid);
}

// Accept `categories: string[]` (preferred) or legacy `category: string`.
function normalizeCategoryNames(body) {
  if (Array.isArray(body.categories)) return body.categories;
  if (typeof body.category === "string" && body.category.trim()) return [body.category];
  return [];
}

function productWithPrices(id) {
  const p = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  if (!p) return null;
  p.prices = db
    .prepare("SELECT label, amount FROM product_prices WHERE product_id = ?")
    .all(id);
  p.categories = productCategories(id);
  return p;
}

// GET /api/products?q=&category=&low=1&limit=&offset=
router.get("/", (req, res) => {
  const { q, category, low } = req.query;
  const limit = Math.min(parseInt(req.query.limit || "200", 10), 1000);
  const offset = parseInt(req.query.offset || "0", 10);

  const where = [];
  const params = [];
  if (q) {
    where.push("(p.name LIKE ? OR p.sku LIKE ? OR p.sku_alias LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (category) {
    where.push(
      `p.id IN (SELECT pc.product_id FROM product_categories pc
                JOIN categories c ON c.id = pc.category_id
                WHERE c.name = ?)`
    );
    params.push(category);
  }
  if (low === "1") where.push("p.stock_quantity <= p.min_stock_alert");
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = db
    .prepare(`SELECT COUNT(*) AS n FROM products p ${whereSql}`)
    .get(...params).n;
  const rows = db
    .prepare(
      `SELECT p.id, p.sku, p.name, p.unit, p.cost_price, p.selling_price,
              p.stock_quantity, p.min_stock_alert
       FROM products p ${whereSql}
       ORDER BY p.name COLLATE NOCASE LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  const items = rows.map((r) => ({ ...r, categories: productCategories(r.id) }));
  res.json({ total, items });
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const p = productWithPrices(req.params.id);
  if (!p) return res.status(404).json({ error: "not_found" });
  res.json(p);
});

function savePrices(productId, prices) {
  db.prepare("DELETE FROM product_prices WHERE product_id = ?").run(productId);
  const ins = db.prepare(
    "INSERT INTO product_prices (product_id, label, amount) VALUES (?, ?, ?)"
  );
  for (const pr of prices || []) {
    if (pr.label && pr.amount != null) ins.run(productId, pr.label, pr.amount);
  }
}

// POST /api/products
router.post("/", (req, res) => {
  const b = req.body || {};
  if (!b.name) return res.status(400).json({ error: "name_required" });
  const sku = b.sku || `SP${Date.now()}`;
  try {
    const info = db
      .prepare(
        `INSERT INTO products (sku, sku_alias, name, unit, cost_price,
          selling_price, sub_unit, sub_unit_ratio, stock_quantity, min_stock_alert)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        sku,
        b.sku_alias || null,
        b.name,
        b.unit || null,
        b.cost_price || 0,
        b.selling_price || 0,
        b.sub_unit || null,
        b.sub_unit_ratio || 1,
        b.stock_quantity || 0,
        b.min_stock_alert || 0
      );
    const id = Number(info.lastInsertRowid);
    savePrices(id, b.prices);
    setProductCategories(id, normalizeCategoryNames(b));
    res.status(201).json(productWithPrices(id));
  } catch (e) {
    if (String(e.message).includes("UNIQUE"))
      return res.status(409).json({ error: "sku_exists" });
    throw e;
  }
});

// PUT /api/products/:id
router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "not_found" });
  const b = { ...existing, ...req.body, id: existing.id };
  try {
    db.prepare(
      `UPDATE products SET sku = ?, sku_alias = ?, name = ?, unit = ?,
        cost_price = ?, selling_price = ?, sub_unit = ?, sub_unit_ratio = ?,
        stock_quantity = ?, min_stock_alert = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      b.sku, b.sku_alias, b.name, b.unit,
      b.cost_price || 0, b.selling_price || 0, b.sub_unit, b.sub_unit_ratio || 1,
      b.stock_quantity ?? 0, b.min_stock_alert || 0, b.id
    );
    if (req.body.prices) savePrices(b.id, req.body.prices);
    // Only rewrite the category links if the client actually sent them.
    if (req.body.categories || req.body.category !== undefined) {
      setProductCategories(b.id, normalizeCategoryNames(req.body));
    }
    res.json(productWithPrices(b.id));
  } catch (e) {
    if (String(e.message).includes("UNIQUE"))
      return res.status(409).json({ error: "sku_exists" });
    throw e;
  }
});

// DELETE /api/products/:id
router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

export default router;
