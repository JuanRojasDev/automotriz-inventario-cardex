require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB para seed');

    // Limpiar colecciones
    await Usuario.deleteMany({});
    await Categoria.deleteMany({});
    await Producto.deleteMany({});

    // Crear usuarios
    const adminPass = await bcrypt.hash('admin123', 12);
    const operPass = await bcrypt.hash('oper123', 12);

    const [admin, operador] = await Usuario.insertMany([
      { nombre: 'Administrador', email: 'admin@aoa.com', password: adminPass, rol: 'admin' },
      { nombre: 'Operador', email: 'operador@aoa.com', password: operPass, rol: 'operador' },
      { nombre: 'Viewer', email: 'viewer@aoa.com', password: await bcrypt.hash('viewer123', 12), rol: 'viewer' },
    ]);

    console.log('✅ Usuarios creados');

    // Crear categorías
    const categorias = await Categoria.insertMany([
      { nombre: 'Repuestos Motor', descripcion: 'Piezas y repuestos para motor' },
      { nombre: 'Frenos', descripcion: 'Sistema de frenos' },
      { nombre: 'Suspensión', descripcion: 'Amortiguadores y suspensión' },
      { nombre: 'Eléctrico', descripcion: 'Componentes eléctricos' },
      { nombre: 'Lubricantes', descripcion: 'Aceites y lubricantes' },
      { nombre: 'Filtros', descripcion: 'Filtros de aire, aceite y combustible' },
    ]);

    console.log('✅ Categorías creadas');

    // Crear productos
    await Producto.insertMany([
      {
        codigo: 'MOT-001',
        nombre: 'Bujía NGK Iridium',
        descripcion: 'Bujía de alto rendimiento',
        categoria: categorias[0]._id,
        unidadMedida: 'unidad',
        stockActual: 50,
        stockMinimo: 10,
        precioCompra: 8500,
        precioVenta: 12000,
        precioPromedio: 8500,
      },
      {
        codigo: 'MOT-002',
        nombre: 'Correa de distribución',
        descripcion: 'Correa de distribución universal',
        categoria: categorias[0]._id,
        unidadMedida: 'unidad',
        stockActual: 15,
        stockMinimo: 5,
        precioCompra: 45000,
        precioVenta: 65000,
        precioPromedio: 45000,
      },
      {
        codigo: 'FRE-001',
        nombre: 'Pastillas de freno delanteras',
        descripcion: 'Pastillas de freno cerámicas',
        categoria: categorias[1]._id,
        unidadMedida: 'juego',
        stockActual: 8,
        stockMinimo: 10,
        precioCompra: 35000,
        precioVenta: 55000,
        precioPromedio: 35000,
      },
      {
        codigo: 'FRE-002',
        nombre: 'Disco de freno ventilado',
        descripcion: 'Disco de freno ventilado 280mm',
        categoria: categorias[1]._id,
        unidadMedida: 'unidad',
        stockActual: 12,
        stockMinimo: 4,
        precioCompra: 75000,
        precioVenta: 110000,
        precioPromedio: 75000,
      },
      {
        codigo: 'SUS-001',
        nombre: 'Amortiguador delantero',
        descripcion: 'Amortiguador gas delantero',
        categoria: categorias[2]._id,
        unidadMedida: 'unidad',
        stockActual: 6,
        stockMinimo: 4,
        precioCompra: 120000,
        precioVenta: 180000,
        precioPromedio: 120000,
      },
      {
        codigo: 'ELE-001',
        nombre: 'Batería 12V 60Ah',
        descripcion: 'Batería libre de mantenimiento',
        categoria: categorias[3]._id,
        unidadMedida: 'unidad',
        stockActual: 3,
        stockMinimo: 5,
        precioCompra: 180000,
        precioVenta: 250000,
        precioPromedio: 180000,
      },
      {
        codigo: 'LUB-001',
        nombre: 'Aceite Motor 5W-30 1L',
        descripcion: 'Aceite sintético para motor',
        categoria: categorias[4]._id,
        unidadMedida: 'litro',
        stockActual: 100,
        stockMinimo: 20,
        precioCompra: 12000,
        precioVenta: 18000,
        precioPromedio: 12000,
      },
      {
        codigo: 'FIL-001',
        nombre: 'Filtro de aceite',
        descripcion: 'Filtro de aceite universal',
        categoria: categorias[5]._id,
        unidadMedida: 'unidad',
        stockActual: 30,
        stockMinimo: 10,
        precioCompra: 8000,
        precioVenta: 14000,
        precioPromedio: 8000,
      },
      {
        codigo: 'FIL-002',
        nombre: 'Filtro de aire',
        descripcion: 'Filtro de aire de papel',
        categoria: categorias[5]._id,
        unidadMedida: 'unidad',
        stockActual: 2,
        stockMinimo: 8,
        precioCompra: 15000,
        precioVenta: 22000,
        precioPromedio: 15000,
      },
    ]);

    console.log('✅ Productos creados');
    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📋 Credenciales de prueba:');
    console.log('  Admin:    admin@aoa.com     / admin123');
    console.log('  Operador: operador@aoa.com  / oper123');
    console.log('  Viewer:   viewer@aoa.com    / viewer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seed();
