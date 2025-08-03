import { ref, get, set, push, query, orderByChild } from 'firebase/database'
import { database } from '../firebase/config'
import toast from 'react-hot-toast'

// Estados de pago
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
}

// Tipos de pago
export const PAYMENT_TYPES = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  MERCADOPAGO: 'mercadopago'
}

// Función para crear una factura
export const createInvoice = async (invoiceData) => {
  try {
    const invoicesRef = ref(database, 'invoices')
    const newInvoiceRef = push(invoicesRef)
    
    const invoice = {
      id: newInvoiceRef.key,
      ...invoiceData,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    await set(newInvoiceRef, invoice)
    
    return {
      success: true,
      invoice: invoice
    }
  } catch (error) {
    console.error('Error creando factura:', error)
    throw error
  }
}

// Función para crear un pago
export const createPayment = async (paymentData) => {
  try {
    const paymentsRef = ref(database, 'payments')
    const newPaymentRef = push(paymentsRef)
    
    const payment = {
      id: newPaymentRef.key,
      ...paymentData,
      status: PAYMENT_STATUS.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    await set(newPaymentRef, payment)
    
    // Si es pago en efectivo, aprobar automáticamente
    if (paymentData.type === PAYMENT_TYPES.CASH) {
      await updatePaymentStatus(newPaymentRef.key, PAYMENT_STATUS.APPROVED)
    }
    
    return {
      success: true,
      payment: payment
    }
  } catch (error) {
    console.error('Error creando pago:', error)
    throw error
  }
}

// Función para actualizar estado de pago
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const paymentRef = ref(database, `payments/${paymentId}`)
    const paymentSnapshot = await get(paymentRef)
    
    if (paymentSnapshot.exists()) {
      const payment = paymentSnapshot.val()
      
      await set(paymentRef, {
        ...payment,
        status: status,
        updatedAt: Date.now()
      })
      
      // Si el pago es aprobado, actualizar factura
      if (status === PAYMENT_STATUS.APPROVED && payment.invoiceId) {
        await updateInvoiceStatus(payment.invoiceId, 'paid')
      }
      
      return { success: true }
    }
    
    return { success: false, error: 'Pago no encontrado' }
  } catch (error) {
    console.error('Error actualizando estado de pago:', error)
    throw error
  }
}

// Función para actualizar estado de factura
export const updateInvoiceStatus = async (invoiceId, status) => {
  try {
    const invoiceRef = ref(database, `invoices/${invoiceId}`)
    const invoiceSnapshot = await get(invoiceRef)
    
    if (invoiceSnapshot.exists()) {
      const invoice = invoiceSnapshot.val()
      
      await set(invoiceRef, {
        ...invoice,
        status: status,
        updatedAt: Date.now()
      })
      
      return { success: true }
    }
    
    return { success: false, error: 'Factura no encontrada' }
  } catch (error) {
    console.error('Error actualizando estado de factura:', error)
    throw error
  }
}

// Función para obtener pagos
export const getPayments = async (filters = {}) => {
  try {
    const paymentsRef = ref(database, 'payments')
    let paymentsQuery = query(paymentsRef, orderByChild('createdAt'))

    const snapshot = await get(paymentsQuery)
    const payments = []

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const payment = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        }
        
        // Aplicar filtros
        if (filters.status && payment.status !== filters.status) return
        if (filters.type && payment.type !== filters.type) return
        if (filters.fechaDesde && payment.createdAt < filters.fechaDesde) return
        if (filters.fechaHasta && payment.createdAt > filters.fechaHasta) return
        
        payments.push(payment)
      })
    }

    return payments.reverse() // Más recientes primero
  } catch (error) {
    console.error('Error obteniendo pagos:', error)
    return []
  }
}

// Función para obtener facturas
export const getInvoices = async (filters = {}) => {
  try {
    const invoicesRef = ref(database, 'invoices')
    let invoicesQuery = query(invoicesRef, orderByChild('createdAt'))

    const snapshot = await get(invoicesQuery)
    const invoices = []

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const invoice = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        }
        
        // Aplicar filtros
        if (filters.status && invoice.status !== filters.status) return
        if (filters.fechaDesde && invoice.createdAt < filters.fechaDesde) return
        if (filters.fechaHasta && invoice.createdAt > filters.fechaHasta) return
        
        invoices.push(invoice)
      })
    }

    return invoices.reverse() // Más recientes primero
  } catch (error) {
    console.error('Error obteniendo facturas:', error)
    return []
  }
}

// Función para obtener estadísticas de pagos
export const getPaymentStats = async () => {
  try {
    const payments = await getPayments()
    
    const stats = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      approvedPayments: payments.filter(p => p.status === PAYMENT_STATUS.APPROVED).length,
      pendingPayments: payments.filter(p => p.status === PAYMENT_STATUS.PENDING).length,
      rejectedPayments: payments.filter(p => p.status === PAYMENT_STATUS.REJECTED).length,
      byType: {},
      byStatus: {}
    }

    // Estadísticas por tipo de pago
    Object.values(PAYMENT_TYPES).forEach(type => {
      const paymentsByType = payments.filter(p => p.type === type)
      stats.byType[type] = {
        count: paymentsByType.length,
        amount: paymentsByType.reduce((sum, p) => sum + (p.amount || 0), 0)
      }
    })

    // Estadísticas por estado
    Object.values(PAYMENT_STATUS).forEach(status => {
      const paymentsByStatus = payments.filter(p => p.status === status)
      stats.byStatus[status] = {
        count: paymentsByStatus.length,
        amount: paymentsByStatus.reduce((sum, p) => sum + (p.amount || 0), 0)
      }
    })

    return stats
  } catch (error) {
    console.error('Error obteniendo estadísticas de pagos:', error)
    return {}
  }
}

// Función para generar número de factura
export const generateInvoiceNumber = async () => {
  try {
    const invoices = await getInvoices()
    const lastInvoice = invoices[0] // Más reciente
    
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.replace('FAC-', ''))
      return `FAC-${String(lastNumber + 1).padStart(6, '0')}`
    }
    
    return 'FAC-000001'
  } catch (error) {
    console.error('Error generando número de factura:', error)
    return 'FAC-000001'
  }
}

// Función para simular integración con MercadoPago
export const createMercadoPagoPayment = async (paymentData) => {
  try {
    // Simulación de creación de preferencia en MercadoPago
    const preference = {
      id: `mp_${Date.now()}`,
      init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mp_${Date.now()}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=mp_${Date.now()}`
    }
    
    // Crear pago en Firebase
    const payment = await createPayment({
      ...paymentData,
      type: PAYMENT_TYPES.MERCADOPAGO,
      mercadopagoPreferenceId: preference.id,
      mercadopagoInitPoint: preference.init_point
    })
    
    return {
      success: true,
      payment: payment.payment,
      preference: preference
    }
  } catch (error) {
    console.error('Error creando pago MercadoPago:', error)
    throw error
  }
} 