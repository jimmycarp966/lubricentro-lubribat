import React, { useState } from 'react'
import { FaStar, FaThumbsUp, FaThumbsDown, FaComment, FaSmile, FaMeh, FaFrown } from 'react-icons/fa'

const FeedbackSystem = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [satisfaction, setSatisfaction] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleRating = (value) => {
    setRating(value)
  }

  const handleSatisfaction = (level) => {
    setSatisfaction(level)
  }

  const handleSubmit = () => {
    if (rating > 0) {
      setIsSubmitted(true)
      // Aquí se enviaría el feedback al backend
      setTimeout(() => {
        setIsVisible(false)
        setIsSubmitted(false)
        setRating(0)
        setFeedback('')
        setSatisfaction('')
      }, 2000)
    }
  }

  const getSatisfactionIcon = (level) => {
    switch (level) {
      case 'excellent': return <FaSmile className="text-2xl text-green-500" />
      case 'good': return <FaSmile className="text-2xl text-yellow-500" />
      case 'poor': return <FaFrown className="text-2xl text-red-500" />
      default: return <FaMeh className="text-2xl text-gray-400" />
    }
  }

  const getSatisfactionText = (level) => {
    switch (level) {
      case 'excellent': return 'Excelente'
      case 'good': return 'Bueno'
      case 'poor': return 'Malo'
      default: return 'Seleccionar'
    }
  }

  return (
    <div className="text-center">
      {/* Botón integrado en la página */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
      >
        <FaComment className="text-lg" />
        <span>¿Cómo fue tu experiencia?</span>
      </button>

      {/* Panel de feedback */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-4">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">¿Cómo fue tu experiencia?</h3>
                <p className="text-sm text-gray-600">Tu opinión nos ayuda a mejorar</p>
              </div>

              {/* Contenido */}
              <div className="p-4 space-y-6">
                {/* Calificación con estrellas */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Califica nuestro servicio:</p>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className={`text-2xl transition-all duration-200 ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {rating === 0 && 'Selecciona una calificación'}
                    {rating === 1 && 'Muy malo'}
                    {rating === 2 && 'Malo'}
                    {rating === 3 && 'Regular'}
                    {rating === 4 && 'Bueno'}
                    {rating === 5 && 'Excelente'}
                  </p>
                </div>

                {/* Nivel de satisfacción */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">¿Qué tan satisfecho estás?</p>
                  <div className="flex justify-center space-x-4">
                    {[
                      { level: 'excellent', icon: FaSmile, color: 'text-green-500' },
                      { level: 'good', icon: FaSmile, color: 'text-yellow-500' },
                      { level: 'poor', icon: FaFrown, color: 'text-red-500' }
                    ].map(({ level, icon: Icon, color }) => (
                      <button
                        key={level}
                        onClick={() => handleSatisfaction(level)}
                        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                          satisfaction === level 
                            ? 'bg-gray-100 border-2 border-green-500' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`text-2xl ${color}`} />
                        <span className="text-xs text-gray-600">
                          {getSatisfactionText(level)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comentario */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Comentarios (opcional):</p>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Cuéntanos sobre tu experiencia..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      rating === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Mensaje de confirmación */
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaThumbsUp className="text-3xl text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">¡Gracias por tu feedback!</h3>
              <p className="text-sm text-gray-600">Tu opinión nos ayuda a mejorar nuestros servicios.</p>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)
}

export default FeedbackSystem 