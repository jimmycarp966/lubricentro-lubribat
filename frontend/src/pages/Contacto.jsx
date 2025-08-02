import React from 'react'
import { FaMapMarkerAlt, FaClock, FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa'

const Contacto = () => {
  return (
    <div className="max-w-6xl mx-auto py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Contáctanos
        </h1>
        <p className="text-xl text-gray-600">
          Tenemos dos sucursales para brindarte el mejor servicio
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Sucursal Monteros */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-green-600 mb-2">Sucursal Monteros</h2>
            <p className="text-gray-600">Nuestra sucursal principal</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <FaMapMarkerAlt className="text-red-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Dirección</h3>
                <p className="text-gray-600">Av. Principal 123, Monteros, Tucumán</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <FaClock className="text-blue-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Horarios</h3>
                <p className="text-gray-600">
                  Lunes a Viernes: 8:00 - 18:00 hs<br />
                  Sábados: 8:00 - 12:00 hs
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <FaPhone className="text-green-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Teléfono</h3>
                <p className="text-gray-600">+54 381 123-4567</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <FaWhatsapp className="text-green-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">WhatsApp</h3>
                <p className="text-gray-600">+54 381 123-4567</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <FaEnvelope className="text-blue-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Email</h3>
                <p className="text-gray-600">monteros@lubribat.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sucursal Concepción */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-green-600 mb-2">Sucursal Concepción</h2>
            <p className="text-gray-600">Nuestra sucursal en Concepción</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <FaMapMarkerAlt className="text-red-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Dirección</h3>
                <p className="text-gray-600">Calle Central 456, Concepción, Tucumán</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <FaClock className="text-blue-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Horarios</h3>
                <p className="text-gray-600">
                  Lunes a Viernes: 8:00 - 18:00 hs<br />
                  Sábados: 8:00 - 12:00 hs
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <FaPhone className="text-green-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Teléfono</h3>
                <p className="text-gray-600">+54 381 987-6543</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <FaWhatsapp className="text-green-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">WhatsApp</h3>
                <p className="text-gray-600">+54 381 987-6543</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <FaEnvelope className="text-blue-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Email</h3>
                <p className="text-gray-600">concepcion@lubribat.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-gray-600 text-lg">
            Nuestro equipo está disponible para atenderte en ambas sucursales
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClock className="text-white text-2xl" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Atención Rápida</h4>
            <p className="text-gray-600">Servicio en 15-30 minutos</p>
          </div>
          
          <div>
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaWhatsapp className="text-white text-2xl" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">WhatsApp</h4>
            <p className="text-gray-600">Consulta rápida por WhatsApp</p>
          </div>
          
          <div>
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaMapMarkerAlt className="text-white text-2xl" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Dos Ubicaciones</h4>
            <p className="text-gray-600">Monteros y Concepción</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contacto 