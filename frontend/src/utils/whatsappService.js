// Servicio para enviar mensajes de WhatsApp automáticamente

// CONFIGURACIÓN DEL NEGOCIO
const BUSINESS_CONFIG = {
  // CAMBIAR ESTE NÚMERO POR EL NÚMERO DE WHATSAPP BUSINESS DEL LUBRICENTRO
  whatsappNumber: '5493815123456', // Ejemplo: 5493815123456 (código país + código área + número)
  businessName: 'LUBRI-BAT',
  businessDescription: 'Servicio de calidad desde 2000'
}

export const sendWhatsAppMessage = (turnoData) => {
  const {
    nombre,
    apellido,
    whatsapp,
    fecha,
    horario,
    servicio,
    sucursal
  } = turnoData

  // Formatear la fecha
  const fechaFormateada = new Date(fecha).toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Crear el mensaje
  const mensaje = `¡Hola ${nombre} ${apellido}! 🚗

✅ Tu turno ha sido confirmado exitosamente:

📅 Fecha: ${fechaFormateada}
⏰ Horario: ${horario}
🔧 Servicio: ${servicio}
🏢 Sucursal: ${sucursal}

📱 Para cualquier consulta, respondé a este mensaje.

¡Te esperamos! 🛠️

${BUSINESS_CONFIG.businessName}
${BUSINESS_CONFIG.businessDescription}`

  // Crear el enlace de WhatsApp usando el número del NEGOCIO
  const numeroCliente = whatsapp.replace(/\D/g, '') // Solo números del cliente
  const mensajeCodificado = encodeURIComponent(mensaje)
  
  // URL para que el negocio envíe mensaje al cliente
  const urlWhatsApp = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${mensajeCodificado}`

  return {
    url: urlWhatsApp,
    mensaje: mensaje,
    numeroNegocio: BUSINESS_CONFIG.whatsappNumber,
    numeroCliente: numeroCliente
  }
}

export const sendReminderMessage = (turnoData) => {
  const {
    nombre,
    apellido,
    whatsapp,
    fecha,
    horario,
    servicio,
    sucursal
  } = turnoData

  const fechaFormateada = new Date(fecha).toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const mensaje = `¡Hola ${nombre} ${apellido}! 🚗

⏰ Recordatorio de tu turno para mañana:

📅 Fecha: ${fechaFormateada}
⏰ Horario: ${horario}
🔧 Servicio: ${servicio}
🏢 Sucursal: ${sucursal}

📱 Si necesitás cambiar o cancelar, contactanos.

¡Te esperamos! 🛠️

${BUSINESS_CONFIG.businessName}`

  const numeroCliente = whatsapp.replace(/\D/g, '')
  const mensajeCodificado = encodeURIComponent(mensaje)
  const urlWhatsApp = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${mensajeCodificado}`

  return {
    url: urlWhatsApp,
    mensaje: mensaje,
    numeroNegocio: BUSINESS_CONFIG.whatsappNumber,
    numeroCliente: numeroCliente
  }
}

export const sendCompletionMessage = (turnoData) => {
  const {
    nombre,
    apellido,
    whatsapp,
    servicio,
    sucursal
  } = turnoData

  const mensaje = `¡Hola ${nombre} ${apellido}! 🚗

✅ Tu servicio ha sido completado exitosamente:

🔧 Servicio: ${servicio}
🏢 Sucursal: ${sucursal}

⭐ ¿Cómo fue tu experiencia?
Valoranos en: [link a reseñas]

📱 Para próximos servicios, contactanos.

¡Gracias por elegirnos! 🛠️

${BUSINESS_CONFIG.businessName}`

  const numeroCliente = whatsapp.replace(/\D/g, '')
  const mensajeCodificado = encodeURIComponent(mensaje)
  const urlWhatsApp = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${mensajeCodificado}`

  return {
    url: urlWhatsApp,
    mensaje: mensaje,
    numeroNegocio: BUSINESS_CONFIG.whatsappNumber,
    numeroCliente: numeroCliente
  }
}

// Función para configurar el número del negocio
export const setBusinessWhatsAppNumber = (newNumber) => {
  BUSINESS_CONFIG.whatsappNumber = newNumber.replace(/\D/g, '')
  console.log('Número de WhatsApp Business configurado:', BUSINESS_CONFIG.whatsappNumber)
}

// Función para obtener la configuración actual
export const getBusinessConfig = () => {
  return { ...BUSINESS_CONFIG }
} 