import React from 'react'
import { Icon } from '@iconify/react'

const ProgressBar = ({ 
  value, 
  max = 100, 
  variant = 'default',
  size = 'md',
  showLabel = true,
  animated = true,
  className = '',
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const variants = {
    default: 'bg-green-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    primary: 'bg-green-600',
    secondary: 'bg-yellow-600'
  }
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  }
  
  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }
  
  const baseClasses = 'w-full bg-gray-200 rounded-full overflow-hidden'
  const progressClasses = [
    variants[variant],
    sizes[size],
    'rounded-full transition-all duration-500 ease-out',
    animated && 'animate-pulse'
  ].filter(Boolean).join(' ')
  
  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      <div 
        className={progressClasses}
        style={{ 
          width: `${percentage}%`,
          transition: animated ? 'width 0.5s ease-out' : 'none'
        }}
      />
      
      {showLabel && (
        <div className="flex items-center justify-between mt-2">
          <span className={`text-gray-600 font-medium ${labelSizes[size]}`}>
            {value} / {max}
          </span>
          <span className={`text-gray-500 ${labelSizes[size]}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar 