const express = require('express');
const { firebaseAuth, requireAdmin } = require('../middleware/firebaseAuth');
const Caja = require('../models/Caja');
const Pedido = require('../models/Pedido');

const router = express.Router();

// Obtener todas las cajas
router.get('/', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const { fecha, turno, estado } = req.query;
    let filtro = {};

    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000);
      filtro.fecha = { $gte: fechaInicio, $lt: fechaFin };
    }

    if (turno) filtro.turno = turno;
    if (estado) filtro.estado = estado;

    const cajas = await Caja.find(filtro)
      .populate('apertura.usuario', 'nombre email')
      .populate('cierre.usuario', 'nombre email')
      .sort({ fecha: -1, turno: 1 });

    res.json({
      message: 'Cajas obtenidas exitosamente',
      cajas
    });
  } catch (error) {
    console.error('Error obteniendo cajas:', error);
    res.status(500).json({
      message: 'Error obteniendo cajas',
      error: error.message
    });
  }
});

// Obtener caja actual
router.get('/actual', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const { turno = 'mañana' } = req.query;
    const caja = await Caja.getCajaActual(turno);

    if (!caja) {
      return res.json({
        message: 'No hay caja abierta para este turno',
        caja: null
      });
    }

    res.json({
      message: 'Caja actual obtenida',
      caja
    });
  } catch (error) {
    console.error('Error obteniendo caja actual:', error);
    res.status(500).json({
      message: 'Error obteniendo caja actual',
      error: error.message
    });
  }
});

// Abrir nueva caja
router.post('/abrir', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const { turno, montoApertura } = req.body;

    // Verificar si ya existe una caja abierta para este turno
    const cajaExistente = await Caja.getCajaActual(turno);
    if (cajaExistente) {
      return res.status(400).json({
        message: `Ya existe una caja abierta para el turno ${turno}`
      });
    }

    const caja = await Caja.crearCaja({
      turno,
      montoApertura: parseFloat(montoApertura) || 0,
      usuarioId: req.user._id
    });

    res.json({
      message: 'Caja abierta exitosamente',
      caja
    });
  } catch (error) {
    console.error('Error abriendo caja:', error);
    res.status(500).json({
      message: 'Error abriendo caja',
      error: error.message
    });
  }
});

// Cerrar caja
router.post('/cerrar/:id', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { montoCierre, observaciones } = req.body;

    const caja = await Caja.findById(id);
    if (!caja) {
      return res.status(404).json({
        message: 'Caja no encontrada'
      });
    }

    if (caja.estado === 'cerrada') {
      return res.status(400).json({
        message: 'La caja ya está cerrada'
      });
    }

    // Calcular ventas del período
    const ventas = await Pedido.aggregate([
      {
        $match: {
          fecha: {
            $gte: caja.apertura.hora,
            $lte: new Date()
          },
          estado: 'completado'
        }
      },
      {
        $group: {
          _id: '$metodoPago',
          total: { $sum: '$total' }
        }
      }
    ]);

    // Actualizar ventas en la caja
    const ventasPorMetodo = {};
    ventas.forEach(venta => {
      ventasPorMetodo[venta._id] = venta.total;
    });

    caja.ventas = {
      efectivo: ventasPorMetodo.efectivo || 0,
      tarjeta: ventasPorMetodo.tarjeta || 0,
      transferencia: ventasPorMetodo.transferencia || 0,
      total: ventas.reduce((sum, v) => sum + v.total, 0)
    };

    // Cerrar caja
    caja.cierre = {
      hora: new Date(),
      monto: parseFloat(montoCierre) || 0,
      usuario: req.user._id,
      diferencia: parseFloat(montoCierre) - caja.apertura.monto
    };

    caja.observaciones = observaciones || '';
    caja.estado = 'cerrada';
    caja.calcularTotales();

    await caja.save();

    res.json({
      message: 'Caja cerrada exitosamente',
      caja
    });
  } catch (error) {
    console.error('Error cerrando caja:', error);
    res.status(500).json({
      message: 'Error cerrando caja',
      error: error.message
    });
  }
});

// Obtener resumen de cajas por fecha
router.get('/resumen/:fecha', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const { fecha } = req.params;
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000);

    const cajas = await Caja.find({
      fecha: { $gte: fechaInicio, $lt: fechaFin }
    }).populate('apertura.usuario', 'nombre');

    const resumen = {
      fecha: fecha,
      totalVentas: 0,
      totalEfectivo: 0,
      totalTarjeta: 0,
      totalTransferencia: 0,
      cajas: cajas.map(caja => ({
        turno: caja.turno,
        estado: caja.estado,
        apertura: caja.apertura.monto,
        cierre: caja.cierre?.monto || 0,
        ventas: caja.ventas,
        diferencia: caja.cierre?.diferencia || 0
      }))
    };

    // Calcular totales
    cajas.forEach(caja => {
      resumen.totalVentas += caja.ventas.total;
      resumen.totalEfectivo += caja.ventas.efectivo;
      resumen.totalTarjeta += caja.ventas.tarjeta;
      resumen.totalTransferencia += caja.ventas.transferencia;
    });

    res.json({
      message: 'Resumen de cajas obtenido',
      resumen
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({
      message: 'Error obteniendo resumen',
      error: error.message
    });
  }
});

// Sincronizar cajas desde sistema legacy
router.post('/sync-legacy', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    console.log('🔄 Sincronizando cajas desde sistema legacy...');
    
    // Aquí iría la lógica para sincronizar cajas desde el sistema legacy
    // Por ahora retornamos un mensaje de placeholder
    
    res.json({
      message: 'Sincronización de cajas completada',
      results: {
        cajas: { synced: 0, updated: 0 }
      }
    });
  } catch (error) {
    console.error('Error sincronizando cajas:', error);
    res.status(500).json({
      message: 'Error sincronizando cajas',
      error: error.message
    });
  }
});

module.exports = router;
