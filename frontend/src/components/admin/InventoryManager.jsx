import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import ProgressBar from '../ui/ProgressBar'
import { 
  getProductosAvanzado, 
  getInventoryAlerts, 
  getInventoryStats, 
  registrarMovimientoInventario,
  getHistorialMovimientos,
  PRODUCT_CATEGORIES,
  STOCK_LEVELS
} from '../../services/inventoryService'
import toast from 'react-hot-toast'

const InventoryManager = () => {
  const [productos, setProductos] = useState([])
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState({})
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMovimientoModal, setShowMovimientoModal] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState(null)
  const [filters, setFilters] = useState({})
  const [movimientoForm, setMovimientoForm] = useState({
    tipo: 'entrada',
    cantidad: '',
    motivo: '',
    observaciones: ''
  })

  useEffect(() => {
    loadInventoryData()
  }, [filters])

  const loadInventoryData = async () => {
    try {
      setLoading(true)
      const [productosData, alertsData, statsData, movimientosData] = await Promise.all([
        getProductosAvanzado(filters),
        getInventoryAlerts(),
        getInventoryStats(),
        getHistorialMovimientos()
      ])
      
      setProductos(productosData)
      setAlerts(alertsData)
      setStats(statsData)
      setMovimientos(movimientosData.slice(0, 10)) // Últimos 10 movimientos
    } catch (error) {
      console.error('Error cargando datos de inventario:', error)
      toast.error('Error cargando inventario')
    } finally {
      setLoading(false)
    }
  }

  const handleMovimiento = async (e) => {
    e.preventDefault()
    
    if (!selectedProducto || !movimientoForm.cantidad || !movimientoForm.motivo) {
      toast.error('Completa todos los campos')
      return
    }

    try {
      await registrarMovimientoInventario({
        productoId: selectedProducto.id,
        productoNombre: selectedProducto.nombre,
        tipo: movimientoForm.tipo,
        cantidad: parseInt(movimientoForm.cantidad),
        motivo: movimientoForm.motivo,
        observaciones: movimientoForm.observaciones,
        usuario: 'admin' // En un sistema real, usar el usuario actual
      })

      toast.success('Movimiento registrado exitosamente')
      setShowMovimientoModal(false)
      setMovimientoForm({
        tipo: 'entrada',
        cantidad: '',
        motivo: '',
        observaciones: ''
      })
      setSelectedProducto(null)
      loadInventoryData()
    } catch (error) {
      console.error('Error registrando movimiento:', error)
      toast.error('Error registrando movimiento')
    }
  }

  const getStockLevelColor = (stock) => {
    if (stock <= STOCK_LEVELS.CRITICAL) return 'red'
    if (stock <= STOCK_LEVELS.LOW) return 'yellow'
    return 'green'
  }

  const getStockLevelText = (stock) => {
    if (stock <= STOCK_LEVELS.CRITICAL) return 'Crítico'
    if (stock <= STOCK_LEVELS.LOW) return 'Bajo'
    return 'Normal'
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
      {/* Alertas de Inventario */}
      {alerts.length > 0 && (
        <Card>
          <Card.Header>
            <div className="flex items-center space-x-2">
              <Icon icon="mdi:alert" className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold">Alertas de Inventario</h3>
              <Badge variant="danger" size="sm">{alerts.length}</Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.type === 'critical' 
                    ? 'bg-red-50 border-red-200 text-red-800' 
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{alert.message}</span>
                    <Badge variant={alert.type === 'critical' ? 'danger' : 'warning'}>
                      {alert.type === 'critical' ? 'Crítico' : 'Advertencia'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:package" className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProductos || 0}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:alert-circle" className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock Crítico</p>
                <p className="text-2xl font-bold text-red-600">{stats.stockCritico || 0}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:package-variant" className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.stockBajo || 0}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:currency-usd" className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(stats.valorTotal || 0).toLocaleString()}
                </p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filters.categoria || ''}
                onChange={(e) => setFilters({...filters, categoria: e.target.value || undefined})}
              >
                <option value="">Todas las categorías</option>
                {Object.entries(PRODUCT_CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Mínimo
              </label>
              <Input
                type="number"
                value={filters.stockMin || ''}
                onChange={(e) => setFilters({...filters, stockMin: e.target.value || undefined})}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Máximo
              </label>
              <Input
                type="number"
                value={filters.stockMax || ''}
                onChange={(e) => setFilters({...filters, stockMax: e.target.value || undefined})}
                placeholder="100"
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Lista de Productos */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Productos</h3>
            <Button
              variant="primary"
              size="sm"
              icon="mdi:plus"
              onClick={() => {
                setSelectedProducto(null)
                setShowMovimientoModal(true)
              }}
            >
              Nuevo Movimiento
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {producto.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {producto.descripcion}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">
                        {PRODUCT_CATEGORIES[producto.categoria] || producto.categoria}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {producto.stock}
                        </span>
                        <Badge variant={getStockLevelColor(producto.stock)}>
                          {getStockLevelText(producto.stock)}
                        </Badge>
                      </div>
                      <ProgressBar 
                        value={(producto.stock / 100) * 100} 
                        max={100}
                        className="mt-1"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${producto.precio?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${((producto.precio || 0) * producto.stock).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        icon="mdi:plus-minus"
                        onClick={() => {
                          setSelectedProducto(producto)
                          setShowMovimientoModal(true)
                        }}
                      >
                        Movimiento
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal de Movimiento */}
      <Modal
        isOpen={showMovimientoModal}
        onClose={() => setShowMovimientoModal(false)}
        title="Registrar Movimiento de Inventario"
        size="md"
      >
        <form onSubmit={handleMovimiento} className="space-y-4">
          {selectedProducto && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Producto seleccionado:</p>
              <p className="font-medium">{selectedProducto.nombre}</p>
              <p className="text-sm text-gray-500">Stock actual: {selectedProducto.stock}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Movimiento
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={movimientoForm.tipo}
                onChange={(e) => setMovimientoForm({...movimientoForm, tipo: e.target.value})}
                required
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <Input
                type="number"
                value={movimientoForm.cantidad}
                onChange={(e) => setMovimientoForm({...movimientoForm, cantidad: e.target.value})}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={movimientoForm.motivo}
              onChange={(e) => setMovimientoForm({...movimientoForm, motivo: e.target.value})}
              required
            >
              <option value="">Seleccionar motivo</option>
              <option value="compra">Compra</option>
              <option value="venta">Venta</option>
              <option value="ajuste">Ajuste de inventario</option>
              <option value="devolucion">Devolución</option>
              <option value="perdida">Pérdida</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="3"
              value={movimientoForm.observaciones}
              onChange={(e) => setMovimientoForm({...movimientoForm, observaciones: e.target.value})}
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMovimientoModal(false)}
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
              Registrar Movimiento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default InventoryManager 