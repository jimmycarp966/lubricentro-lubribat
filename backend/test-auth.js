const express = require('express');
const { firebaseAuth, requireAdmin } = require('./middleware/firebaseAuth');

const app = express();
app.use(express.json());

// Ruta de prueba sin autenticación
app.get('/test', (req, res) => {
  res.json({ message: 'API funcionando' });
});

// Ruta con autenticación
app.get('/test-auth', firebaseAuth, requireAdmin, (req, res) => {
  res.json({ 
    message: 'Autenticación exitosa',
    user: req.user 
  });
});

// Ruta para probar token
app.post('/test-token', firebaseAuth, (req, res) => {
  res.json({ 
    message: 'Token válido',
    user: req.user,
    tokenLength: req.header('Authorization')?.replace('Bearer ', '').length
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🧪 Servidor de prueba corriendo en puerto ${PORT}`);
  console.log('📝 Endpoints de prueba:');
  console.log('  GET  /test - Sin autenticación');
  console.log('  GET  /test-auth - Con autenticación');
  console.log('  POST /test-token - Probar token');
});
