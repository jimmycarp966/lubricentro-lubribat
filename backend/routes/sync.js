const express = require('express');
const { firebaseAuth, requireAdmin } = require('../middleware/firebaseAuth');
const legacySync = require('../services/legacySync');
const fileWatcher = require('../services/fileWatcher');

const router = express.Router();

// Ruta de prueba sin autenticación
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API de sincronización funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba para estadísticas sin autenticación
router.get('/test/stats', (req, res) => {
  res.json({
    message: 'Estadísticas de prueba',
    stats: {
      productos: 0,
      pedidos: 0,
      clientes: 0
    }
  });
});

// Sincronizar todos los datos del 4 y 5 de agosto
router.post('/legacy', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    console.log('🔄 Iniciando sincronización desde sistema legacy...');
    
    const results = await legacySync.syncAll();
    
    res.json({
      message: 'Sincronización completada exitosamente',
      results,
      targetDates: ['2025-08-04', '2025-08-05']
    });
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    res.status(500).json({ 
      message: 'Error durante la sincronización',
      error: error.message 
    });
  }
});

// Sincronizar solo productos
router.post('/legacy/products', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const results = await legacySync.syncProducts();
    res.json({
      message: 'Productos sincronizados exitosamente',
      results
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error sincronizando productos',
      error: error.message 
    });
  }
});

// Sincronizar solo ventas
router.post('/legacy/sales', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const results = await legacySync.syncSales();
    res.json({
      message: 'Ventas sincronizadas exitosamente',
      results
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error sincronizando ventas',
      error: error.message 
    });
  }
});

// Sincronizar solo clientes
router.post('/legacy/clients', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const results = await legacySync.syncClients();
    res.json({
      message: 'Clientes sincronizados exitosamente',
      results
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error sincronizando clientes',
      error: error.message 
    });
  }
});

// Obtener estadísticas de sincronización
router.get('/legacy/stats', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const stats = await legacySync.getSyncStats();
    res.json({
      message: 'Estadísticas de sincronización',
      stats
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error obteniendo estadísticas',
      error: error.message 
    });
  }
});

// Control de sincronización automática
router.post('/legacy/auto/start', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    fileWatcher.startWatching();
    res.json({
      message: 'Monitoreo automático iniciado',
      status: fileWatcher.getStatus()
    });
  } catch (error) {
    console.error('❌ Error iniciando monitoreo:', error);
    res.status(500).json({
      message: 'Error iniciando monitoreo automático',
      error: error.message
    });
  }
});

router.post('/legacy/auto/stop', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    fileWatcher.stopWatching();
    res.json({
      message: 'Monitoreo automático detenido',
      status: fileWatcher.getStatus()
    });
  } catch (error) {
    console.error('❌ Error deteniendo monitoreo:', error);
    res.status(500).json({
      message: 'Error deteniendo monitoreo automático',
      error: error.message
    });
  }
});

router.get('/legacy/auto/status', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    res.json({
      status: fileWatcher.getStatus()
    });
  } catch (error) {
    console.error('❌ Error obteniendo estado:', error);
    res.status(500).json({
      message: 'Error obteniendo estado del monitoreo',
      error: error.message
    });
  }
});

module.exports = router;
