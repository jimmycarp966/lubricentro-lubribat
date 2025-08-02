import React, { useState, useEffect } from 'react'
import { FaTools, FaCheckCircle, FaClock, FaCar } from 'react-icons/fa'

const ServiceStatus = () => {
  const [currentStatus, setCurrentStatus] = useState('available')
  const [queueLength, setQueueLength] = useState(2)

  const statusConfig = {
    available: {
      icon: FaCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      text: 'Disponible',
      description: 'Sin espera'
    },
    busy: {
      icon: FaClock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      text: 'Ocupado',
      description: `${queueLength} en espera`
    },
    closed: {
      icon: FaTools,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      text: 'Cerrado',
      description: 'Hasta mañana'
    }
  }

  const config = statusConfig[currentStatus]
  const IconComponent = config.icon

  useEffect(() => {
    // Simular cambios de estado
    const interval = setInterval(() => {
      const now = new Date()
      const hour = now.getHours()
      const day = now.getDay()

      if (day === 0) { // Domingo
        setCurrentStatus('closed')
      } else if (hour < 8 || hour >= 20) {
        setCurrentStatus('closed')
      } else if (hour >= 12 && hour < 16) {
        setCurrentStatus('closed')
      } else {
        setCurrentStatus('available')
        setQueueLength(Math.floor(Math.random() * 3) + 1)
      }
    }, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed top-20 right-6 z-40">
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <IconComponent className={`text-lg ${config.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{config.text}</p>
            <p className="text-xs text-gray-600">{config.description}</p>
          </div>
        </div>
        
        {currentStatus === 'available' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <FaCar className="text-blue-600 text-sm" />
              <span className="text-xs text-gray-600">Próximo turno disponible</span>
            </div>
            <p className="text-xs text-green-600 font-medium mt-1">¡Reserva ahora!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceStatus 