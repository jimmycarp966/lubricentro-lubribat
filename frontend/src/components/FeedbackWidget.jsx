import React, { useState } from 'react'
import { FaStar, FaThumbsUp, FaSmile, FaFrown } from 'react-icons/fa'

const FeedbackWidget = () => {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (rating > 0) {
      setIsSubmitted(true)
      setTimeout(() => {
        setIsSubmitted(false)
        setRating(0)
        setFeedback('')
      }, 3000)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <FaThumbsUp className="text-3xl text-green-600 mx-auto mb-2" />
        <h3 className="font-semibold text-green-800 mb-1">¡Gracias por tu feedback!</h3>
        <p className="text-sm text-green-600">Tu opinión nos ayuda a mejorar</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Cómo fue tu experiencia?</h3>
        <p className="text-sm text-gray-600">Tu opinión nos ayuda a mejorar nuestros servicios</p>
      </div>

      {/* Calificación con estrellas */}
      <div className="mb-4">
        <div className="flex justify-center space-x-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl transition-all duration-200 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`}
            >
              <FaStar />
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500">
          {rating === 0 && 'Selecciona una calificación'}
          {rating === 1 && 'Muy malo'}
          {rating === 2 && 'Malo'}
          {rating === 3 && 'Regular'}
          {rating === 4 && 'Bueno'}
          {rating === 5 && 'Excelente'}
        </p>
      </div>

      {/* Comentario */}
      <div className="mb-4">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Cuéntanos sobre tu experiencia (opcional)..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows="3"
        />
      </div>

      {/* Botón de envío */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0}
        className={`w-full py-2 px-4 rounded-lg transition-colors ${
          rating === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        Enviar Feedback
      </button>
    </div>
  )
}

export default FeedbackWidget 