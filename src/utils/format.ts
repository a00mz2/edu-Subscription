export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('en-US').format(n ?? 0);

export const formatDate = (s: string | null | undefined): string =>
  s ? new Date(s).toLocaleDateString('ar-EG') : '—';
