import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { 
  getAllPayments, 
  getPaymentStats, 
  getPaymentsByStatus,
  getPaymentsByMethod,
  updatePaymentStatus,
  PAYMENT_STATUS,
  PAYMENT_METHODS
} from '../../services/paymentTrackingService'
import toast from 'react-hot-toast'

const PaymentManager = () => {
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPayments()
    loadStats()
  }, [])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const allPayments = await getAllPayments()
      setPayments(allPayments)
    } catch (error) {
      console.error('Error cargando pagos:', error)
      toast.error('Error cargando pagos')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const paymentStats = await getPaymentStats()
      setStats(paymentStats)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  const handleStatusFilter = async (status) => {
    setSelectedStatus(status)
    setLoading(true)
    try {
      if (status) {
        const filteredPayments = await getPaymentsByStatus(status)
        setPayments(filteredPayments)
      } else {
        await loadPayments()
      }
    } catch (error) {
      console.error('Error filtrando por estado:', error)
      toast.error('Error aplicando filtro')
    } finally {
      setLoading(false)
    }
  }

  const handleMethodFilter = async (method) => {
    setSelectedMethod(method)
    setLoading(true)
    try {
      if (method) {
        const filteredPayments = await getPaymentsByMethod(method)
        setPayments(filteredPayments)
      } else {
        await loadPayments()
      }
    } catch (error) {
      console.error('Error filtrando por método:', error)
      toast.error('Error aplicando filtro')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (paymentId, newStatus) => {
    try {
      const result = await updatePaymentStatus(paymentId, newStatus)
      if (result.success) {
        toast.success(`Estado actualizado a ${newStatus}`)
        await loadPayments()
        await loadStats()
      } else {
        toast.error('Error actualizando estado')
      }
    } catch (error) {
      console.error('Error actualizando estado:', error)
      toast.error('Error actualizando estado')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case PAYMENT_STATUS.APPROVED:
        return 'success'
      case PAYMENT_STATUS.PENDING:
        return 'warning'
      case PAYMENT_STATUS.REJECTED:
        return 'danger'
      case PAYMENT_STATUS.CANCELLED:
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getMethodIcon = (method) => {
    switch (method) {
      case 'mercadopago_wallet':
        return 'mdi:wallet'
      case 'rapipago':
        return 'mdi:cash'
      case 'pagofacil':
        return 'mdi:cash-multiple'
      case 'visa':
        return 'mdi:credit-card'
      case 'mastercard':
        return 'mdi:credit-card-outline'
      case 'amex':
        return 'mdi:credit-card-wireless'
      default:
        return 'mdi:credit-card-off'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredPayments = payments.filter(payment => {
    const searchMatch = !searchTerm || 
      payment.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.sucursal.toLowerCase().includes(searchTerm.toLowerCase())
    
    return searchMatch
  })

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:cash" className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pagos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:check-circle" className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aprobados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aprobados || 0}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:clock" className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendientes || 0}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:currency-usd" className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.montoTotal || 0)}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold">Filtros</h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Cliente, servicio, sucursal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value={PAYMENT_STATUS.APPROVED}>Aprobados</option>
                <option value={PAYMENT_STATUS.PENDING}>Pendientes</option>
                <option value={PAYMENT_STATUS.REJECTED}>Rechazados</option>
                <option value={PAYMENT_STATUS.CANCELLED}>Cancelados</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => handleMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos los métodos</option>
                <option value="mercadopago_wallet">MercadoPago Wallet</option>
                <option value="rapipago">RapiPago</option>
                <option value="pagofacil">PagoFácil</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStatus('')
                  setSelectedMethod('')
                  setSearchTerm('')
                  loadPayments()
                }}
                fullWidth
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Lista de pagos */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pagos Recientes</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={loadPayments}
              loading={loading}
            >
              Actualizar
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando pagos...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <Icon icon="mdi:cash-off" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron pagos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sucursal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.cliente}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.vehiculo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.servicio}</div>
                        <div className="text-sm text-gray-500">
                          {payment.fecha} - {payment.horario}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.sucursal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.monto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Icon 
                            icon={getMethodIcon(payment.metodoPago)} 
                            className="w-5 h-5 text-gray-600" 
                          />
                          <span className="text-sm text-gray-900">
                            {payment.metodoPago.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(payment.estado)}>
                          {payment.estado}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.fechaCreacion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {payment.estado === PAYMENT_STATUS.PENDING && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleUpdateStatus(payment.id, PAYMENT_STATUS.APPROVED)}
                              >
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleUpdateStatus(payment.id, PAYMENT_STATUS.REJECTED)}
                              >
                                Rechazar
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Ver detalles del pago
                              console.log('Detalles del pago:', payment)
                            }}
                          >
                            Ver
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default PaymentManager 