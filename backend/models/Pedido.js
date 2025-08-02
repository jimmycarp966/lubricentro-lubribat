const mongoose = require('mongoose')

const pedidoSchema = new mongoose.Schema({
  numero: {
    type: String,
    unique: true,
    required: true
  },
  mayorista: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precio: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  metodoEntrega: {
    type: String,
    enum: ['retiro', 'envio'],
    required: true
  },
  notas: {
    type: String,
    trim: true
  },
  fechaEntrega: {
    type: Date
  },
  entregadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  entregadoAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Index for efficient queries
pedidoSchema.index({ mayorista: 1, createdAt: -1 })
pedidoSchema.index({ estado: 1 })
pedidoSchema.index({ numero: 1 })

// Generate order number
pedidoSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments()
    this.numero = `PED-${String(count + 1).padStart(6, '0')}`
  }
  next()
})

// Method to calculate total
pedidoSchema.methods.calculateTotal = function() {
  return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0)
}

// Method to update stock when order is confirmed
pedidoSchema.methods.updateStock = async function() {
  for (const item of this.items) {
    const producto = await mongoose.model('Producto').findById(item.producto)
    if (producto) {
      await producto.updateStock(-item.cantidad)
    }
  }
}

// Method to check if order can be cancelled
pedidoSchema.methods.canBeCancelled = function() {
  return ['pendiente', 'en_preparacion'].includes(this.estado)
}

// Virtual for status text
pedidoSchema.virtual('estadoTexto').get(function() {
  const estados = {
    pendiente: 'Pendiente',
    en_preparacion: 'En Preparación',
    listo: 'Listo para Retirar',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  }
  return estados[this.estado] || this.estado
})

module.exports = mongoose.model('Pedido', pedidoSchema) 