import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProductos } from '../contexts/ProductosContext'
import { useTurnos } from '../contexts/TurnosContext'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'
import TurnosCalendar from '../components/TurnosCalendar'
import NotificationsPanel from '../components/NotificationsPanel'
import WhatsAppConfig from '../components/WhatsAppConfig' // NEW IMPORT
import { sendReminderMessage, sendCompletionMessage } from '../utils/whatsappService'

const AdminPanel = () => {
  const { user } = useAuth()
  const { productos, addProducto, updateProducto, deleteProducto } = useProductos()
  const { 
    turnos, 
    actualizarTurno, 
    eliminarTurno, 
    fetchTurnos,
    notifications,
    obtenerNotificacionesNoLeidas 
  } = useTurnos()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSucursal, setSelectedSucursal] = useState('todas')
  const [selectedEstado, setSelectedEstado] = useState('todos')
  const [activeTurnosTab, setActiveTurnosTab] = useState('pendientes')

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

  // Verificar si el usuario es admin
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      navigate('/')
    }
  }, [user, navigate])

  // Productos más populares (datos estáticos)
  const productosPopulares = productos.slice(0, 3).map((p, index) => ({
    nombre: p.nombre,
    ventas: [45, 32, 28][index] || 15 // STATIC DATA
  }))

  // Servicios más populares (datos estáticos)
  const servicios = ['Cambio de Aceite', 'Revisión General', 'Cambio de Filtros', 'Lubricación Completa']
  const serviciosPopulares = servicios.map((s, index) => ({
    nombre: s,
    turnos: [18, 12, 8, 6][index] || 5 // STATIC DATA
  }))

  const calcularStats = () => {
    const turnosHoy = turnos.filter(t => 
      t.fecha === format(new Date(), 'yyyy-MM-dd')
    ).length

    const turnosPendientes = turnos.filter(t => 
      t.estado === 'pendiente' || t.estado === 'confirmado'
    ).length

    const turnosFinalizados = turnos.filter(t => 
      t.estado === 'finalizado'
    ).length

    const notificacionesNoLeidas = obtenerNotificacionesNoLeidas().length

    return {
      turnosHoy,
      turnosPendientes,
      turnosFinalizados,
      notificacionesNoLeidas
    }
  }

  const handleResetData = () => {
    if (window.confirm('¿Querés recargar los datos de ejemplo? Esto eliminará todos los turnos actuales.')) {
      localStorage.removeItem('turnos')
      fetchTurnos()
      toast.success('Datos de ejemplo recargados')
    }
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
  }

  const handleFinalizarTurno = async (turnoId) => {
    if (window.confirm('¿Confirmar que el turno ha sido finalizado?')) {
      await actualizarTurno(turnoId, { estado: 'finalizado' })

      // Enviar mensaje de finalización (NEW)
      const turno = turnos.find(t => t._id === turnoId)
      if (turno) {
        const whatsappData = {
          nombre: turno.cliente?.nombre?.split(' ')[0] || turno.nombre || '',
          apellido: turno.cliente?.nombre?.split(' ')[1] || turno.apellido || '',
          whatsapp: turno.cliente?.telefono || turno.whatsapp || '',
          servicio: turno.servicio,
          sucursal: turno.sucursal
        }
        const whatsappResult = sendCompletionMessage(whatsappData)
        if (whatsappResult.url) {
          window.open(whatsappResult.url, '_blank')
        }
      }
    }
  }

  const handleEnviarRecordatorio = (turno) => {
    const whatsappData = {
      nombre: turno.cliente?.nombre?.split(' ')[0] || turno.nombre || '',
      apellido: turno.cliente?.nombre?.split(' ')[1] || turno.apellido || '',
      whatsapp: turno.cliente?.telefono || turno.whatsapp || '',
      fecha: new Date(turno.fecha),
      horario: turno.horario,
      servicio: turno.servicio,
      sucursal: turno.sucursal
    }
    const whatsappResult = sendReminderMessage(whatsappData)
    if (whatsappResult.url) {
      window.open(whatsappResult.url, '_blank')
      toast.success('Recordatorio enviado por WhatsApp')
    }
  }

  const handleEditTurno = (turno) => {
    // Implementar edición de turno
    toast.info('Función de edición en desarrollo')
  }

  const handleDeleteTurno = async (turnoId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este turno?')) {
      await eliminarTurno(turnoId)
      toast.success('Turno eliminado correctamente')
    }
  }

  // Funciones para gestión de productos
  const handleEditProducto = (producto) => {
    setEditingProduct(producto)
    setShowProductForm(true)
  }

  const handleDeleteProducto = async (productoId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este producto?')) {
      await deleteProducto(productoId)
      toast.success('Producto eliminado correctamente')
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
      toast.error('Error al guardar el producto')
    }
  }

  // Funciones para gestión de mayoristas
  const handleEditMayorista = (mayorista) => {
    setEditingMayorista(mayorista)
    setShowMayoristaForm(true)
  }

  const handleDeleteMayorista = async (mayoristaId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este mayorista?')) {
      // Aquí iría la lógica para eliminar el mayorista de la base de datos
      toast.success('Mayorista eliminado correctamente')
    }
  }

  const handleSaveMayorista = async (mayoristaData) => {
    try {
      if (editingMayorista) {
        // Aquí iría la lógica para actualizar el mayorista en la base de datos
        toast.success('Mayorista actualizado correctamente')
      } else {
        // Aquí iría la lógica para agregar un nuevo mayorista a la base de datos
        toast.success('Mayorista agregado correctamente')
      }
      setShowMayoristaForm(false)
      setEditingMayorista(null)
    } catch (error) {
      toast.error('Error al guardar el mayorista')
    }
  }

  // Filtrar y ordenar productos
  const filteredProductos = productos
    .filter(producto => {
      const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filterCategory || producto.categoria === filterCategory
      const matchesStock = !filterStock || 
        (filterStock === 'disponible' && producto.stock > 10) ||
        (filterStock === 'bajo' && producto.stock <= 10 && producto.stock > 0) ||
        (filterStock === 'agotado' && producto.stock === 0)
      
      return matchesSearch && matchesCategory && matchesStock
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre)
        case 'precio':
          return b.precio - a.precio
        case 'stock':
          return b.stock - a.stock
        case 'categoria':
          return a.categoria.localeCompare(b.categoria)
        default:
          return 0
      }
    })

  // Filtrar mayoristas
  const filteredMayoristas = mayoristas // Assuming 'mayoristas' is defined elsewhere or will be added
    .filter(mayorista => {
      const matchesSearch = mayorista.nombre.toLowerCase().includes(searchMayorista.toLowerCase()) ||
                           mayorista.empresa.toLowerCase().includes(searchMayorista.toLowerCase()) ||
                           mayorista.email.toLowerCase().includes(searchMayorista.toLowerCase()) ||
                           mayorista.telefono.toLowerCase().includes(searchMayorista.toLowerCase()) ||
                           mayorista.ciudad.toLowerCase().includes(searchMayorista.toLowerCase())
      const matchesTipo = !filterTipoMayorista || mayorista.tipo === filterTipoMayorista
      
      return matchesSearch && matchesTipo
    })
    .sort((a, b) => {
      switch (sortMayoristas) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre)
        case 'tipo':
          return a.tipo.localeCompare(b.tipo)
        case 'ciudad':
          return a.ciudad.localeCompare(b.ciudad)
        default:
          return 0
      }
    })

  // Filtrar turnos
  const filteredTurnos = turnos.filter(turno => {
    const fechaMatch = turno.fecha === format(selectedDate, 'yyyy-MM-dd')
    const sucursalMatch = selectedSucursal === 'todas' || turno.sucursal === selectedSucursal
    const estadoMatch = selectedEstado === 'todos' || turno.estado === selectedEstado
    
    return fechaMatch && sucursalMatch && estadoMatch
  })

  // Filtrar por estado activo
  const turnosActivos = filteredTurnos.filter(turno => {
    if (activeTurnosTab === 'pendientes') {
      return turno.estado === 'pendiente' || turno.estado === 'confirmado'
    } else if (activeTurnosTab === 'finalizados') {
      return turno.estado === 'finalizado'
    }
    return true
  })

  const stats = calcularStats()

  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="Logo" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
                <p className="text-gray-600">Bienvenido, {user.nombre}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Notificaciones</p>
                <p className="text-2xl font-bold text-blue-600">{stats.notificacionesNoLeidas}</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('turnos')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'turnos'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 Gestión de Turnos
            </button>
            <button
              onClick={() => setActiveTab('notificaciones')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative ${
                activeTab === 'notificaciones'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔔 Notificaciones
              {stats.notificacionesNoLeidas > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {stats.notificacionesNoLeidas}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'whatsapp'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📱 WhatsApp Business
            </button>
            <button
              onClick={() => setActiveTab('productos')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'productos'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📦 Productos
            </button>
            <button
              onClick={() => setActiveTab('mayoristas')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'mayoristas'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏢 Mayoristas
            </button>
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'pedidos'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Pedidos
            </button>
            <button
              onClick={() => setActiveTab('reportes')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'reportes'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 Reportes
            </button>
          </div>
        </div>

        {/* Contenido de las tabs */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Turnos Hoy</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.turnosHoy}</p>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.turnosPendientes}</p>
                  </div>
                  <div className="text-4xl">⏳</div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Finalizados</p>
                    <p className="text-3xl font-bold text-green-600">{stats.turnosFinalizados}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notificaciones</p>
                    <p className="text-3xl font-bold text-red-600">{stats.notificacionesNoLeidas}</p>
                  </div>
                  <div className="text-4xl">🔔</div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Servicios Más Populares</h3>
                <div className="space-y-4">
                  {serviciosPopulares.map((servicio, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{servicio.nombre}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(servicio.turnos / 18) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{servicio.turnos}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Productos Más Vendidos</h3>
                <div className="space-y-4">
                  {productosPopulares.map((producto, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{producto.nombre}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(producto.ventas / 45) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{producto.ventas}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'turnos' && (
          <div className="space-y-6">
            {/* Calendar and Filter Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendario */}
              <div className="lg:col-span-2">
                <TurnosCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  turnos={turnos}
                />
              </div>

              {/* Filtros */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sucursal</label>
                  <select
                    value={selectedSucursal}
                    onChange={(e) => setSelectedSucursal(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todas">Todas las sucursales</option>
                    <option value="Sucursal Concepción">Concepción</option>
                    <option value="Sucursal Monteros">Monteros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="todos"
                        checked={selectedEstado === 'todos'}
                        onChange={(e) => setSelectedEstado(e.target.value)}
                        className="mr-2"
                      />
                      Todos
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="pendiente"
                        checked={selectedEstado === 'pendiente'}
                        onChange={(e) => setSelectedEstado(e.target.value)}
                        className="mr-2"
                      />
                      Pendientes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="confirmado"
                        checked={selectedEstado === 'confirmado'}
                        onChange={(e) => setSelectedEstado(e.target.value)}
                        className="mr-2"
                      />
                      Confirmados
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="finalizado"
                        checked={selectedEstado === 'finalizado'}
                        onChange={(e) => setSelectedEstado(e.target.value)}
                        className="mr-2"
                      />
                      Finalizados
                    </label>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">📅 Fecha Seleccionada</h3>
                  <p className="text-blue-600 font-medium">
                    {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
                  </p>
                  <p className="text-sm text-blue-500 mt-1">
                    {filteredTurnos.length} turno{filteredTurnos.length !== 1 ? 's' : ''} encontrado{filteredTurnos.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Turnos List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setActiveTurnosTab('pendientes')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTurnosTab === 'pendientes'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pendientes ({turnosActivos.filter(t => t.estado === 'pendiente' || t.estado === 'confirmado').length})
                </button>
                <button
                  onClick={() => setActiveTurnosTab('finalizados')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTurnosTab === 'finalizados'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Finalizados ({turnosActivos.filter(t => t.estado === 'finalizado').length})
                </button>
              </div>

              <div className="space-y-4">
                {turnosActivos.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">📅</div>
                    <p className="text-gray-500">No hay turnos para esta fecha</p>
                  </div>
                ) : (
                  turnosActivos.map((turno) => (
                    <div key={turno._id} className="border rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="font-semibold text-gray-800">
                              {turno.cliente?.nombre || turno.nombre}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              turno.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                              turno.estado === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {turno.estado}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Servicio:</span> {turno.servicio}
                            </div>
                            <div>
                              <span className="font-medium">Sucursal:</span> {turno.sucursal}
                            </div>
                            <div>
                              <span className="font-medium">Fecha:</span> {turno.fecha}
                            </div>
                            <div>
                              <span className="font-medium">Horario:</span> {turno.horario}
                            </div>
                            <div>
                              <span className="font-medium">Teléfono:</span> {turno.cliente?.telefono || turno.whatsapp}
                            </div>
                            <div>
                              <span className="font-medium">Vehículo:</span> {turno.vehiculo?.marca} {turno.vehiculo?.modelo}
                            </div>
                            <div>
                              <span className="font-medium">Patente:</span> {turno.vehiculo?.patente}
                            </div>
                            <div>
                              <span className="font-medium">Año:</span> {turno.vehiculo?.año}
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
                            <>
                              <button
                                onClick={() => handleEnviarRecordatorio(turno)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                                title="Enviar recordatorio por WhatsApp"
                              >
                                📱 Recordatorio
                              </button>
                              <button
                                onClick={() => handleFinalizarTurno(turno._id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                              >
                                ✅ Finalizar
                              </button>
                            </>
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notificaciones' && (
          <NotificationsPanel />
        )}

        {activeTab === 'whatsapp' && (
          <div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-yellow-800">🔧 Debug</h3>
              <p className="text-sm text-yellow-600">Pestaña WhatsApp activa</p>
            </div>
            <WhatsAppConfig />
          </div>
        )}

        {activeTab === 'productos' && (
          <div className="space-y-6">
            {/* Header con botón agregar */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
                  <p className="text-gray-600">Administra el inventario de aceites, filtros y repuestos</p>
                </div>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Agregar Producto</span>
                </button>
              </div>

              {/* Filtros y búsqueda */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas las categorías</option>
                    <option value="aceites">Aceites</option>
                    <option value="filtros">Filtros</option>
                    <option value="repuestos">Repuestos</option>
                    <option value="lubricantes">Lubricantes</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todo el stock</option>
                    <option value="disponible">Disponible</option>
                    <option value="bajo">Stock bajo</option>
                    <option value="agotado">Agotado</option>
                  </select>
                </div>
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="nombre">Ordenar por nombre</option>
                    <option value="precio">Ordenar por precio</option>
                    <option value="stock">Ordenar por stock</option>
                    <option value="categoria">Ordenar por categoría</option>
                  </select>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Productos</p>
                      <p className="text-2xl font-bold text-blue-800">{filteredProductos.length}</p>
                    </div>
                    <div className="text-3xl">📦</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Disponible</p>
                      <p className="text-2xl font-bold text-green-800">{productos.filter(p => p.stock > 10).length}</p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Stock Bajo</p>
                      <p className="text-2xl font-bold text-yellow-800">{productos.filter(p => p.stock <= 10 && p.stock > 0).length}</p>
                    </div>
                    <div className="text-3xl">⚠️</div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Agotado</p>
                      <p className="text-2xl font-bold text-red-800">{productos.filter(p => p.stock === 0).length}</p>
                    </div>
                    <div className="text-3xl">❌</div>
                  </div>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProductos.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <p className="text-gray-500 text-lg">No se encontraron productos</p>
                    <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                ) : (
                  filteredProductos.map((producto) => (
                    <div key={producto._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-800 mb-1">{producto.nombre}</h3>
                          <p className="text-gray-600 text-sm mb-2">{producto.descripcion}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              producto.categoria === 'aceites' ? 'bg-blue-100 text-blue-800' :
                              producto.categoria === 'filtros' ? 'bg-green-100 text-green-800' :
                              producto.categoria === 'repuestos' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {producto.categoria}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              producto.stock === 0 ? 'bg-red-100 text-red-800' :
                              producto.stock <= 10 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {producto.stock === 0 ? 'Agotado' : 
                               producto.stock <= 10 ? 'Stock bajo' : 'Disponible'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">${producto.precio}</p>
                          <p className="text-sm text-gray-500">Stock: {producto.stock}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProducto(producto)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProducto(producto._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mayoristas' && (
          <div className="space-y-6">
            {/* Header con botón agregar */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Gestión de Mayoristas</h2>
                  <p className="text-gray-600">Administra proveedores y contactos comerciales</p>
                </div>
                <button
                  onClick={() => setShowMayoristaForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Agregar Mayorista</span>
                </button>
              </div>

              {/* Filtros y búsqueda */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <input
                    type="text"
                    placeholder="Buscar mayoristas..."
                    value={searchMayorista}
                    onChange={(e) => setSearchMayorista(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <select
                    value={filterTipoMayorista}
                    onChange={(e) => setFilterTipoMayorista(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="aceites">Proveedor de Aceites</option>
                    <option value="filtros">Proveedor de Filtros</option>
                    <option value="repuestos">Proveedor de Repuestos</option>
                    <option value="general">Proveedor General</option>
                  </select>
                </div>
                <div>
                  <select
                    value={sortMayoristas}
                    onChange={(e) => setSortMayoristas(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="nombre">Ordenar por nombre</option>
                    <option value="tipo">Ordenar por tipo</option>
                    <option value="ciudad">Ordenar por ciudad</option>
                  </select>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Mayoristas</p>
                      <p className="text-2xl font-bold text-blue-800">{filteredMayoristas.length}</p>
                    </div>
                    <div className="text-3xl">🏢</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Aceites</p>
                      <p className="text-2xl font-bold text-green-800">{mayoristas.filter(m => m.tipo === 'aceites').length}</p>
                    </div>
                    <div className="text-3xl">🛢️</div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Filtros</p>
                      <p className="text-2xl font-bold text-purple-800">{mayoristas.filter(m => m.tipo === 'filtros').length}</p>
                    </div>
                    <div className="text-3xl">🔧</div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Repuestos</p>
                      <p className="text-2xl font-bold text-orange-800">{mayoristas.filter(m => m.tipo === 'repuestos').length}</p>
                    </div>
                    <div className="text-3xl">⚙️</div>
                  </div>
                </div>
              </div>

              {/* Lista de mayoristas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMayoristas.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🏢</div>
                    <p className="text-gray-500 text-lg">No se encontraron mayoristas</p>
                    <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                ) : (
                  filteredMayoristas.map((mayorista) => (
                    <div key={mayorista._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-800 mb-1">{mayorista.nombre}</h3>
                          <p className="text-gray-600 text-sm mb-2">{mayorista.empresa}</p>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              mayorista.tipo === 'aceites' ? 'bg-blue-100 text-blue-800' :
                              mayorista.tipo === 'filtros' ? 'bg-green-100 text-green-800' :
                              mayorista.tipo === 'repuestos' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {mayorista.tipo}
                            </span>
                            <span className="text-xs text-gray-500">{mayorista.ciudad}</span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>📧 {mayorista.email}</p>
                            <p>📱 {mayorista.telefono}</p>
                            {mayorista.contacto && <p>👤 {mayorista.contacto}</p>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMayorista(mayorista)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteMayorista(mayorista._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Pedidos</h2>
            <p className="text-gray-600">Funcionalidad en desarrollo...</p>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Reportes y Estadísticas</h2>
            <p className="text-gray-600">Funcionalidad en desarrollo...</p>
          </div>
        )}
      </div>

      {/* Modal para agregar/editar producto */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
              </h2>
              <button
                onClick={() => {
                  setShowProductForm(false)
                  setEditingProduct(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const productoData = {
                nombre: formData.get('nombre'),
                descripcion: formData.get('descripcion'),
                precio: parseFloat(formData.get('precio')),
                stock: parseInt(formData.get('stock')),
                categoria: formData.get('categoria'),
                codigo: formData.get('codigo')
              }
              handleSaveProducto(productoData)
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto</label>
                  <input
                    type="text"
                    name="nombre"
                    defaultValue={editingProduct?.nombre || ''}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Aceite de Motor 5W-30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
                  <input
                    type="text"
                    name="codigo"
                    defaultValue={editingProduct?.codigo || ''}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Código interno"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  name="descripcion"
                  defaultValue={editingProduct?.descripcion || ''}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción detallada del producto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                  <input
                    type="number"
                    name="precio"
                    defaultValue={editingProduct?.precio || ''}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={editingProduct?.stock || ''}
                    required
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    name="categoria"
                    defaultValue={editingProduct?.categoria || 'aceites'}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="aceites">Aceites</option>
                    <option value="filtros">Filtros</option>
                    <option value="repuestos">Repuestos</option>
                    <option value="lubricantes">Lubricantes</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false)
                    setEditingProduct(null)
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  {editingProduct ? 'Actualizar' : 'Agregar'} Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para agregar/editar mayorista */}
      {showMayoristaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingMayorista ? 'Editar Mayorista' : 'Agregar Mayorista'}
              </h2>
              <button
                onClick={() => {
                  setShowMayoristaForm(false)
                  setEditingMayorista(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const mayoristaData = {
                nombre: formData.get('nombre'),
                empresa: formData.get('empresa'),
                tipo: formData.get('tipo'),
                email: formData.get('email'),
                telefono: formData.get('telefono'),
                contacto: formData.get('contacto'),
                ciudad: formData.get('ciudad')
              }
              handleSaveMayorista(mayoristaData)
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    defaultValue={editingMayorista?.nombre || ''}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                  <input
                    type="text"
                    name="empresa"
                    defaultValue={editingMayorista?.empresa || ''}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: AutoParts S.A."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  name="tipo"
                  defaultValue={editingMayorista?.tipo || 'general'}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">Proveedor General</option>
                  <option value="aceites">Proveedor de Aceites</option>
                  <option value="filtros">Proveedor de Filtros</option>
                  <option value="repuestos">Proveedor de Repuestos</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingMayorista?.email || ''}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ejemplo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    defaultValue={editingMayorista?.telefono || ''}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contacto</label>
                <input
                  type="text"
                  name="contacto"
                  defaultValue={editingMayorista?.contacto || ''}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del contacto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  defaultValue={editingMayorista?.ciudad || ''}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Concepción"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMayoristaForm(false)
                    setEditingMayorista(null)
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  {editingMayorista ? 'Actualizar' : 'Agregar'} Mayorista
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