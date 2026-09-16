import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(join(dataDir, "manage.db"));

db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// All money values are stored as INTEGER VND (whole dong, no decimals).
db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT UNIQUE NOT NULL,
  sku_alias TEXT,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT,
  cost_price INTEGER NOT NULL DEFAULT 0,
  selling_price INTEGER NOT NULL DEFAULT 0,
  sub_unit TEXT,
  sub_unit_ratio INTEGER NOT NULL DEFAULT 1,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_alert INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS product_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices(product_id);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  current_debt INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  current_debt INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('EXPORT','IMPORT')),
  entity_id INTEGER,
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  extra_fee INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  paid_amount INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_entity ON transactions(type, entity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);

CREATE TABLE IF NOT EXISTS transaction_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit TEXT,
  unit_price INTEGER NOT NULL,
  cost_price INTEGER NOT NULL DEFAULT 0,
  price_label TEXT
);
CREATE INDEX IF NOT EXISTS idx_tx_items_tx ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_tx_items_product ON transaction_items(product_id);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  party_type TEXT NOT NULL CHECK (party_type IN ('CUSTOMER','SUPPLIER')),
  party_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_party ON payments(party_type, party_id);

CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

-- Many-to-many link between products and categories.
-- A product can belong to 0..N categories; a category can have 0..N products.
-- products.category (single TEXT) is legacy; this junction table is the source of truth.
CREATE TABLE IF NOT EXISTS product_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(product_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_pc_product ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_pc_category ON product_categories(category_id);
`);

// One-time, idempotent migration: lift legacy products.category (single name)
// into the M2M product_categories table. Safe to run on every start (no-op after first).
(function migrateProductCategories() {
  const rows = db
    .prepare("SELECT id, category FROM products WHERE category IS NOT NULL AND category != ''")
    .all();
  if (rows.length === 0) return;
  const ensureCat = db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)");
  const catId = db.prepare("SELECT id FROM categories WHERE name = ?");
  const link = db.prepare("INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)");
  for (const r of rows) {
    ensureCat.run(r.category);
    const c = catId.get(r.category);
    if (c) link.run(r.id, c.id);
  }
})();

export function nextCode(type) {
  const prefix = type === "EXPORT" ? "XK" : "NK";
  const row = db
    .prepare("SELECT COUNT(*) AS n FROM transactions WHERE type = ?")
    .get(type);
  return `${prefix}${String(row.n + 1).padStart(4, "0")}`;
}
