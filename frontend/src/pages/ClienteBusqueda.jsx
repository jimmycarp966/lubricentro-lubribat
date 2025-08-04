import React, { useState } from 'react'
import { FaSearch, FaPhone, FaCar, FaHistory, FaStar, FaCrown } from 'react-icons/fa'
import { buscarClientePorWhatsApp, buscarClientePorPatente } from '../services/clientesService'

const ClienteBusqueda = () => {
  const [telefono, setTelefono] = useState('')
  const [patente, setPatente] = useState('')
  const [busquedaPor, setBusquedaPor] = useState('telefono') // 'telefono' o 'patente'
  const [clienteEncontrado, setClienteEncontrado] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Simulación de base de datos de clientes
  const clientesDB = [
    {
      telefono: '+54 9 11 1234-5678',
      nombre: 'Juan Pérez',
      vehiculos: [
        { patente: 'ABC123', modelo: 'Toyota Corolla 2020' },
        { patente: 'XYZ789', modelo: 'Ford Ranger 2019' }
      ],
      historial: [
        {
          fecha: '2024-01-15',
          servicio: 'Cambio de Aceite y Filtro',
          sucursal: 'Sucursal Monteros',
          patente: 'ABC123',
          puntos: 50
        },
        {
          fecha: '2024-01-10',
          servicio: 'Revisión General',
          sucursal: 'Sucursal Monteros',
          patente: 'ABC123',
          puntos: 100
        },
        {
          fecha: '2024-01-05',
          servicio: 'Cambio de Filtros',
          sucursal: 'Sucursal Concepción',
          patente: 'XYZ789',
          puntos: 30
        }
      ],
      puntosAcumulados: 180,
      nivel: 'Bronce',
      fechaPrimeraVisita: '2024-01-05',
      ultimaVisita: '2024-01-15'
    }
  ]

  const buscarCliente = async () => {
    setIsLoading(true)
    setError('')
    setClienteEncontrado(null)
    
    try {
      let cliente = null
      
      if (busquedaPor === 'telefono') {
        if (!telefono || telefono.trim() === '') {
          setError('Por favor ingresa un número de WhatsApp')
          return
        }
        console.log('🔍 Buscando por WhatsApp:', telefono)
        cliente = await buscarClientePorWhatsApp(telefono)
      } else if (busquedaPor === 'patente') {
        if (!patente || patente.trim() === '') {
          setError('Por favor ingresa una patente')
          return
        }
        console.log('🔍 Buscando por patente:', patente)
        cliente = await buscarClientePorPatente(patente)
      }
      
      if (cliente) {
        console.log('✅ Cliente encontrado:', cliente)
        setClienteEncontrado(cliente)
      } else {
        setError('No se encontró ningún cliente con esos datos')
      }
    } catch (error) {
      console.error('❌ Error buscando cliente:', error)
      setError('Error al buscar cliente. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatearTelefono = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '+54 9 $1 $2-$3')
    }
    return value
  }

  const formatearPatente = (value) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  }

  const handleTelefonoChange = (e) => {
    const formatted = formatearTelefono(e.target.value)
    setTelefono(formatted)
  }

  const handlePatenteChange = (e) => {
    const formatted = formatearPatente(e.target.value)
    setPatente(formatted)
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Buscar Cliente
        </h1>
        <p className="text-gray-600">
          Ingresa el número de WhatsApp para ver el historial del cliente
        </p>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        {/* Selector de tipo de búsqueda */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Buscar por:
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setBusquedaPor('telefono')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                busquedaPor === 'telefono'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaPhone className="inline mr-2" />
              WhatsApp
            </button>
            <button
              onClick={() => setBusquedaPor('patente')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                busquedaPor === 'patente'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaCar className="inline mr-2" />
              Patente
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {busquedaPor === 'telefono' ? (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de WhatsApp
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={telefono}
                  onChange={handleTelefonoChange}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patente del Vehículo
              </label>
              <div className="relative">
                <FaCar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={patente}
                  onChange={handlePatenteChange}
                  placeholder="ABC123"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all uppercase"
                />
              </div>
            </div>
          )}
          <button
            onClick={buscarCliente}
            disabled={isLoading || (busquedaPor === 'telefono' ? !telefono : !patente)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaSearch />
            )}
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Resultado */}
      {clienteEncontrado && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Información del Cliente */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Información del Cliente</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{clienteEncontrado.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">WhatsApp</p>
                  <p className="font-medium">{clienteEncontrado.whatsapp}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Primera visita</p>
                  <p className="font-medium">{new Date(clienteEncontrado.fechaPrimeraVisita).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última visita</p>
                  <p className="font-medium">{new Date(clienteEncontrado.ultimaVisita).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <FaCrown className="text-yellow-500" />
                Programa de Fidelidad
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Total turnos</p>
                  <p className="font-bold text-2xl text-green-600">{clienteEncontrado.totalTurnos}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Primera visita</p>
                  <p className="font-medium">{new Date(clienteEncontrado.primeraVisita).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última visita</p>
                  <p className="font-medium">{new Date(clienteEncontrado.ultimaVisita).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <FaCar className="text-blue-500" />
                Vehículos Registrados
              </h3>
              <div className="space-y-3">
                {clienteEncontrado.vehiculos.map((vehiculo, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-3">
                    <p className="font-medium">{vehiculo.patente}</p>
                    <p className="text-sm text-gray-600">{vehiculo.modelo}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Historial de Servicios */}
          <div>
            <h3 className="font-semibold text-xl text-gray-800 mb-6 flex items-center gap-2">
              <FaHistory className="text-green-500" />
              Historial de Servicios ({clienteEncontrado.historial.length} servicios)
            </h3>
            
            <div className="space-y-4">
              {clienteEncontrado.historial.map((servicio, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border-l-4 border-green-500">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Fecha</p>
                      <p className="font-medium">{new Date(servicio.fecha).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Servicio</p>
                      <p className="font-medium">{servicio.servicio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sucursal</p>
                      <p className="font-medium">{servicio.sucursal}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehículo</p>
                      <p className="font-medium">{servicio.patente}</p>
                    </div>
                    <div className="md:col-span-4 flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          servicio.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                          servicio.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {servicio.estado}
                        </span>
                        {servicio.total > 0 && (
                          <span className="text-sm text-gray-600">${servicio.total.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Reservar nuevo turno
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Editar información
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {clienteEncontrado === false && (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Cliente no encontrado</h3>
          <p className="text-gray-600 mb-6">
            No se encontró ningún cliente con ese número de teléfono.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            Crear nuevo cliente
          </button>
        </div>
      )}
    </div>
  )
}

export default ClienteBusqueda 