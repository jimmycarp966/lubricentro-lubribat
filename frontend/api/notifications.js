// Vercel Serverless Function para notificaciones
export default function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Simular base de datos en memoria
  let notifications = JSON.parse(req.headers['x-notifications'] || '[]')

  if (req.method === 'GET') {
    console.log('📡 GET /api/notifications - Enviando', notifications.length, 'notificaciones')
    res.status(200).json(notifications)
  } else if (req.method === 'POST') {
    const nuevaNotificacion = {
      id: Date.now().toString(),
      ...req.body,
      timestamp: new Date().toISOString()
    }
    notifications.unshift(nuevaNotificacion)
    console.log('📡 POST /api/notifications - Notificación creada:', nuevaNotificacion.id)
    res.status(200).json({ success: true, notification: nuevaNotificacion })
  } else {
    res.status(405).json({ error: 'Método no permitido' })
  }
} 