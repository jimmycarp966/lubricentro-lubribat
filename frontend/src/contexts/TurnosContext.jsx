import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const TurnosContext = createContext()

export const useTurnos = () => {
  const context = useContext(TurnosContext)
  if (!context) {
    throw new Error('useTurnos debe ser usado dentro de un TurnosProvider')
  }
  return context
}

export const TurnosProvider = ({ children }) => {
  const [turnos, setTurnos] = useState([])
  const [notifications, setNotifications] = useState([]) // NEW: Notifications array
  const [loading, setLoading] = useState(false)

  // Datos simulados de turnos
  const turnosSimulados = [
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
    },
    {
      _id: '2',
      fecha: '2024-01-16',
      horario: '14:30',
      servicio: 'Revisión General',
      sucursal: 'Sucursal Concepción',
      cliente: {
        nombre: 'María González',
        telefono: '+5493815987654',
        email: 'maria@email.com'
      },
      vehiculo: {
        patente: 'XYZ789',
        modelo: 'Ford Focus 2019'
      },
      estado: 'pendiente',
      createdAt: '2024-01-11T15:30:00.000Z'
    },
    {
      _id: '3',
      fecha: '2024-01-15',
      horario: '11:00',
      servicio: 'Cambio de Filtros',
      sucursal: 'Sucursal Monteros',
      cliente: {
        nombre: 'Carlos López',
        telefono: '+5493815123457',
        email: 'carlos@email.com'
      },
      vehiculo: {
        patente: 'DEF456',
        modelo: 'Honda Civic 2021'
      },
      estado: 'finalizado',
      createdAt: '2024-01-12T09:00:00.000Z'
    },
    {
      _id: '4',
      fecha: '2024-01-16',
      horario: '16:00',
      servicio: 'Lubricación Completa',
      sucursal: 'Sucursal Concepción',
      cliente: {
        nombre: 'Ana Rodríguez',
        telefono: '+5493815987655',
        email: 'ana@email.com'
      },
      vehiculo: {
        patente: 'GHI789',
        modelo: 'Chevrolet Onix 2022'
      },
      estado: 'confirmado',
      createdAt: '2024-01-13T14:00:00.000Z'
    }
  ]

  // Cargar turnos desde localStorage o usar datos simulados
  useEffect(() => {
    setLoading(true)
    const turnosGuardados = localStorage.getItem('turnos')
    
    if (turnosGuardados) {
      setTurnos(JSON.parse(turnosGuardados))
    } else {
      // Primera vez: usar datos simulados
      setTurnos(turnosSimulados)
      localStorage.setItem('turnos', JSON.stringify(turnosSimulados))
    }
    
    setLoading(false)
  }, [])

  // Guardar turnos en localStorage cuando cambien
  useEffect(() => {
    if (turnos.length > 0) {
      localStorage.setItem('turnos', JSON.stringify(turnos))
    }
  }, [turnos])

  // Cargar notificaciones desde localStorage al inicializar
  useEffect(() => {
    const notificacionesGuardadas = localStorage.getItem('notifications')
    if (notificacionesGuardadas) {
      setNotifications(JSON.parse(notificacionesGuardadas))
    }
  }, [])

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  const crearTurno = async (turnoData) => {
    try {
      const nuevoTurno = {
        _id: Date.now().toString(),
        ...turnoData,
        estado: 'confirmado',
        createdAt: new Date().toISOString()
      }

      setTurnos(prev => [nuevoTurno, ...prev])

      // Crear notificación para administradores (NEW)
      const nuevaNotificacion = {
        id: Date.now().toString(),
        tipo: 'nuevo_turno',
        titulo: 'Nuevo Turno Reservado',
        mensaje: `${turnoData.cliente.nombre} reservó un turno para ${turnoData.fecha} a las ${turnoData.horario}`,
        turno: nuevoTurno,
        leida: false,
        timestamp: new Date().toISOString(),
        whatsappData: {
          nombre: turnoData.cliente.nombre.split(' ')[0],
          apellido: turnoData.cliente.nombre.split(' ').slice(1).join(' ') || '',
          whatsapp: turnoData.cliente.telefono,
          fecha: turnoData.fecha,
          horario: turnoData.horario,
          servicio: turnoData.servicio,
          sucursal: turnoData.sucursal
        }
      }

      // Debug log para verificar que se crea la notificación
      console.log('🔔 Nueva notificación creada:', nuevaNotificacion)
      console.log('📊 Total de notificaciones:', notifications.length + 1)

      setNotifications(prev => [nuevaNotificacion, ...prev])

      toast.success('Turno creado correctamente')
      return { success: true, turno: nuevoTurno }
    } catch (error) {
      toast.error('Error al crear turno')
      return { success: false, error: error.message }
    }
  }

  const fetchTurnos = async () => {
    try {
      setLoading(true)
      const turnosGuardados = localStorage.getItem('turnos')
      
      if (turnosGuardados) {
        setTurnos(JSON.parse(turnosGuardados))
      } else {
        // Primera vez: usar datos simulados
        setTurnos(turnosSimulados)
        localStorage.setItem('turnos', JSON.stringify(turnosSimulados))
      }
      
      setLoading(false)
      return { success: true }
    } catch (error) {
      setLoading(false)
      toast.error('Error al cargar turnos')
      return { success: false, error: error.message }
    }
  }

  const actualizarTurno = async (id, turnoData) => {
    try {
      setTurnos(prev => prev.map(t => t._id === id ? { ...t, ...turnoData } : t))
      toast.success('Turno actualizado correctamente')

      // Si el turno se finaliza, crear notificación (NEW)
      if (turnoData.estado === 'finalizado') {
        const turno = turnos.find(t => t._id === id)
        if (turno) {
          const notificacionFinalizacion = {
            id: Date.now().toString(),
            tipo: 'turno_finalizado',
            titulo: 'Turno Finalizado',
            mensaje: `El turno de ${turno.cliente.nombre} ha sido completado`,
            turno: { ...turno, ...turnoData },
            leida: false,
            timestamp: new Date().toISOString(),
            whatsappData: {
              nombre: turno.cliente.nombre.split(' ')[0],
              apellido: turno.cliente.nombre.split(' ').slice(1).join(' ') || '',
              whatsapp: turno.cliente.telefono,
              servicio: turno.servicio,
              sucursal: turno.sucursal
            }
          }
          setNotifications(prev => [notificacionFinalizacion, ...prev])
        }
      }

      return { success: true }
    } catch (error) {
      toast.error('Error al actualizar turno')
      return { success: false, error: error.message }
    }
  }

  const eliminarTurno = async (id) => {
    try {
      setTurnos(prev => prev.filter(t => t._id !== id))
      toast.success('Turno eliminado correctamente')
      return { success: true }
    } catch (error) {
      toast.error('Error al eliminar turno')
      return { success: false, error: error.message }
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      setTurnos(prev => prev.map(t => t._id === id ? { ...t, estado: nuevoEstado } : t))
      toast.success('Estado del turno actualizado')
      return { success: true }
    } catch (error) {
      toast.error('Error al cambiar estado')
      return { success: false, error: error.message }
    }
  }

  // Funciones para manejar notificaciones (NEW)
  const marcarNotificacionComoLeida = (notificacionId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificacionId 
          ? { ...notif, leida: true }
          : notif
      )
    )
  }

  const eliminarNotificacion = (notificacionId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificacionId))
  }

  const obtenerNotificacionesNoLeidas = () => {
    return notifications.filter(notif => !notif.leida)
  }

  const limpiarNotificaciones = () => {
    setNotifications([])
  }

  const value = {
    turnos,
    setTurnos, // NEW: Expose setTurnos for debug purposes
    loading,
    fetchTurnos,
    crearTurno,
    actualizarTurno,
    eliminarTurno,
    cambiarEstado,
    notifications, // NEW
    setNotifications, // NEW: Expose setNotifications for debug purposes
    marcarNotificacionComoLeida, // NEW
    eliminarNotificacion, // NEW
    obtenerNotificacionesNoLeidas, // NEW
    limpiarNotificaciones // NEW
  }

  return (
    <TurnosContext.Provider value={value}>
      {children}
    </TurnosContext.Provider>
  )
} 