/**
 * Calcula el nuevo precio promedio ponderado al registrar una entrada.
 * Formula: ((stockActual * precioPromedio) + (cantidad * precioUnitario)) / (stockActual + cantidad)
 */
const calcularPrecioPromedio = (stockActual, precioPromedio, cantidad, precioUnitario) => {
  const totalAnterior = stockActual * precioPromedio;
  const totalNuevo = cantidad * precioUnitario;
  const nuevoStock = stockActual + cantidad;

  if (nuevoStock === 0) return 0;

  return (totalAnterior + totalNuevo) / nuevoStock;
};

/**
 * Calcula el nuevo stock después de un movimiento.
 */
const calcularNuevoStock = (stockActual, tipo, cantidad) => {
  switch (tipo) {
    case 'ENTRADA':
      return stockActual + cantidad;
    case 'SALIDA':
      return stockActual - cantidad;
    case 'AJUSTE':
      return cantidad; // En ajuste, la cantidad es el nuevo stock absoluto
    default:
      throw new Error(`Tipo de movimiento inválido: ${tipo}`);
  }
};

/**
 * Valida que haya stock suficiente para una salida.
 */
const validarStockSuficiente = (stockActual, cantidad) => {
  if (stockActual < cantidad) {
    throw new Error(
      `Stock insuficiente. Stock actual: ${stockActual}, cantidad solicitada: ${cantidad}`
    );
  }
};

module.exports = { calcularPrecioPromedio, calcularNuevoStock, validarStockSuficiente };
