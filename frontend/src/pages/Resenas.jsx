import React, { useState } from 'react'
import { FaStar, FaThumbsUp, FaSmile, FaFrown, FaComment } from 'react-icons/fa'
import { createReview } from '../services/reviewsService'
import { useAuth } from '../contexts/AuthContext'

const Resenas = () => {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Por favor selecciona una calificación')
      return
    }

    setIsLoading(true)
    
    try {
      const reviewData = {
        rating,
        feedback,
        clientName: user?.displayName || 'Cliente anónimo',
        clientEmail: user?.email || 'sin-email@ejemplo.com',
        clientId: user?.uid || 'anonymous',
        service: 'Servicio de lubricentro',
        date: new Date().toISOString()
      }

      console.log('📝 Enviando reseña:', reviewData)
      
      const result = await createReview(reviewData)
      
      if (result.success) {
        console.log('✅ Reseña enviada exitosamente')
        setIsSubmitted(true)
        setRating(0)
        setFeedback('')
      } else {
        console.error('❌ Error enviando reseña:', result.error)
        alert('Error al enviar la reseña. Por favor intenta nuevamente.')
      }
    } catch (error) {
      console.error('❌ Error enviando reseña:', error)
      alert('Error al enviar la reseña. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = () => {
    return [...Array(5)].map((_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => setRating(index + 1)}
        className={`text-3xl transition-colors ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        } hover:text-yellow-400`}
      >
        <FaStar />
      </button>
    ))
  }

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaSmile className="text-white text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¡Gracias por tu opinión!
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Tu feedback nos ayuda a mejorar nuestros servicios. 
            Tu reseña será revisada y publicada pronto.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false)
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            Enviar otra reseña
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ¿Cómo fue tu experiencia?
        </h1>
        <p className="text-gray-600 text-xl">
          Tu opinión es muy importante para nosotros
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating con estrellas */}
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Califica nuestro servicio
            </h3>
            <div className="flex justify-center space-x-2 mb-4">
              {renderStars()}
            </div>
            <p className="text-sm text-gray-500">
              {rating === 0 && 'Selecciona una calificación'}
              {rating === 1 && 'Muy malo'}
              {rating === 2 && 'Malo'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bueno'}
              {rating === 5 && 'Excelente'}
            </p>
          </div>

          {/* Feedback escrito */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Cuéntanos más sobre tu experiencia
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              placeholder="¿Qué te gustó más? ¿Qué podríamos mejorar? Tu opinión nos ayuda a seguir creciendo..."
            />
          </div>

          {/* Botones de acción rápida */}
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFeedback(prev => prev + ' Servicio muy rápido y eficiente.')}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <FaThumbsUp className="text-green-600" />
              <span className="text-green-700 font-medium">Rápido</span>
            </button>
            
            <button
              type="button"
              onClick={() => setFeedback(prev => prev + ' Personal muy amable y profesional.')}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <FaSmile className="text-blue-600" />
              <span className="text-blue-700 font-medium">Amable</span>
            </button>
            
            <button
              type="button"
              onClick={() => setFeedback(prev => prev + ' Precios muy buenos.')}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-yellow-200 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition-all"
            >
              <FaComment className="text-yellow-600" />
              <span className="text-yellow-700 font-medium">Económico</span>
            </button>
          </div>

          {/* Botón de envío */}
          <div className="text-center pt-6">
            <button
              type="submit"
              disabled={rating === 0 || isLoading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar Reseña'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Estadísticas de reseñas */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Reseñas de nuestros clientes
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">4.8</div>
            <div className="flex justify-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < 4 ? 'text-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <p className="text-gray-600">Calificación promedio</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">1,247</div>
            <p className="text-gray-600">Reseñas recibidas</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">98%</div>
            <p className="text-gray-600">Clientes satisfechos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Resenas 