import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProductos } from '../contexts/ProductosContext'
import { useTurnos } from '../contexts/TurnosContext'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

const AdminPanel = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { productos, agregarProducto, actualizarProducto, eliminarProducto } = useProductos()
  const { turnos, fetchTurnos, actualizarTurno, eliminarTurno } = useTurnos()
  
  // Estados principales
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTurnosTab, setActiveTurnosTab] = useState('pendientes')
  
  // Estados para formularios
  const [showProductForm, setShowProductForm] = useState(false)
  const [showMayoristaForm, setShowMayoristaForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingMayorista, setEditingMayorista] = useState(null)
  const [editingTurno, setEditingTurno] = useState(null)
  const [showEditTurnoForm, setShowEditTurnoForm] = useState(false)
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [selectedSucursal, setSelectedSucursal] = useState('todas')

  // Datos simulados
  const [mayoristas, setMayoristas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalTurnos: 0,
    turnosHoy: 0,
    turnosPendientes: 0,
    turnosConfirmados: 0,
    turnosFinalizados: 0,
    ingresosEstimados: 0,
    productosPopulares: [],
    serviciosPopulares: []
  })

  // Datos simulados de mayoristas
  const mayoristasSimulados = [
    {
      _id: '1',
      nombre: 'Taller Mecánico Central',
      email: 'taller@central.com',
      telefono: '+5493815123456',
      direccion: 'Av. San Martín 123, San Miguel de Tucumán',
      tipoPrecio: 'taller_amigo'
    },
    {
      _id: '2',
      nombre: 'Distribuidora Auto Parts',
      email: 'ventas@autoparts.com',
      telefono: '+5493815987654',
      direccion: 'Ruta 9 Km 15, Yerba Buena',
      tipoPrecio: 'mayorista'
    }
  ]

  // Datos simulados de pedidos
  const pedidosSimulados = [
    {
      _id: '1',
      numero: 'PED-001',
      fecha: '2024-01-15T10:00:00.000Z',
      mayorista: { nombre: 'Taller Mecánico Central' },
      items: [
        { producto: { nombre: 'Aceite de Motor 5W-30' }, cantidad: 5, precio: 2500 },
        { producto: { nombre: 'Filtro de Aceite' }, cantidad: 10, precio: 800 }
      ],
      total: 20500,
      estado: 'pendiente',
      notas: 'Urgente para mañana'
    },
    {
      _id: '2',
      numero: 'PED-002',
      fecha: '2024-01-14T14:30:00.000Z',
      mayorista: { nombre: 'Distribuidora Auto Parts' },
      items: [
        { producto: { nombre: 'Líquido de Frenos' }, cantidad: 3, precio: 1200 }
      ],
      total: 3600,
      estado: 'listo',
      notas: ''
    }
  ]

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }

    // Cargar mayoristas
    const mayoristasGuardados = localStorage.getItem('mayoristas')
    if (mayoristasGuardados) {
      setMayoristas(JSON.parse(mayoristasGuardados))
    } else {
      setMayoristas(mayoristasSimulados)
      localStorage.setItem('mayoristas', JSON.stringify(mayoristasSimulados))
    }

    // Cargar pedidos
    const pedidosGuardados = localStorage.getItem('pedidos')
    if (pedidosGuardados) {
      setPedidos(JSON.parse(pedidosGuardados))
    } else {
      setPedidos(pedidosSimulados)
      localStorage.setItem('pedidos', JSON.stringify(pedidosSimulados))
    }

    // Cargar turnos
    fetchTurnos()
  }, [user, navigate, fetchTurnos])

  // Calcular estadísticas
  useEffect(() => {
    const calcularStats = () => {
      const hoy = format(new Date(), 'yyyy-MM-dd')
      
      const turnosHoy = turnos.filter(t => t.fecha === hoy).length
      const turnosPendientes = turnos.filter(t => t.estado === 'pendiente').length
      const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado').length
      const turnosFinalizados = turnos.filter(t => t.estado === 'finalizado').length
      
      // Simular ingresos (promedio $5000 por turno)
      const ingresosEstimados = turnosConfirmados * 5000
      
      // Productos más populares (datos estáticos)
      const productosPopulares = productos.slice(0, 3).map((p, index) => ({
        nombre: p.nombre,
        ventas: [45, 32, 28][index] || 15
      }))
      
      // Servicios más populares (datos estáticos)
      const servicios = ['Cambio de Aceite', 'Revisión General', 'Cambio de Filtros', 'Lubricación Completa']
      const serviciosPopulares = servicios.map((s, index) => ({
        nombre: s,
        turnos: [18, 12, 8, 6][index] || 5
      }))

      setStats({
        totalProductos: productos.length,
        totalTurnos: turnos.length,
        turnosHoy,
        turnosPendientes,
        turnosConfirmados,
        turnosFinalizados,
        ingresosEstimados,
        productosPopulares,
        serviciosPopulares
      })
    }

    calcularStats()
  }, [productos, turnos])

  // Filtrar turnos por fecha y estado
  const filteredTurnos = turnos.filter(turno => {
    const turnoDateStr = turno.fecha
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
    const estadoMatch = activeTurnosTab === 'pendientes' ? 
      (turno.estado === 'pendiente' || turno.estado === 'confirmado') : 
      turno.estado === 'finalizado'
    
    const sucursalMatch = selectedSucursal === 'todas' || turno.sucursal === selectedSucursal
    
    return turnoDateStr === selectedDateStr && estadoMatch && sucursalMatch
  })

  // Funciones de manejo
  const handleFinalizarTurno = async (turnoId) => {
    if (window.confirm('¿Confirmar que el turno ha sido finalizado?')) {
      await actualizarTurno(turnoId, { estado: 'finalizado' })
    }
  }

  const handleEditTurno = (turno) => {
    setEditingTurno(turno)
    setShowEditTurnoForm(true)
  }

  const handleUpdateTurno = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const updatedData = {
      fecha: formData.get('fecha'),
      horario: formData.get('horario'),
      servicio: formData.get('servicio'),
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      whatsapp: formData.get('whatsapp'),
      patente: formData.get('patente'),
      modelo: formData.get('modelo'),
      estado: formData.get('estado')
    }

    await actualizarTurno(editingTurno._id, updatedData)
    setShowEditTurnoForm(false)
    setEditingTurno(null)
  }

  const handleDeleteTurno = async (turnoId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este turno?')) {
      await eliminarTurno(turnoId)
    }
  }

  const handleResetData = () => {
    if (window.confirm('¿Querés recargar los datos de ejemplo? Esto eliminará todos los turnos actuales.')) {
      localStorage.removeItem('turnos')
      fetchTurnos()
      toast.success('Datos de ejemplo recargados')
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'confirmado':
        return 'bg-green-100 text-green-800'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'finalizado':
        return 'bg-blue-100 text-blue-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Verificar si el usuario es admin
  if (user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-green-500">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="LUBRI-BAT" className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-600">Gestión completa LUBRI-BAT</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Bienvenido, {user.nombre}</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString('es-AR')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('turnos')}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                activeTab === 'turnos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 Gestión de Turnos
            </button>
            <button
              onClick={() => setActiveTab('productos')}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                activeTab === 'productos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📦 Productos
            </button>
            <button
              onClick={() => setActiveTab('mayoristas')}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                activeTab === 'mayoristas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏢 Mayoristas
            </button>
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                activeTab === 'pedidos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Pedidos
            </button>
            <button
              onClick={() => setActiveTab('reportes')}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                activeTab === 'reportes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 Reportes
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Turnos Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.turnosHoy}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.turnosPendientes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Confirmados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.turnosConfirmados}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ingresos Est.</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.ingresosEstimados.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Button */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800">🔧 Debug</h3>
                  <p className="text-sm text-yellow-600">Si no ves turnos, recarga los datos de ejemplo</p>
                </div>
                <button
                  onClick={handleResetData}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Recargar Datos
                </button>
              </div>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Servicios Más Populares</h3>
                <div className="space-y-3">
                  {stats.serviciosPopulares.map((servicio, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{servicio.nombre}</span>
                      <span className="font-semibold text-blue-600">{servicio.turnos} turnos</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
                <div className="space-y-3">
                  {stats.productosPopulares.map((producto, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{producto.nombre}</span>
                      <span className="font-semibold text-green-600">{producto.ventas} unidades</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Turnos Tab */}
        {activeTab === 'turnos' && (
          <div className="space-y-6">
            {/* Date and Filter Controls */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const dateValue = e.target.value
                      const [year, month, day] = dateValue.split('-')
                      const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                      setSelectedDate(newDate)
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sucursal</label>
                  <select
                    value={selectedSucursal}
                    onChange={(e) => setSelectedSucursal(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="todas">Todas las sucursales</option>
                    <option value="Sucursal Monteros">Monteros</option>
                    <option value="Sucursal Concepción">Concepción</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTurnosTab('pendientes')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTurnosTab === 'pendientes'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Pendientes
                    </button>
                    <button
                      onClick={() => setActiveTurnosTab('finalizados')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTurnosTab === 'finalizados'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Finalizados
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Turnos List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-6">
                {activeTurnosTab === 'pendientes' ? 'Turnos Pendientes' : 'Turnos Finalizados'} - {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
              </h2>
              
              {filteredTurnos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-600 text-lg">
                    {activeTurnosTab === 'pendientes' ? 'No hay turnos pendientes' : 'No hay turnos finalizados'} para esta fecha
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTurnos.map((turno) => (
                    <div key={turno._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <span className="font-semibold text-xl text-blue-600">{turno.horario || 'Sin horario'}</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(turno.estado)}`}>
                              {turno.estado || 'Sin estado'}
                            </span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {turno.sucursal || 'No especificada'}
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-lg mb-2">
                                {turno.cliente?.nombre || `${turno.nombre || ''} ${turno.apellido || ''}` || 'Sin nombre'}
                              </h4>
                              <p className="text-gray-600 mb-1">
                                📱 {turno.cliente?.telefono || turno.whatsapp || 'No disponible'}
                              </p>
                              <p className="text-gray-600 mb-1">
                                🚗 {turno.vehiculo?.patente || turno.patente || 'No disponible'} - {turno.vehiculo?.modelo || turno.modelo || 'No disponible'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg mb-2">{turno.servicio || 'Servicio no especificado'}</h4>
                              <p className="text-gray-600 mb-1">⭐ Puntos: {turno.puntosServicio || 0}</p>
                              <p className="text-gray-600 mb-1">
                                📅 Creado: {turno.fechaCreacion ? new Date(turno.fechaCreacion).toLocaleDateString() : 'No disponible'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditTurno(turno)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                          >
                            ✏️ Editar
                          </button>
                          {activeTurnosTab === 'pendientes' && (
                            <button
                              onClick={() => handleFinalizarTurno(turno._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                            >
                              ✅ Finalizar
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTurno(turno._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Productos Tab */}
        {activeTab === 'productos' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Productos</h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                + Agregar Producto
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productos.map((producto) => (
                <div key={producto._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{producto.nombre}</h3>
                  <p className="text-gray-600 mb-2">{producto.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-600">${producto.precio}</span>
                    <span className="text-sm text-gray-500">Stock: {producto.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mayoristas Tab */}
        {activeTab === 'mayoristas' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Mayoristas</h2>
              <button
                onClick={() => setShowMayoristaForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                + Agregar Mayorista
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mayoristas.map((mayorista) => (
                <div key={mayorista._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{mayorista.nombre}</h3>
                  <p className="text-gray-600 mb-1">{mayorista.email}</p>
                  <p className="text-gray-600 mb-1">{mayorista.telefono}</p>
                  <p className="text-gray-600 mb-2">{mayorista.direccion}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {mayorista.tipoPrecio}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedidos Tab */}
        {activeTab === 'pedidos' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Gestión de Pedidos</h2>
            
            <div className="space-y-6">
              {pedidos.map((pedido) => (
                <div key={pedido._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{pedido.numero}</h3>
                      <p className="text-gray-600">{pedido.mayorista.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(pedido.fecha).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                        ${pedido.total.toLocaleString()}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">{pedido.estado}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {pedido.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.producto.nombre} x{item.cantidad}</span>
                        <span>${item.precio}</span>
                      </div>
                    ))}
                  </div>
                  
                  {pedido.notas && (
                    <p className="text-sm text-gray-600 mt-3 italic">"{pedido.notas}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reportes Tab */}
        {activeTab === 'reportes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Reportes y Estadísticas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-2">Resumen General</h3>
                  <div className="space-y-2 text-sm">
                    <p>Total de turnos: {stats.totalTurnos}</p>
                    <p>Turnos finalizados: {stats.turnosFinalizados}</p>
                    <p>Productos en stock: {stats.totalProductos}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-2">Ingresos</h3>
                  <div className="space-y-2 text-sm">
                    <p>Ingresos estimados: ${stats.ingresosEstimados.toLocaleString()}</p>
                    <p>Promedio por turno: $5,000</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-2">Actividad</h3>
                  <div className="space-y-2 text-sm">
                    <p>Turnos hoy: {stats.turnosHoy}</p>
                    <p>Pendientes: {stats.turnosPendientes}</p>
                    <p>Confirmados: {stats.turnosConfirmados}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Turno Modal */}
      {showEditTurnoForm && editingTurno && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Editar Turno</h2>
            <form onSubmit={handleUpdateTurno} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    defaultValue={editingTurno.fecha}
                    required
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
                  <input
                    type="time"
                    name="horario"
                    defaultValue={editingTurno.horario}
                    required
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                <input
                  type="text"
                  name="servicio"
                  defaultValue={editingTurno.servicio}
                  required
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    defaultValue={editingTurno.cliente?.nombre || editingTurno.nombre}
                    required
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    defaultValue={editingTurno.cliente?.apellido || editingTurno.apellido}
                    required
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  name="whatsapp"
                  defaultValue={editingTurno.cliente?.telefono || editingTurno.whatsapp}
                  required
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
                  <input
                    type="text"
                    name="patente"
                    defaultValue={editingTurno.vehiculo?.patente || editingTurno.patente}
                    required
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                  <input
                    type="text"
                    name="modelo"
                    defaultValue={editingTurno.vehiculo?.modelo || editingTurno.modelo}
                    required
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select name="estado" defaultValue={editingTurno.estado} className="border border-gray-300 rounded px-3 py-2 w-full">
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditTurnoForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel 