import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTurnos } from '../contexts/TurnosContext'
import { sendWhatsAppMessage, sendCompletionMessage } from '../utils/whatsappService'
import { notificationManager, requestNotificationPermission } from '../services/notificationService'
import NotificationSettings from './NotificationSettings'
import toast from 'react-hot-toast'

const NotificationsPanel = () => {
  const { 
    notifications, 
    marcarNotificacionComoLeida, 
    eliminarNotificacion,
    obtenerNotificacionesNoLeidas 
  } = useTurnos()
  
  const [activeTab, setActiveTab] = useState('todas')
  const [notificationPermission, setNotificationPermission] = useState('default')

  useEffect(() => {
    // Verificar permisos de notificaciones
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const notificacionesNoLeidas = obtenerNotificacionesNoLeidas()
  const notificacionesFiltradas = activeTab === 'no-leidas' 
    ? notificacionesNoLeidas 
    : notifications

  const handleEnviarWhatsApp = (notificacion) => {
    try {
      let whatsappResult
      
      if (notificacion.tipo === 'nuevo_turno') {
        whatsappResult = sendWhatsAppMessage(notificacion.whatsappData)
      } else if (notificacion.tipo === 'turno_finalizado') {
        whatsappResult = sendCompletionMessage(notificacion.whatsappData)
      }

      if (whatsappResult?.url) {
        window.open(whatsappResult.url, '_blank')
        marcarNotificacionComoLeida(notificacion.id)
        toast.success('WhatsApp abierto para envío')
      }
    } catch (error) {
      toast.error('Error al abrir WhatsApp')
    }
  }

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'nuevo_turno':
        return '📅'
      case 'turno_finalizado':
        return '✅'
      default:
        return '🔔'
    }
  }

  const getColorByType = (tipo) => {
    switch (tipo) {
      case 'nuevo_turno':
        return 'border-green-200 bg-green-50'
      case 'turno_finalizado':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-lg">🔔</span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Notificaciones</h2>
            <p className="text-sm text-gray-500">Gestión de alertas del sistema</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          {notificacionesNoLeidas.length > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {notificacionesNoLeidas.length} nueva{notificacionesNoLeidas.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 sm:space-x-4 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('todas')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
            activeTab === 'todas'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('no-leidas')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
            activeTab === 'no-leidas'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          No leídas ({notificacionesNoLeidas.length})
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'configuracion' ? (
        <NotificationSettings />
      ) : (
        <div className="space-y-4">
          {notificacionesFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl sm:text-6xl mb-4">🔔</div>
              <p className="text-gray-500 text-sm sm:text-base">
                {activeTab === 'no-leidas' 
                  ? 'No hay notificaciones no leídas'
                  : 'No hay notificaciones'
                }
              </p>
            </div>
          ) : (
          notificacionesFiltradas.map((notificacion) => (
            <div
              key={notificacion.id}
              className={`border rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-md ${
                getColorByType(notificacion.tipo)
              } ${notificacion.leida ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-lg sm:text-xl">
                      {getIconByType(notificacion.tipo)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                        {notificacion.titulo}
                      </h3>
                      {!notificacion.leida && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base leading-relaxed">
                      {notificacion.mensaje}
                    </p>
                    <div className="text-xs sm:text-sm text-gray-500 flex items-center space-x-1">
                      <span>🕒</span>
                      <span>{format(new Date(notificacion.timestamp), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                    </div>
                    
                    {/* Detalles del turno */}
                    {notificacion.turno && (
                      <div className="mt-3 p-2 sm:p-3 bg-white rounded-lg border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                          <div>
                            <span className="font-medium">Cliente:</span> {notificacion.turno.cliente?.nombre}
                          </div>
                          <div>
                            <span className="font-medium">Teléfono:</span> {notificacion.turno.cliente?.telefono}
                          </div>
                          <div>
                            <span className="font-medium">Servicio:</span> {notificacion.turno.servicio}
                          </div>
                          <div>
                            <span className="font-medium">Sucursal:</span> {notificacion.turno.sucursal}
                          </div>
                          <div>
                            <span className="font-medium">Fecha:</span> {notificacion.turno.fecha}
                          </div>
                          <div>
                            <span className="font-medium">Horario:</span> {notificacion.turno.horario}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-2 sm:ml-4">
                  {notificacion.whatsappData && (
                    <button
                      onClick={() => handleEnviarWhatsApp(notificacion)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm flex items-center space-x-2 shadow-sm"
                      title="Enviar WhatsApp automáticamente"
                    >
                      <span>📱</span>
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  )}
                  
                  <div className="flex space-x-1 sm:space-x-2">
                    <button
                      onClick={() => marcarNotificacionComoLeida(notificacion.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors shadow-sm"
                    >
                      {notificacion.leida ? 'No leída' : 'Leída'}
                    </button>
                    <button
                      onClick={() => eliminarNotificacion(notificacion.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors shadow-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsPanel 