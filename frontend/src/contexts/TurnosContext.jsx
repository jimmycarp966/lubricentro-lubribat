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

// Simulación de API compartida usando localStorage y eventos
const API_SIMULADA = {
  // Obtener todos los turnos
  getTurnos: () => {
    const turnos = localStorage.getItem('api_turnos')
    console.log('🔧 API: Obteniendo turnos desde localStorage:', turnos ? JSON.parse(turnos).length : 0)
    return turnos ? JSON.parse(turnos) : []
  },
  
  // Guardar turnos
  saveTurnos: (turnos) => {
    console.log('🔧 API: Guardando turnos en localStorage:', turnos.length)
    localStorage.setItem('api_turnos', JSON.stringify(turnos))
    // Disparar evento para notificar cambios
    window.dispatchEvent(new CustomEvent('turnosUpdated', { detail: turnos }))
  },
  
  // Agregar un turno
  addTurno: (turno) => {
    console.log('🔧 API: Agregando turno:', turno._id)
    const turnos = API_SIMULADA.getTurnos()
    turnos.unshift(turno)
    API_SIMULADA.saveTurnos(turnos)
    return turno
  },
  
  // Obtener notificaciones
  getNotifications: () => {
    const notifications = localStorage.getItem('api_notifications')
    console.log('🔧 API: Obteniendo notificaciones desde localStorage:', notifications ? JSON.parse(notifications).length : 0)
    return notifications ? JSON.parse(notifications) : []
  },
  
  // Guardar notificaciones
  saveNotifications: (notifications) => {
    console.log('🔧 API: Guardando notificaciones en localStorage:', notifications.length)
    localStorage.setItem('api_notifications', JSON.stringify(notifications))
    // Disparar evento para notificar cambios
    window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: notifications }))
  },
  
  // Agregar notificación
  addNotification: (notification) => {
    console.log('🔧 API: Agregando notificación:', notification.id)
    const notifications = API_SIMULADA.getNotifications()
    notifications.unshift(notification)
    API_SIMULADA.saveNotifications(notifications)
    return notification
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

  // Cargar datos desde la API simulada
  useEffect(() => {
    setLoading(true)
    
    // Verificar si ya hay datos en la API simulada
    const turnosAPI = API_SIMULADA.getTurnos()
    const notificationsAPI = API_SIMULADA.getNotifications()
    
    if (turnosAPI.length === 0) {
      // Primera vez: inicializar con datos simulados
      API_SIMULADA.saveTurnos(turnosSimulados)
      setTurnos(turnosSimulados)
    } else {
      // Usar datos existentes de la API
      setTurnos(turnosAPI)
    }
    
    if (notificationsAPI.length === 0) {
      // Inicializar notificaciones vacías
      API_SIMULADA.saveNotifications([])
      setNotifications([])
    } else {
      setNotifications(notificationsAPI)
    }
    
    setLoading(false)
  }, [])

  // Sincronizar con la API simulada cada 1 segundo y escuchar eventos
  useEffect(() => {
    const syncData = () => {
      const turnosAPI = API_SIMULADA.getTurnos()
      const notificationsAPI = API_SIMULADA.getNotifications()
      
      console.log('🔧 Sync: Sincronizando datos...')
      console.log('🔧 Sync: Turnos en API:', turnosAPI.length, 'Turnos en estado:', turnos.length)
      console.log('🔧 Sync: Notificaciones en API:', notificationsAPI.length, 'Notificaciones en estado:', notifications.length)
      
      setTurnos(turnosAPI)
      setNotifications(notificationsAPI)
    }

    // Sincronización inicial
    syncData()

    // Intervalo de sincronización
    const interval = setInterval(syncData, 1000)

    // Escuchar eventos de cambios
    const handleTurnosUpdate = (event) => {
      console.log('🔧 Event: turnosUpdated recibido')
      setTurnos(event.detail)
    }

    const handleNotificationsUpdate = (event) => {
      console.log('🔧 Event: notificationsUpdated recibido')
      setNotifications(event.detail)
    }

    // Escuchar cambios en localStorage
    const handleStorageChange = (event) => {
      console.log('🔧 Storage: Cambio detectado en localStorage:', event.key)
      if (event.key === 'api_turnos') {
        const turnosAPI = API_SIMULADA.getTurnos()
        setTurnos(turnosAPI)
      } else if (event.key === 'api_notifications') {
        const notificationsAPI = API_SIMULADA.getNotifications()
        setNotifications(notificationsAPI)
      }
    }

    // Agregar listeners
    window.addEventListener('turnosUpdated', handleTurnosUpdate)
    window.addEventListener('notificationsUpdated', handleNotificationsUpdate)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('turnosUpdated', handleTurnosUpdate)
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const crearTurno = async (turnoData) => {
    try {
      console.log('🔧 Debug: Iniciando crearTurno con datos:', turnoData)
      
      const nuevoTurno = {
        _id: Date.now().toString(),
        ...turnoData,
        estado: 'confirmado',
        createdAt: new Date().toISOString()
      }

      console.log('🔧 Debug: Nuevo turno creado:', nuevoTurno)

      // Guardar en la API simulada
      API_SIMULADA.addTurno(nuevoTurno)
      console.log('🔧 Debug: Turno guardado en API simulada')

      // Crear notificación para administradores
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

      console.log('🔔 Nueva notificación creada:', nuevaNotificacion)

      // Guardar notificación en la API simulada
      API_SIMULADA.addNotification(nuevaNotificacion)
      console.log('🔧 Debug: Notificación guardada en API simulada')

      console.log('🔧 Debug: Turno y notificación creados exitosamente')
      toast.success('Turno creado correctamente')
      return { success: true, turno: nuevoTurno }
    } catch (error) {
      console.log('🔧 Debug: Error en crearTurno:', error)
      toast.error('Error al crear turno')
      return { success: false, error: error.message }
    }
  }

  const fetchTurnos = async () => {
    try {
      setLoading(true)
      const turnosAPI = API_SIMULADA.getTurnos()
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
      const turnosActuales = API_SIMULADA.getTurnos()
      const turnosActualizados = turnosActuales.map(t => 
        t._id === id ? { ...t, ...turnoData } : t
      )
      API_SIMULADA.saveTurnos(turnosActualizados)
      setTurnos(turnosActualizados)
      toast.success('Turno actualizado correctamente')

      // Si el turno se finaliza, crear notificación
      if (turnoData.estado === 'finalizado') {
        const turno = turnosActuales.find(t => t._id === id)
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
          API_SIMULADA.addNotification(notificacionFinalizacion)
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
      const turnosActuales = API_SIMULADA.getTurnos()
      const turnosFiltrados = turnosActuales.filter(t => t._id !== id)
      API_SIMULADA.saveTurnos(turnosFiltrados)
      setTurnos(turnosFiltrados)
      toast.success('Turno eliminado correctamente')
      return { success: true }
    } catch (error) {
      toast.error('Error al eliminar turno')
      return { success: false, error: error.message }
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const turnosActuales = API_SIMULADA.getTurnos()
      const turnosActualizados = turnosActuales.map(t => 
        t._id === id ? { ...t, estado: nuevoEstado } : t
      )
      API_SIMULADA.saveTurnos(turnosActualizados)
      setTurnos(turnosActualizados)
      toast.success('Estado del turno actualizado')
      return { success: true }
    } catch (error) {
      toast.error('Error al cambiar estado')
      return { success: false, error: error.message }
    }
  }

  // Funciones para manejar notificaciones
  const marcarNotificacionComoLeida = (notificacionId) => {
    const notificationsActuales = API_SIMULADA.getNotifications()
    const notificationsActualizadas = notificationsActuales.map(notif => 
      notif.id === notificacionId 
        ? { ...notif, leida: true }
        : notif
    )
    API_SIMULADA.saveNotifications(notificationsActualizadas)
    setNotifications(notificationsActualizadas)
  }

  const eliminarNotificacion = (notificacionId) => {
    const notificationsActuales = API_SIMULADA.getNotifications()
    const notificationsFiltradas = notificationsActuales.filter(notif => notif.id !== notificacionId)
    API_SIMULADA.saveNotifications(notificationsFiltradas)
    setNotifications(notificationsFiltradas)
  }

  const obtenerNotificacionesNoLeidas = () => {
    return notifications.filter(notif => !notif.leida)
  }

  const limpiarNotificaciones = () => {
    API_SIMULADA.saveNotifications([])
    setNotifications([])
  }

  // Función para crear notificaciones de pedidos
  const crearNotificacionPedido = (pedidoData) => {
    const nuevaNotificacion = {
      id: Date.now().toString(),
      tipo: 'nuevo_pedido',
      titulo: 'Nuevo Pedido de Mayorista',
      mensaje: `${pedidoData.mayorista} realizó un pedido por $${pedidoData.total.toLocaleString()}`,
      pedido: pedidoData,
      leida: false,
      timestamp: new Date().toISOString(),
      whatsappData: {
        mayorista: pedidoData.mayorista,
        total: pedidoData.total,
        items: pedidoData.items.length,
        estado: pedidoData.estado
      }
    }

    console.log('🔔 Nueva notificación de pedido:', nuevaNotificacion)
    API_SIMULADA.addNotification(nuevaNotificacion)
  }

  // Función para crear notificaciones de cambio de estado de pedido
  const crearNotificacionEstadoPedido = (pedidoData, nuevoEstado) => {
    const nuevaNotificacion = {
      id: Date.now().toString(),
      tipo: 'estado_pedido',
      titulo: `Pedido ${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)}`,
      mensaje: `El pedido de ${pedidoData.mayorista} cambió a estado "${nuevoEstado}"`,
      pedido: { ...pedidoData, estado: nuevoEstado },
      leida: false,
      timestamp: new Date().toISOString()
    }

    console.log('🔔 Nueva notificación de estado de pedido:', nuevaNotificacion)
    API_SIMULADA.addNotification(nuevaNotificacion)
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