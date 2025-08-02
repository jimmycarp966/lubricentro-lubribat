const express = require('express')
const { body, validationResult } = require('express-validator')
const Producto = require('../models/Producto')
const { auth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Get all productos (public for mayoristas)
router.get('/', auth, async (req, res) => {
  try {
    const { categoria, search, activo = true } = req.query
    const filter = { activo: activo === 'true' }
    
    if (categoria) {
      filter.categoria = categoria
    }
    
    if (search) {
      filter.$text = { $search: search }
    }

    const productos = await Producto.find(filter).sort({ nombre: 1 })
    res.json(productos)
  } catch (error) {
    console.error('Get productos error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get producto by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const producto = await Producto.findById(id)

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    res.json(producto)
  } catch (error) {
    console.error('Get producto error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Create producto (admin only)
router.post('/', [
  auth,
  requireAdmin,
  body('nombre').trim().isLength({ min: 2 }),
  body('descripcion').optional().trim(),
  body('sku').trim().isLength({ min: 3 }),
  body('precio').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  body('categoria').optional().isIn(['aceite', 'filtro', 'lubricante', 'accesorio', 'otro']),
  body('marca').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: errors.array() 
      })
    }

    const { nombre, descripcion, sku, precio, stock, categoria, marca } = req.body

    // Check if SKU already exists
    const existingProducto = await Producto.findOne({ sku })
    if (existingProducto) {
      return res.status(400).json({ message: 'El SKU ya existe' })
    }

    const producto = new Producto({
      nombre,
      descripcion,
      sku,
      precio,
      stock,
      categoria: categoria || 'otro',
      marca
    })

    await producto.save()
    res.status(201).json(producto)
  } catch (error) {
    console.error('Create producto error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Update producto (admin only)
router.put('/:id', [
  auth,
  requireAdmin,
  body('nombre').optional().trim().isLength({ min: 2 }),
  body('descripcion').optional().trim(),
  body('precio').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('categoria').optional().isIn(['aceite', 'filtro', 'lubricante', 'accesorio', 'otro']),
  body('marca').optional().trim(),
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

    const producto = await Producto.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    res.json(producto)
  } catch (error) {
    console.error('Update producto error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Delete producto (admin only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const producto = await Producto.findByIdAndDelete(id)

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    res.json({ message: 'Producto eliminado exitosamente' })
  } catch (error) {
    console.error('Delete producto error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Update stock (admin only)
router.patch('/:id/stock', [
  auth,
  requireAdmin,
  body('cantidad').isInt()
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
    const { cantidad } = req.body

    const producto = await Producto.findById(id)
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    await producto.updateStock(cantidad)
    res.json(producto)
  } catch (error) {
    console.error('Update stock error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Bulk update stock (admin only)
router.post('/bulk-stock', [
  auth,
  requireAdmin,
  body('productos').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: errors.array() 
      })
    }

    const { productos } = req.body

    const updates = productos.map(async (item) => {
      const producto = await Producto.findById(item.id)
      if (producto) {
        await producto.updateStock(item.cantidad)
        return producto
      }
    })

    await Promise.all(updates)

    res.json({ message: 'Stock actualizado exitosamente' })
  } catch (error) {
    console.error('Bulk stock update error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get low stock productos (admin only)
router.get('/admin/low-stock', auth, requireAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const productos = await Producto.find({
      stock: { $lte: 5 },
      activo: true
    })
    .sort({ stock: 1 })
    .limit(parseInt(limit))

    res.json(productos)
  } catch (error) {
    console.error('Get low stock error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Get productos by categoria
router.get('/categoria/:categoria', auth, async (req, res) => {
  try {
    const { categoria } = req.params
    const productos = await Producto.find({
      categoria,
      activo: true
    }).sort({ nombre: 1 })

    res.json(productos)
  } catch (error) {
    console.error('Get productos by categoria error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Search productos
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params
    const productos = await Producto.find({
      $text: { $search: query },
      activo: true
    }).sort({ score: { $meta: 'textScore' } })

    res.json(productos)
  } catch (error) {
    console.error('Search productos error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

module.exports = router 