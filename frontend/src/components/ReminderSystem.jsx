import React, { useState, useEffect } from 'react'
import { FaBell, FaClock, FaTools, FaCar, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

const ReminderSystem = () => {
  const [reminders, setReminders] = useState([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Simular recordatorios inteligentes
    const mockReminders = [
      {
        id: 1,
        type: 'maintenance',
        title: 'Cambio de aceite recomendado',
        message: 'Tu vehículo necesita cambio de aceite en 500 km',
        priority: 'high',
        icon: FaTools,
        color: 'text-orange-600'
      },
      {
        id: 2,
        type: 'appointment',
        title: 'Turno confirmado',
        message: 'Tu cita está programada para mañana a las 10:00',
        priority: 'medium',
        icon: FaClock,
        color: 'text-green-600'
      },
      {
        id: 3,
        type: 'service',
        title: 'Servicio completado',
        message: 'Tu cambio de aceite fue completado exitosamente',
        priority: 'low',
        icon: FaCheckCircle,
        color: 'text-blue-600'
      }
    ]
    setReminders(mockReminders)
  }, [])

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50'
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-4 border-green-500 bg-green-50'
      default: return 'border-l-4 border-gray-500 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <FaExclamationTriangle className="text-red-500" />
      case 'medium': return <FaClock className="text-yellow-500" />
      case 'low': return <FaCheckCircle className="text-green-500" />
      default: return <FaBell className="text-gray-500" />
    }
  }

  return (
    <div className="fixed top-32 right-6 z-40">
      {/* Botón flotante */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
      >
        <FaBell className="text-2xl text-green-600" />
        {reminders.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {reminders.length}
          </span>
        )}
      </button>

      {/* Panel de recordatorios */}
      {isVisible && (
        <div className="absolute top-16 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recordatorios</h3>
            <p className="text-sm text-gray-600">Mantén tu vehículo al día</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {reminders.length === 0 ? (
              <div className="p-6 text-center">
                <FaBell className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay recordatorios pendientes</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`p-4 rounded-lg ${getPriorityColor(reminder.priority)} transition-all duration-200 hover:shadow-md`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getPriorityIcon(reminder.priority)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {reminder.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {reminder.message}
                        </p>
                        <div className="flex space-x-2">
                          <button className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors">
                            Ver más
                          </button>
                          <button className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              Ver todos los recordatorios
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReminderSystem 