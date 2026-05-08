const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: [true, 'El producto es requerido'],
    },
    tipo: {
      type: String,
      enum: ['ENTRADA', 'SALIDA', 'AJUSTE'],
      required: [true, 'El tipo de movimiento es requerido'],
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es requerida'],
      min: [1, 'La cantidad debe ser mayor a 0'],
    },
    precioUnitario: {
      type: Number,
      required: [true, 'El precio unitario es requerido'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stockAntes: {
      type: Number,
      required: true,
    },
    stockDespues: {
      type: Number,
      required: true,
    },
    precioPromedioAntes: {
      type: Number,
      default: 0,
    },
    precioPromedioDespues: {
      type: Number,
      default: 0,
    },
    observacion: {
      type: String,
      trim: true,
    },
    referencia: {
      type: String,
      trim: true,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario es requerido'],
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para optimizar consultas de kardex
movimientoSchema.index({ producto: 1, fecha: -1 });
movimientoSchema.index({ tipo: 1, fecha: -1 });
movimientoSchema.index({ usuario: 1, fecha: -1 });
movimientoSchema.index({ fecha: -1 });

module.exports = mongoose.model('Movimiento', movimientoSchema);
