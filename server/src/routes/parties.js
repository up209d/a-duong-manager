import { Router } from "express";
import { db } from "../db.js";

// Shared factory for customers and suppliers (same shape).
export function makePartyRouter(table, partyType) {
  const router = Router();

  router.get("/", (req, res) => {
    const { q } = req.query;
    const limit = Math.min(parseInt(req.query.limit || "200", 10), 1000);
    let where = "";
    const params = [];
    if (q) {
      where = "WHERE name LIKE ? OR phone LIKE ?";
      const like = `%${q}%`;
      params.push(like, like);
    }
    const total = db
      .prepare(`SELECT COUNT(*) AS n, COALESCE(SUM(current_debt),0) AS debt FROM ${table} ${where}`)
      .get(...params);
    const items = db
      .prepare(
        `SELECT * FROM ${table} ${where} ORDER BY name COLLATE NOCASE LIMIT ?`
      )
      .all(...params, limit);
    res.json({ total: total.n, total_debt: total.debt, items });
  });

  router.get("/:id", (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json(row);
  });

  router.post("/", (req, res) => {
    const b = req.body || {};
    if (!b.name) return res.status(400).json({ error: "name_required" });
    const info = db
      .prepare(`INSERT INTO ${table} (name, phone, address) VALUES (?, ?, ?)`)
      .run(b.name, b.phone || null, b.address || null);
    const id = Number(info.lastInsertRowid);
    res.status(201).json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id));
  });

  router.put("/:id", (req, res) => {
    const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    const b = { ...existing, ...req.body, id: existing.id };
    db.prepare(
      `UPDATE ${table} SET name = ?, phone = ?, address = ? WHERE id = ?`
    ).run(b.name, b.phone, b.address, b.id);
    res.json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(b.id));
  });

  router.delete("/:id", (req, res) => {
    const info = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: "not_found" });
    res.json({ ok: true });
  });

  // POST /:id/payments  { amount, note }  (thu no / tra no)
  router.post("/:id/payments", (req, res) => {
    const id = Number(req.params.id);
    const amount = Number((req.body || {}).amount);
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "amount_required" });

    const party = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    if (!party) return res.status(404).json({ error: "not_found" });

    db.exec("BEGIN");
    try {
      db.prepare(`UPDATE ${table} SET current_debt = current_debt - ? WHERE id = ?`)
        .run(amount, id);
      db.prepare(
        "INSERT INTO payments (party_type, party_id, amount, note) VALUES (?, ?, ?, ?)"
      ).run(partyType, id, amount, (req.body || {}).note || null);
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
    res.status(201).json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id));
  });

  // GET /:id/payments
  router.get("/:id/payments", (req, res) => {
    const rows = db
      .prepare(
        "SELECT * FROM payments WHERE party_type = ? AND party_id = ? ORDER BY created_at DESC"
      )
      .all(partyType, req.params.id);
    res.json(rows);
  });

  return router;
}
