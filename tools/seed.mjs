#!/usr/bin/env node
/**
 * Seed realistic sample data (categories + products) for a small Vietnamese shop.
 * Idempotent: safe to re-run. Existing categories/products (matched by name) are skipped.
 *
 * Usage:
 *   node tools/seed.mjs            # seeds against http://localhost:26260
 *   BASE=http://host:port node tools/seed.mjs
 */
const BASE = process.env.BASE || "http://localhost:26260";
const API = `${BASE}/api/v1`;

async function req(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    method: opts.method || (opts.body ? "POST" : "GET"),
    headers: opts.body ? { "content-type": "application/json" } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ---- categories ----
const CATEGORIES = [
  "Đồ uống",
  "Bánh kẹo",
  "Thực phẩm",
  "Gia vị",
  "Sữa",
  "Hóa mỹ phẩm",
];

// ---- products (name, sku, unit, cost, sell, stock, alert, categories) ----
const PRODUCTS = [
  { name: "Coca Cola lon 330ml", sku: "8934560100011", unit: "Lon", cost: 7000, sell: 10000, stock: 48, alert: 12, cats: ["Đồ uống"] },
  { name: "Nước suối Aquafina 500ml", sku: "8936000100022", unit: "Chai", cost: 3000, sell: 5000, stock: 60, alert: 20, cats: ["Đồ uống"] },
  { name: "Trà Xanh Không Độ 250ml", sku: "8935550100033", unit: "Chai", cost: 4500, sell: 7000, stock: 36, alert: 12, cats: ["Đồ uống"] },
  { name: "Red Bull 250ml", sku: "8935000100044", unit: "Lon", cost: 18000, sell: 25000, stock: 24, alert: 6, cats: ["Đồ uống"] },
  { name: "Bánh Oreo 17g", sku: "8938000100055", unit: "Túi", cost: 2000, sell: 3000, stock: 120, alert: 30, cats: ["Bánh kẹo"] },
  { name: "Kẹo Haribo Gummy 100g", sku: "4001000100066", unit: "Hộp", cost: 18000, sell: 25000, stock: 15, alert: 5, cats: ["Bánh kẹo"] },
  { name: "Bánh tráng trộn 200g", sku: "VN00001000077", unit: "Hộp", cost: 10000, sell: 15000, stock: 20, alert: 8, cats: ["Bánh kẹo"] },
  { name: "Gạo ST25 5kg", sku: "8939000100088", unit: "Túi", cost: 220000, sell: 250000, stock: 10, alert: 3, cats: ["Thực phẩm"] },
  { name: "Phá lấu 400g", sku: "8939100100099", unit: "Gói", cost: 32000, sell: 45000, stock: 18, alert: 6, cats: ["Thực phẩm"] },
  { name: "Dầu ăn Neptune 1L", sku: "8939200100100", unit: "Chai", cost: 55000, sell: 65000, stock: 12, alert: 4, cats: ["Gia vị"] },
  { name: "Nước mắm Chin Su 500ml", sku: "8939300100111", unit: "Chai", cost: 28000, sell: 35000, stock: 25, alert: 8, cats: ["Gia vị"] },
  { name: "Sữa tươi Vinamilk 1L", sku: "8939400100122", unit: "Hộp", cost: 26000, sell: 32000, stock: 30, alert: 10, cats: ["Sữa"] },
  { name: "Xà phòng Lifebuoy 100g", sku: "8939500100133", unit: "Cái", cost: 8000, sell: 12000, stock: 40, alert: 10, cats: ["Hóa mỹ phẩm"] },
  { name: "Dầu gội Pantene 250ml", sku: "8939600100144", unit: "Chai", cost: 70000, sell: 85000, stock: 8, alert: 3, cats: ["Hóa mỹ phẩm"] },
];

async function main() {
  // 1. Categories (create missing, ignore conflicts)
  const existingCats = new Set((await req("/categories")).data.map((c) => c.name));
  let catCreated = 0;
  for (const name of CATEGORIES) {
    if (existingCats.has(name)) continue;
    const r = await req("/categories", { body: { name } });
    if (r.status === 201 || r.status === 409) catCreated++;
  }

  // 2. Products (skip ones that already exist by name)
  const existing = await req("/products?limit=1000");
  const existingNames = new Set(existing.data.items.map((p) => p.name));
  let prodCreated = 0;
  for (const p of PRODUCTS) {
    if (existingNames.has(p.name)) continue;
    const body = {
      name: p.name,
      sku: p.sku,
      unit: p.unit,
      cost_price: p.cost,
      selling_price: p.sell,
      stock_quantity: p.stock,
      min_stock_alert: p.alert,
      categories: p.cats,
      prices: [{ label: "Bán lẻ", amount: p.sell }],
    };
    const r = await req("/products", { body });
    if (r.status === 201) prodCreated++;
    else console.log(`  ! ${p.name}: ${r.status} ${JSON.stringify(r.data)}`);
  }

  // 3. Summary
  const cats = await req("/categories");
  const prods = await req("/products?limit=1000");
  console.log(`\nSeed complete: +${catCreated} categories, +${prodCreated} products`);
  console.log(`Now: ${cats.data.length} categories, ${prods.data.total} products`);
  for (const c of cats.data) console.log(`  - ${c.name} (${c.product_count} sp)`);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
