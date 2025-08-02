import React, { useState } from 'react'
import { FaGift, FaTimes, FaClock, FaStar } from 'react-icons/fa'

const PromotionBanner = () => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaGift className="text-2xl animate-pulse" />
            <div>
              <p className="font-bold text-sm">¡OFERTA ESPECIAL!</p>
              <p className="text-xs opacity-90">Cambio de aceite + filtro = $12,000</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-xs">
              <FaClock />
              <span>Válido hasta fin de mes</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <FaStar />
              <span>4.9/5</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromotionBanner 