import { Router } from "express";
import { db, nextCode } from "../db.js";

const router = Router();

// Confirmed business formulas (docs/02-decisions.md):
//   revenue = subtotal - discount + extra_fee
//   cogs    = sum(item qty * cost_price snapshot)
//   gross   = revenue - cogs
//   debt    += (total - paid)

// POST /api/transactions  { type, entity_id, items:[{product_id, quantity, unit_price, price_label, unit}], discount, extra_fee, paid_amount, note }
router.post("/", (req, res) => {
  const b = req.body || {};
  const type = b.type === "IMPORT" ? "IMPORT" : "EXPORT";
  const items = Array.isArray(b.items) ? b.items : [];
  if (items.length === 0) return res.status(400).json({ error: "items_required" });

  const discount = Math.max(0, Number(b.discount) || 0);
  const extraFee = Math.max(0, Number(b.extra_fee) || 0);
  const paid = Math.max(0, Number(b.paid_amount) || 0);

  db.exec("BEGIN");
  try {
    let subtotal = 0;
    let cogs = 0;
    const productIds = [];
    const getProduct = db.prepare("SELECT * FROM products WHERE id = ?");
    const updStock = db.prepare(
      "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?"
    );

    // Validate + compute, adjust stock
    const prepared = [];
    for (const it of items) {
      const p = getProduct.get(it.product_id);
      if (!p) {
        db.exec("ROLLBACK");
        return res.status(400).json({ error: "product_not_found", product_id: it.product_id });
      }
      const qty = Number(it.quantity);
      if (!qty || qty <= 0) {
        db.exec("ROLLBACK");
        return res.status(400).json({ error: "invalid_quantity", product_id: it.product_id });
      }
      const delta = type === "EXPORT" ? -qty : qty;
      if (type === "EXPORT" && p.stock_quantity + delta < 0) {
        db.exec("ROLLBACK");
        return res.status(409).json({
          error: "insufficient_stock",
          product_id: p.id,
          available: p.stock_quantity
        });
      }
      const unitPrice = it.unit_price != null ? Number(it.unit_price) : p.selling_price;
      subtotal += unitPrice * qty;
      cogs += (p.cost_price || 0) * qty;
      updStock.run(delta, p.id);
      productIds.push(p.id);
      prepared.push({ p, qty, unitPrice, priceLabel: it.price_label || null, unit: it.unit || p.unit });
    }

    const total = subtotal - discount + extraFee;
    const code = nextCode(type);
    const info = db
      .prepare(
        `INSERT INTO transactions (code, type, entity_id, subtotal, discount, extra_fee,
          total_amount, paid_amount, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        code, type, b.entity_id || null,
        subtotal, discount, extraFee, total, paid, b.note || null
      );
    const txId = Number(info.lastInsertRowid);

    const insItem = db.prepare(
      `INSERT INTO transaction_items (transaction_id, product_id, quantity, unit,
        unit_price, cost_price, price_label)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (const { p, qty, unitPrice, priceLabel, unit } of prepared) {
      insItem.run(txId, p.id, qty, unit, unitPrice, p.cost_price || 0, priceLabel);
    }

    // Update party debt: debt += (total - paid)
    if (b.entity_id) {
      const table = type === "EXPORT" ? "customers" : "suppliers";
      db.prepare(
        `UPDATE ${table} SET current_debt = current_debt + ? WHERE id = ?`
      ).run(total - paid, b.entity_id);
    }

    db.exec("COMMIT");
    res.status(201).json({
      ...db.prepare("SELECT * FROM transactions WHERE id = ?").get(txId),
      items: db.prepare("SELECT * FROM transaction_items WHERE transaction_id = ?").all(txId),
      cogs
    });
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
});

// GET /api/transactions?type=&entity_id=&from=&to=&status=&limit=&offset=
router.get("/", (req, res) => {
  const { type, entity_id: entityId, from, to, status } = req.query;
  const limit = Math.min(parseInt(req.query.limit || "100", 10), 1000);
  const offset = parseInt(req.query.offset || "0", 10);

  const where = [];
  const params = [];
  if (type) { where.push("type = ?"); params.push(type); }
  if (entityId) { where.push("entity_id = ?"); params.push(entityId); }
  if (from) { where.push("date(created_at) >= date(?)"); params.push(from); }
  if (to) { where.push("date(created_at) <= date(?)"); params.push(to); }
  if (status === "paid") where.push("paid_amount >= total_amount");
  if (status === "partial") where.push("paid_amount > 0 AND paid_amount < total_amount");
  if (status === "unpaid") where.push("paid_amount = 0");
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = db.prepare(`SELECT COUNT(*) AS n FROM transactions ${whereSql}`).get(...params).n;
  const items = db
    .prepare(
      `SELECT t.*,
              (SELECT name FROM customers c WHERE c.id = t.entity_id) AS customer_name,
              (SELECT name FROM suppliers s WHERE s.id = t.entity_id) AS supplier_name
       FROM transactions t ${whereSql}
       ORDER BY t.created_at DESC, t.id DESC LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);
  res.json({ total, items });
});

// GET /api/transactions/:id
router.get("/:id", (req, res) => {
  const t = db
    .prepare(
      `SELECT t.*,
              (SELECT name FROM customers c WHERE c.id = t.entity_id) AS customer_name,
              (SELECT name FROM suppliers s WHERE s.id = t.entity_id) AS supplier_name
       FROM transactions t WHERE t.id = ?`
    )
    .get(req.params.id);
  if (!t) return res.status(404).json({ error: "not_found" });
  t.items = db
    .prepare(
      `SELECT i.*, p.name AS product_name, p.sku
       FROM transaction_items i JOIN products p ON p.id = i.product_id
       WHERE i.transaction_id = ?`
    )
    .all(req.params.id);
  const cogs = t.items.reduce((s, i) => s + i.cost_price * i.quantity, 0);
  t.cogs = cogs;
  t.gross_profit = t.subtotal - t.discount + t.extra_fee - cogs;
  res.json(t);
});

export default router;
