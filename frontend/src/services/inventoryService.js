import { ref, get, set, push, query, orderByChild, equalTo } from 'firebase/database'
import { database } from '../firebase/config'
import toast from 'react-hot-toast'

// Categorías de productos
export const PRODUCT_CATEGORIES = {
  'aceites': 'Aceites',
  'filtros': 'Filtros',
  'liquidos': 'Líquidos',
  'repuestos': 'Repuestos',
  'accesorios': 'Accesorios',
  'herramientas': 'Herramientas',
  'otros': 'Otros'
}

// Niveles de stock
export const STOCK_LEVELS = {
  CRITICAL: 5,
  LOW: 15,
  NORMAL: 50
}

// Función para obtener productos con filtros avanzados
export const getProductosAvanzado = async (filters = {}) => {
  try {
    const productosRef = ref(database, 'productos')
    let productosQuery = productosRef

    // Aplicar filtros
    if (filters.categoria) {
      productosQuery = query(productosRef, orderByChild('categoria'), equalTo(filters.categoria))
    }

    const snapshot = await get(productosQuery)
    const productos = []

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const producto = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        }
        
        // Aplicar filtros adicionales
        if (filters.stockMin && producto.stock < filters.stockMin) return
        if (filters.stockMax && producto.stock > filters.stockMax) return
        if (filters.precioMin && producto.precio < filters.precioMin) return
        if (filters.precioMax && producto.precio > filters.precioMax) return
        
        productos.push(producto)
      })
    }

    return productos
  } catch (error) {
    console.error('Error obteniendo productos avanzado:', error)
    throw error
  }
}

// Función para obtener alertas de inventario
export const getInventoryAlerts = async () => {
  try {
    const productos = await getProductosAvanzado()
    const alerts = []

    productos.forEach(producto => {
      if (producto.stock <= STOCK_LEVELS.CRITICAL) {
        alerts.push({
          type: 'critical',
          message: `Stock crítico: ${producto.nombre} (${producto.stock} unidades)`,
          producto: producto
        })
      } else if (producto.stock <= STOCK_LEVELS.LOW) {
        alerts.push({
          type: 'warning',
          message: `Stock bajo: ${producto.nombre} (${producto.stock} unidades)`,
          producto: producto
        })
      }
    })

    return alerts
  } catch (error) {
    console.error('Error obteniendo alertas de inventario:', error)
    return []
  }
}

// Función para registrar movimiento de inventario
export const registrarMovimientoInventario = async (movimiento) => {
  try {
    const movimientosRef = ref(database, 'inventario_movimientos')
    const nuevoMovimientoRef = push(movimientosRef)
    
    const movimientoCompleto = {
      ...movimiento,
      timestamp: Date.now(),
      fecha: new Date().toISOString()
    }

    await set(nuevoMovimientoRef, movimientoCompleto)
    
    // Actualizar stock del producto
    const productoRef = ref(database, `productos/${movimiento.productoId}`)
    const productoSnapshot = await get(productoRef)
    
    if (productoSnapshot.exists()) {
      const producto = productoSnapshot.val()
      const nuevoStock = producto.stock + (movimiento.tipo === 'entrada' ? movimiento.cantidad : -movimiento.cantidad)
      
      await set(productoRef, {
        ...producto,
        stock: Math.max(0, nuevoStock),
        ultimaActualizacion: Date.now()
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error registrando movimiento de inventario:', error)
    throw error
  }
}

// Función para obtener historial de movimientos
export const getHistorialMovimientos = async (filters = {}) => {
  try {
    const movimientosRef = ref(database, 'inventario_movimientos')
    let movimientosQuery = query(movimientosRef, orderByChild('timestamp'))

    const snapshot = await get(movimientosQuery)
    const movimientos = []

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const movimiento = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        }
        
        // Aplicar filtros
        if (filters.productoId && movimiento.productoId !== filters.productoId) return
        if (filters.tipo && movimiento.tipo !== filters.tipo) return
        if (filters.fechaDesde && new Date(movimiento.timestamp) < new Date(filters.fechaDesde)) return
        if (filters.fechaHasta && new Date(movimiento.timestamp) > new Date(filters.fechaHasta)) return
        
        movimientos.push(movimiento)
      })
    }

    return movimientos.reverse() // Más recientes primero
  } catch (error) {
    console.error('Error obteniendo historial de movimientos:', error)
    return []
  }
}

// Función para obtener estadísticas de inventario
export const getInventoryStats = async () => {
  try {
    const productos = await getProductosAvanzado()
    
    const stats = {
      totalProductos: productos.length,
      stockCritico: productos.filter(p => p.stock <= STOCK_LEVELS.CRITICAL).length,
      stockBajo: productos.filter(p => p.stock <= STOCK_LEVELS.LOW && p.stock > STOCK_LEVELS.CRITICAL).length,
      stockNormal: productos.filter(p => p.stock > STOCK_LEVELS.LOW).length,
      valorTotal: productos.reduce((sum, p) => sum + (p.precio * p.stock), 0),
      categorias: {}
    }

    // Estadísticas por categoría
    Object.keys(PRODUCT_CATEGORIES).forEach(categoria => {
      const productosCategoria = productos.filter(p => p.categoria === categoria)
      stats.categorias[categoria] = {
        cantidad: productosCategoria.length,
        stockTotal: productosCategoria.reduce((sum, p) => sum + p.stock, 0),
        valorTotal: productosCategoria.reduce((sum, p) => sum + (p.precio * p.stock), 0)
      }
    })

    return stats
  } catch (error) {
    console.error('Error obteniendo estadísticas de inventario:', error)
    return {}
  }
} 