const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Producto = require('../models/Producto')
require('dotenv').config()

const initializeDatabase = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lubricentro')
    console.log('✅ Conectado a MongoDB')

    // Crear usuario administrador
    const adminExists = await User.findOne({ email: 'admin@lubricentro.com' })
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await User.create({
        email: 'admin@lubricentro.com',
        password: hashedPassword,
        nombre: 'Administrador',
        apellido: 'Sistema',
        role: 'admin',
        activo: true
      })
      console.log('✅ Usuario administrador creado')
    }

    // Crear mayorista de prueba
    const mayoristaExists = await User.findOne({ email: 'mayorista@test.com' })
    if (!mayoristaExists) {
      const hashedPassword = await bcrypt.hash('mayorista123', 10)
      await User.create({
        email: 'mayorista@test.com',
        password: hashedPassword,
        nombre: 'Mayorista',
        apellido: 'Prueba',
        role: 'mayorista',
        activo: true
      })
      console.log('✅ Usuario mayorista de prueba creado')
    }

    // Crear productos de ejemplo
    const productosEjemplo = [
      {
        nombre: 'Aceite de Motor 5W-30',
        descripcion: 'Aceite sintético de alta calidad para motores modernos',
        sku: 'ACE-5W30-1L',
        precio: 2500,
        stock: 50,
        categoria: 'aceite',
        marca: 'Shell'
      },
      {
        nombre: 'Filtro de Aceite',
        descripcion: 'Filtro de aceite de alta eficiencia',
        sku: 'FIL-ACE-001',
        precio: 800,
        stock: 30,
        categoria: 'filtro',
        marca: 'Mann'
      },
      {
        nombre: 'Aceite de Transmisión',
        descripcion: 'Aceite específico para transmisiones automáticas',
        sku: 'ACE-TRANS-1L',
        precio: 3200,
        stock: 25,
        categoria: 'aceite',
        marca: 'Castrol'
      },
      {
        nombre: 'Filtro de Aire',
        descripcion: 'Filtro de aire de alto rendimiento',
        sku: 'FIL-AIRE-001',
        precio: 1200,
        stock: 40,
        categoria: 'filtro',
        marca: 'K&N'
      },
      {
        nombre: 'Lubricante de Dirección',
        descripcion: 'Lubricante para sistema de dirección asistida',
        sku: 'LUB-DIR-500ML',
        precio: 1800,
        stock: 20,
        categoria: 'lubricante',
        marca: 'Penrite'
      }
    ]

    for (const producto of productosEjemplo) {
      const exists = await Producto.findOne({ sku: producto.sku })
      if (!exists) {
        await Producto.create(producto)
      }
    }
    console.log('✅ Productos de ejemplo creados')

    console.log('\n🎉 Base de datos inicializada correctamente!')
    console.log('\n📋 Credenciales de acceso:')
    console.log('👨‍💼 Admin: admin@lubricentro.com / admin123')
    console.log('🏪 Mayorista: mayorista@test.com / mayorista123')
    console.log('\n🚀 Puedes iniciar el servidor con: npm run dev')

  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error)
  } finally {
    await mongoose.disconnect()
  }
}

initializeDatabase() 