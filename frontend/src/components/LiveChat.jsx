import React, { useState, useEffect, useRef } from 'react'
import { FaComments, FaTimes, FaPaperPlane, FaWhatsapp, FaPhone } from 'react-icons/fa'

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '¡Hola! 👋 ¿En qué podemos ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const quickReplies = [
    '¿Cuáles son sus horarios?',
    '¿Qué servicios ofrecen?',
    '¿Cuánto cuesta un cambio de aceite?',
    '¿Tienen turnos disponibles?'
  ]

  const botResponses = {
    'horarios': 'Nuestros horarios son: Lunes a Viernes de 08:00-13:00 y 16:00-20:00, Sábados de 08:30-13:00. ¿Te gustaría agendar un turno?',
    'servicios': 'Ofrecemos cambio de aceite, revisión general, cambio de filtros, lubricación completa y diagnóstico computarizado. ¿Cuál te interesa?',
    'precio': 'El cambio de aceite básico cuesta $15,000. Incluye aceite de calidad y filtro. ¿Te gustaría reservar?',
    'turnos': 'Tenemos turnos disponibles esta semana. ¿Qué día te viene mejor?'
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage.toLowerCase())
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const generateBotResponse = (message) => {
    if (message.includes('horario')) return botResponses.horarios
    if (message.includes('servicio')) return botResponses.servicios
    if (message.includes('precio') || message.includes('cuesta') || message.includes('costo')) return botResponses.precio
    if (message.includes('turno')) return botResponses.turnos
    if (message.includes('gracias')) return '¡De nada! 😊 ¿Hay algo más en lo que podamos ayudarte?'
    
    return 'Gracias por tu consulta. Te recomiendo agendar un turno para una atención más personalizada. ¿Te gustaría que te ayude con eso?'
  }

  const handleQuickReply = (reply) => {
    setInputMessage(reply)
    handleSendMessage()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
            isOpen ? 'hidden' : 'block'
          }`}
        >
          <FaComments className="text-2xl" />
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaComments className="text-lg" />
              </div>
              <div>
                <h3 className="font-semibold">LUBRI-BAT</h3>
                <p className="text-sm opacity-90">Soporte en vivo</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </div>

          {/* Contact Options */}
          <div className="px-4 pb-4">
            <div className="flex space-x-2">
              <a
                href="https://wa.me/5491112345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:+5491112345678"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <FaPhone />
                <span>Llamar</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LiveChat 