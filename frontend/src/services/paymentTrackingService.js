import { ref, push, set, get, query, orderByChild, equalTo } from 'firebase/database'
import { database } from '../firebase/config'
import toast from 'react-hot-toast'

// Estructura de datos para tracking de pagos
const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

const PAYMENT_METHODS = {
  MERCADOPAGO_WALLET: 'mercadopago_wallet',
  RAPIPAGO: 'rapipago',
  PAGOFACIL: 'pagofacil',
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMEX: 'amex'
}

// Función para registrar un pago en Firebase
export const registerPayment = async (paymentData) => {
  try {
    const paymentRef = ref(database, 'payments')
    const newPaymentRef = push(paymentRef)
    
    const paymentRecord = {
      id: newPaymentRef.key,
      turnoId: paymentData.turnoId,
      cliente: paymentData.cliente,
      servicio: paymentData.servicio,
      sucursal: paymentData.sucursal,
      fecha: paymentData.fecha,
      horario: paymentData.horario,
      monto: paymentData.monto,
      metodoPago: paymentData.metodoPago,
      estado: PAYMENT_STATUS.PENDING,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      mercadopagoId: paymentData.mercadopagoId || null,
      externalReference: paymentData.externalReference,
      detalles: {
        metodo: paymentData.metodoPago,
        descripcion: `${paymentData.servicio} - ${paymentData.sucursal}`,
        cliente: paymentData.cliente,
        vehiculo: paymentData.vehiculo || 'No especificado'
      }
    }

    await set(newPaymentRef, paymentRecord)
    
    console.log('✅ Pago registrado:', paymentRecord)
    return {
      success: true,
      paymentId: newPaymentRef.key,
      payment: paymentRecord
    }
  } catch (error) {
    console.error('❌ Error registrando pago:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Función para actualizar estado de pago
export const updatePaymentStatus = async (paymentId, newStatus, additionalData = {}) => {
  try {
    const paymentRef = ref(database, `payments/${paymentId}`)
    const paymentSnapshot = await get(paymentRef)
    
    if (!paymentSnapshot.exists()) {
      throw new Error('Pago no encontrado')
    }

    const currentPayment = paymentSnapshot.val()
    const updatedPayment = {
      ...currentPayment,
      estado: newStatus,
      fechaActualizacion: new Date().toISOString(),
      ...additionalData
    }

    await set(paymentRef, updatedPayment)
    
    console.log(`✅ Estado de pago actualizado: ${paymentId} -> ${newStatus}`)
    
    // Si el pago fue aprobado, actualizar el turno
    if (newStatus === PAYMENT_STATUS.APPROVED) {
      await updateTurnoStatus(currentPayment.turnoId, 'confirmado')
      toast.success('Pago aprobado - Turno confirmado')
    }
    
    return {
      success: true,
      payment: updatedPayment
    }
  } catch (error) {
    console.error('❌ Error actualizando estado de pago:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Función para obtener todos los pagos
export const getAllPayments = async () => {
  try {
    const paymentsRef = ref(database, 'payments')
    const paymentsQuery = query(paymentsRef, orderByChild('fechaCreacion'))
    const snapshot = await get(paymentsQuery)
    
    if (!snapshot.exists()) {
      return []
    }

    const payments = []
    snapshot.forEach((childSnapshot) => {
      payments.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      })
    })

    return payments.reverse() // Más recientes primero
  } catch (error) {
    console.error('❌ Error obteniendo pagos:', error)
    return []
  }
}

// Función para obtener pagos por estado
export const getPaymentsByStatus = async (status) => {
  try {
    const paymentsRef = ref(database, 'payments')
    const paymentsQuery = query(paymentsRef, orderByChild('estado'), equalTo(status))
    const snapshot = await get(paymentsQuery)
    
    if (!snapshot.exists()) {
      return []
    }

    const payments = []
    snapshot.forEach((childSnapshot) => {
      payments.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      })
    })

    return payments
  } catch (error) {
    console.error('❌ Error obteniendo pagos por estado:', error)
    return []
  }
}

// Función para obtener pagos por método
export const getPaymentsByMethod = async (method) => {
  try {
    const paymentsRef = ref(database, 'payments')
    const paymentsQuery = query(paymentsRef, orderByChild('metodoPago'), equalTo(method))
    const snapshot = await get(paymentsQuery)
    
    if (!snapshot.exists()) {
      return []
    }

    const payments = []
    snapshot.forEach((childSnapshot) => {
      payments.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      })
    })

    return payments
  } catch (error) {
    console.error('❌ Error obteniendo pagos por método:', error)
    return []
  }
}

// Función para obtener estadísticas de pagos
export const getPaymentStats = async () => {
  try {
    const payments = await getAllPayments()
    
    const stats = {
      total: payments.length,
      aprobados: payments.filter(p => p.estado === PAYMENT_STATUS.APPROVED).length,
      pendientes: payments.filter(p => p.estado === PAYMENT_STATUS.PENDING).length,
      rechazados: payments.filter(p => p.estado === PAYMENT_STATUS.REJECTED).length,
      cancelados: payments.filter(p => p.estado === PAYMENT_STATUS.CANCELLED).length,
      montoTotal: payments
        .filter(p => p.estado === PAYMENT_STATUS.APPROVED)
        .reduce((sum, p) => sum + (p.monto || 0), 0),
      porMetodo: {},
      porSucursal: {},
      porServicio: {}
    }

    // Estadísticas por método de pago
    payments.forEach(payment => {
      const metodo = payment.metodoPago || 'desconocido'
      if (!stats.porMetodo[metodo]) {
        stats.porMetodo[metodo] = { cantidad: 0, monto: 0 }
      }
      stats.porMetodo[metodo].cantidad++
      if (payment.estado === PAYMENT_STATUS.APPROVED) {
        stats.porMetodo[metodo].monto += payment.monto || 0
      }
    })

    // Estadísticas por sucursal
    payments.forEach(payment => {
      const sucursal = payment.sucursal || 'desconocida'
      if (!stats.porSucursal[sucursal]) {
        stats.porSucursal[sucursal] = { cantidad: 0, monto: 0 }
      }
      stats.porSucursal[sucursal].cantidad++
      if (payment.estado === PAYMENT_STATUS.APPROVED) {
        stats.porSucursal[sucursal].monto += payment.monto || 0
      }
    })

    // Estadísticas por servicio
    payments.forEach(payment => {
      const servicio = payment.servicio || 'desconocido'
      if (!stats.porServicio[servicio]) {
        stats.porServicio[servicio] = { cantidad: 0, monto: 0 }
      }
      stats.porServicio[servicio].cantidad++
      if (payment.estado === PAYMENT_STATUS.APPROVED) {
        stats.porServicio[servicio].monto += payment.monto || 0
      }
    })

    return stats
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de pagos:', error)
    return {
      total: 0,
      aprobados: 0,
      pendientes: 0,
      rechazados: 0,
      cancelados: 0,
      montoTotal: 0,
      porMetodo: {},
      porSucursal: {},
      porServicio: {}
    }
  }
}

// Función para actualizar estado del turno
const updateTurnoStatus = async (turnoId, newStatus) => {
  try {
    const turnoRef = ref(database, `turnos/${turnoId}`)
    const turnoSnapshot = await get(turnoRef)
    
    if (turnoSnapshot.exists()) {
      const turno = turnoSnapshot.val()
      await set(turnoRef, {
        ...turno,
        estado: newStatus,
        fechaActualizacion: new Date().toISOString()
      })
      console.log(`✅ Turno ${turnoId} actualizado a estado: ${newStatus}`)
    }
  } catch (error) {
    console.error('❌ Error actualizando turno:', error)
  }
}

// Función para simular webhook de MercadoPago
export const simulateMercadoPagoWebhook = async (paymentId, status) => {
  try {
    const result = await updatePaymentStatus(paymentId, status, {
      mercadopagoStatus: status,
      webhookReceived: new Date().toISOString()
    })
    
    return result
  } catch (error) {
    console.error('❌ Error simulando webhook:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Función para obtener pagos recientes (últimas 24 horas)
export const getRecentPayments = async () => {
  try {
    const payments = await getAllPayments()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    return payments.filter(payment => {
      const paymentDate = new Date(payment.fechaCreacion)
      return paymentDate > twentyFourHoursAgo
    })
  } catch (error) {
    console.error('❌ Error obteniendo pagos recientes:', error)
    return []
  }
}

export { PAYMENT_STATUS, PAYMENT_METHODS } 