const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Datos en memoria (simulando base de datos)
let turnos = []
let notifications = []

// Rutas para turnos
app.get('/api/turnos', (req, res) => {
  console.log('📡 GET /api/turnos - Enviando', turnos.length, 'turnos')
  res.json(turnos)
})

app.post('/api/turnos', (req, res) => {
  const nuevoTurno = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  }
  turnos.unshift(nuevoTurno)
  console.log('📡 POST /api/turnos - Turno creado:', nuevoTurno._id)
  res.json({ success: true, turno: nuevoTurno })
})

// Rutas para notificaciones
app.get('/api/notifications', (req, res) => {
  console.log('📡 GET /api/notifications - Enviando', notifications.length, 'notificaciones')
  res.json(notifications)
})

app.post('/api/notifications', (req, res) => {
  const nuevaNotificacion = {
    id: Date.now().toString(),
    ...req.body,
    timestamp: new Date().toISOString()
  }
  notifications.unshift(nuevaNotificacion)
  console.log('📡 POST /api/notifications - Notificación creada:', nuevaNotificacion.id)
  res.json({ success: true, notification: nuevaNotificacion })
})

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({
    turnos: turnos.length,
    notifications: notifications.length,
    timestamp: new Date().toISOString()
  })
})

// Inicializar con datos de ejemplo
turnos = [
  {
    _id: '1',
    fecha: '2024-01-15',
    horario: '09:00',
    servicio: 'Cambio de Aceite',
    sucursal: 'Sucursal Monteros',
    cliente: {
      nombre: 'Juan Pérez',
      telefono: '+5493815123456',
      email: 'juan@email.com'
    },
    vehiculo: {
      patente: 'ABC123',
      modelo: 'Toyota Corolla 2020'
    },
    estado: 'confirmado',
    createdAt: '2024-01-10T10:00:00.000Z'
  }
]

notifications = []

console.log('🚀 Servidor iniciado en puerto', PORT)
console.log('📊 Datos iniciales:', turnos.length, 'turnos,', notifications.length, 'notificaciones')

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
}) 