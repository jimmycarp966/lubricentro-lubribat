const mongoose = require('mongoose')

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  categoria: {
    type: String,
    enum: ['aceite', 'filtro', 'lubricante', 'accesorio', 'otro'],
    default: 'otro'
  },
  marca: {
    type: String,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  imagen: {
    type: String
  }
}, {
  timestamps: true
})

// Index for efficient queries
productoSchema.index({ nombre: 'text', descripcion: 'text' })
productoSchema.index({ categoria: 1 })
productoSchema.index({ activo: 1 })

// Method to update stock
productoSchema.methods.updateStock = async function(cantidad) {
  this.stock = Math.max(0, this.stock + cantidad)
  return this.save()
}

// Method to check if product is available
productoSchema.methods.isAvailable = function() {
  return this.activo && this.stock > 0
}

// Virtual for price with currency
productoSchema.virtual('precioFormateado').get(function() {
  return `$${this.precio.toFixed(2)}`
})

module.exports = mongoose.model('Producto', productoSchema) 