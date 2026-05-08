const logger = {
  info: (msg, data = '') => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data || '');
  },
  error: (msg, error = '') => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, error || '');
  },
  warn: (msg, data = '') => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data || '');
  },
  operation: (usuario, operacion, detalle = '') => {
    console.log(
      `[AUDIT] ${new Date().toISOString()} - Usuario: ${usuario} | Op: ${operacion} | ${detalle}`
    );
  },
};

module.exports = logger;
