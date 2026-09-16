import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// GET /api/categories  ->  [{ id, name, product_count }]
router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.id, c.name, COUNT(pc.product_id) AS product_count
       FROM categories c
       LEFT JOIN product_categories pc ON pc.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name COLLATE NOCASE`
    )
    .all();
  res.json(rows);
});

// POST /api/categories  { name }
router.post("/", (req, res) => {
  const name = String((req.body || {}).name || "").trim();
  if (!name) return res.status(400).json({ error: "name_required" });
  try {
    db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
    const row = db.prepare("SELECT id, name FROM categories WHERE name = ?").get(name);
    res.status(201).json(row);
  } catch (e) {
    if (String(e.message).includes("UNIQUE"))
      return res.status(409).json({ error: "name_exists" });
    throw e;
  }
});

// PUT /api/categories/:id  { name }  -> rename (product links are by id, so they follow)
router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT id, name FROM categories WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "not_found" });
  const name = String((req.body || {}).name || "").trim();
  if (!name) return res.status(400).json({ error: "name_required" });
  try {
    db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, existing.id);
    const row = db.prepare("SELECT id, name FROM categories WHERE id = ?").get(existing.id);
    res.json(row);
  } catch (e) {
    if (String(e.message).includes("UNIQUE"))
      return res.status(409).json({ error: "name_exists" });
    throw e;
  }
});

// DELETE /api/categories/:id
// Unlinks the category from all products (product_categories rows are removed via
// ON DELETE CASCADE) and deletes the category. Products themselves are kept.
router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

export default router;
