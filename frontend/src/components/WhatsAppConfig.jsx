import React, { useState } from 'react'
import { setBusinessWhatsAppNumber, getBusinessConfig } from '../utils/whatsappService'
import toast from 'react-hot-toast'

const WhatsAppConfig = () => {
  const [whatsappNumber, setWhatsappNumber] = useState(getBusinessConfig().whatsappNumber)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    if (whatsappNumber.length < 10) {
      toast.error('El número debe tener al menos 10 dígitos')
      return
    }

    setBusinessWhatsAppNumber(whatsappNumber)
    setIsEditing(false)
    toast.success('Número de WhatsApp Business configurado correctamente')
  }

  const handleCancel = () => {
    setWhatsappNumber(getBusinessConfig().whatsappNumber)
    setIsEditing(false)
  }

  const formatNumber = (number) => {
    // Formatear número para mostrar: +54 9 381 512-3456
    const cleaned = number.replace(/\D/g, '')
    if (cleaned.length === 0) return ''
    
    let formatted = ''
    if (cleaned.startsWith('54')) {
      formatted = `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}-${cleaned.slice(9, 13)}`
    } else {
      formatted = cleaned
    }
    
    return formatted
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Configuración WhatsApp Business</h2>
          <p className="text-gray-600">Configura el número desde el cual se enviarán los mensajes</p>
        </div>
        <div className="text-4xl">📱</div>
      </div>

      <div className="space-y-6">
        {/* Información actual */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Número Actual</h3>
          <p className="text-blue-600 font-mono text-lg">
            {formatNumber(getBusinessConfig().whatsappNumber)}
          </p>
          <p className="text-sm text-blue-500 mt-1">
            Este es el número que aparecerá como remitente en los mensajes
          </p>
        </div>

        {/* Formulario de configuración */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de WhatsApp Business
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="5493815123456"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
                <div className="text-sm text-gray-500">
                  <p>Formato: código país + código área + número</p>
                  <p>Ejemplo: 5493815123456 (Argentina, Tucumán)</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    ✅ Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex-1 p-3 bg-gray-100 rounded-xl font-mono">
                  {formatNumber(whatsappNumber)}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  ✏️ Editar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Instrucciones</h3>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>1. <strong>Configura el número:</strong> Ingresa el número de WhatsApp Business del lubricentro</p>
            <p>2. <strong>Formato requerido:</strong> Código país + código área + número (sin espacios ni guiones)</p>
            <p>3. <strong>Ejemplo Argentina:</strong> 5493815123456</p>
            <p>4. <strong>Verificación:</strong> Asegúrate de que el número esté registrado en WhatsApp Business</p>
          </div>
        </div>

        {/* Información sobre el funcionamiento */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">🔄 Cómo funciona</h3>
          <div className="space-y-2 text-sm text-green-700">
            <p>• Cuando alguien reserve un turno, se creará una notificación</p>
            <p>• Al hacer clic en "Enviar WhatsApp", se abrirá WhatsApp con el mensaje pre-llenado</p>
            <p>• El mensaje se enviará desde este número configurado al cliente</p>
            <p>• Solo necesitas hacer clic en "Enviar" desde WhatsApp</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatsAppConfig 