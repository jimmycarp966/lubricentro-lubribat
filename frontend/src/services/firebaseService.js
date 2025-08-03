import { 
  ref, 
  push, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  off,
  query,
  orderByChild,
  equalTo
} from 'firebase/database'
import { database } from '../firebase/config'

// Referencias a las colecciones
const turnosRef = ref(database, 'turnos')
const notificationsRef = ref(database, 'notifications')

// Servicio para Turnos
export const turnosService = {
  // Obtener todos los turnos
  async getTurnos() {
    try {
      const snapshot = await get(turnosRef)
      if (snapshot.exists()) {
        const turnos = []
        snapshot.forEach((childSnapshot) => {
          turnos.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          })
        })
        return turnos
      }
      return []
    } catch (error) {
      console.error('Error obteniendo turnos:', error)
      return []
    }
  },

  // Crear un nuevo turno
  async createTurno(turnoData) {
    try {
      const newTurnoRef = push(turnosRef)
      const newTurno = {
        ...turnoData,
        createdAt: new Date().toISOString(),
        status: 'pendiente'
      }
      await set(newTurnoRef, newTurno)
      return { id: newTurnoRef.key, ...newTurno }
    } catch (error) {
      console.error('Error creando turno:', error)
      throw error
    }
  },

  // Actualizar un turno
  async updateTurno(turnoId, updates) {
    try {
      const turnoRef = ref(database, `turnos/${turnoId}`)
      await update(turnoRef, updates)
      return true
    } catch (error) {
      console.error('Error actualizando turno:', error)
      throw error
    }
  },

  // Eliminar un turno
  async deleteTurno(turnoId) {
    try {
      const turnoRef = ref(database, `turnos/${turnoId}`)
      await remove(turnoRef)
      return true
    } catch (error) {
      console.error('Error eliminando turno:', error)
      throw error
    }
  },

  // Escuchar cambios en tiempo real
  onTurnosChange(callback) {
    const unsubscribe = onValue(turnosRef, (snapshot) => {
      const turnos = []
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          turnos.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          })
        })
      }
      callback(turnos)
    })
    return unsubscribe
  }
}

// Servicio para Notificaciones
export const notificationsService = {
  // Obtener todas las notificaciones
  async getNotifications() {
    try {
      const snapshot = await get(notificationsRef)
      if (snapshot.exists()) {
        const notifications = []
        snapshot.forEach((childSnapshot) => {
          notifications.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          })
        })
        return notifications
      }
      return []
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error)
      return []
    }
  },

  // Crear una nueva notificación
  async createNotification(notificationData) {
    try {
      const newNotificationRef = push(notificationsRef)
      const newNotification = {
        ...notificationData,
        timestamp: new Date().toISOString(),
        leida: false
      }
      await set(newNotificationRef, newNotification)
      return { id: newNotificationRef.key, ...newNotification }
    } catch (error) {
      console.error('Error creando notificación:', error)
      throw error
    }
  },

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    try {
      const notificationRef = ref(database, `notifications/${notificationId}`)
      await update(notificationRef, { leida: true })
      return true
    } catch (error) {
      console.error('Error marcando notificación como leída:', error)
      throw error
    }
  },

  // Eliminar una notificación
  async deleteNotification(notificationId) {
    try {
      const notificationRef = ref(database, `notifications/${notificationId}`)
      await remove(notificationRef)
      return true
    } catch (error) {
      console.error('Error eliminando notificación:', error)
      throw error
    }
  },

  // Escuchar cambios en tiempo real
  onNotificationsChange(callback) {
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notifications = []
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          notifications.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          })
        })
      }
      callback(notifications)
    })
    return unsubscribe
  }
} 