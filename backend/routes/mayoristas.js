const express = require('express')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { auth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Get all mayoristas (admin only)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { activo = true } = req.query
    const filter = { role: 'mayorista' }
    
    if (activo !== undefined) {
      filter.activo = activo === 'true'
    }

    const mayoristas = await User.find(filter)
      .select('-password')
      .sort({ nombre: 1 })

    res.json(mayoristas)
  } catch (error) {
    console.error('Get mayoristas error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get mayorista by ID
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const mayorista = await User.findById(id).select('-password')

    if (!mayorista || mayorista.role !== 'mayorista') {
      return res.status(404).json({ message: 'Mayorista no encontrado' })
    }

    res.json(mayorista)
  } catch (error) {
    console.error('Get mayorista error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Create mayorista (admin only)
router.post('/', [
  auth,
  requireAdmin,
  body('nombre').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('telefono').optional().trim(),
  body('direccion').optional().trim(),
  body('tipoPrecio').optional().isIn(['minorista', 'mayorista', 'taller_amigo'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: errors.array() 
      })
    }

    const { nombre, email, password, telefono, direccion, tipoPrecio } = req.body

    // Check if email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }

    const mayorista = new User({
      nombre,
      email,
      password,
      role: 'mayorista',
      telefono,
      direccion,
      tipoPrecio: tipoPrecio || 'mayorista'
    })

    await mayorista.save()

    res.status(201).json({
      message: 'Mayorista creado exitosamente',
      mayorista: {
        id: mayorista._id,
        nombre: mayorista.nombre,
        email: mayorista.email,
        telefono: mayorista.telefono,
        direccion: mayorista.direccion,
        tipoPrecio: mayorista.tipoPrecio,
        activo: mayorista.activo
      }
    })
  } catch (error) {
    console.error('Create mayorista error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Update mayorista (admin only)
router.put('/:id', [
  auth,
  requireAdmin,
  body('nombre').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('telefono').optional().trim(),
  body('direccion').optional().trim(),
  body('tipoPrecio').optional().isIn(['minorista', 'mayorista', 'taller_amigo']),
  body('activo').optional().isBoolean()
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

    // Check if email is being updated and if it already exists
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } 
      })
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está registrado' })
      }
    }

    const mayorista = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!mayorista || mayorista.role !== 'mayorista') {
      return res.status(404).json({ message: 'Mayorista no encontrado' })
    }

    res.json({
      message: 'Mayorista actualizado exitosamente',
      mayorista
    })
  } catch (error) {
    console.error('Update mayorista error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Delete mayorista (admin only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const mayorista = await User.findById(id)

    if (!mayorista || mayorista.role !== 'mayorista') {
      return res.status(404).json({ message: 'Mayorista no encontrado' })
    }

    // Soft delete - just mark as inactive
    mayorista.activo = false
    await mayorista.save()

    res.json({ message: 'Mayorista desactivado exitosamente' })
  } catch (error) {
    console.error('Delete mayorista error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Reactivate mayorista (admin only)
router.patch('/:id/reactivate', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const mayorista = await User.findById(id)

    if (!mayorista || mayorista.role !== 'mayorista') {
      return res.status(404).json({ message: 'Mayorista no encontrado' })
    }

    mayorista.activo = true
    await mayorista.save()

    res.json({ message: 'Mayorista reactivado exitosamente' })
  } catch (error) {
    console.error('Reactivate mayorista error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Change mayorista password (admin only)
router.patch('/:id/password', [
  auth,
  requireAdmin,
  body('newPassword').isLength({ min: 6 })
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
    const { newPassword } = req.body

    const mayorista = await User.findById(id)
    if (!mayorista || mayorista.role !== 'mayorista') {
      return res.status(404).json({ message: 'Mayorista no encontrado' })
    }

    mayorista.password = newPassword
    await mayorista.save()

    res.json({ message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error('Change mayorista password error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get mayorista statistics (admin only)
router.get('/admin/stats', auth, requireAdmin, async (req, res) => {
  try {
    const totalMayoristas = await User.countDocuments({ role: 'mayorista' })
    const activosMayoristas = await User.countDocuments({ 
      role: 'mayorista', 
      activo: true 
    })
    const inactivosMayoristas = await User.countDocuments({ 
      role: 'mayorista', 
      activo: false 
    })

    const stats = {
      total: totalMayoristas,
      activos: activosMayoristas,
      inactivos: inactivosMayoristas
    }

    res.json(stats)
  } catch (error) {
    console.error('Get mayorista stats error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get mayoristas by tipo precio
router.get('/admin/tipo-precio/:tipo', auth, requireAdmin, async (req, res) => {
  try {
    const { tipo } = req.params
    const mayoristas = await User.find({
      role: 'mayorista',
      tipoPrecio: tipo,
      activo: true
    })
    .select('-password')
    .sort({ nombre: 1 })

    res.json(mayoristas)
  } catch (error) {
    console.error('Get mayoristas by tipo precio error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

module.exports = router 