// Same-origin by default (web goes through the gateway on :26261, or a tunnel
// like https://xxx.tunnel.aws.ducup.dev). Native builds can set EXPO_PUBLIC_API_BASE.
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || '';

type Result<T> = { ok: true; data: T } | { ok: false; status: number; error: string; data?: any };

export async function api<T = any>(
  path: string,
  opts: { method?: string; body?: unknown } = {}
): Promise<Result<T>> {
  try {
    const res = await fetch(`${API_BASE}/api/v1${path}`, {
      method: opts.method || (opts.body ? 'POST' : 'GET'),
      headers: opts.body ? { 'content-type': 'application/json' } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, error: data.error || 'error', data };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, status: 0, error: 'network', data: undefined };
  }
}

export const API = {
  // products
  listProducts: (q?: string, category?: string, low?: boolean) =>
    api(
      `/products?q=${encodeURIComponent(q || '')}&category=${encodeURIComponent(
        category || ''
      )}${low ? '&low=1' : ''}`
    ),
  getProduct: (id: number) => api(`/products/${id}`),
  createProduct: (body: unknown) => api('/products', { body }),
  updateProduct: (id: number, body: unknown) =>
    api(`/products/${id}`, { method: 'PUT', body }),
  deleteProduct: (id: number) => api(`/products/${id}`, { method: 'DELETE' }),

  // categories (M2M with products)
  listCategories: () => api<{ id: number; name: string; product_count: number }[]>('/categories'),
  createCategory: (name: string) => api('/categories', { body: { name } }),
  renameCategory: (id: number, name: string) =>
    api(`/categories/${id}`, { method: 'PUT', body: { name } }),
  deleteCategory: (id: number) => api(`/categories/${id}`, { method: 'DELETE' }),

  // customers / suppliers
  listCustomers: (q?: string) => api(`/customers?q=${encodeURIComponent(q || '')}`),
  createCustomer: (body: unknown) => api('/customers', { body }),
  updateCustomer: (id: number, body: unknown) =>
    api(`/customers/${id}`, { method: 'PUT', body }),
  customer: (id: number) => api(`/customers/${id}`),
  listSuppliers: (q?: string) => api(`/suppliers?q=${encodeURIComponent(q || '')}`),
  createSupplier: (body: unknown) => api('/suppliers', { body }),
  updateSupplier: (id: number, body: unknown) =>
    api(`/suppliers/${id}`, { method: 'PUT', body }),
  supplier: (id: number) => api(`/suppliers/${id}`),
  recordPayment: (kind: 'customers' | 'suppliers', id: number, amount: number, note?: string) =>
    api(`/${kind}/${id}/payments`, { body: { amount, note } }),
  payments: (kind: 'customers' | 'suppliers', id: number) =>
    api(`/${kind}/${id}/payments`),

  // transactions
  createTransaction: (body: unknown) => api('/transactions', { body }),
  listTransactions: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api(`/transactions${qs ? `?${qs}` : ''}`);
  },
  transaction: (id: number) => api(`/transactions/${id}`),

  // reports
  summary: (date?: string) => api(`/reports/summary${date ? `?date=${date}` : ''}`),
  profitLoss: (from: string, to: string) =>
    api(`/reports/profit-loss?from=${from}&to=${to}`),
  debts: () => api('/reports/debts'),
};
