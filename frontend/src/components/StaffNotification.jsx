import React, { useState, useEffect } from 'react'
import { FaUser, FaCrown, FaTools, FaClock, FaCheckCircle, FaTimes } from 'react-icons/fa'

const StaffNotification = () => {
  const [notifications, setNotifications] = useState([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Simular notificaciones del personal
    const mockNotifications = [
      {
        id: 1,
        type: 'new_booking',
        customer: {
          name: 'Juan Pérez',
          phone: '+54 9 11 1234-5678',
          loyaltyPoints: 1250,
          level: 'Gold',
          visits: 8
        },
        service: {
          name: 'Cambio de aceite completo',
          date: '2024-01-15',
          time: '10:00',
          price: 15000
        },
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutos atrás
        read: false
      },
      {
        id: 2,
        type: 'service_completed',
        customer: {
          name: 'María González',
          phone: '+54 9 11 9876-5432',
          loyaltyPoints: 850,
          level: 'Silver',
          visits: 5
        },
        service: {
          name: 'Lubricación completa',
          date: '2024-01-15',
          time: '09:00',
          price: 12000
        },
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
        read: true
      }
    ]
    setNotifications(mockNotifications)
  }, [])

  const getLevelColor = (level) => {
    switch (level) {
      case 'Bronze': return 'text-orange-600'
      case 'Silver': return 'text-gray-600'
      case 'Gold': return 'text-yellow-600'
      case 'Platinum': return 'text-purple-600'
      default: return 'text-green-600'
    }
  }

  const getLevelIcon = (level) => {
    switch (level) {
      case 'Bronze': return <FaCrown className="text-orange-500" />
      case 'Silver': return <FaCrown className="text-gray-500" />
      case 'Gold': return <FaCrown className="text-yellow-500" />
      case 'Platinum': return <FaCrown className="text-purple-500" />
      default: return <FaCrown className="text-green-500" />
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours} h`
    return 'Hace más de 1 día'
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="fixed top-24 right-34 z-40">
      {/* Botón flotante */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 relative"
      >
        <FaUser className="text-2xl text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones del personal */}
      {isVisible && (
        <div className="absolute top-16 right-0 w-96 bg-white rounded-2xl shadow-xl border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Panel del Personal</h3>
              <span className="text-sm opacity-90">{unreadCount} nuevas</span>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <FaUser className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay notificaciones</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      notification.read 
                        ? 'border-gray-200 bg-gray-50' 
                        : 'border-blue-200 bg-blue-50'
                    } hover:shadow-md`}
                  >
                    {/* Header de la notificación */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        {notification.type === 'new_booking' ? (
                          <FaClock className="text-lg text-green-600" />
                        ) : (
                          <FaCheckCircle className="text-lg text-blue-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          notification.read ? 'text-gray-600' : 'text-gray-800'
                        }`}>
                          {notification.type === 'new_booking' ? 'Nueva Reserva' : 'Servicio Completado'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>

                    {/* Información del cliente */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {notification.customer.name}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {getLevelIcon(notification.customer.level)}
                          <span className={`text-xs font-medium ${getLevelColor(notification.customer.level)}`}>
                            {notification.customer.level}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        📞 {notification.customer.phone}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Puntos: {notification.customer.loyaltyPoints}</span>
                        <span>Visitas: {notification.customer.visits}</span>
                      </div>
                    </div>

                    {/* Información del servicio */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaTools className="text-sm text-gray-500" />
                        <span className="font-medium text-gray-800">
                          {notification.service.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          📅 {notification.service.date} - {notification.service.time}
                        </span>
                        <span className="font-semibold text-green-600">
                          ${notification.service.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex space-x-2 mt-3">
                      <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-xs font-medium">
                        Confirmar
                      </button>
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium">
                        Ver detalles
                      </button>
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
                {notifications.length} notificaciones totales
              </span>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffNotification 