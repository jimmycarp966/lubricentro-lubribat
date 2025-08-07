const mongoose = require('mongoose');

const cajaSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  turno: {
    type: String,
    required: true,
    enum: ['mañana', 'tarde', 'noche'],
    default: 'mañana'
  },
  apertura: {
    hora: {
      type: Date,
      required: true
    },
    monto: {
      type: Number,
      required: true,
      default: 0
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  cierre: {
    hora: {
      type: Date
    },
    monto: {
      type: Number,
      default: 0
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    diferencia: {
      type: Number,
      default: 0
    }
  },
  ventas: {
    efectivo: {
      type: Number,
      default: 0
    },
    tarjeta: {
      type: Number,
      default: 0
    },
    transferencia: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  gastos: {
    type: Number,
    default: 0
  },
  observaciones: {
    type: String,
    default: ''
  },
  estado: {
    type: String,
    enum: ['abierta', 'cerrada'],
    default: 'abierta'
  },
  origen: {
    type: String,
    enum: ['web', 'legacy_sync'],
    default: 'web'
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
cajaSchema.index({ fecha: 1, turno: 1 });
cajaSchema.index({ estado: 1 });

// Método para calcular totales
cajaSchema.methods.calcularTotales = function() {
  this.ventas.total = this.ventas.efectivo + this.ventas.tarjeta + this.ventas.transferencia;
  
  if (this.cierre.hora && this.cierre.monto) {
    this.cierre.diferencia = this.cierre.monto - this.apertura.monto;
  }
  
  return this;
};

// Método estático para obtener caja actual
cajaSchema.statics.getCajaActual = function(turno = 'mañana') {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  return this.findOne({
    fecha: {
      $gte: hoy,
      $lt: new Date(hoy.getTime() + 24 * 60 * 60 * 1000)
    },
    turno: turno,
    estado: 'abierta'
  });
};

// Método estático para crear nueva caja
cajaSchema.statics.crearCaja = function(datos) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  return this.create({
    fecha: hoy,
    turno: datos.turno || 'mañana',
    apertura: {
      hora: new Date(),
      monto: datos.montoApertura || 0,
      usuario: datos.usuarioId
    },
    ventas: {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
      total: 0
    }
  });
};

module.exports = mongoose.model('Caja', cajaSchema);
