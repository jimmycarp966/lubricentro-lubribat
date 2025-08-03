import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProductos } from '../contexts/ProductosContext'
import { useTurnos } from '../contexts/TurnosContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'
import TurnosCalendar from '../components/TurnosCalendar'
import NotificationsPanel from '../components/NotificationsPanel'
import WhatsAppConfig from '../components/WhatsAppConfig'
import { sendReminderMessage, sendCompletionMessage } from '../utils/whatsappService'

const AdminPanel = () => {
  const { user } = useAuth()
  const { productos, addProducto, updateProducto, deleteProducto } = useProductos()
  const { 
    turnos, 
    setTurnos,
    actualizarTurno, 
    eliminarTurno, 
    fetchTurnos,
    notifications,
    setNotifications,
    obtenerNotificacionesNoLeidas,
    crearNotificacionPedido,
    crearNotificacionEstadoPedido
  } = useTurnos()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState('turnos')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSucursal, setSelectedSucursal] = useState('')
  const [selectedEstado, setSelectedEstado] = useState('')
  const [showDebug, setShowDebug] = useState(false)

  // Estados para gestión de productos
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [sortBy, setSortBy] = useState('nombre')

  // Estados para gestión de mayoristas
  const [showMayoristaForm, setShowMayoristaForm] = useState(false)
  const [editingMayorista, setEditingMayorista] = useState(null)
  const [searchMayorista, setSearchMayorista] = useState('')
  const [filterTipoMayorista, setFilterTipoMayorista] = useState('')
  const [sortMayoristas, setSortMayoristas] = useState('nombre')

  // Estados para gestión de pedidos
  const [showPedidoForm, setShowPedidoForm] = useState(false)
  const [editingPedido, setEditingPedido] = useState(null)
  const [searchPedido, setSearchPedido] = useState('')
  const [filterEstadoPedido, setFilterEstadoPedido] = useState('')
  const [filterMayoristaPedido, setFilterMayoristaPedido] = useState('')
  const [sortPedidos, setSortPedidos] = useState('fecha')

  // Estados para reportes
  const [reportPeriod, setReportPeriod] = useState('mes')

  // Manejar navegación desde notificaciones
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
      navigate(location.pathname, { replace: true })
    }
  }, [location.state, navigate])

  // Función para mostrar/ocultar debug con Ctrl+Shift+D
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        setShowDebug(prev => !prev)
        console.log('🔧 Debug mode:', !showDebug ? 'ON' : 'OFF')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showDebug])

  // Datos simulados para mayoristas y pedidos
  const [mayoristas, setMayoristas] = useState([
    {
      _id: '1',
      nombre: 'Juan Pérez',
      empresa: 'AutoParts S.A.',
      tipo: 'aceites',
      email: 'juan@autoparts.com',
      telefono: '+54 9 381 512-3456',
      contacto: 'Juan Pérez',
      ciudad: 'Concepción'
    },
    {
      _id: '2',
      nombre: 'María González',
      empresa: 'Filtros Pro',
      tipo: 'filtros',
      email: 'maria@filtrospro.com',
      telefono: '+54 9 381 598-7654',
      contacto: 'María González',
      ciudad: 'Monteros'
    }
  ])

  const [pedidos, setPedidos] = useState([
    {
      _id: '1',
      numero: 'PED-001',
      fecha: new Date().toISOString(),
      mayorista: 'AutoParts S.A.',
      items: [
        { producto: 'Aceite de Motor 5W-30', cantidad: 10, precio: 2500 },
        { producto: 'Filtro de Aceite', cantidad: 15, precio: 800 }
      ],
      total: 37000,
      estado: 'pendiente',
      notas: 'Pedido mensual'
    }
  ])

  // Datos simulados para reportes
  const reportData = {
    ingresosTotales: 1250000,
    turnosCompletados: 156,
    clientesNuevos: 23,
    satisfaccion: 4.8,
    serviciosPopulares: [
      { nombre: 'Cambio de Aceite', cantidad: 45, porcentaje: 28.8 },
      { nombre: 'Cambio de Filtros', cantidad: 32, porcentaje: 20.5 },
      { nombre: 'Alineación', cantidad: 28, porcentaje: 17.9 }
    ],
    ingresosPorSucursal: [
      { nombre: 'Concepción', ingresos: 750000, turnos: 95, porcentaje: 60 },
      { nombre: 'Monteros', ingresos: 500000, turnos: 61, porcentaje: 40 }
    ],
    tendencias: [
      { metrica: 'Ingresos', cambio: 12, valor: '$1,250,000' },
      { metrica: 'Turnos', cambio: 8, valor: '156 turnos' },
      { metrica: 'Clientes', cambio: 15, valor: '23 nuevos' }
    ],
    clientesRecurrentes: 89,
    porcentajeRecurrentes: 57,
    porcentajeNuevos: 43,
    valorPromedioCliente: 8012,
    recomendaciones: [
      {
        titulo: 'Promocionar servicios premium',
        descripcion: 'Los clientes están dispuestos a pagar más por servicios especializados',
        prioridad: 'alta'
      },
      {
        titulo: 'Expandir horarios en Monteros',
        descripcion: 'La sucursal tiene alta demanda pero horarios limitados',
        prioridad: 'media'
      }
    ]
  }

  // Cálculos y filtros
  const filteredTurnos = turnos.filter(turno => {
    const fechaMatch = !selectedDate || turno.fecha === format(selectedDate, 'yyyy-MM-dd')
    const sucursalMatch = !selectedSucursal || turno.sucursal === selectedSucursal
    const estadoMatch = !selectedEstado || turno.estado === selectedEstado
    return fechaMatch && sucursalMatch && estadoMatch
  })

  const filteredNotifications = notifications.filter(notification => !notification.leida)

  const filteredProductos = productos.filter(producto => {
    const searchMatch = !searchTerm || producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const categoryMatch = !filterCategory || producto.categoria === filterCategory
    const stockMatch = !filterStock || 
      (filterStock === 'disponible' && producto.stock > 10) ||
      (filterStock === 'bajo' && producto.stock <= 10 && producto.stock > 0) ||
      (filterStock === 'agotado' && producto.stock === 0)
    return searchMatch && categoryMatch && stockMatch
  }).sort((a, b) => {
    switch (sortBy) {
      case 'precio': return b.precio - a.precio
      case 'stock': return b.stock - a.stock
      case 'categoria': return a.categoria.localeCompare(b.categoria)
      default: return a.nombre.localeCompare(b.nombre)
    }
  })

  const filteredMayoristas = mayoristas.filter(mayorista => {
    const searchMatch = !searchMayorista || mayorista.nombre.toLowerCase().includes(searchMayorista.toLowerCase())
    const tipoMatch = !filterTipoMayorista || mayorista.tipo === filterTipoMayorista
    return searchMatch && tipoMatch
  }).sort((a, b) => {
    switch (sortMayoristas) {
      case 'tipo': return a.tipo.localeCompare(b.tipo)
      case 'ciudad': return a.ciudad.localeCompare(b.ciudad)
      default: return a.nombre.localeCompare(b.nombre)
    }
  })

  const filteredPedidos = pedidos.filter(pedido => {
    const searchMatch = !searchPedido || pedido.numero.toLowerCase().includes(searchPedido.toLowerCase())
    const estadoMatch = !filterEstadoPedido || pedido.estado === filterEstadoPedido
    const mayoristaMatch = !filterMayoristaPedido || pedido.mayorista.includes(filterMayoristaPedido)
    return searchMatch && estadoMatch && mayoristaMatch
  }).sort((a, b) => {
    switch (sortPedidos) {
      case 'total': return b.total - a.total
      case 'estado': return a.estado.localeCompare(b.estado)
      case 'mayorista': return a.mayorista.localeCompare(b.mayorista)
      default: return new Date(b.fecha) - new Date(a.fecha)
    }
  })

  const totalInvertido = pedidos.reduce((total, pedido) => total + pedido.total, 0)

  // Definición de tabs
  const tabs = [
    { id: 'turnos', name: 'Turnos' },
    { id: 'productos', name: 'Productos' },
    { id: 'mayoristas', name: 'Mayoristas' },
    { id: 'pedidos', name: 'Pedidos' },
    { id: 'reportes', name: 'Reportes' },
    { id: 'notificaciones', name: 'Notificaciones' },
    { id: 'whatsapp', name: 'WhatsApp' }
  ]

  // Funciones de manejo
  const handleEstadoChange = async (turnoId, nuevoEstado) => {
    try {
      await actualizarTurno(turnoId, { estado: nuevoEstado })
      toast.success('Estado actualizado correctamente')
    } catch (error) {
      console.error('Error actualizando estado:', error)
      toast.error('Error al actualizar estado')
    }
  }

  const handleDeleteTurno = async (turnoId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este turno?')) {
      try {
        await eliminarTurno(turnoId)
        setTurnos(prev => prev.filter(t => t.id !== turnoId))
        toast.success('Turno eliminado correctamente')
      } catch (error) {
        console.error('Error eliminando turno:', error)
        toast.error('Error al eliminar el turno')
      }
    }
  }

  const handleEditProducto = (producto) => {
    setEditingProduct(producto)
    setShowProductForm(true)
  }

  const handleDeleteProducto = async (productoId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este producto?')) {
      try {
        await deleteProducto(productoId)
        toast.success('Producto eliminado correctamente')
      } catch (error) {
        console.error('Error eliminando producto:', error)
        toast.error('Error al eliminar el producto')
      }
    }
  }

  const handleSaveProducto = async (productoData) => {
    try {
      if (editingProduct) {
        await updateProducto(editingProduct._id, productoData)
        toast.success('Producto actualizado correctamente')
      } else {
        await addProducto(productoData)
        toast.success('Producto agregado correctamente')
      }
      setShowProductForm(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Error guardando producto:', error)
      toast.error('Error al guardar el producto')
    }
  }

  const handleEditMayorista = (mayorista) => {
    setEditingMayorista(mayorista)
    setShowMayoristaForm(true)
  }

  const handleDeleteMayorista = async (mayoristaId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este mayorista?')) {
      try {
        setMayoristas(prev => prev.filter(m => m._id !== mayoristaId))
        toast.success('Mayorista eliminado correctamente')
      } catch (error) {
        console.error('Error eliminando mayorista:', error)
        toast.error('Error al eliminar el mayorista')
      }
    }
  }

  const handleSaveMayorista = async (mayoristaData) => {
    try {
      if (editingMayorista) {
        setMayoristas(prev => prev.map(m => 
          m._id === editingMayorista._id ? { ...m, ...mayoristaData } : m
        ))
        toast.success('Mayorista actualizado correctamente')
      } else {
        const nuevoMayorista = {
          _id: Date.now().toString(),
          ...mayoristaData
        }
        setMayoristas(prev => [nuevoMayorista, ...prev])
        toast.success('Mayorista agregado correctamente')
      }
      setShowMayoristaForm(false)
      setEditingMayorista(null)
    } catch (error) {
      console.error('Error guardando mayorista:', error)
      toast.error('Error al guardar el mayorista')
    }
  }

  const handleEditPedido = (pedido) => {
    setEditingPedido(pedido)
    setShowPedidoForm(true)
  }

  const handleDeletePedido = async (pedidoId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este pedido?')) {
      try {
        setPedidos(prev => prev.filter(p => p._id !== pedidoId))
        toast.success('Pedido eliminado correctamente')
      } catch (error) {
        console.error('Error eliminando pedido:', error)
        toast.error('Error al eliminar el pedido')
      }
    }
  }

  const handleSavePedido = async (pedidoData) => {
    try {
      if (editingPedido) {
        setPedidos(prev => prev.map(p => 
          p._id === editingPedido._id ? { ...p, ...pedidoData } : p
        ))
        toast.success('Pedido actualizado correctamente')
      } else {
        const nuevoPedido = {
          _id: Date.now().toString(),
          numero: `PED-${String(Date.now()).slice(-6)}`,
          fecha: new Date().toISOString(),
          ...pedidoData
        }
        setPedidos(prev => [nuevoPedido, ...prev])
        
        // Crear notificación de nuevo pedido
        await crearNotificacionPedido(nuevoPedido)
        
        toast.success('Pedido agregado correctamente')
      }
      setShowPedidoForm(false)
      setEditingPedido(null)
    } catch (error) {
      console.error('Error guardando pedido:', error)
      toast.error('Error al guardar el pedido')
    }
  }

  const getNextEstado = (currentEstado) => {
    const estados = ['pendiente', 'confirmado', 'enviado', 'recibido']
    const currentIndex = estados.indexOf(currentEstado)
    return estados[Math.min(currentIndex + 1, estados.length - 1)]
  }

  const getNextEstadoLabel = (currentEstado) => {
    const nextEstado = getNextEstado(currentEstado)
    const labels = {
      'pendiente': 'Confirmar',
      'confirmado': 'Enviar',
      'enviado': 'Recibir',
      'recibido': 'Recibido'
    }
    return labels[nextEstado] || 'Siguiente'
  }

  const handleUpdateEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      setPedidos(prev => prev.map(p => 
        p._id === pedidoId ? { ...p, estado: nuevoEstado } : p
      ))
      
      // Crear notificación de cambio de estado
      const pedido = pedidos.find(p => p._id === pedidoId)
      if (pedido) {
        await crearNotificacionEstadoPedido(pedido, nuevoEstado)
      }
      
      toast.success('Estado del pedido actualizado correctamente')
    } catch (error) {
      console.error('Error actualizando estado del pedido:', error)
      toast.error('Error al actualizar el estado del pedido')
    }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tenés permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('es-AR')}
              </span>
              {showDebug && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  🔧 DEBUG MODE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel - Solo visible con Ctrl+Shift+D */}
      {showDebug && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              🔧 Panel de Debug (Ctrl+Shift+D para ocultar)
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  console.log('🔥 DEBUG COMPLETO DEL SISTEMA FIREBASE:')
                  console.log('📊 Estado actual:')
                  console.log('- Turnos:', turnos.length)
                  console.log('- Notificaciones:', notifications.length)
                  console.log('- Usuario:', user)
                  console.log('- Active Tab:', activeTab)
                  console.log('- Selected Date:', selectedDate)
                  console.log('- Selected Sucursal:', selectedSucursal)
                  console.log('- Turnos Filtrados:', filteredTurnos.length)
                  console.log('- Notificaciones Filtradas:', filteredNotifications.length)
                  
                  try {
                    const { turnosService } = await import('../services/firebaseService')
                    const turnosFirebase = await turnosService.getTurnos()
                    console.log('🔥 Firebase - Turnos:', turnosFirebase.length)
                    console.log('📊 Comparación:')
                    console.log('- React State:', turnos.length)
                    console.log('- Firebase:', turnosFirebase.length)
                    
                    if (turnos.length !== turnosFirebase.length) {
                      console.log('⚠️ DESINCRONIZACIÓN DETECTADA')
                      setTurnos(turnosFirebase)
                      toast.success('Estado sincronizado con Firebase')
                    } else {
                      console.log('✅ Sincronización correcta')
                      toast.success('Sistema funcionando correctamente')
                    }
                  } catch (error) {
                    console.error('❌ Error en debug:', error)
                    toast.error('Error conectando con Firebase')
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                🔍 Debug Completo
              </button>
              <button
                onClick={async () => {
                  try {
                    const turnoPrueba = {
                      cliente: {
                        nombre: 'Cliente Prueba',
                        telefono: '3815000000',
                        whatsapp: '3815000000'
                      },
                      vehiculo: {
                        marca: 'Toyota',
                        modelo: 'Corolla',
                        año: '2020',
                        patente: 'ABC123'
                      },
                      servicio: 'Cambio de aceite',
                      sucursal: 'Concepción',
                      fecha: '2025-01-15',
                      horario: '09:00',
                      estado: 'pendiente',
                      timestamp: Date.now()
                    }
                    
                    const notificacionPrueba = {
                      tipo: 'nuevo_turno',
                      titulo: 'Turno de Prueba',
                      mensaje: 'Cliente Prueba reservó un turno para 2025-01-15 a las 09:00',
                      leida: false,
                      timestamp: Date.now()
                    }
                    
                    const { turnosService, notificationsService } = await import('../services/firebaseService')
                    const nuevoTurno = await turnosService.createTurno(turnoPrueba)
                    const nuevaNotificacion = await notificationsService.createNotification(notificacionPrueba)
                    console.log('🧪 Firebase: Datos de prueba creados:', nuevoTurno.id, nuevaNotificacion.id)
                    toast.success('Datos de prueba creados en Firebase')
                  } catch (error) {
                    console.error('❌ Error creando datos de prueba:', error)
                    toast.error('Error creando datos de prueba')
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
              >
                🧪 Crear Datos Prueba
              </button>
              <button
                onClick={async () => {
                  try {
                    const { turnosService, notificationsService } = await import('../services/firebaseService')
                    const turnosActuales = await turnosService.getTurnos()
                    const notificationsActuales = await notificationsService.getNotifications()
                    
                    const deleteTurnosPromises = turnosActuales.map(turno => turnosService.deleteTurno(turno.id))
                    await Promise.all(deleteTurnosPromises)
                    
                    const deleteNotificationsPromises = notificationsActuales.map(notification => notificationsService.deleteNotification(notification.id))
                    await Promise.all(deleteNotificationsPromises)
                    
                    console.log('🗑️ Firebase: Datos limpiados - Turnos:', turnosActuales.length, 'Notificaciones:', notificationsActuales.length)
                    toast.success('Datos limpiados de Firebase')
                  } catch (error) {
                    console.error('❌ Error limpiando datos:', error)
                    toast.error('Error limpiando datos')
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                🗑️ Limpiar Datos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'turnos' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sucursal
                  </label>
                  <select
                    value={selectedSucursal}
                    onChange={(e) => setSelectedSucursal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las sucursales</option>
                    <option value="Concepción">Concepción</option>
                    <option value="Monteros">Monteros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const [year, month, day] = e.target.value.split('-')
                      setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedSucursal('')
                      setSelectedDate(null)
                      setSelectedEstado('')
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Calendario */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendario de Turnos</h3>
              <TurnosCalendar 
                turnos={turnos}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>

            {/* Lista de Turnos */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Turnos {filteredTurnos.length > 0 && `(${filteredTurnos.length})`}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehículo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Servicio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sucursal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Horario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTurnos.map((turno) => (
                      <tr key={turno.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {turno.cliente?.nombre || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {turno.cliente?.telefono || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {turno.vehiculo?.marca} {turno.vehiculo?.modelo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {turno.vehiculo?.patente}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {turno.servicio}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {turno.sucursal}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(turno.fecha), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {turno.horario}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            turno.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            turno.estado === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {turno.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEstadoChange(turno.id, 'confirmado')}
                              disabled={turno.estado === 'confirmado'}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => handleEstadoChange(turno.id, 'finalizado')}
                              disabled={turno.estado === 'finalizado'}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              Finalizar
                            </button>
                            <button
                              onClick={() => handleDeleteTurno(turno.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTurnos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay turnos para mostrar
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'productos' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
                  <p className="text-gray-600">Administra el inventario de aceites, filtros y repuestos</p>
                </div>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ➕ Agregar Producto
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Funcionalidad en desarrollo</p>
                <p className="text-sm">Próximamente: Gestión completa de productos</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mayoristas' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestión de Mayoristas</h2>
                  <p className="text-gray-600">Administra proveedores y contactos comerciales</p>
                </div>
                <button
                  onClick={() => setShowMayoristaForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ➕ Agregar Mayorista
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Funcionalidad en desarrollo</p>
                <p className="text-sm">Próximamente: Gestión completa de mayoristas</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h2>
                  <p className="text-gray-600">Administra órdenes de compra y pedidos a proveedores</p>
                </div>
                <button
                  onClick={() => setShowPedidoForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ➕ Nuevo Pedido
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Funcionalidad en desarrollo</p>
                <p className="text-sm">Próximamente: Gestión completa de pedidos</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>
                  <p className="text-gray-600">Análisis completo del negocio y métricas de rendimiento</p>
                </div>
              </div>
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Funcionalidad en desarrollo</p>
                <p className="text-sm">Próximamente: Reportes completos y estadísticas</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notificaciones' && (
          <NotificationsPanel />
        )}

        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Configuración de WhatsApp</h2>
                  <p className="text-gray-600">Configura el número de WhatsApp Business</p>
                </div>
              </div>
              <WhatsAppConfig />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel 