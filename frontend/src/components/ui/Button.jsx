import React from 'react'
import { Icon } from '@iconify/react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props 
}) => {
  const baseClasses = 'btn inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    danger: 'btn-danger',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400'
  }
  
  const sizes = {
    sm: 'btn-sm',
    md: 'px-4 py-2',
    lg: 'btn-lg'
  }
  
  const classes = [
    baseClasses,
    variants[variant],
    sizes[size],
    className
  ].filter(Boolean).join(' ')
  
  const iconClasses = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  
  return (
    <button 
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className={`${iconClasses} mr-2 animate-spin`}>
          <Icon icon="mdi:loading" />
        </div>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <Icon icon={icon} className={`${iconClasses} mr-2`} />
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <Icon icon={icon} className={`${iconClasses} ml-2`} />
      )}
    </button>
  )
}

export default Button 