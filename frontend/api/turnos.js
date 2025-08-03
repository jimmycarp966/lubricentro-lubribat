// Vercel Serverless Function para turnos
export default function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Simular base de datos en memoria (en producción usarías una DB real)
  let turnos = JSON.parse(req.headers['x-turnos'] || '[]')
  let notifications = JSON.parse(req.headers['x-notifications'] || '[]')

  if (req.method === 'GET') {
    console.log('📡 GET /api/turnos - Enviando', turnos.length, 'turnos')
    res.status(200).json(turnos)
  } else if (req.method === 'POST') {
    const nuevoTurno = {
      _id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
    turnos.unshift(nuevoTurno)
    console.log('📡 POST /api/turnos - Turno creado:', nuevoTurno._id)
    res.status(200).json({ success: true, turno: nuevoTurno })
  } else {
    res.status(405).json({ error: 'Método no permitido' })
  }
} 