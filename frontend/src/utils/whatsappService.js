// Servicio para enviar mensajes de WhatsApp automáticamente

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

LUBRI-BAT
Servicio de calidad desde 2000`

  // Crear el enlace de WhatsApp
  const numeroWhatsApp = whatsapp.replace(/\D/g, '') // Solo números
  const mensajeCodificado = encodeURIComponent(mensaje)
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`

  return {
    url: urlWhatsApp,
    mensaje: mensaje,
    numero: numeroWhatsApp
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

LUBRI-BAT`

  const numeroWhatsApp = whatsapp.replace(/\D/g, '')
  const mensajeCodificado = encodeURIComponent(mensaje)
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`

  return {
    url: urlWhatsApp,
    mensaje: mensaje,
    numero: numeroWhatsApp
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

LUBRI-BAT`

  const numeroWhatsApp = whatsapp.replace(/\D/g, '')
  const mensajeCodificado = encodeURIComponent(mensaje)
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`

  return {
    url: urlWhatsApp,
    mensaje: mensaje,
    numero: numeroWhatsApp
  }
} 