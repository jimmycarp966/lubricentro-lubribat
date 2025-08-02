const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { auth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: errors.array() 
      })
    }

    const { email, password } = req.body

    const user = await User.findOne({ email, activo: true })
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        tipoPrecio: user.tipoPrecio
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Register (solo admin puede crear usuarios)
router.post('/register', [
  auth,
  requireAdmin,
  body('nombre').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'mayorista']),
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

    const { nombre, email, password, role, telefono, direccion, tipoPrecio } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }

    const user = new User({
      nombre,
      email,
      password,
      role,
      telefono,
      direccion,
      tipoPrecio: tipoPrecio || 'mayorista'
    })

    await user.save()

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        tipoPrecio: user.tipoPrecio
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        nombre: req.user.nombre,
        email: req.user.email,
        role: req.user.role,
        tipoPrecio: req.user.tipoPrecio,
        telefono: req.user.telefono,
        direccion: req.user.direccion
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Change password
router.put('/change-password', [
  auth,
  body('currentPassword').isLength({ min: 6 }),
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

    const { currentPassword, newPassword } = req.body

    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' })
    }

    req.user.password = newPassword
    await req.user.save()

    res.json({ message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Create initial admin user (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  router.post('/create-admin', async (req, res) => {
    try {
      const adminExists = await User.findOne({ role: 'admin' })
      if (adminExists) {
        return res.status(400).json({ message: 'Ya existe un usuario admin' })
      }

      const admin = new User({
        nombre: 'Administrador',
        email: 'admin@lubricentro.com',
        password: 'admin123',
        role: 'admin',
        tipoPrecio: 'mayorista'
      })

      await admin.save()

      res.status(201).json({
        message: 'Usuario admin creado exitosamente',
        user: {
          id: admin._id,
          nombre: admin.nombre,
          email: admin.email,
          role: admin.role
        }
      })
    } catch (error) {
      console.error('Create admin error:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  })
}

module.exports = router 