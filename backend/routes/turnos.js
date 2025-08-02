const express = require('express')
const { body, validationResult } = require('express-validator')
const Turno = require('../models/Turno')
const { auth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Get all turnos (admin only)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { fecha, estado } = req.query
    const filter = {}
    
    if (fecha) {
      filter.fecha = {
        $gte: new Date(fecha),
        $lt: new Date(new Date(fecha).getTime() + 24 * 60 * 60 * 1000)
      }
    }
    
    if (estado) {
      filter.estado = estado
    }

    const turnos = await Turno.find(filter).sort({ fecha: 1, horario: 1 })
    res.json(turnos)
  } catch (error) {
    console.error('Get turnos error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get available time slots for a date
router.get('/horarios/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params
    const availableSlots = await Turno.getAvailableTimeSlots(new Date(fecha))
    res.json(availableSlots)
  } catch (error) {
    console.error('Get horarios error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Create turno (public)
router.post('/', [
  body('fecha').isISO8601(),
  body('horario').isString().isLength({ min: 4, max: 5 }),
  body('servicio.id').isString(),
  body('servicio.nombre').isString(),
  body('servicio.duracion').isInt({ min: 15, max: 120 }),
  body('nombre').trim().isLength({ min: 2 }),
  body('apellido').trim().isLength({ min: 2 }),
  body('whatsapp').trim().isLength({ min: 10 }),
  body('patente').trim().isLength({ min: 4, max: 10 }),
  body('modelo').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: errors.array() 
      })
    }

    const { fecha, horario, servicio, nombre, apellido, whatsapp, patente, modelo } = req.body

    // Check if time slot is available
    const isAvailable = await Turno.isTimeSlotAvailable(new Date(fecha), horario)
    if (!isAvailable) {
      return res.status(400).json({ message: 'Este horario no está disponible' })
    }

    const turno = new Turno({
      fecha: new Date(fecha),
      horario,
      servicio,
      cliente: {
        nombre,
        apellido,
        whatsapp,
        patente,
        modelo
      }
    })

    await turno.save()

    // TODO: Send WhatsApp confirmation
    // await sendWhatsAppConfirmation(turno)

    res.status(201).json(turno)
  } catch (error) {
    console.error('Create turno error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Update turno (admin only)
router.put('/:id', [
  auth,
  requireAdmin,
  body('fecha').optional().isISO8601(),
  body('horario').optional().isString().isLength({ min: 4, max: 5 }),
  body('estado').optional().isIn(['pendiente', 'confirmado', 'cancelado', 'completado'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: errors.array() 
      })
    }

    const { id } = req.params
    const updateData = req.body

    // If updating fecha/horario, check availability
    if (updateData.fecha && updateData.horario) {
      const isAvailable = await Turno.isTimeSlotAvailable(
        new Date(updateData.fecha), 
        updateData.horario
      )
      if (!isAvailable) {
        return res.status(400).json({ message: 'Este horario no está disponible' })
      }
    }

    // If confirming turno, add confirmation data
    if (updateData.estado === 'confirmado') {
      updateData.confirmadoPor = req.user._id
      updateData.confirmadoAt = new Date()
    }

    const turno = await Turno.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!turno) {
      return res.status(404).json({ message: 'Turno no encontrado' })
    }

    res.json(turno)
  } catch (error) {
    console.error('Update turno error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Delete turno (admin only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const turno = await Turno.findByIdAndDelete(id)

    if (!turno) {
      return res.status(404).json({ message: 'Turno no encontrado' })
    }

    res.json({ message: 'Turno eliminado exitosamente' })
  } catch (error) {
    console.error('Delete turno error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get turno by ID
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const turno = await Turno.findById(id)

    if (!turno) {
      return res.status(404).json({ message: 'Turno no encontrado' })
    }

    res.json(turno)
  } catch (error) {
    console.error('Get turno error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Bulk operations (admin only)
router.post('/bulk-confirm', auth, requireAdmin, async (req, res) => {
  try {
    const { turnoIds } = req.body

    if (!Array.isArray(turnoIds) || turnoIds.length === 0) {
      return res.status(400).json({ message: 'IDs de turnos requeridos' })
    }

    const result = await Turno.updateMany(
      { _id: { $in: turnoIds } },
      {
        estado: 'confirmado',
        confirmadoPor: req.user._id,
        confirmadoAt: new Date()
      }
    )

    res.json({
      message: `${result.modifiedCount} turnos confirmados exitosamente`
    })
  } catch (error) {
    console.error('Bulk confirm error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

module.exports = router 