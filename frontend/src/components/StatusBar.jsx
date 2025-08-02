import React, { useState, useEffect } from 'react'
import { FaTools, FaCheckCircle, FaClock, FaCar } from 'react-icons/fa'

const StatusBar = () => {
  const [currentStatus, setCurrentStatus] = useState('available')
  const [queueLength, setQueueLength] = useState(2)

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date()
      const hour = now.getHours()
      const day = now.getDay()

      // Domingo cerrado
      if (day === 0) {
        setCurrentStatus('closed')
        setQueueLength(0)
        return
      }

      // Sábados solo mañana
      if (day === 6) {
        if (hour < 8 || hour >= 13) {
          setCurrentStatus('closed')
          setQueueLength(0)
        } else {
          setCurrentStatus('available')
          setQueueLength(Math.floor(Math.random() * 3) + 1)
        }
        return
      }

      // Lunes a Viernes
      if (hour < 8 || hour >= 20) {
        setCurrentStatus('closed')
        setQueueLength(0)
      } else if (hour >= 13 && hour < 16) {
        setCurrentStatus('break')
        setQueueLength(0)
      } else {
        setCurrentStatus('available')
        setQueueLength(Math.floor(Math.random() * 5) + 1)
      }
    }

    updateStatus()
    const interval = setInterval(updateStatus, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  const getStatusInfo = () => {
    switch (currentStatus) {
      case 'available':
        return {
          icon: <FaCheckCircle className="text-green-500" />,
          text: 'Disponible',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'busy':
        return {
          icon: <FaClock className="text-yellow-500" />,
          text: 'Ocupado',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      case 'break':
        return {
          icon: <FaClock className="text-orange-500" />,
          text: 'Receso',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
      case 'closed':
        return {
          icon: <FaTools className="text-gray-500" />,
          text: 'Cerrado',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
      default:
        return {
          icon: <FaCheckCircle className="text-green-500" />,
          text: 'Disponible',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 ${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-full px-4 py-2 shadow-lg`}>
      <div className="flex items-center space-x-2">
        {statusInfo.icon}
        <span className={`text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
        {currentStatus === 'available' && queueLength > 0 && (
          <span className="text-xs text-gray-500">
            • {queueLength} en cola
          </span>
        )}
      </div>
    </div>
  )
}

export default StatusBar 