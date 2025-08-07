const express = require('express');
const { firebaseAuth, requireAdmin } = require('./middleware/firebaseAuth');

const app = express();
app.use(express.json());

// Middleware para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Ruta de prueba sin autenticación
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta con autenticación
app.get('/test-auth', firebaseAuth, requireAdmin, (req, res) => {
  res.json({ 
    message: 'Autenticación exitosa',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Ruta para probar token
app.post('/test-token', firebaseAuth, (req, res) => {
  res.json({ 
    message: 'Token válido',
    user: req.user,
    tokenLength: req.header('Authorization')?.replace('Bearer ', '').length,
    timestamp: new Date().toISOString()
  });
});

// Ruta que simula las rutas de sincronización
app.get('/sync/legacy/stats', firebaseAuth, requireAdmin, (req, res) => {
  res.json({
    message: 'Estadísticas de sincronización',
    stats: {
      productos: 10,
      pedidos: 5,
      clientes: 3
    }
  });
});

app.post('/sync/legacy', firebaseAuth, requireAdmin, (req, res) => {
  res.json({
    message: 'Sincronización completada exitosamente',
    results: {
      products: { synced: 5, updated: 2 },
      sales: { synced: 3 },
      clients: { synced: 1 }
    }
  });
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`🧪 Servidor de prueba completo corriendo en puerto ${PORT}`);
  console.log('📝 Endpoints de prueba:');
  console.log('  GET  /test - Sin autenticación');
  console.log('  GET  /test-auth - Con autenticación');
  console.log('  POST /test-token - Probar token');
  console.log('  GET  /sync/legacy/stats - Simular stats');
  console.log('  POST /sync/legacy - Simular sync');
});
