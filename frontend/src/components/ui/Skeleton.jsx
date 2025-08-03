import React from 'react'

const Skeleton = ({ 
  className = '', 
  variant = 'text', 
  width, 
  height,
  lines = 1,
  ...props 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variants = {
    text: 'h-4',
    title: 'h-8',
    avatar: 'w-12 h-12 rounded-full',
    card: 'h-48 rounded-lg',
    button: 'h-10 w-24 rounded-lg',
    input: 'h-12 rounded-lg'
  }
  
  const classes = [
    baseClasses,
    variants[variant],
    className
  ].filter(Boolean).join(' ')
  
  const style = {
    width: width,
    height: height,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200px 100%',
    animation: 'shimmer 1.5s infinite'
  }
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={classes}
            style={style}
          />
        ))}
      </div>
    )
  }
  
  return (
    <div 
      className={classes}
      style={style}
      {...props}
    />
  )
}

export default Skeleton 