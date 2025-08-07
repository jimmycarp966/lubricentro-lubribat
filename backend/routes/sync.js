const express = require('express');
const { auth, requireAdmin } = require('../middleware/auth');
const legacySync = require('../services/legacySync');

const router = express.Router();

// Sincronizar todos los datos del 4 y 5 de agosto
router.post('/legacy', auth, requireAdmin, async (req, res) => {
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
router.post('/legacy/products', auth, requireAdmin, async (req, res) => {
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
router.post('/legacy/sales', auth, requireAdmin, async (req, res) => {
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
router.post('/legacy/clients', auth, requireAdmin, async (req, res) => {
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
router.get('/legacy/stats', auth, requireAdmin, async (req, res) => {
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

module.exports = router;
