import React, { useState, useContext } from 'react'
import { FaBars, FaTimes, FaBell, FaCrown, FaUser, FaStar, FaComment, FaTools, FaChartBar, FaSearch, FaWhatsapp, FaEdit, FaTrash, FaCheck, FaClock, FaPhone, FaEnvelope } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const SidePanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(null)
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'reminder', message: 'Turno de Juan Pérez mañana a las 10:00', time: '2h', read: false },
    { id: 2, type: 'reminder', message: 'Cambio de aceite para ABC123', time: '4h', read: false },
    { id: 3, type: 'reminder', message: 'Revisión general pendiente', time: '6h', read: false },
    { id: 4, type: 'message', message: 'Cliente consulta sobre horarios', time: '1h', read: false },
    { id: 5, type: 'message', message: 'Solicitud de cambio de turno', time: '3h', read: false }
  ])


  const [loyaltyData, setLoyaltyData] = useState({
    points: 1250,
    level: 'Gold',
    progress: 62,
    nextLevel: 'Platinum',
    pointsNeeded: 500
  })
  const [staffData, setStaffData] = useState({
    newBookings: 1,
    completedServices: 2,
    pendingServices: 3,
    todayRevenue: 45000
  })
  const [ratings, setRatings] = useState({
    average: 4.9,
    total: 127,
    recent: 15
  })
  
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Solo mostrar para administradores o empleados autenticados
  const isAdmin = user && (user.role === 'admin' || user.role === 'employee')
  
  if (!isAdmin) {
    return null // No mostrar nada si no es admin o no está logueado
  }

  // Funciones interactivas
  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const handleReserveTurno = () => {
    navigate('/turnos')
    setIsOpen(false)
  }

  const handleViewHistory = () => {
    navigate('/buscar-cliente')
    setIsOpen(false)
  }

  const handleWhatsApp = (phone) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank')
  }

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_blank')
  }

  const handleEmail = (email) => {
    window.open(`mailto:${email}`, '_blank')
  }

  const getUnreadCount = (type) => {
    return notifications.filter(n => n.type === type && !n.read).length
  }

  return (
    <>
      {/* Botón flotante principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 bg-gradient-to-r from-green-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Panel lateral */}
      {isOpen && (
        <div className="fixed inset-0 z-40">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Panel de Control</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              {/* Contenido del panel */}
              <div className="space-y-6">
                {/* Sección: Notificaciones */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaBell className="text-green-600 mr-2" />
                    Notificaciones
                  </h3>
                  <div className="space-y-2">
                                         <button 
                       onClick={() => setActiveSection(activeSection === 'reminders' ? null : 'reminders')}
                       className="w-full text-left p-2 rounded hover:bg-white transition-colors"
                     >
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-600">Recordatorios ({getUnreadCount('reminder')})</span>
                         <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                           {getUnreadCount('reminder')}
                         </span>
                       </div>
                     </button>
                     <button 
                       onClick={() => setActiveSection(activeSection === 'messages' ? null : 'messages')}
                       className="w-full text-left p-2 rounded hover:bg-white transition-colors"
                     >
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-600">Mensajes ({getUnreadCount('message')})</span>
                         <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                           {getUnreadCount('message')}
                         </span>
                       </div>
                     </button>
                  </div>

                                     {/* Lista de notificaciones expandible */}
                   {activeSection && (
                     <div className="mt-3 space-y-2 max-h-40 overflow-y-auto border-t pt-3">
                                               <div className="text-xs text-gray-500 mb-2">
                          Mostrando {notifications.filter(n => n.type === activeSection).length} {activeSection === 'reminders' ? 'recordatorios' : 'mensajes'}
                        </div>
                       {notifications
                         .filter(n => n.type === activeSection)
                         .map(notification => (
                           <div 
                             key={notification.id} 
                             className={`p-3 rounded-lg border ${notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}
                           >
                             <div className="flex items-start justify-between">
                               <div className="flex-1">
                                 <p className={`${notification.read ? 'text-gray-500' : 'text-gray-800'} font-medium text-sm leading-tight`}>
                                   {notification.message}
                                 </p>
                                 <p className="text-gray-400 text-xs mt-1 flex items-center">
                                   <FaClock className="mr-1" />
                                   {notification.time}
                                 </p>
                               </div>
                               <div className="flex space-x-1 ml-2">
                                 {!notification.read && (
                                   <button
                                     onClick={() => markNotificationAsRead(notification.id)}
                                     className="text-green-600 hover:text-green-800 p-1 rounded"
                                     title="Marcar como leída"
                                   >
                                     <FaCheck className="text-xs" />
                                   </button>
                                 )}
                                 <button
                                   onClick={() => deleteNotification(notification.id)}
                                   className="text-red-600 hover:text-red-800 p-1 rounded"
                                   title="Eliminar"
                                 >
                                   <FaTrash className="text-xs" />
                                 </button>
                               </div>
                             </div>
                           </div>
                         ))}
                       {notifications.filter(n => n.type === activeSection).length === 0 && (
                         <div className="text-center text-gray-500 text-xs py-4 bg-gray-50 rounded-lg">
                           No hay {activeSection === 'reminders' ? 'recordatorios' : 'mensajes'} para mostrar
                         </div>
                       )}
                     </div>
                   )}
                </div>

                {/* Sección: Fidelización */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaCrown className="text-yellow-600 mr-2" />
                    Programa de Fidelidad
                  </h3>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{loyaltyData.points.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 mb-3">puntos disponibles</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" 
                        style={{ width: `${loyaltyData.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">Nivel {loyaltyData.level}</div>
                    <div className="text-xs text-gray-400">
                      {loyaltyData.pointsNeeded} puntos para {loyaltyData.nextLevel}
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/buscar-cliente')}
                    className="w-full mt-3 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                  >
                    Ver Clientes VIP
                  </button>
                </div>

                {/* Sección: Personal */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUser className="text-blue-600 mr-2" />
                    Panel del Personal
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Nuevas reservas</span>
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">{staffData.newBookings}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Servicios completados</span>
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">{staffData.completedServices}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pendientes</span>
                      <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-1">{staffData.pendingServices}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Ingresos hoy</span>
                      <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1">${staffData.todayRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <button 
                      onClick={() => navigate('/admin/turnos')}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                    >
                      Gestionar Turnos
                    </button>
                    <button 
                      onClick={() => handleWhatsApp('+54 381 123-4567')}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaWhatsapp className="text-xs" />
                      Contactar Cliente
                    </button>
                  </div>
                </div>

                {/* Sección: Feedback */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaStar className="text-green-600 mr-2" />
                    Calificaciones
                  </h3>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar key={star} className="text-yellow-400 text-sm" />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">{ratings.average}/5 ({ratings.total} reseñas)</div>
                    <div className="text-xs text-gray-500 mt-1">{ratings.recent} nuevas esta semana</div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <button 
                      onClick={() => navigate('/resenas')}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                    >
                      Ver Todas las Reseñas
                    </button>
                    <button 
                      onClick={() => handleEmail('feedback@lubribat.com')}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaEnvelope className="text-xs" />
                      Contactar Cliente
                    </button>
                  </div>
                </div>

                {/* Botones de acción rápida */}
                <div className="space-y-2">
                  <button 
                    onClick={handleReserveTurno}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium"
                  >
                    Reservar Turno
                  </button>
                  <button 
                    onClick={handleViewHistory}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Ver Historial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SidePanel 