const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Token de acceso requerido' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
}

const requireAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador' })
  }
  next()
}

const requireMayorista = async (req, res, next) => {
  if (req.user.role !== 'mayorista' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de mayorista' })
  }
  next()
}

module.exports = { auth, requireAdmin, requireMayorista } 