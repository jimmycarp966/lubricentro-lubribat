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

// API usando Vercel Serverless Functions
const API_VERCEL = {
  baseURL: '/api', // Usar rutas relativas para Vercel

  // Obtener todos los turnos
  getTurnos: async () => {
    try {
      const response = await fetch(`${API_VERCEL.baseURL}/turnos`)
      const turnos = await response.json()
      console.log('🔧 API: Obteniendo turnos desde Vercel:', turnos.length)
      return turnos
    } catch (error) {
      console.log('🔧 API: Error obteniendo turnos:', error)
      return []
    }
  },
  
  // Agregar un turno
  addTurno: async (turnoData) => {
    try {
      console.log('🔧 API: Agregando turno a Vercel:', turnoData)
      const response = await fetch(`${API_VERCEL.baseURL}/turnos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(turnoData)
      })
      const result = await response.json()
      console.log('🔧 API: Turno agregado a Vercel:', result)
      return result.turno
    } catch (error) {
      console.log('🔧 API: Error agregando turno:', error)
      throw error
    }
  },
  
  // Obtener notificaciones
  getNotifications: async () => {
    try {
      const response = await fetch(`${API_VERCEL.baseURL}/notifications`)
      const notifications = await response.json()
      console.log('🔧 API: Obteniendo notificaciones desde Vercel:', notifications.length)
      return notifications
    } catch (error) {
      console.log('🔧 API: Error obteniendo notificaciones:', error)
      return []
    }
  },
  
  // Agregar notificación
  addNotification: async (notificationData) => {
    try {
      console.log('🔧 API: Agregando notificación a Vercel:', notificationData)
      const response = await fetch(`${API_VERCEL.baseURL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      })
      const result = await response.json()
      console.log('🔧 API: Notificación agregada a Vercel:', result)
      return result.notification
    } catch (error) {
      console.log('🔧 API: Error agregando notificación:', error)
      throw error
    }
  },

  // Verificar estado del servidor
  checkStatus: async () => {
    try {
      const response = await fetch(`${API_VERCEL.baseURL}/turnos`)
      const turnos = await response.json()
      console.log('🔧 API: Estado de Vercel - Turnos:', turnos.length)
      return { turnos: turnos.length, timestamp: new Date().toISOString() }
    } catch (error) {
      console.log('🔧 API: Error verificando estado:', error)
      return null
    }
  }
}

export const TurnosProvider = ({ children }) => {
  const [turnos, setTurnos] = useState([])
  const [notifications, setNotifications] = useState([])
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

  // Cargar datos desde la API real
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      try {
        const turnosAPI = await API_VERCEL.getTurnos()
        const notificationsAPI = await API_VERCEL.getNotifications()
        
        if (turnosAPI.length === 0) {
          // Primera vez: usar datos simulados
          setTurnos(turnosSimulados)
        } else {
          // Usar datos existentes de la API
          setTurnos(turnosAPI)
        }
        
        setNotifications(notificationsAPI)
      } catch (error) {
        console.log('🔧 Error cargando datos:', error)
        setTurnos(turnosSimulados)
        setNotifications([])
      }
      
      setLoading(false)
    }

    loadData()
  }, [])

  // Sincronizar con la API real cada 2 segundos
  useEffect(() => {
    const syncData = async () => {
      try {
        const turnosAPI = await API_VERCEL.getTurnos()
        const notificationsAPI = await API_VERCEL.getNotifications()
        
        console.log('🔧 Sync: Sincronizando datos...')
        console.log('🔧 Sync: Turnos en API:', turnosAPI.length, 'Turnos en estado:', turnos.length)
        console.log('🔧 Sync: Notificaciones en API:', notificationsAPI.length, 'Notificaciones en estado:', notifications.length)
        
        setTurnos(turnosAPI)
        setNotifications(notificationsAPI)
      } catch (error) {
        console.log('🔧 Error en sincronización:', error)
      }
    }

    // Sincronización inicial
    syncData()

    // Intervalo de sincronización
    const interval = setInterval(syncData, 2000)

    return () => clearInterval(interval)
  }, [])

  const crearTurno = async (turnoData) => {
    try {
      console.log('🔧 Debug: Iniciando crearTurno con datos:', turnoData)
      
      const nuevoTurno = {
        ...turnoData,
        estado: 'confirmado',
        createdAt: new Date().toISOString()
      }

      console.log('🔧 Debug: Nuevo turno creado:', nuevoTurno)

      // Guardar en la API real
      const turnoGuardado = await API_VERCEL.addTurno(nuevoTurno)
      console.log('🔧 Debug: Turno guardado en API real')

      // Crear notificación para administradores
      const nuevaNotificacion = {
        tipo: 'nuevo_turno',
        titulo: 'Nuevo Turno Reservado',
        mensaje: `${turnoData.cliente.nombre} reservó un turno para ${turnoData.fecha} a las ${turnoData.horario}`,
        turno: turnoGuardado,
        leida: false,
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

      console.log('🔔 Nueva notificación creada:', nuevaNotificacion)

      // Guardar notificación en la API real
      await API_VERCEL.addNotification(nuevaNotificacion)
      console.log('🔧 Debug: Notificación guardada en API real')

      console.log('🔧 Debug: Turno y notificación creados exitosamente')
      toast.success('Turno creado correctamente')
      return { success: true, turno: turnoGuardado }
    } catch (error) {
      console.log('🔧 Debug: Error en crearTurno:', error)
      toast.error('Error al crear turno')
      return { success: false, error: error.message }
    }
  }

  const fetchTurnos = async () => {
    try {
      setLoading(true)
      const turnosAPI = await API_VERCEL.getTurnos()
      setTurnos(turnosAPI)
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
      // Por ahora solo actualizamos el estado local
      setTurnos(prev => prev.map(t => t._id === id ? { ...t, ...turnoData } : t))
      toast.success('Turno actualizado correctamente')

      // Si el turno se finaliza, crear notificación
      if (turnoData.estado === 'finalizado') {
        const turno = turnos.find(t => t._id === id)
        if (turno) {
          const notificacionFinalizacion = {
            tipo: 'turno_finalizado',
            titulo: 'Turno Finalizado',
            mensaje: `El turno de ${turno.cliente.nombre} ha sido completado`,
            turno: { ...turno, ...turnoData },
            leida: false,
            whatsappData: {
              nombre: turno.cliente.nombre.split(' ')[0],
              apellido: turno.cliente.nombre.split(' ').slice(1).join(' ') || '',
              whatsapp: turno.cliente.telefono,
              servicio: turno.servicio,
              sucursal: turno.sucursal
            }
          }
          await API_VERCEL.addNotification(notificacionFinalizacion)
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

  // Funciones para manejar notificaciones
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

  // Función para crear notificaciones de pedidos
  const crearNotificacionPedido = async (pedidoData) => {
    const nuevaNotificacion = {
      tipo: 'nuevo_pedido',
      titulo: 'Nuevo Pedido de Mayorista',
      mensaje: `${pedidoData.mayorista} realizó un pedido por $${pedidoData.total.toLocaleString()}`,
      pedido: pedidoData,
      leida: false,
      whatsappData: {
        mayorista: pedidoData.mayorista,
        total: pedidoData.total,
        items: pedidoData.items.length,
        estado: pedidoData.estado
      }
    }

    console.log('🔔 Nueva notificación de pedido:', nuevaNotificacion)
    await API_VERCEL.addNotification(nuevaNotificacion)
  }

  // Función para crear notificaciones de cambio de estado de pedido
  const crearNotificacionEstadoPedido = async (pedidoData, nuevoEstado) => {
    const nuevaNotificacion = {
      tipo: 'estado_pedido',
      titulo: `Pedido ${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)}`,
      mensaje: `El pedido de ${pedidoData.mayorista} cambió a estado "${nuevoEstado}"`,
      pedido: { ...pedidoData, estado: nuevoEstado },
      leida: false
    }

    console.log('🔔 Nueva notificación de estado de pedido:', nuevaNotificacion)
    await API_VERCEL.addNotification(nuevaNotificacion)
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
    limpiarNotificaciones, // NEW
    crearNotificacionPedido, // NEW: For pedidos notifications
    crearNotificacionEstadoPedido // NEW: For pedido state change notifications
  }

  return (
    <TurnosContext.Provider value={value}>
      {children}
    </TurnosContext.Provider>
  )
} 