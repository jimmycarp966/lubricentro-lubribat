const express = require('express')
const { body, validationResult } = require('express-validator')
const Pedido = require('../models/Pedido')
const Producto = require('../models/Producto')
const { auth, requireAdmin, requireMayorista } = require('../middleware/auth')

const router = express.Router()

// Get all pedidos (admin only)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { estado, mayorista, fecha } = req.query
    const filter = {}
    
    if (estado) {
      filter.estado = estado
    }
    
    if (mayorista) {
      filter.mayorista = mayorista
    }
    
    if (fecha) {
      filter.createdAt = {
        $gte: new Date(fecha),
        $lt: new Date(new Date(fecha).getTime() + 24 * 60 * 60 * 1000)
      }
    }

    const pedidos = await Pedido.find(filter)
      .populate('mayorista', 'nombre email')
      .populate('items.producto', 'nombre sku')
      .sort({ createdAt: -1 })

    res.json(pedidos)
  } catch (error) {
    console.error('Get pedidos error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get pedidos for mayorista
router.get('/mayorista', auth, requireMayorista, async (req, res) => {
  try {
    const pedidos = await Pedido.find({ mayorista: req.user._id })
      .populate('items.producto', 'nombre sku')
      .sort({ createdAt: -1 })

    res.json(pedidos)
  } catch (error) {
    console.error('Get mayorista pedidos error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get pedido by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const pedido = await Pedido.findById(id)
      .populate('mayorista', 'nombre email')
      .populate('items.producto', 'nombre sku descripcion')

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    // Check if user can access this pedido
    if (req.user.role === 'mayorista' && pedido.mayorista.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acceso denegado' })
    }

    res.json(pedido)
  } catch (error) {
    console.error('Get pedido error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Create pedido (mayorista only)
router.post('/', [
  auth,
  requireMayorista,
  body('items').isArray({ min: 1 }),
  body('items.*.producto').isMongoId(),
  body('items.*.cantidad').isInt({ min: 1 }),
  body('items.*.precio').isFloat({ min: 0 }),
  body('total').isFloat({ min: 0 }),
  body('metodoEntrega').isIn(['retiro', 'envio']),
  body('notas').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: errors.array() 
      })
    }

    const { items, total, metodoEntrega, notas } = req.body

    // Validate items and check stock
    for (const item of items) {
      const producto = await Producto.findById(item.producto)
      if (!producto) {
        return res.status(400).json({ message: `Producto ${item.producto} no encontrado` })
      }
      
      if (!producto.isAvailable()) {
        return res.status(400).json({ message: `Producto ${producto.nombre} no disponible` })
      }
      
      if (producto.stock < item.cantidad) {
        return res.status(400).json({ 
          message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}` 
        })
      }
    }

    const pedido = new Pedido({
      mayorista: req.user._id,
      items,
      total,
      metodoEntrega,
      notas
    })

    await pedido.save()

    // Update stock
    await pedido.updateStock()

    // Populate for response
    await pedido.populate('items.producto', 'nombre sku')

    res.status(201).json(pedido)
  } catch (error) {
    console.error('Create pedido error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Update pedido estado (admin only)
router.put('/:id/estado', [
  auth,
  requireAdmin,
  body('estado').isIn(['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'])
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
    const { estado } = req.body

    const pedido = await Pedido.findById(id)
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    // If delivering, add delivery data
    if (estado === 'entregado') {
      pedido.entregadoPor = req.user._id
      pedido.entregadoAt = new Date()
    }

    pedido.estado = estado
    await pedido.save()

    await pedido.populate('mayorista', 'nombre email')
    await pedido.populate('items.producto', 'nombre sku')

    res.json(pedido)
  } catch (error) {
    console.error('Update pedido estado error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Cancel pedido (mayorista can cancel their own, admin can cancel any)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const { id } = req.params
    const pedido = await Pedido.findById(id)

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    // Check permissions
    if (req.user.role === 'mayorista' && pedido.mayorista.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acceso denegado' })
    }

    if (!pedido.canBeCancelled()) {
      return res.status(400).json({ message: 'No se puede cancelar este pedido' })
    }

    pedido.estado = 'cancelado'
    await pedido.save()

    // Restore stock if cancelling
    for (const item of pedido.items) {
      const producto = await Producto.findById(item.producto)
      if (producto) {
        await producto.updateStock(item.cantidad)
      }
    }

    res.json({ message: 'Pedido cancelado exitosamente' })
  } catch (error) {
    console.error('Cancel pedido error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get pedido statistics (admin only)
router.get('/admin/stats', auth, requireAdmin, async (req, res) => {
  try {
    const totalPedidos = await Pedido.countDocuments()
    const pendientesPedidos = await Pedido.countDocuments({ estado: 'pendiente' })
    const enPreparacionPedidos = await Pedido.countDocuments({ estado: 'en_preparacion' })
    const listosPedidos = await Pedido.countDocuments({ estado: 'listo' })
    const entregadosPedidos = await Pedido.countDocuments({ estado: 'entregado' })

    const totalVentas = await Pedido.aggregate([
      { $match: { estado: { $in: ['listo', 'entregado'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])

    const stats = {
      total: totalPedidos,
      pendientes: pendientesPedidos,
      enPreparacion: enPreparacionPedidos,
      listos: listosPedidos,
      entregados: entregadosPedidos,
      totalVentas: totalVentas[0]?.total || 0
    }

    res.json(stats)
  } catch (error) {
    console.error('Get pedido stats error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get pedidos by date range (admin only)
router.get('/admin/date-range', auth, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Fecha de inicio y fin requeridas' })
    }

    const pedidos = await Pedido.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('mayorista', 'nombre email')
    .populate('items.producto', 'nombre sku')
    .sort({ createdAt: -1 })

    res.json(pedidos)
  } catch (error) {
    console.error('Get pedidos by date range error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Bulk update pedidos estado (admin only)
router.post('/admin/bulk-update-estado', [
  auth,
  requireAdmin,
  body('pedidoIds').isArray({ min: 1 }),
  body('estado').isIn(['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: errors.array() 
      })
    }

    const { pedidoIds, estado } = req.body

    const updateData = { estado }
    if (estado === 'entregado') {
      updateData.entregadoPor = req.user._id
      updateData.entregadoAt = new Date()
    }

    const result = await Pedido.updateMany(
      { _id: { $in: pedidoIds } },
      updateData
    )

    res.json({
      message: `${result.modifiedCount} pedidos actualizados exitosamente`
    })
  } catch (error) {
    console.error('Bulk update pedidos error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

module.exports = router 