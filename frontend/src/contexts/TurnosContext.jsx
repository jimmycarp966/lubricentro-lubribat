import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { turnosService, notificationsService } from '../services/firebaseService'

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
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  // Cargar datos iniciales desde Firebase
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        console.log('🔥 Firebase: Cargando datos iniciales...')
        const [turnosData, notificationsData] = await Promise.all([
          turnosService.getTurnos(),
          notificationsService.getNotifications()
        ])
        
        console.log('🔥 Firebase: Turnos cargados:', turnosData.length)
        console.log('🔥 Firebase: Notificaciones cargadas:', notificationsData.length)
        
        setTurnos(turnosData)
        setNotifications(notificationsData)
      } catch (error) {
        console.error('🔥 Firebase: Error cargando datos iniciales:', error)
        toast.error('Error conectando con la base de datos')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Escuchar cambios en tiempo real
  useEffect(() => {
    console.log('🔥 Firebase: Configurando listeners en tiempo real...')
    
    // Listener para turnos
    const unsubscribeTurnos = turnosService.onTurnosChange((turnosData) => {
      console.log('🔥 Firebase: Turnos actualizados en tiempo real:', turnosData.length)
      setTurnos(turnosData)
    })

    // Listener para notificaciones
    const unsubscribeNotifications = notificationsService.onNotificationsChange((notificationsData) => {
      console.log('🔥 Firebase: Notificaciones actualizadas en tiempo real:', notificationsData.length)
      setNotifications(notificationsData)
    })

    return () => {
      console.log('🔥 Firebase: Limpiando listeners...')
      unsubscribeTurnos()
      unsubscribeNotifications()
    }
  }, [])

  const crearTurno = async (turnoData) => {
    try {
      console.log('🔥 Firebase: Creando turno:', turnoData)
      
      const nuevoTurno = await turnosService.createTurno(turnoData)
      console.log('🔥 Firebase: Turno creado exitosamente:', nuevoTurno.id)

      // Crear notificación para administradores
      const nuevaNotificacion = {
        tipo: 'nuevo_turno',
        titulo: 'Nuevo Turno Reservado',
        mensaje: `${turnoData.cliente.nombre} reservó un turno para ${turnoData.fecha} a las ${turnoData.horario}`,
        turno: nuevoTurno,
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

      try {
        console.log('🔔 Firebase: Creando notificación:', nuevaNotificacion)
        await notificationsService.createNotification(nuevaNotificacion)
        console.log('🔔 Firebase: Notificación creada exitosamente')
      } catch (notificationError) {
        console.warn('⚠️ Firebase: Error creando notificación (no crítico):', notificationError)
        // No fallar el turno si la notificación falla
      }

      toast.success('Turno creado correctamente')
      return { success: true, turno: nuevoTurno }
    } catch (error) {
      console.error('🔥 Firebase: Error creando turno:', error)
      toast.error('Error al crear turno')
      return { success: false, error: error.message }
    }
  }

  const fetchTurnos = async () => {
    try {
      setLoading(true)
      const turnosData = await turnosService.getTurnos()
      setTurnos(turnosData)
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
      console.log('🔥 Firebase: Actualizando turno:', id, turnoData)
      await turnosService.updateTurno(id, turnoData)
      
      // Si el turno se finaliza, crear notificación
      if (turnoData.estado === 'finalizado') {
        const turno = turnos.find(t => t.id === id)
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
          await notificationsService.createNotification(notificacionFinalizacion)
        }
      }

      toast.success('Turno actualizado correctamente')
      return { success: true }
    } catch (error) {
      console.error('🔥 Firebase: Error actualizando turno:', error)
      toast.error('Error al actualizar turno')
      return { success: false, error: error.message }
    }
  }

  const eliminarTurno = async (id) => {
    try {
      console.log('🔥 Firebase: Eliminando turno:', id)
      await turnosService.deleteTurno(id)
      toast.success('Turno eliminado correctamente')
      return { success: true }
    } catch (error) {
      console.error('🔥 Firebase: Error eliminando turno:', error)
      toast.error('Error al eliminar turno')
      return { success: false, error: error.message }
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      console.log('🔥 Firebase: Cambiando estado del turno:', id, nuevoEstado)
      await turnosService.updateTurno(id, { estado: nuevoEstado })
      toast.success('Estado del turno actualizado')
      return { success: true }
    } catch (error) {
      console.error('🔥 Firebase: Error cambiando estado:', error)
      toast.error('Error al cambiar estado')
      return { success: false, error: error.message }
    }
  }

  // Funciones para manejar notificaciones
  const marcarNotificacionComoLeida = async (notificacionId) => {
    try {
      console.log('🔥 Firebase: Marcando notificación como leída:', notificacionId)
      await notificationsService.markAsRead(notificacionId)
    } catch (error) {
      console.error('🔥 Firebase: Error marcando notificación como leída:', error)
    }
  }

  const eliminarNotificacion = async (notificacionId) => {
    try {
      console.log('🔥 Firebase: Eliminando notificación:', notificacionId)
      await notificationsService.deleteNotification(notificacionId)
      toast.success('Notificación eliminada')
    } catch (error) {
      console.error('🔥 Firebase: Error eliminando notificación:', error)
      toast.error('Error al eliminar notificación')
    }
  }

  const obtenerNotificacionesNoLeidas = () => {
    return notifications.filter(notif => !notif.leida)
  }

  const limpiarNotificaciones = async () => {
    try {
      console.log('🔥 Firebase: Limpiando todas las notificaciones')
      const deletePromises = notifications.map(notif => 
        notificationsService.deleteNotification(notif.id)
      )
      await Promise.all(deletePromises)
      toast.success('Notificaciones limpiadas')
    } catch (error) {
      console.error('🔥 Firebase: Error limpiando notificaciones:', error)
      toast.error('Error al limpiar notificaciones')
    }
  }

  // Función para crear notificaciones de pedidos
  const crearNotificacionPedido = async (pedidoData) => {
    try {
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

      console.log('🔔 Firebase: Creando notificación de pedido:', nuevaNotificacion)
      await notificationsService.createNotification(nuevaNotificacion)
      console.log('🔔 Firebase: Notificación de pedido creada exitosamente')
    } catch (error) {
      console.error('🔥 Firebase: Error creando notificación de pedido:', error)
    }
  }

  // Función para crear notificaciones de cambio de estado de pedido
  const crearNotificacionEstadoPedido = async (pedidoData, nuevoEstado) => {
    try {
      const nuevaNotificacion = {
        tipo: 'estado_pedido',
        titulo: `Pedido ${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)}`,
        mensaje: `El pedido de ${pedidoData.mayorista} cambió a estado "${nuevoEstado}"`,
        pedido: { ...pedidoData, estado: nuevoEstado },
        leida: false
      }

      console.log('🔔 Firebase: Creando notificación de estado de pedido:', nuevaNotificacion)
      await notificationsService.createNotification(nuevaNotificacion)
      console.log('🔔 Firebase: Notificación de estado de pedido creada exitosamente')
    } catch (error) {
      console.error('🔥 Firebase: Error creando notificación de estado de pedido:', error)
    }
  }

  const value = {
    turnos,
    setTurnos,
    loading,
    fetchTurnos,
    crearTurno,
    actualizarTurno,
    eliminarTurno,
    cambiarEstado,
    notifications,
    setNotifications,
    marcarNotificacionComoLeida,
    eliminarNotificacion,
    obtenerNotificacionesNoLeidas,
    limpiarNotificaciones,
    crearNotificacionPedido,
    crearNotificacionEstadoPedido
  }

  return (
    <TurnosContext.Provider value={value}>
      {children}
    </TurnosContext.Provider>
  )
} 