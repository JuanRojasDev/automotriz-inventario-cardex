const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código es requerido'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'La categoría es requerida'],
    },
    unidadMedida: {
      type: String,
      required: [true, 'La unidad de medida es requerida'],
      trim: true,
      default: 'unidad',
    },
    stockActual: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
    },
    stockMinimo: {
      type: Number,
      default: 5,
      min: [0, 'El stock mínimo no puede ser negativo'],
    },
    precioCompra: {
      type: Number,
      default: 0,
      min: [0, 'El precio de compra no puede ser negativo'],
    },
    precioVenta: {
      type: Number,
      default: 0,
      min: [0, 'El precio de venta no puede ser negativo'],
    },
    precioPromedio: {
      type: Number,
      default: 0,
      min: [0, 'El precio promedio no puede ser negativo'],
    },
    imagen: {
      type: String,
      default: null,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    eliminado: {
      type: Boolean,
      default: false,
    },
    fechaEliminado: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Índices compuestos para optimizar búsquedas
productoSchema.index({ nombre: 'text', descripcion: 'text' });
productoSchema.index({ categoria: 1, activo: 1 });
productoSchema.index({ stockActual: 1, stockMinimo: 1 });
productoSchema.index({ eliminado: 1, activo: 1 });

// Virtual: indica si el stock está bajo
productoSchema.virtual('stockBajo').get(function () {
  return this.stockActual <= this.stockMinimo;
});

productoSchema.set('toJSON', { virtuals: true });
productoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Producto', productoSchema);
