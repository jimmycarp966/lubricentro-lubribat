const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Configurar JWT_SECRET si no está definido
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'lubricentro-super-secret-jwt-key-2025';
  console.log('⚠️ JWT_SECRET no configurado, usando valor por defecto');
}

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lubricentro:lubricentro123@cluster0.mongodb.net/lubricentro?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error conectando a MongoDB:', err))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/turnos', require('./routes/turnos'))
app.use('/api/productos', require('./routes/productos'))
app.use('/api/mayoristas', require('./routes/mayoristas'))
app.use('/api/pedidos', require('./routes/pedidos'))
app.use('/api/sync', require('./routes/sync'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
}) 