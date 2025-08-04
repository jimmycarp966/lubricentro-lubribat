import React from 'react'
import { FaCalendarAlt, FaClock, FaTools, FaUser, FaCheck } from 'react-icons/fa'

const BookingProgress = ({ currentStep, totalSteps = 6 }) => {
  const steps = [
    { id: 1, title: 'Sucursal', icon: FaCalendarAlt, description: 'Elige sucursal' },
    { id: 2, title: 'Fecha', icon: FaCalendarAlt, description: 'Selecciona el día' },
    { id: 3, title: 'Horario', icon: FaClock, description: 'Elige la hora' },
    { id: 4, title: 'Servicio', icon: FaTools, description: 'Qué necesitas' },
    { id: 5, title: 'Datos', icon: FaUser, description: 'Tu información' },
    { id: 6, title: 'Pago', icon: FaCheck, description: 'Confirma y paga' }
  ]

  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile Progress - Horizontal Scroll */}
      <div className="md:hidden overflow-x-auto pb-4">
        <div className="flex items-center min-w-max">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep
            const isUpcoming = step.id > currentStep

            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted 
                        ? 'bg-green-600 text-white' 
                        : isActive 
                          ? 'bg-blue-600 text-white ring-2 sm:ring-4 ring-blue-200' 
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <FaCheck className="text-sm sm:text-lg" />
                    ) : (
                      <step.icon className="text-sm sm:text-lg" />
                    )}
                  </div>
                  
                  {/* Step Info */}
                  <div className="mt-2 text-center min-w-[60px] sm:min-w-[80px]">
                    <p className={`text-xs sm:text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-gray-200 min-w-[20px] sm:min-w-[30px]">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Desktop Progress - Full Width */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          const isUpcoming = step.id > currentStep

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted 
                      ? 'bg-green-600 text-white' 
                      : isActive 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200' 
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? (
                    <FaCheck className="text-lg" />
                  ) : (
                    <step.icon className="text-lg" />
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 sm:mt-6">
        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">
          Paso {currentStep} de {totalSteps}
        </p>
      </div>
    </div>
  )
}

export default BookingProgress 