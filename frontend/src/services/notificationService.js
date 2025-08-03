import toast from 'react-hot-toast'

// Solicitar permisos de notificaciones
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    toast.error('Las notificaciones están bloqueadas. Por favor, habilítalas en tu navegador.')
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Enviar notificación push
export const sendPushNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false
  }

  const defaultOptions = {
    icon: '/logo.png',
    badge: '/logo.png',
    requireInteraction: true,
    ...options
  }

  const notification = new Notification(title, defaultOptions)

  // Manejar clics en la notificación
  notification.onclick = (event) => {
    event.preventDefault()
    window.focus()
    notification.close()
    
    // Navegar a la página correspondiente si se especifica
    if (options.url) {
      window.location.href = options.url
    }
  }

  return notification
}

// Notificaciones específicas para turnos
export const sendTurnoConfirmationNotification = (turno) => {
  const title = '✅ Turno Confirmado'
  const body = `Tu turno para ${turno.servicio} el ${turno.fecha} a las ${turno.horario} ha sido confirmado.`
  
  return sendPushNotification(title, {
    body,
    tag: `turno-${turno.id}`,
    data: { turnoId: turno.id, type: 'turno-confirmation' }
  })
}

export const sendTurnoReminderNotification = (turno) => {
  const title = '⏰ Recordatorio de Turno'
  const body = `Recordatorio: Tu turno para ${turno.servicio} es mañana a las ${turno.horario}.`
  
  return sendPushNotification(title, {
    body,
    tag: `reminder-${turno.id}`,
    data: { turnoId: turno.id, type: 'turno-reminder' }
  })
}

export const sendTurnoCompletionNotification = (turno) => {
  const title = '🎉 Servicio Completado'
  const body = `Tu servicio de ${turno.servicio} ha sido completado. ¡Gracias por elegirnos!`
  
  return sendPushNotification(title, {
    body,
    tag: `completion-${turno.id}`,
    data: { turnoId: turno.id, type: 'turno-completion' }
  })
}

// Notificaciones para administradores
export const sendAdminNotification = (title, message, type = 'info') => {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '🚨',
    success: '✅'
  }

  const fullTitle = `${icons[type]} ${title}`
  
  return sendPushNotification(fullTitle, {
    body: message,
    tag: `admin-${Date.now()}`,
    data: { type: 'admin-notification' }
  })
}

// Notificaciones de inventario
export const sendLowStockNotification = (producto) => {
  const title = '📦 Stock Bajo'
  const body = `El producto "${producto.nombre}" tiene stock bajo (${producto.stock} unidades).`
  
  return sendPushNotification(title, {
    body,
    tag: `stock-${producto.id}`,
    data: { productoId: producto.id, type: 'low-stock' }
  })
}

// Notificaciones de WhatsApp
export const sendWhatsAppNotification = (turno) => {
  const title = '📱 WhatsApp Enviado'
  const body = `Se envió un mensaje de WhatsApp para el turno de ${turno.cliente?.nombre}.`
  
  return sendPushNotification(title, {
    body,
    tag: `whatsapp-${turno.id}`,
    data: { turnoId: turno.id, type: 'whatsapp-sent' }
  })
}

// Sistema de notificaciones en tiempo real
export class NotificationManager {
  constructor() {
    this.subscribers = new Map()
    this.notificationQueue = []
    this.isProcessing = false
  }

  // Suscribirse a notificaciones
  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, [])
    }
    this.subscribers.get(type).push(callback)
  }

  // Desuscribirse de notificaciones
  unsubscribe(type, callback) {
    if (this.subscribers.has(type)) {
      const callbacks = this.subscribers.get(type)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // Publicar notificación
  publish(type, data) {
    if (this.subscribers.has(type)) {
      this.subscribers.get(type).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error en callback de notificación:', error)
        }
      })
    }
  }

  // Agregar notificación a la cola
  queueNotification(notification) {
    this.notificationQueue.push(notification)
    this.processQueue()
  }

  // Procesar cola de notificaciones
  async processQueue() {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift()
      
      try {
        await this.sendNotification(notification)
        // Esperar un poco entre notificaciones
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Error enviando notificación:', error)
      }
    }

    this.isProcessing = false
  }

  // Enviar notificación
  async sendNotification(notification) {
    const { type, title, options } = notification

    // Enviar notificación push si está habilitada
    if (Notification.permission === 'granted') {
      sendPushNotification(title, options)
    }

    // Mostrar toast
    switch (type) {
      case 'success':
        toast.success(title)
        break
      case 'error':
        toast.error(title)
        break
      case 'warning':
        toast(title, { icon: '⚠️' })
        break
      default:
        toast(title)
    }

    // Publicar para suscriptores
    this.publish(type, { title, options })
  }
}

// Instancia global del gestor de notificaciones
export const notificationManager = new NotificationManager()

// Funciones de conveniencia
export const notify = {
  success: (title, options = {}) => {
    notificationManager.queueNotification({ type: 'success', title, options })
  },
  error: (title, options = {}) => {
    notificationManager.queueNotification({ type: 'error', title, options })
  },
  warning: (title, options = {}) => {
    notificationManager.queueNotification({ type: 'warning', title, options })
  },
  info: (title, options = {}) => {
    notificationManager.queueNotification({ type: 'info', title, options })
  }
} 