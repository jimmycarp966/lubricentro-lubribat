import React, { useState } from 'react'
import { Icon } from '@iconify/react'

const Rating = ({ 
  value = 0, 
  max = 5, 
  onChange, 
  readonly = false,
  size = 'md',
  showValue = true,
  className = '',
  ...props 
}) => {
  const [hoverValue, setHoverValue] = useState(0)
  
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }
  
  const handleClick = (starValue) => {
    if (!readonly && onChange) {
      onChange(starValue)
    }
  }
  
  const handleMouseEnter = (starValue) => {
    if (!readonly) {
      setHoverValue(starValue)
    }
  }
  
  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0)
    }
  }
  
  const displayValue = hoverValue || value
  
  return (
    <div className={`flex items-center space-x-1 ${className}`} {...props}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= displayValue
        const isHalf = !isFilled && starValue - 0.5 <= displayValue
        
        return (
          <button
            key={index}
            type="button"
            className={`transition-all duration-200 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
          >
            <Icon 
              icon={isFilled ? 'mdi:star' : isHalf ? 'mdi:star-half' : 'mdi:star-outline'}
              className={`${sizes[size]} ${
                isFilled 
                  ? 'text-yellow-400 animate-heartbeat' 
                  : isHalf 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
              }`}
            />
          </button>
        )
      })}
      
      {showValue && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {value.toFixed(1)} / {max}
        </span>
      )}
    </div>
  )
}

export default Rating 