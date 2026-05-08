/**
 * Formatea un número como moneda colombiana (COP).
 */
export const formatCurrency = (val) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(val ?? 0);

/**
 * Formatea un timestamp (string o número) como fecha/hora corta en español.
 */
export const formatDate = (ts) => {
  const d = new Date(typeof ts === 'string' && /^\d+$/.test(ts) ? parseInt(ts) : ts);
  return d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
};

/**
 * Formatea solo la fecha (sin hora).
 */
export const formatDateOnly = (ts) => {
  const d = new Date(typeof ts === 'string' && /^\d+$/.test(ts) ? parseInt(ts) : ts);
  return d.toLocaleDateString('es-CO');
};

/**
 * Formatea una fecha para mostrar día/mes en gráficos.
 */
export const formatChartDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};
