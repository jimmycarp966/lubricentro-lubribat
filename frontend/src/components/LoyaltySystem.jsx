import React, { useState, useEffect } from 'react'
import { FaStar, FaGift, FaCrown, FaPercent, FaTrophy, FaCoins } from 'react-icons/fa'

const LoyaltySystem = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [customerData, setCustomerData] = useState({
    points: 1250,
    level: 'Gold',
    visits: 8,
    nextReward: 200,
    rewards: [
      { id: 1, name: 'Cambio de aceite gratis', points: 500, available: true },
      { id: 2, name: '20% descuento en lubricación', points: 300, available: true },
      { id: 3, name: 'Revisión gratuita', points: 200, available: true },
      { id: 4, name: 'Café gratis', points: 50, available: true }
    ]
  })

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
      case 'Bronze': return <FaStar className="text-orange-500" />
      case 'Silver': return <FaStar className="text-gray-500" />
      case 'Gold': return <FaCrown className="text-yellow-500" />
      case 'Platinum': return <FaTrophy className="text-purple-500" />
      default: return <FaStar className="text-green-500" />
    }
  }

  return (
    <div className="fixed top-24 left-6 z-40">
      {/* Botón flotante */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <FaCrown className="text-2xl text-white" />
      </button>

      {/* Panel de fidelización */}
      {isVisible && (
        <div className="absolute top-16 left-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              {getLevelIcon(customerData.level)}
              <div>
                <h3 className="text-lg font-semibold">Programa de Fidelidad</h3>
                <p className="text-sm opacity-90">Nivel {customerData.level}</p>
              </div>
            </div>
          </div>

          {/* Puntos y estadísticas */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Puntos actuales</p>
                <p className="text-2xl font-bold text-green-600">{customerData.points}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Próxima recompensa</p>
                <p className="text-lg font-semibold text-orange-600">{customerData.nextReward} pts</p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{Math.round((customerData.points / 2000) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((customerData.points / 2000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Visitas: {customerData.visits}</span>
              <span className="text-green-600 font-medium">+50 pts por visita</span>
            </div>
          </div>

          {/* Recompensas disponibles */}
          <div className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Recompensas disponibles</h4>
            <div className="space-y-2">
              {customerData.rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    reward.available && customerData.points >= reward.points
                      ? 'border-green-200 bg-green-50 hover:bg-green-100'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <FaGift className={`text-lg ${
                        reward.available && customerData.points >= reward.points
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          reward.available && customerData.points >= reward.points
                            ? 'text-gray-800'
                            : 'text-gray-500'
                        }`}>
                          {reward.name}
                        </p>
                        <p className="text-xs text-gray-500">{reward.points} puntos</p>
                      </div>
                    </div>
                    <button
                      disabled={!reward.available || customerData.points < reward.points}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        reward.available && customerData.points >= reward.points
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Canjear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex space-x-2">
              <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                Ver historial
              </button>
              <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                Más recompensas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoyaltySystem 