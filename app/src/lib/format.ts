// VND formatting: whole dong, Vietnamese thousand separators
export function money(n: number | null | undefined): string {
  const v = Math.round(Number(n) || 0);
  return new Intl.NumberFormat('vi-VN').format(v) + ' \u20AB';
}

export function num(n: number | null | undefined): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0));
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthStartStr(): string {
  return new Date().toISOString().slice(0, 8) + '01';
}
