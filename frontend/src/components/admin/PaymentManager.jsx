import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import { 
  getPayments, 
  getInvoices, 
  getPaymentStats, 
  createPayment, 
  createInvoice,
  PAYMENT_STATUS,
  PAYMENT_TYPES
} from '../../services/paymentService'
import toast from 'react-hot-toast'

const PaymentManager = () => {
  const [payments, setPayments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    type: PAYMENT_TYPES.CASH,
    description: '',
    customerName: '',
    customerEmail: ''
  })
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '',
    customerEmail: '',
    items: [{ name: '', quantity: 1, price: '' }],
    total: 0
  })

  // Datos simulados
  const mockPayments = [
    {
      id: '1',
      amount: 15000,
      type: PAYMENT_TYPES.CASH,
      status: PAYMENT_STATUS.APPROVED,
      description: 'Cambio de aceite y filtro',
      customerName: 'Juan Pérez',
      customerEmail: 'juan@email.com',
      createdAt: Date.now() - 86400000, // 1 día atrás
      updatedAt: Date.now() - 86400000
    },
    {
      id: '2',
      amount: 8500,
      type: PAYMENT_TYPES.CARD,
      status: PAYMENT_STATUS.APPROVED,
      description: 'Limpieza de inyectores',
      customerName: 'María González',
      customerEmail: 'maria@email.com',
      createdAt: Date.now() - 172800000, // 2 días atrás
      updatedAt: Date.now() - 172800000
    },
    {
      id: '3',
      amount: 22000,
      type: PAYMENT_TYPES.TRANSFER,
      status: PAYMENT_STATUS.PENDING,
      description: 'Cambio de frenos completo',
      customerName: 'Carlos López',
      customerEmail: 'carlos@email.com',
      createdAt: Date.now() - 259200000, // 3 días atrás
      updatedAt: Date.now() - 259200000
    },
    {
      id: '4',
      amount: 12000,
      type: PAYMENT_TYPES.MERCADOPAGO,
      status: PAYMENT_STATUS.APPROVED,
      description: 'Alineación y balanceo',
      customerName: 'Ana Rodríguez',
      customerEmail: 'ana@email.com',
      createdAt: Date.now() - 345600000, // 4 días atrás
      updatedAt: Date.now() - 345600000
    }
  ]

  const mockInvoices = [
    {
      id: '1',
      invoiceNumber: 'FAC-000001',
      customerName: 'Juan Pérez',
      customerEmail: 'juan@email.com',
      items: [
        { name: 'Aceite de motor 5W30', quantity: 2, price: 5000 },
        { name: 'Filtro de aceite', quantity: 1, price: 3000 },
        { name: 'Mano de obra', quantity: 1, price: 7000 }
      ],
      total: 15000,
      status: 'paid',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000
    },
    {
      id: '2',
      invoiceNumber: 'FAC-000002',
      customerName: 'María González',
      customerEmail: 'maria@email.com',
      items: [
        { name: 'Limpieza de inyectores', quantity: 1, price: 8500 }
      ],
      total: 8500,
      status: 'paid',
      createdAt: Date.now() - 172800000,
      updatedAt: Date.now() - 172800000
    },
    {
      id: '3',
      invoiceNumber: 'FAC-000003',
      customerName: 'Carlos López',
      customerEmail: 'carlos@email.com',
      items: [
        { name: 'Pastillas de freno', quantity: 4, price: 8000 },
        { name: 'Líquido de frenos', quantity: 1, price: 2000 },
        { name: 'Mano de obra', quantity: 1, price: 12000 }
      ],
      total: 22000,
      status: 'pending',
      createdAt: Date.now() - 259200000,
      updatedAt: Date.now() - 259200000
    }
  ]

  useEffect(() => {
    loadPaymentData()
  }, [])

  const loadPaymentData = async () => {
    try {
      setLoading(true)
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPayments(mockPayments)
      setInvoices(mockInvoices)
      
      // Calcular estadísticas
      const totalAmount = mockPayments.reduce((sum, p) => sum + p.amount, 0)
      const approvedPayments = mockPayments.filter(p => p.status === PAYMENT_STATUS.APPROVED)
      const pendingPayments = mockPayments.filter(p => p.status === PAYMENT_STATUS.PENDING)
      
      setStats({
        totalPayments: mockPayments.length,
        totalAmount: totalAmount,
        approvedPayments: approvedPayments.length,
        pendingPayments: pendingPayments.length,
        totalInvoices: mockInvoices.length,
        paidInvoices: mockInvoices.filter(i => i.status === 'paid').length,
        pendingInvoices: mockInvoices.filter(i => i.status === 'pending').length
      })
    } catch (error) {
      console.error('Error cargando datos de pagos:', error)
      toast.error('Error cargando datos de pagos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePayment = async (e) => {
    e.preventDefault()
    
    if (!paymentForm.amount || !paymentForm.description || !paymentForm.customerName) {
      toast.error('Completa todos los campos obligatorios')
      return
    }

    try {
      const newPayment = {
        id: Date.now().toString(),
        amount: parseInt(paymentForm.amount),
        type: paymentForm.type,
        status: paymentForm.type === PAYMENT_TYPES.CASH ? PAYMENT_STATUS.APPROVED : PAYMENT_STATUS.PENDING,
        description: paymentForm.description,
        customerName: paymentForm.customerName,
        customerEmail: paymentForm.customerEmail,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      setPayments(prev => [newPayment, ...prev])
      setStats(prev => ({
        ...prev,
        totalPayments: prev.totalPayments + 1,
        totalAmount: prev.totalAmount + newPayment.amount,
        [newPayment.status === PAYMENT_STATUS.APPROVED ? 'approvedPayments' : 'pendingPayments']: 
          prev[newPayment.status === PAYMENT_STATUS.APPROVED ? 'approvedPayments' : 'pendingPayments'] + 1
      }))

      toast.success('Pago registrado exitosamente')
      setShowPaymentModal(false)
      setPaymentForm({
        amount: '',
        type: PAYMENT_TYPES.CASH,
        description: '',
        customerName: '',
        customerEmail: ''
      })
    } catch (error) {
      console.error('Error creando pago:', error)
      toast.error('Error registrando pago')
    }
  }

  const handleCreateInvoice = async (e) => {
    e.preventDefault()
    
    if (!invoiceForm.customerName || invoiceForm.items.length === 0) {
      toast.error('Completa todos los campos obligatorios')
      return
    }

    try {
      const total = invoiceForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newInvoice = {
        id: Date.now().toString(),
        invoiceNumber: `FAC-${String(mockInvoices.length + 1).padStart(6, '0')}`,
        customerName: invoiceForm.customerName,
        customerEmail: invoiceForm.customerEmail,
        items: invoiceForm.items,
        total: total,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      setInvoices(prev => [newInvoice, ...prev])
      setStats(prev => ({
        ...prev,
        totalInvoices: prev.totalInvoices + 1,
        pendingInvoices: prev.pendingInvoices + 1
      }))

      toast.success('Factura creada exitosamente')
      setShowInvoiceModal(false)
      setInvoiceForm({
        customerName: '',
        customerEmail: '',
        items: [{ name: '', quantity: 1, price: '' }],
        total: 0
      })
    } catch (error) {
      console.error('Error creando factura:', error)
      toast.error('Error creando factura')
    }
  }

  const addInvoiceItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: '' }]
    }))
  }

  const removeInvoiceItem = (index) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateInvoiceItem = (index, field, value) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case PAYMENT_STATUS.APPROVED:
      case 'paid':
        return 'success'
      case PAYMENT_STATUS.PENDING:
        return 'warning'
      case PAYMENT_STATUS.REJECTED:
        return 'danger'
      default:
        return 'outline'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case PAYMENT_STATUS.APPROVED:
        return 'Aprobado'
      case PAYMENT_STATUS.PENDING:
        return 'Pendiente'
      case PAYMENT_STATUS.REJECTED:
        return 'Rechazado'
      case 'paid':
        return 'Pagado'
      case 'pending':
        return 'Pendiente'
      default:
        return status
    }
  }

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case PAYMENT_TYPES.CASH:
        return 'mdi:cash'
      case PAYMENT_TYPES.CARD:
        return 'mdi:credit-card'
      case PAYMENT_TYPES.TRANSFER:
        return 'mdi:bank-transfer'
      case PAYMENT_TYPES.MERCADOPAGO:
        return 'mdi:cellphone'
      default:
        return 'mdi:cash'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <Card.Body>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:cash" className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Ingresos</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalAmount?.toLocaleString()}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:credit-card" className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pagos Aprobados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedPayments}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:clock" className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:file-document" className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Facturas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Acciones Rápidas</h3>
              <Button
                variant="primary"
                size="sm"
                icon="mdi:plus"
                onClick={() => setShowPaymentModal(true)}
              >
                Nuevo Pago
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                icon="mdi:plus"
                className="w-full"
                onClick={() => setShowInvoiceModal(true)}
              >
                Crear Factura
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon="mdi:download"
                className="w-full"
                onClick={() => toast.success('Reporte exportado exitosamente')}
              >
                Exportar Reporte
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon="mdi:cog"
                className="w-full"
                onClick={() => toast.info('Configuración de pagos')}
              >
                Configuración
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold">Métodos de Pago</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon icon="mdi:cash" className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Efectivo</span>
                </div>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon icon="mdi:credit-card" className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Tarjeta</span>
                </div>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon icon="mdi:bank-transfer" className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Transferencia</span>
                </div>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon icon="mdi:cellphone" className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">MercadoPago</span>
                </div>
                <Badge variant="success">Activo</Badge>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Lista de pagos recientes */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold">Pagos Recientes</h3>
        </Card.Header>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Icon icon={getPaymentTypeIcon(payment.type)} className="w-4 h-4" />
                        <span className="text-sm text-gray-900">
                          {payment.type === PAYMENT_TYPES.CASH ? 'Efectivo' :
                           payment.type === PAYMENT_TYPES.CARD ? 'Tarjeta' :
                           payment.type === PAYMENT_TYPES.TRANSFER ? 'Transferencia' :
                           payment.type === PAYMENT_TYPES.MERCADOPAGO ? 'MercadoPago' : payment.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(payment.status)}>
                        {getStatusText(payment.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal de nuevo pago */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Registrar Nuevo Pago"
        size="md"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto
              </label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={paymentForm.type}
                onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                required
              >
                <option value={PAYMENT_TYPES.CASH}>Efectivo</option>
                <option value={PAYMENT_TYPES.CARD}>Tarjeta</option>
                <option value={PAYMENT_TYPES.TRANSFER}>Transferencia</option>
                <option value={PAYMENT_TYPES.MERCADOPAGO}>MercadoPago</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <Input
              value={paymentForm.description}
              onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
              placeholder="Descripción del servicio"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente
              </label>
              <Input
                value={paymentForm.customerName}
                onChange={(e) => setPaymentForm({...paymentForm, customerName: e.target.value})}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email del Cliente
              </label>
              <Input
                type="email"
                value={paymentForm.customerEmail}
                onChange={(e) => setPaymentForm({...paymentForm, customerEmail: e.target.value})}
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              icon="mdi:check"
            >
              Registrar Pago
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de nueva factura */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Crear Nueva Factura"
        size="lg"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente
              </label>
              <Input
                value={invoiceForm.customerName}
                onChange={(e) => setInvoiceForm({...invoiceForm, customerName: e.target.value})}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email del Cliente
              </label>
              <Input
                type="email"
                value={invoiceForm.customerEmail}
                onChange={(e) => setInvoiceForm({...invoiceForm, customerEmail: e.target.value})}
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items de la Factura
            </label>
            <div className="space-y-3">
              {invoiceForm.items.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-2">
                  <Input
                    placeholder="Descripción"
                    value={item.name}
                    onChange={(e) => updateInvoiceItem(index, 'name', e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Cantidad"
                    value={item.quantity}
                    onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Precio"
                    value={item.price}
                    onChange={(e) => updateInvoiceItem(index, 'price', parseInt(e.target.value) || 0)}
                    required
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    icon="mdi:delete"
                    onClick={() => removeInvoiceItem(index)}
                    disabled={invoiceForm.items.length === 1}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon="mdi:plus"
                onClick={addInvoiceItem}
              >
                Agregar Item
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowInvoiceModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              icon="mdi:check"
            >
              Crear Factura
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PaymentManager 