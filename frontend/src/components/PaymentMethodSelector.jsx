import { useState } from 'react'
import { PAYMENT_METHODS } from '../services/paymentService'

const PaymentMethodSelector = ({ onMethodSelect, selectedMethod, disabled = false }) => {
  const [showMore, setShowMore] = useState(false)

  const paymentMethods = [
    {
      id: PAYMENT_METHODS.EFECTIVO,
      name: 'Efectivo',
      description: 'Pago en efectivo al momento del servicio',
      icon: '💵',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      id: PAYMENT_METHODS.TRANSFERENCIA,
      name: 'Transferencia',
      description: 'Transferencia bancaria (se confirma al recibir comprobante)',
      icon: '🏦',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: PAYMENT_METHODS.TARJETA_PRESENCIAL,
      name: 'Tarjeta Presencial',
      description: 'Pago con tarjeta en el local',
      icon: '💳',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      id: PAYMENT_METHODS.MERCADOPAGO,
      name: 'MercadoPago',
      description: 'Pago online con tarjeta, efectivo o transferencia',
      icon: '🟡',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600'
    },
    {
      id: PAYMENT_METHODS.PAGO_FACIL,
      name: 'Pago Fácil',
      description: 'Pago en efectivo en sucursales Pago Fácil',
      icon: '🏪',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    },
    {
      id: PAYMENT_METHODS.RAPIPAGO,
      name: 'Rapipago',
      description: 'Pago en efectivo en sucursales Rapipago',
      icon: '🏪',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    }
  ]

  const visibleMethods = showMore ? paymentMethods : paymentMethods.slice(0, 4)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Selecciona tu método de pago</h3>
        <p className="text-sm text-gray-600">Elige la forma que más te convenga para pagar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => onMethodSelect(method.id)}
            disabled={disabled}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full ${method.color} ${method.hoverColor} flex items-center justify-center text-white text-xl transition-colors`}>
                {method.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                  {method.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {method.description}
                </p>
              </div>
              {selectedMethod === method.id && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {paymentMethods.length > 4 && (
        <div className="text-center">
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            {showMore ? 'Ver menos opciones' : 'Ver más métodos de pago'}
          </button>
        </div>
      )}

      {selectedMethod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-blue-800">
              Método seleccionado: {paymentMethods.find(m => m.id === selectedMethod)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentMethodSelector 