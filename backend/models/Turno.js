const mongoose = require('mongoose')

const turnoSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true
  },
  horario: {
    type: String,
    required: true
  },
  servicio: {
    id: {
      type: String,
      required: true
    },
    nombre: {
      type: String,
      required: true
    },
    duracion: {
      type: Number,
      required: true
    }
  },
  cliente: {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    apellido: {
      type: String,
      required: true,
      trim: true
    },
    whatsapp: {
      type: String,
      required: true,
      trim: true
    },
    patente: {
      type: String,
      required: true,
      trim: true
    },
    modelo: {
      type: String,
      required: true,
      trim: true
    }
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmado', 'cancelado', 'completado'],
    default: 'pendiente'
  },
  notas: {
    type: String,
    trim: true
  },
  confirmadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmadoAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Index for efficient queries
turnoSchema.index({ fecha: 1, horario: 1 })
turnoSchema.index({ estado: 1 })

// Virtual for full name
turnoSchema.virtual('cliente.nombreCompleto').get(function() {
  return `${this.cliente.nombre} ${this.cliente.apellido}`
})

// Method to check if time slot is available
turnoSchema.statics.isTimeSlotAvailable = async function(fecha, horario) {
  const existingTurno = await this.findOne({
    fecha: fecha,
    horario: horario,
    estado: { $nin: ['cancelado'] }
  })
  return !existingTurno
}

// Method to get available time slots for a date
turnoSchema.statics.getAvailableTimeSlots = async function(fecha) {
  const turnos = await this.find({
    fecha: fecha,
    estado: { $nin: ['cancelado'] }
  })
  
  const occupiedSlots = turnos.map(turno => turno.horario)
  
  // Generate all possible time slots (8:00 to 17:00, every 45 minutes)
  const allSlots = []
  for (let hour = 8; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 45) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      allSlots.push(time)
    }
  }
  
  return allSlots.filter(slot => !occupiedSlots.includes(slot))
}

module.exports = mongoose.model('Turno', turnoSchema) 