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
const productosRef = ref(database, 'productos')

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
        estado: turnoData.estado || 'pendiente'
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

// Servicio para Productos
export const productosService = {
  // Obtener todos los productos
  async getProductos() {
    try {
      const snapshot = await get(productosRef)
      if (snapshot.exists()) {
        const productos = []
        snapshot.forEach((childSnapshot) => {
          productos.push({
            _id: childSnapshot.key,
            id: childSnapshot.key,
            ...childSnapshot.val()
          })
        })
        return productos
      }
      return []
    } catch (error) {
      console.error('Error obteniendo productos:', error)
      return []
    }
  },

  // Crear un nuevo producto
  async createProducto(productoData) {
    try {
      const newProductoRef = push(productosRef)
      const newProducto = {
        ...productoData,
        createdAt: new Date().toISOString(),
        activo: true
      }
      await set(newProductoRef, newProducto)
      return { id: newProductoRef.key, ...newProducto }
    } catch (error) {
      console.error('Error creando producto:', error)
      throw error
    }
  },

  // Actualizar un producto
  async updateProducto(productoId, updates) {
    try {
      const productoRef = ref(database, `productos/${productoId}`)
      await update(productoRef, updates)
      return true
    } catch (error) {
      console.error('Error actualizando producto:', error)
      throw error
    }
  },

  // Eliminar un producto
  async deleteProducto(productoId) {
    try {
      const productoRef = ref(database, `productos/${productoId}`)
      await remove(productoRef)
      return true
    } catch (error) {
      console.error('Error eliminando producto:', error)
      throw error
    }
  },

  // Escuchar cambios en tiempo real
  onProductosChange(callback) {
    const unsubscribe = onValue(productosRef, (snapshot) => {
      const productos = []
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          productos.push({
            _id: childSnapshot.key,
            id: childSnapshot.key,
            ...childSnapshot.val()
          })
        })
      }
      callback(productos)
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