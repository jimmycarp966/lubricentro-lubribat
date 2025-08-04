import toast from 'react-hot-toast'
import { registerPayment, updatePaymentStatus, PAYMENT_STATUS } from './paymentTrackingService'

// Configuración de MercadoPago (en producción usar variables de entorno)
const MERCADOPAGO_CONFIG = {
  PUBLIC_KEY: 'TEST-12345678-1234-1234-1234-123456789012', // Clave pública de prueba
  ACCESS_TOKEN: 'TEST-12345678901234567890123456789012-123456-12345678901234567890123456789012', // Token de acceso de prueba
  BASE_URL: 'https://api.mercadopago.com'
}

// Función para crear una preferencia de pago
export const createPaymentPreference = async (turnoData) => {
  try {
    console.log('🔧 Debug: Iniciando creación de preferencia de pago:', turnoData)
    
    // Registrar el pago en Firebase antes de crear la preferencia
    const paymentData = {
      turnoId: turnoData.id,
      cliente: turnoData.nombreCliente,
      servicio: turnoData.servicio,
      sucursal: turnoData.sucursal,
      fecha: turnoData.fecha,
      horario: turnoData.horario || 'No especificado',
      monto: turnoData.precio || 5000,
      metodoPago: 'mercadopago_wallet', // Por defecto
      vehiculo: turnoData.vehiculo || 'No especificado',
      externalReference: turnoData.id
    }

    console.log('🔧 Debug: Datos de pago a registrar:', paymentData)
    
    const paymentRegistration = await registerPayment(paymentData)
    console.log('🔧 Debug: Resultado del registro de pago:', paymentRegistration)
    
    if (!paymentRegistration.success) {
      console.error('❌ Error: Falló el registro de pago:', paymentRegistration.error)
      throw new Error(`Error registrando pago en el sistema: ${paymentRegistration.error}`)
    }

    // Simular creación de preferencia (en producción sería una llamada real a MercadoPago)
    const preference = {
      id: `pref_${Date.now()}`,
      items: [
        {
          id: turnoData.id,
          title: `Turno - ${turnoData.servicio}`,
          description: `Servicio: ${turnoData.servicio} - Sucursal: ${turnoData.sucursal} - Fecha: ${turnoData.fecha}`,
          quantity: 1,
          unit_price: turnoData.precio || 5000,
          currency_id: 'ARS'
        }
      ],
      payer: {
        name: turnoData.nombreCliente || 'Cliente',
        email: turnoData.emailCliente || 'cliente@example.com'
      },
      back_urls: {
        success: `${window.location.origin}/turnos/success?payment_id=${paymentRegistration.paymentId}`,
        failure: `${window.location.origin}/turnos/failure?payment_id=${paymentRegistration.paymentId}`,
        pending: `${window.location.origin}/turnos/pending?payment_id=${paymentRegistration.paymentId}`
      },
      auto_return: 'approved',
      external_reference: paymentRegistration.paymentId, // Usar el ID del pago registrado
      notification_url: `${window.location.origin}/api/webhooks/mercadopago`,
      expires: true,
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    }

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000))

    const result = {
      success: true,
      preference: preference,
      paymentId: paymentRegistration.paymentId,
      init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preference.id}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preference.id}`
    }
    
    console.log('✅ Debug: Preferencia de pago creada exitosamente:', result)
    return result
  } catch (error) {
    console.error('❌ Error creando preferencia de pago:', error)
    return {
      success: false,
      error: `Error al crear preferencia de pago: ${error.message}`
    }
  }
}

// Función para procesar el pago
export const processPayment = async (paymentData) => {
  try {
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000))

    const paymentResult = {
      id: `payment_${Date.now()}`,
      status: 'approved',
      status_detail: 'accredited',
      payment_method: {
        id: paymentData.payment_method_id || 'rapipago',
        type: paymentData.payment_type_id || 'ticket',
        installments: paymentData.installments || 1
      },
      transaction_amount: paymentData.transaction_amount,
      external_reference: paymentData.external_reference,
      created_at: new Date().toISOString()
    }

    return {
      success: true,
      payment: paymentResult
    }
  } catch (error) {
    console.error('Error procesando pago:', error)
    return {
      success: false,
      error: 'Error al procesar el pago'
    }
  }
}

// Función para verificar el estado de un pago
export const checkPaymentStatus = async (paymentId) => {
  try {
    // Simular verificación de estado
    await new Promise(resolve => setTimeout(resolve, 1000))

    const statuses = ['approved', 'pending', 'rejected', 'cancelled']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    return {
      success: true,
      status: randomStatus,
      payment_id: paymentId
    }
  } catch (error) {
    console.error('Error verificando estado de pago:', error)
    return {
      success: false,
      error: 'Error al verificar estado de pago'
    }
  }
}

// Función para obtener métodos de pago disponibles
export const getPaymentMethods = () => {
  return [
    {
      id: 'rapipago',
      name: 'RapiPago',
      type: 'ticket',
      logo: 'https://http2.mlstatic.com/static/org-img/checkout/logos/rapipago/rapipago.png',
      description: 'Paga en efectivo en cualquier sucursal de RapiPago'
    },
    {
      id: 'pagofacil',
      name: 'PagoFácil',
      type: 'ticket',
      logo: 'https://http2.mlstatic.com/static/org-img/checkout/logos/pagofacil/pagofacil.png',
      description: 'Paga en efectivo en cualquier sucursal de PagoFácil'
    },
    {
      id: 'visa',
      name: 'Visa',
      type: 'credit_card',
      logo: 'https://http2.mlstatic.com/static/org-img/checkout/logos/visa/visa.png',
      description: 'Tarjeta de crédito Visa'
    },
    {
      id: 'mastercard',
      name: 'Mastercard',
      type: 'credit_card',
      logo: 'https://http2.mlstatic.com/static/org-img/checkout/logos/mastercard/mastercard.png',
      description: 'Tarjeta de crédito Mastercard'
    },
    {
      id: 'amex',
      name: 'American Express',
      type: 'credit_card',
      logo: 'https://http2.mlstatic.com/static/org-img/checkout/logos/amex/amex.png',
      description: 'Tarjeta de crédito American Express'
    },
    {
      id: 'mercadopago',
      name: 'MercadoPago',
      type: 'digital_wallet',
      logo: 'https://http2.mlstatic.com/static/org-img/checkout/logos/mercadopago/mercadopago.png',
      description: 'Billetera digital de MercadoPago'
    }
  ]
}

// Función para manejar webhooks de MercadoPago
export const handleWebhook = async (webhookData) => {
  try {
    const { type, data } = webhookData

    switch (type) {
      case 'payment':
        // Procesar notificación de pago
        const paymentId = data.external_reference || data.id
        const paymentStatus = await checkPaymentStatus(paymentId)
        
        if (paymentStatus.success) {
          // Actualizar estado del pago en Firebase
          let newStatus
          let action
          
          switch (paymentStatus.status) {
            case 'approved':
              newStatus = PAYMENT_STATUS.APPROVED
              action = 'confirm_turno'
              toast.success('Pago aprobado - Turno confirmado')
              break
            case 'rejected':
              newStatus = PAYMENT_STATUS.REJECTED
              action = 'reject_turno'
              toast.error('Pago rechazado')
              break
            case 'pending':
              newStatus = PAYMENT_STATUS.PENDING
              action = 'pending_turno'
              toast.info('Pago pendiente de confirmación')
              break
            case 'cancelled':
              newStatus = PAYMENT_STATUS.CANCELLED
              action = 'cancel_turno'
              toast.warning('Pago cancelado')
              break
            default:
              newStatus = PAYMENT_STATUS.PENDING
              action = 'pending_turno'
          }

          // Actualizar estado del pago en Firebase
          await updatePaymentStatus(paymentId, newStatus, {
            mercadopagoPaymentId: data.id,
            mercadopagoStatus: paymentStatus.status,
            webhookReceived: new Date().toISOString()
          })

          return { success: true, action, paymentId }
        }
        break

      case 'preference':
        // Procesar notificación de preferencia
        console.log('Preferencia actualizada:', data)
        break

      default:
        console.log('Webhook no manejado:', type)
    }

    return { success: true }
  } catch (error) {
    console.error('Error procesando webhook:', error)
    return { success: false, error: error.message }
  }
}

// Función para generar URL de pago
export const generatePaymentUrl = (preferenceId, isSandbox = true) => {
  const baseUrl = isSandbox 
    ? 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect'
    : 'https://www.mercadopago.com.ar/checkout/v1/redirect'
  
  return `${baseUrl}?pref_id=${preferenceId}`
}

// Función para validar datos de pago
export const validatePaymentData = (turnoData) => {
  const errors = []

  if (!turnoData.servicio) {
    errors.push('Servicio es requerido')
  }

  if (!turnoData.precio || turnoData.precio <= 0) {
    errors.push('Precio válido es requerido')
  }

  if (!turnoData.nombreCliente) {
    errors.push('Nombre del cliente es requerido')
  }

  if (!turnoData.emailCliente) {
    errors.push('Email del cliente es requerido')
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  }
} 