import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTurnos } from '../contexts/TurnosContext'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const SidePanel = () => {
  const { user } = useAuth()
  const { notifications, obtenerNotificacionesNoLeidas } = useTurnos()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  // Solo mostrar para administradores y empleados
  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
    return null
  }

  const notificacionesNoLeidas = obtenerNotificacionesNoLeidas()
  const notificacionesRecientes = notifications.slice(0, 3)

  const handleNotificationClick = (notificacion) => {
    // Marcar como leída
    if (!notificacion.leida) {
      // Aquí podrías llamar a una función para marcar como leída
      console.log('Marcando notificación como leída:', notificacion.id)
    }
    
    // Navegar según el tipo de notificación
    if (notificacion.tipo === 'nuevo_turno' || notificacion.tipo === 'turno_finalizado') {
      // Navegar a gestión de turnos
      navigate('/admin', { state: { activeTab: 'turnos' } })
    } else if (notificacion.tipo === 'nuevo_pedido' || notificacion.tipo === 'estado_pedido') {
      // Navegar a gestión de pedidos
      navigate('/admin', { state: { activeTab: 'pedidos' } })
    } else {
      // Navegar al panel general
      navigate('/admin')
    }
    
    setIsOpen(false)
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-32 z-40 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
          </svg>
          {notificacionesNoLeidas.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notificacionesNoLeidas.length}
            </span>
          )}
        </div>
      </button>

      {/* Panel lateral */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Panel de Control</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Notificaciones */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">Notificaciones</h3>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {notificacionesNoLeidas.length} nuevas
                </span>
              </div>
              
              <div className="space-y-3">
                {notificacionesRecientes.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay notificaciones</p>
                ) : (
                  notificacionesRecientes.map((notificacion) => (
                    <div
                      key={notificacion.id}
                      onClick={() => handleNotificationClick(notificacion)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        notificacion.leida 
                          ? 'bg-gray-50 hover:bg-gray-100' 
                          : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg">
                          {notificacion.tipo === 'nuevo_turno' ? '📅' : '✅'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-800">
                            {notificacion.titulo}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {notificacion.mensaje}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(notificacion.timestamp), 'dd/MM HH:mm', { locale: es })}
                          </p>
                        </div>
                        {!notificacion.leida && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 3 && (
                <button
                  onClick={() => {
                    navigate('/admin')
                    setIsOpen(false)
                  }}
                  className="w-full mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver todas las notificaciones →
                </button>
              )}
            </div>

            {/* Acciones rápidas */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-4">Acciones Rápidas</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/admin')
                    setIsOpen(false)
                  }}
                  className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">📊</div>
                    <div>
                      <div className="font-medium text-sm">Panel de Admin</div>
                      <div className="text-xs text-gray-600">Gestionar turnos y más</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/admin')
                    setIsOpen(false)
                  }}
                  className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-green-600">📅</div>
                    <div>
                      <div className="font-medium text-sm">Gestión de Turnos</div>
                      <div className="text-xs text-gray-600">Ver y gestionar citas</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/admin')
                    setIsOpen(false)
                  }}
                  className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-purple-600">🔔</div>
                    <div>
                      <div className="font-medium text-sm">Notificaciones</div>
                      <div className="text-xs text-gray-600">Ver todas las alertas</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Información del usuario */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.nombre?.charAt(0) || 'A'}
                </div>
                <div>
                  <div className="font-medium text-sm">{user.nombre}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default SidePanel 