import React, { useEffect, useState } from 'react'

const Confetti = ({ 
  isActive = false, 
  duration = 3000,
  className = '',
  ...props 
}) => {
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: ['#16a34a', '#eab308', '#3b82f6', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
        size: Math.random() * 8 + 4
      }))
      
      setParticles(newParticles)
      
      const timer = setTimeout(() => {
        setParticles([])
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isActive, duration])
  
  if (!isActive || particles.length === 0) return null
  
  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`} {...props}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: '50%',
            transform: `rotate(${particle.rotation}deg)`,
            animation: `fall ${duration}ms linear forwards`,
            animationDelay: `${Math.random() * 1000}ms`
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(${Math.random() * 360}deg);
          }
        }
      `}</style>
    </div>
  )
}

export default Confetti 