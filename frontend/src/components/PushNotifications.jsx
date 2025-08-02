import React, { useState, useEffect } from 'react'
import { FaBell, FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaClock } from 'react-icons/fa'

const PushNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const [hasNewNotifications, setHasNewNotifications] = useState(false)

  useEffect(() => {
    // Simular notificaciones push
    const mockNotifications = [
      {
        id: 1,
        type: 'service',
        title: 'Servicio completado',
        message: 'Tu cambio de aceite está listo. ¡Puedes retirar tu vehículo!',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        read: false,
        icon: FaCheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        id: 2,
        type: 'promotion',
        title: '¡Oferta especial!',
        message: '20% de descuento en lubricación completa. Válido hasta mañana.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
        read: false,
        icon: FaInfoCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        id: 3,
        type: 'reminder',
        title: 'Recordatorio de cita',
        message: 'Tu turno está programado para mañana a las 10:00. ¡No olvides venir!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        read: true,
        icon: FaClock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    ]
    setNotifications(mockNotifications)
    setHasNewNotifications(mockNotifications.some(n => !n.read))
  }, [])

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
    setHasNewNotifications(notifications.some(n => !n.read && n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setHasNewNotifications(false)
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours} h`
    return `Hace ${days} días`
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="fixed top-24 right-20 z-40">
      {/* Botón flotante */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 relative"
      >
        <FaBell className="text-2xl text-green-600" />
        {hasNewNotifications && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isVisible && (
        <div className="absolute top-16 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <FaBell className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay notificaciones</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      notification.read 
                        ? 'border-gray-200 bg-gray-50' 
                        : 'border-green-200 bg-green-50'
                    } hover:shadow-md`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <notification.icon className={`text-lg ${notification.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-semibold mb-1 ${
                            notification.read ? 'text-gray-600' : 'text-gray-800'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${
                          notification.read ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-green-600 hover:text-green-700 font-medium"
                            >
                              Marcar como leída
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {unreadCount} sin leer
              </span>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                Ver todas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PushNotifications 