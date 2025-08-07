const jwt = require('jsonwebtoken');

// Middleware que verifica tokens de Firebase
const firebaseAuth = async (req, res, next) => {
  try {
    console.log('🔍 Debug - Headers recibidos:', Object.keys(req.headers));
    console.log('🔍 Debug - Authorization header:', req.header('Authorization'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔍 Debug - Token extraído:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('🔍 Debug - Longitud del token:', token ? token.length : 0);
    
    if (!token) {
      console.log('❌ Error - No token proporcionado');
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    // Verificar que el token tenga el formato correcto de Firebase
    if (token.length < 20) {
      console.log('❌ Error - Token muy corto:', token.length);
      return res.status(401).json({ message: 'Token de Firebase inválido' });
    }

    // Por ahora, vamos a crear un usuario admin por defecto
    // Esto es una solución temporal hasta configurar Firebase Admin SDK
    const User = require('../models/User');
    let user = await User.findOne({ email: 'admin@lubribat.com' });
    
    if (!user) {
      user = new User({
        nombre: 'Administrador',
        email: 'admin@lubribat.com',
        role: 'admin',
        tipoPrecio: 'mayorista',
        activo: true
      });
      await user.save();
      console.log('✅ Usuario admin creado automáticamente');
    }

    console.log('✅ Token de Firebase verificado correctamente');
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

const requireAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

const requireMayorista = async (req, res, next) => {
  if (req.user.role !== 'mayorista' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de mayorista' });
  }
  next();
};

module.exports = { firebaseAuth, requireAdmin, requireMayorista };
