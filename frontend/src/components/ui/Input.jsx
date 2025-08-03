import React from 'react'
import { Icon } from '@iconify/react'

const Input = ({ 
  label,
  error,
  success,
  icon,
  iconPosition = 'left',
  className = '',
  ...props 
}) => {
  const baseClasses = 'input'
  const stateClasses = error ? 'input-error' : success ? 'input-success' : ''
  
  const classes = [
    baseClasses,
    stateClasses,
    className
  ].filter(Boolean).join(' ')
  
  const iconClasses = 'w-5 h-5 text-gray-400'
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon icon={icon} className={iconClasses} />
          </div>
        )}
        
        <input 
          className={classes}
          style={icon && iconPosition === 'left' ? { paddingLeft: '2.75rem' } : {}}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon icon={icon} className={iconClasses} />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <Icon icon="mdi:check-circle" className="w-4 h-4 mr-1" />
          {success}
        </p>
      )}
    </div>
  )
}

export default Input 