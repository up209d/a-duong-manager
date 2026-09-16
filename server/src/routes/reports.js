import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// Helper: profit/loss totals for a date range (sales = EXPORT only)
function profitLoss(from, to) {
  const range = "t.type = 'EXPORT' AND date(t.created_at) BETWEEN date(?) AND date(?)";
  const params = [from, to];

  const sales = db
    .prepare(
      `SELECT COUNT(*) AS orders,
              COALESCE(SUM(t.subtotal),0) AS subtotal,
              COALESCE(SUM(t.discount),0) AS discount,
              COALESCE(SUM(t.extra_fee),0) AS extra_fee,
              COALESCE(SUM(t.total_amount),0) AS revenue
       FROM transactions t WHERE ${range}`
    )
    .get(...params);

  const cogsRow = db
    .prepare(
      `SELECT COALESCE(SUM(i.cost_price * i.quantity),0) AS cogs
       FROM transaction_items i
       JOIN transactions t ON t.id = i.transaction_id
       WHERE ${range}`
    )
    .get(...params);

  // Import-side costs (shipping/processing) reduce net profit per confirmed formula
  const importCosts = db
    .prepare(
      `SELECT COALESCE(SUM(discount * -1 + extra_fee),0) AS costs
       FROM transactions
       WHERE type = 'IMPORT' AND date(created_at) BETWEEN date(?) AND date(?)`
    )
    .get(from, to);

  const revenue = sales.revenue;
  const gross = revenue - cogsRow.cogs;
  const net = gross - (importCosts.costs || 0);

  return {
    orders: sales.orders,
    revenue,
    subtotal: sales.subtotal,
    discount: sales.discount,
    extra_fee: sales.extra_fee,
    cogs: cogsRow.cogs,
    import_costs: importCosts.costs || 0,
    gross_profit: gross,
    net_profit: net
  };
}

// GET /api/reports/summary?date=YYYY-MM-DD (default: today)
router.get("/summary", (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  res.json(profitLoss(date, date));
});

// GET /api/reports/profit-loss?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/profit-loss", (req, res) => {
  const to = req.query.to || new Date().toISOString().slice(0, 10);
  const from = req.query.from || to.slice(0, 8) + "01";
  res.json(profitLoss(from, to));
});

// GET /api/reports/debts
router.get("/debts", (req, res) => {
  const receivables = db
    .prepare("SELECT COUNT(*) AS n, COALESCE(SUM(current_debt),0) AS total FROM customers WHERE current_debt > 0")
    .get();
  const payables = db
    .prepare("SELECT COUNT(*) AS n, COALESCE(SUM(current_debt),0) AS total FROM suppliers WHERE current_debt > 0")
    .get();
  res.json({
    receivables: receivables.total,
    receivables_parties: receivables.n,
    payables: payables.total,
    payables_parties: payables.n,
    net: receivables.total - payables.total
  });
});

export default router;
