import { ref, push, set, get, update } from 'firebase/database'
import { database } from '../firebase/config'
import { createPaymentPreference } from './mercadopagoService'

// Tipos de pago disponibles
export const PAYMENT_METHODS = {
  EFECTIVO: 'efectivo',
  TRANSFERENCIA: 'transferencia',
  MERCADOPAGO: 'mercadopago',
  TARJETA_PRESENCIAL: 'tarjeta_presencial',
  PAGO_FACIL: 'pago_facil',
  RAPIPAGO: 'rapipago'
}

// Estados de pago
export const PAYMENT_STATUS = {
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
  RECHAZADO: 'rechazado',
  CANCELADO: 'cancelado',
  REEMBOLSADO: 'reembolsado'
}

// Crear un nuevo pago
export const createPayment = async (paymentData) => {
  try {
    const paymentRef = ref(database, 'pagos')
    const newPaymentRef = push(paymentRef)
    
    const payment = {
      id: newPaymentRef.key,
      ...paymentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: PAYMENT_STATUS.PENDIENTE
    }
    
    await set(newPaymentRef, payment)
    console.log('✅ Pago creado:', payment)
    return { success: true, paymentId: newPaymentRef.key, payment }
  } catch (error) {
    console.error('❌ Error creando pago:', error)
    return { success: false, error: error.message }
  }
}

// Procesar pago con MercadoPago
export const processMercadoPagoPayment = async (paymentData) => {
  try {
    // Crear preferencia en MercadoPago
    const mpResult = await createPaymentPreference(paymentData)
    
    if (mpResult.success) {
      // Guardar pago en Firebase
      const payment = await createPayment({
        ...paymentData,
        method: PAYMENT_METHODS.MERCADOPAGO,
        mercadopagoId: mpResult.paymentId,
        paymentUrl: mpResult.sandbox_init_point
      })
      
      return {
        success: true,
        paymentId: payment.paymentId,
        paymentUrl: mpResult.sandbox_init_point,
        mercadopagoId: mpResult.paymentId
      }
    } else {
      return { success: false, error: 'Error creando preferencia de pago' }
    }
  } catch (error) {
    console.error('❌ Error procesando pago MercadoPago:', error)
    return { success: false, error: error.message }
  }
}

// Procesar pago en efectivo
export const processCashPayment = async (paymentData) => {
  try {
    const payment = await createPayment({
      ...paymentData,
      method: PAYMENT_METHODS.EFECTIVO,
      status: PAYMENT_STATUS.PAGADO, // Efectivo se marca como pagado inmediatamente
      paidAt: new Date().toISOString()
    })
    
    return {
      success: true,
      paymentId: payment.paymentId,
      status: PAYMENT_STATUS.PAGADO
    }
  } catch (error) {
    console.error('❌ Error procesando pago en efectivo:', error)
    return { success: false, error: error.message }
  }
}

// Procesar pago por transferencia
export const processTransferPayment = async (paymentData) => {
  try {
    const payment = await createPayment({
      ...paymentData,
      method: PAYMENT_METHODS.TRANSFERENCIA,
      status: PAYMENT_STATUS.PENDIENTE,
      transferInfo: {
        accountNumber: '123-456789/0',
        bank: 'Banco Tucumán',
        cbu: '1234567890123456789012'
      }
    })
    
    return {
      success: true,
      paymentId: payment.paymentId,
      status: PAYMENT_STATUS.PENDIENTE,
      transferInfo: payment.payment.transferInfo
    }
  } catch (error) {
    console.error('❌ Error procesando pago por transferencia:', error)
    return { success: false, error: error.message }
  }
}

// Procesar pago con tarjeta presencial
export const processCardPayment = async (paymentData) => {
  try {
    const payment = await createPayment({
      ...paymentData,
      method: PAYMENT_METHODS.TARJETA_PRESENCIAL,
      status: PAYMENT_STATUS.PAGADO,
      paidAt: new Date().toISOString()
    })
    
    return {
      success: true,
      paymentId: payment.paymentId,
      status: PAYMENT_STATUS.PAGADO
    }
  } catch (error) {
    console.error('❌ Error procesando pago con tarjeta:', error)
    return { success: false, error: error.message }
  }
}

// Obtener todos los pagos
export const getPayments = async () => {
  try {
    const paymentsRef = ref(database, 'pagos')
    const snapshot = await get(paymentsRef)
    
    if (snapshot.exists()) {
      const payments = []
      snapshot.forEach((childSnapshot) => {
        payments.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        })
      })
      return payments
    }
    return []
  } catch (error) {
    console.error('❌ Error obteniendo pagos:', error)
    return []
  }
}

// Obtener pagos por cliente
export const getPaymentsByClient = async (clientId) => {
  try {
    const paymentsRef = ref(database, 'pagos')
    const snapshot = await get(paymentsRef)
    
    if (snapshot.exists()) {
      const payments = []
      snapshot.forEach((childSnapshot) => {
        const payment = childSnapshot.val()
        if (payment.clientId === clientId) {
          payments.push({
            id: childSnapshot.key,
            ...payment
          })
        }
      })
      return payments
    }
    return []
  } catch (error) {
    console.error('❌ Error obteniendo pagos del cliente:', error)
    return []
  }
}

// Actualizar estado de pago
export const updatePaymentStatus = async (paymentId, status, additionalData = {}) => {
  try {
    const paymentRef = ref(database, `pagos/${paymentId}`)
    await update(paymentRef, {
      status,
      updatedAt: new Date().toISOString(),
      ...additionalData
    })
    
    console.log(`✅ Estado de pago actualizado: ${paymentId} -> ${status}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Error actualizando estado de pago:', error)
    return { success: false, error: error.message }
  }
}

// Confirmar pago y actualizar inventario
export const confirmPayment = async (paymentId) => {
  try {
    // Actualizar estado del pago
    await updatePaymentStatus(paymentId, PAYMENT_STATUS.PAGADO, {
      paidAt: new Date().toISOString()
    })
    
    // Obtener datos del pago
    const paymentRef = ref(database, `pagos/${paymentId}`)
    const snapshot = await get(paymentRef)
    
    if (snapshot.exists()) {
      const payment = snapshot.val()
      
      // Si es un turno, actualizar inventario
      if (payment.turnoId) {
        await updateInventoryForTurno(payment)
      }
      
      // Si es un pedido mayorista, actualizar inventario
      if (payment.pedidoId) {
        await updateInventoryForPedido(payment)
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('❌ Error confirmando pago:', error)
    return { success: false, error: error.message }
  }
}

// Actualizar inventario para turno
const updateInventoryForTurno = async (payment) => {
  try {
    const { turnoId, servicio, sucursal } = payment
    
    // Obtener productos necesarios para el servicio
    const productosNecesarios = getProductosForService(servicio)
    
    // Actualizar inventario
    for (const producto of productosNecesarios) {
      const inventarioRef = ref(database, `inventario/${producto.id}`)
      const snapshot = await get(inventarioRef)
      
      if (snapshot.exists()) {
        const inventario = snapshot.val()
        const nuevaCantidad = Math.max(0, inventario.cantidad - producto.cantidad)
        
        await update(inventarioRef, {
          cantidad: nuevaCantidad,
          updatedAt: new Date().toISOString()
        })
        
        // Registrar movimiento
        await registrarMovimientoInventario({
          tipo: 'venta',
          productoId: producto.id,
          cantidad: -producto.cantidad,
          sucursal,
          turnoId,
          paymentId: payment.id,
          motivo: `Venta por servicio: ${servicio}`
        })
      }
    }
    
    console.log('✅ Inventario actualizado para turno:', turnoId)
  } catch (error) {
    console.error('❌ Error actualizando inventario para turno:', error)
  }
}

// Actualizar inventario para pedido mayorista
const updateInventoryForPedido = async (payment) => {
  try {
    const { pedidoId, items } = payment
    
    // Actualizar inventario para cada item
    for (const item of items) {
      const inventarioRef = ref(database, `inventario/${item.producto.id}`)
      const snapshot = await get(inventarioRef)
      
      if (snapshot.exists()) {
        const inventario = snapshot.val()
        const nuevaCantidad = inventario.cantidad + item.cantidad
        
        await update(inventarioRef, {
          cantidad: nuevaCantidad,
          updatedAt: new Date().toISOString()
        })
        
        // Registrar movimiento
        await registrarMovimientoInventario({
          tipo: 'compra',
          productoId: item.producto.id,
          cantidad: item.cantidad,
          pedidoId,
          paymentId: payment.id,
          motivo: `Compra mayorista: ${item.producto.nombre}`
        })
      }
    }
    
    console.log('✅ Inventario actualizado para pedido:', pedidoId)
  } catch (error) {
    console.error('❌ Error actualizando inventario para pedido:', error)
  }
}

// Registrar movimiento de inventario
const registrarMovimientoInventario = async (movimiento) => {
  try {
    const movimientosRef = ref(database, 'inventario_movimientos')
    const newMovimientoRef = push(movimientosRef)
    
    await set(newMovimientoRef, {
      id: newMovimientoRef.key,
      ...movimiento,
      createdAt: new Date().toISOString()
    })
    
    console.log('✅ Movimiento de inventario registrado:', movimiento)
  } catch (error) {
    console.error('❌ Error registrando movimiento de inventario:', error)
  }
}

// Obtener productos necesarios para un servicio
const getProductosForService = (servicio) => {
  const productosPorServicio = {
    'cambio-aceite': [
      { id: 'aceite-motor', cantidad: 1, nombre: 'Aceite de Motor' },
      { id: 'filtro-aceite', cantidad: 1, nombre: 'Filtro de Aceite' }
    ],
    'revision-general': [
      { id: 'aceite-motor', cantidad: 1, nombre: 'Aceite de Motor' },
      { id: 'filtro-aceite', cantidad: 1, nombre: 'Filtro de Aceite' },
      { id: 'filtro-aire', cantidad: 1, nombre: 'Filtro de Aire' }
    ],
    'cambio-filtros': [
      { id: 'filtro-aceite', cantidad: 1, nombre: 'Filtro de Aceite' },
      { id: 'filtro-aire', cantidad: 1, nombre: 'Filtro de Aire' },
      { id: 'filtro-combustible', cantidad: 1, nombre: 'Filtro de Combustible' }
    ],
    'lubricacion': [
      { id: 'aceite-motor', cantidad: 1, nombre: 'Aceite de Motor' },
      { id: 'filtro-aceite', cantidad: 1, nombre: 'Filtro de Aceite' },
      { id: 'grasa', cantidad: 1, nombre: 'Grasa Multipropósito' }
    ]
  }
  
  return productosPorServicio[servicio] || []
}

// Obtener estadísticas de pagos
export const getPaymentStats = async () => {
  try {
    const payments = await getPayments()
    
    const stats = {
      total: payments.length,
      pagados: payments.filter(p => p.status === PAYMENT_STATUS.PAGADO).length,
      pendientes: payments.filter(p => p.status === PAYMENT_STATUS.PENDIENTE).length,
      totalAmount: payments
        .filter(p => p.status === PAYMENT_STATUS.PAGADO)
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      byMethod: {}
    }
    
    // Agrupar por método de pago
    payments.forEach(payment => {
      const method = payment.method || 'desconocido'
      if (!stats.byMethod[method]) {
        stats.byMethod[method] = {
          count: 0,
          amount: 0
        }
      }
      stats.byMethod[method].count++
      stats.byMethod[method].amount += payment.amount || 0
    })
    
    return stats
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de pagos:', error)
    return {
      total: 0,
      pagados: 0,
      pendientes: 0,
      totalAmount: 0,
      byMethod: {}
    }
  }
} 