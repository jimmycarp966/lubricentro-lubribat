import React from 'react'
import { Link } from 'react-router-dom'
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
  as,
  to,
  href,
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
  
  const iconElement = (
    <>
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
    </>
  )
  
  // Si es un Link de React Router
  if (as === 'Link' || to) {
    return (
      <Link 
        to={to}
        className={classes}
        {...props}
      >
        {iconElement}
      </Link>
    )
  }
  
  // Si es un enlace externo
  if (as === 'a' || href) {
    return (
      <a 
        href={href}
        className={classes}
        {...props}
      >
        {iconElement}
      </a>
    )
  }
  
  // Botón normal
  return (
    <button 
      className={`${classes} ripple`}
      disabled={disabled || loading}
      {...props}
    >
      {iconElement}
    </button>
  )
}

export default Button 