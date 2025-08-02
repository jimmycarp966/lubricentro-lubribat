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
  const { productos } = useProductos()
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
          <WhatsAppConfig />
        )}

        {activeTab === 'productos' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Productos</h2>
            <p className="text-gray-600">Funcionalidad en desarrollo...</p>
          </div>
        )}

        {activeTab === 'mayoristas' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Mayoristas</h2>
            <p className="text-gray-600">Funcionalidad en desarrollo...</p>
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
    </div>
  )
}

export default AdminPanel 