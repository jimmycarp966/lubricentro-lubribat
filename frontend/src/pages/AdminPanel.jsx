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
    setTurnos, // NEW: For debug buttons
    actualizarTurno, 
    eliminarTurno, 
    fetchTurnos,
    notifications,
    setNotifications, // NEW: For debug buttons
    obtenerNotificacionesNoLeidas,
    crearNotificacionPedido, // NEW: For pedidos notifications
    crearNotificacionEstadoPedido // NEW: For pedido state change notifications
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

  // Estados para gestión de pedidos
  const [showPedidoForm, setShowPedidoForm] = useState(false)
  const [editingPedido, setEditingPedido] = useState(null)
  const [searchPedido, setSearchPedido] = useState('')
  const [filterEstadoPedido, setFilterEstadoPedido] = useState('')
  const [filterMayoristaPedido, setFilterMayoristaPedido] = useState('')
  const [sortPedidos, setSortPedidos] = useState('fecha')

  // Estados para reportes
  const [reportPeriod, setReportPeriod] = useState('mes')

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
      fecha: '2024-01-15T10:00:00.000Z',
      mayorista: 'AutoParts S.A.',
      items: [
        { producto: 'Aceite de Motor 5W-30', cantidad: 5, precio: 2500 },
        { producto: 'Filtro de Aceite', cantidad: 10, precio: 800 }
      ],
      total: 20500,
      estado: 'pendiente',
      notas: 'Urgente para mañana'
    },
    {
      _id: '2',
      numero: 'PED-002',
      fecha: '2024-01-14T14:30:00.000Z',
      mayorista: 'Filtros Pro',
      items: [
        { producto: 'Líquido de Frenos', cantidad: 3, precio: 1200 }
      ],
      total: 3600,
      estado: 'recibido',
      notas: ''
    }
  ])

  // Datos de reportes
  const reportData = {
    ingresosTotales: 125000,
    turnosCompletados: 156,
    clientesNuevos: 23,
    satisfaccion: 4.8,
    serviciosPopulares: [
      { nombre: 'Cambio de Aceite', cantidad: 45, porcentaje: 29 },
      { nombre: 'Cambio de Filtros', cantidad: 32, porcentaje: 21 },
      { nombre: 'Alineación', cantidad: 28, porcentaje: 18 },
      { nombre: 'Frenos', cantidad: 25, porcentaje: 16 },
      { nombre: 'Otros', cantidad: 26, porcentaje: 16 }
    ],
    ingresosPorSucursal: [
      { nombre: 'Concepción', ingresos: 75000, turnos: 95, porcentaje: 60 },
      { nombre: 'Monteros', ingresos: 50000, turnos: 61, porcentaje: 40 }
    ],
    tendencias: [
      { metrica: 'Ingresos', cambio: 12, valor: '$125,000' },
      { metrica: 'Turnos', cambio: 8, valor: '156 turnos' },
      { metrica: 'Clientes Nuevos', cambio: 15, valor: '23 clientes' },
      { metrica: 'Satisfacción', cambio: 4, valor: '4.8/5' }
    ],
    clientesRecurrentes: 133,
    porcentajeRecurrentes: 85,
    porcentajeNuevos: 15,
    valorPromedioCliente: 800,
    recomendaciones: [
      {
        prioridad: 'alta',
        titulo: 'Stock Bajo',
        descripcion: 'Reabastecer filtros de aceite - solo quedan 5 unidades'
      },
      {
        prioridad: 'media',
        titulo: 'Promoción Sugerida',
        descripcion: 'Ofrecer descuento en cambio de aceite + filtros'
      },
      {
        prioridad: 'baja',
        titulo: 'Capacitación',
        descripcion: 'Capacitar equipo en nuevos servicios'
      },
      {
        prioridad: 'media',
        titulo: 'Horarios Extendidos',
        descripcion: 'Considerar horarios vespertinos en Concepción'
      }
    ]
  }

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

    // Debug logs para verificar datos
    console.log('📊 Stats calculados:', {
      turnosHoy,
      turnosPendientes,
      turnosFinalizados,
      notificacionesNoLeidas,
      totalTurnos: turnos.length,
      turnos: turnos.slice(0, 3) // Mostrar primeros 3 turnos para debug
    })

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

  // Funciones para gestión de pedidos
  const handleEditPedido = (pedido) => {
    setEditingPedido(pedido)
    setShowPedidoForm(true)
  }

  const handleDeletePedido = async (pedidoId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este pedido?')) {
      // Aquí iría la lógica para eliminar el pedido de la base de datos
      toast.success('Pedido eliminado correctamente')
    }
  }

  const handleSavePedido = async (pedidoData) => {
    try {
      if (editingPedido) {
        // Actualizar pedido existente
        setPedidos(prev => prev.map(p => p._id === editingPedido._id ? { ...p, ...pedidoData } : p))
        toast.success('Pedido actualizado correctamente')
      } else {
        // Crear nuevo pedido
        const nuevoPedido = {
          _id: Date.now().toString(),
          numero: `PED-${String(Date.now()).slice(-6)}`,
          fecha: new Date().toISOString(),
          ...pedidoData,
          estado: 'pendiente'
        }
        
        setPedidos(prev => [nuevoPedido, ...prev])
        
        // Crear notificación para el nuevo pedido
        crearNotificacionPedido(nuevoPedido)
        
        toast.success('Pedido agregado correctamente')
      }
      setShowPedidoForm(false)
      setEditingPedido(null)
    } catch (error) {
      toast.error('Error al guardar el pedido')
    }
  }

  const getNextEstado = (currentEstado) => {
    switch (currentEstado) {
      case 'pendiente':
        return 'confirmado'
      case 'confirmado':
        return 'enviado'
      case 'enviado':
        return 'recibido'
      case 'recibido':
        return 'finalizado' // Assuming 'finalizado' is the final state for a turno
      default:
        return currentEstado
    }
  }

  const getNextEstadoLabel = (currentEstado) => {
    switch (currentEstado) {
      case 'pendiente':
        return 'Confirmar'
      case 'confirmado':
        return 'Enviar'
      case 'enviado':
        return 'Recibir'
      case 'recibido':
        return 'Finalizar'
      default:
        return currentEstado
    }
  }

  const handleUpdateEstadoPedido = async (pedidoId, nuevoEstado) => {
    if (window.confirm(`¿Confirmar que el pedido ha pasado a estado "${nuevoEstado}"?`)) {
      // Actualizar el estado del pedido
      setPedidos(prev => prev.map(p => {
        if (p._id === pedidoId) {
          const pedidoActualizado = { ...p, estado: nuevoEstado }
          
          // Crear notificación para el cambio de estado
          crearNotificacionEstadoPedido(p, nuevoEstado)
          
          return pedidoActualizado
        }
        return p
      }))
      
      toast.success(`Pedido actualizado a estado "${nuevoEstado}"`)
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

  // Filtrar pedidos
  const filteredPedidos = pedidos // Assuming 'pedidos' is defined elsewhere or will be added
    .filter(pedido => {
      const matchesSearch = pedido.numero.toString().includes(searchPedido) ||
                           pedido.mayorista.toLowerCase().includes(searchPedido.toLowerCase()) ||
                           pedido.notas?.toLowerCase().includes(searchPedido.toLowerCase())
      const matchesEstado = !filterEstadoPedido || pedido.estado === filterEstadoPedido
      const matchesMayorista = !filterMayoristaPedido || pedido.mayorista.toLowerCase().includes(filterMayoristaPedido.toLowerCase())
      
      return matchesSearch && matchesEstado && matchesMayorista
    })
    .sort((a, b) => {
      switch (sortPedidos) {
        case 'fecha':
          return new Date(b.fecha) - new Date(a.fecha)
        case 'total':
          return b.total - a.total
        case 'estado':
          return a.estado.localeCompare(b.estado)
        case 'mayorista':
          return a.mayorista.localeCompare(b.mayorista)
        default:
          return 0
      }
    })

  // Cálculos para pedidos (ejemplo, en un caso real, estos datos deberían provenir de la base de datos)
  const totalInvertido = pedidos.reduce((sum, pedido) => sum + pedido.total, 0)

  const stats = calcularStats()

  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  // Función para actualizar información de debug
  const updateDebugInfo = () => {
    const info = {
      turnos: turnos.length,
      notifications: notifications.length,
      productos: productos.length,
      mayoristas: mayoristas.length,
      pedidos: pedidos.length,
      localStorage: {
        turnos: localStorage.getItem('turnos') ? 'Sí' : 'No',
        notifications: localStorage.getItem('notifications') ? 'Sí' : 'No',
        productos: localStorage.getItem('productos') ? 'Sí' : 'No',
        mayoristas: localStorage.getItem('mayoristas') ? 'Sí' : 'No',
        pedidos: localStorage.getItem('pedidos') ? 'Sí' : 'No'
      },
      ultimosTurnos: turnos.slice(0, 3).map(t => ({
        id: t._id,
        fecha: t.fecha,
        cliente: t.cliente?.nombre || 'Sin nombre',
        sucursal: t.sucursal
      })),
      ultimasNotificaciones: notifications.slice(0, 3).map(n => ({
        id: n.id,
        tipo: n.tipo,
        titulo: n.titulo,
        leida: n.leida
      }))
    }
    setDebugInfo(JSON.stringify(info, null, 2))
  }

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

        {/* Debug Panel - Visible for testing */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">🔧 Panel de Debug</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  updateDebugInfo()
                  setShowDebug(!showDebug)
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
              >
                {showDebug ? 'Ocultar Debug' : 'Mostrar Debug'}
              </button>
              <button
                onClick={() => {
                  console.log('🔧 Debug: Verificando estado actual...')
                  console.log('🔧 Debug: Turnos actuales:', turnos.length)
                  console.log('🔧 Debug: Notificaciones actuales:', notifications.length)
                  console.log('🔧 Debug: Turnos en localStorage:', localStorage.getItem('turnos'))
                  console.log('🔧 Debug: Notificaciones en localStorage:', localStorage.getItem('notifications'))
                  
                  // Mostrar en consola los últimos 3 turnos
                  console.log('🔧 Debug: Últimos 3 turnos:', turnos.slice(0, 3))
                  
                  // Mostrar en consola las últimas 3 notificaciones
                  console.log('🔧 Debug: Últimas 3 notificaciones:', notifications.slice(0, 3))
                  
                  updateDebugInfo()
                  toast.success('Estado verificado en consola')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                🔍 Verificar Estado
              </button>
              <button
                onClick={() => {
                  // Limpiar localStorage y reinicializar
                  localStorage.removeItem('vercel_turnos')
                  localStorage.removeItem('vercel_notifications')
                  localStorage.removeItem('api_turnos')
                  localStorage.removeItem('api_notifications')
                  localStorage.removeItem('turnos')
                  localStorage.removeItem('notifications')
                  localStorage.removeItem('device_id')
                  localStorage.removeItem('last_sync_timestamp')

                  // Recargar la página para reinicializar
                  window.location.reload()

                  toast.success('Datos limpiados y reinicializados')
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                🗑️ Limpiar Datos
              </button>
              <button
                onClick={() => {
                  // Forzar sincronización manual
                  const turnosAPI = JSON.parse(localStorage.getItem('api_turnos') || '[]')
                  const notificationsAPI = JSON.parse(localStorage.getItem('api_notifications') || '[]')
                  
                  console.log('🔧 Manual Sync: Turnos en localStorage:', turnosAPI.length)
                  console.log('🔧 Manual Sync: Notificaciones en localStorage:', notificationsAPI.length)
                  console.log('🔧 Manual Sync: Últimos turnos:', turnosAPI.slice(0, 3))
                  console.log('🔧 Manual Sync: Últimas notificaciones:', notificationsAPI.slice(0, 3))
                  
                  // Forzar actualización del estado
                  setTurnos(turnosAPI)
                  setNotifications(notificationsAPI)
                  
                  toast.success('Sincronización manual completada')
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                🔄 Sincronizar Manual
              </button>
              <button
                onClick={() => {
                  // Forzar evento de sincronización
                  window.dispatchEvent(new CustomEvent('forceSync', { detail: { type: 'all' } }))
                  
                  // También verificar localStorage
                  const turnosAPI = JSON.parse(localStorage.getItem('vercel_turnos') || '[]')
                  const notificationsAPI = JSON.parse(localStorage.getItem('vercel_notifications') || '[]')
                  
                  console.log('🔧 Force Sync: Disparando evento forceSync')
                  console.log('🔧 Force Sync: Turnos disponibles:', turnosAPI.length)
                  console.log('🔧 Force Sync: Notificaciones disponibles:', notificationsAPI.length)
                  
                  setTurnos(turnosAPI)
                  setNotifications(notificationsAPI)
                  
                  toast.success('Sincronización forzada completada')
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
              >
                ⚡ Forzar Sync
              </button>
              <button
                onClick={() => {
                  // Sincronización manual desde localStorage
                  const turnosAPI = JSON.parse(localStorage.getItem('vercel_turnos') || '[]')
                  const notificationsAPI = JSON.parse(localStorage.getItem('vercel_notifications') || '[]')

                  console.log('🔧 Manual Sync: Sincronizando desde localStorage')
                  console.log('🔧 Manual Sync: Turnos en localStorage:', turnosAPI.length)
                  console.log('🔧 Manual Sync: Notificaciones en localStorage:', notificationsAPI.length)

                  setTurnos(turnosAPI)
                  setNotifications(notificationsAPI)

                  toast.success('Datos sincronizados manualmente')
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                🔄 Sync Manual
              </button>
              <button
                onClick={() => {
                  // Debug completo del sistema
                  const turnosLocalStorage = JSON.parse(localStorage.getItem('vercel_turnos') || '[]')
                  const notificationsLocalStorage = JSON.parse(localStorage.getItem('vercel_notifications') || '[]')
                  
                  console.log('🔧 DEBUG COMPLETO DEL SISTEMA:')
                  console.log('📊 Turnos en localStorage:', turnosLocalStorage.length)
                  console.log('📊 Turnos en estado React:', turnos.length)
                  console.log('📊 Notificaciones en localStorage:', notificationsLocalStorage.length)
                  console.log('📊 Notificaciones en estado React:', notifications.length)
                  
                  console.log('📋 Últimos 3 turnos en localStorage:', turnosLocalStorage.slice(0, 3))
                  console.log('📋 Últimos 3 turnos en React:', turnos.slice(0, 3))
                  console.log('📋 Últimas 3 notificaciones en localStorage:', notificationsLocalStorage.slice(0, 3))
                  console.log('📋 Últimas 3 notificaciones en React:', notifications.slice(0, 3))
                  
                  // Verificar si hay diferencias
                  const turnosDiferentes = turnosLocalStorage.length !== turnos.length
                  const notificationsDiferentes = notificationsLocalStorage.length !== notifications.length
                  
                  console.log('⚠️ DIFERENCIAS DETECTADAS:')
                  console.log('⚠️ Turnos diferentes:', turnosDiferentes)
                  console.log('⚠️ Notificaciones diferentes:', notificationsDiferentes)
                  
                  if (turnosDiferentes || notificationsDiferentes) {
                    console.log('🔄 SINCRONIZANDO...')
                    setTurnos(turnosLocalStorage)
                    setNotifications(notificationsLocalStorage)
                    toast.success('Sincronización completada')
                  } else {
                    toast.success('Sistema sincronizado correctamente')
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                             >
                 🔍 Debug Completo
               </button>
               <button
                 onClick={() => {
                   // Crear turno de prueba
                   const turnoPrueba = {
                     _id: Date.now().toString(),
                     fecha: '2024-01-20',
                     horario: '10:00',
                     servicio: 'Cambio de Aceite',
                     sucursal: 'Sucursal Monteros',
                     cliente: {
                       nombre: 'Cliente Prueba',
                       telefono: '+5493815123456',
                       email: 'prueba@email.com'
                     },
                     vehiculo: {
                       patente: 'TEST123',
                       modelo: 'Auto Prueba 2024'
                     },
                     estado: 'confirmado',
                     createdAt: new Date().toISOString()
                   }

                   const notificacionPrueba = {
                     id: Date.now().toString(),
                     tipo: 'nuevo_turno',
                     titulo: 'Turno de Prueba',
                     mensaje: 'Cliente Prueba reservó un turno para 2024-01-20 a las 10:00',
                     turno: turnoPrueba,
                     leida: false,
                     timestamp: new Date().toISOString()
                   }

                   // Guardar en localStorage
                   const turnosActuales = JSON.parse(localStorage.getItem('vercel_turnos') || '[]')
                   const notificationsActuales = JSON.parse(localStorage.getItem('vercel_notifications') || '[]')
                   
                   turnosActuales.unshift(turnoPrueba)
                   notificationsActuales.unshift(notificacionPrueba)
                   
                   localStorage.setItem('vercel_turnos', JSON.stringify(turnosActuales))
                   localStorage.setItem('vercel_notifications', JSON.stringify(notificationsActuales))

                   // Actualizar estado React
                   setTurnos(turnosActuales)
                   setNotifications(notificationsActuales)

                   console.log('🧪 Datos de prueba creados:', turnoPrueba._id, notificacionPrueba.id)
                   toast.success('Datos de prueba creados')
                 }}
                 className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
               >
                 🧪 Crear Datos Prueba
               </button>
             </div>
           </div>
          {showDebug && (
            <div className="bg-yellow-100 border border-yellow-300 rounded p-4">
              <div className="text-xs text-yellow-800">
                <pre className="whitespace-pre-wrap">{debugInfo || 'Sin información de debug'}</pre>
              </div>
            </div>
          )}
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
                    {turnos.filter(t => 
                      t.fecha === format(selectedDate, 'yyyy-MM-dd') &&
                      (selectedEstado === 'todos' || t.estado === selectedEstado) &&
                      (selectedSucursal === 'todas' || t.sucursal === selectedSucursal)
                    ).length} turno{turnos.filter(t => 
                      t.fecha === format(selectedDate, 'yyyy-MM-dd') &&
                      (selectedEstado === 'todos' || t.estado === selectedEstado) &&
                      (selectedSucursal === 'todas' || t.sucursal === selectedSucursal)
                    ).length !== 1 ? 's' : ''} encontrado{turnos.filter(t => 
                      t.fecha === format(selectedDate, 'yyyy-MM-dd') &&
                      (selectedEstado === 'todos' || t.estado === selectedEstado) &&
                      (selectedSucursal === 'todas' || t.sucursal === selectedSucursal)
                    ).length !== 1 ? 's' : ''}
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
                  Pendientes ({turnos.filter(t => t.estado === 'pendiente' || t.estado === 'confirmado').length})
                </button>
                <button
                  onClick={() => setActiveTurnosTab('finalizados')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTurnosTab === 'finalizados'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Finalizados ({turnos.filter(t => t.estado === 'finalizado').length})
                </button>
              </div>

              {/* Debug Panel */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-800 mb-2">🔧 Debug - Información de Turnos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Turnos:</span> {turnos.length}
                  </div>
                  <div>
                    <span className="font-medium">Fecha Seleccionada:</span> {format(selectedDate, 'yyyy-MM-dd')}
                  </div>
                  <div>
                    <span className="font-medium">Sucursal Filtro:</span> {selectedSucursal}
                  </div>
                  <div>
                    <span className="font-medium">Estado Filtro:</span> {selectedEstado}
                  </div>
                  <div>
                    <span className="font-medium">Turnos Filtrados:</span> {turnos.filter(t => 
                      t.fecha === format(selectedDate, 'yyyy-MM-dd') &&
                      (selectedEstado === 'todos' || t.estado === selectedEstado) &&
                      (selectedSucursal === 'todas' || t.sucursal === selectedSucursal)
                    ).length}
                  </div>
                  <div>
                    <span className="font-medium">Notificaciones No Leídas:</span> {obtenerNotificacionesNoLeidas().length}
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedDate(new Date())
                      setSelectedSucursal('todas')
                      setSelectedEstado('todos')
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                  >
                    🔄 Limpiar Filtros
                  </button>
                  <button
                    onClick={() => {
                      console.log('📋 Todos los turnos:', turnos)
                      console.log('🔔 Todas las notificaciones:', notifications)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                  >
                    📋 Ver en Consola
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔧 Debug: Botón "Crear Turno Prueba" clickeado')
                      
                      // Crear un turno de prueba
                      const turnoPrueba = {
                        _id: Date.now().toString(),
                        fecha: format(new Date(), 'yyyy-MM-dd'),
                        horario: '10:00',
                        servicio: 'Cambio de Aceite',
                        sucursal: 'Sucursal Concepción',
                        cliente: {
                          nombre: 'Cliente Prueba',
                          telefono: '+5493815123456',
                          email: 'prueba@email.com'
                        },
                        vehiculo: {
                          patente: 'TEST123',
                          modelo: 'Toyota Corolla 2020'
                        },
                        estado: 'confirmado',
                        createdAt: new Date().toISOString()
                      }
                      
                      console.log('🔧 Debug: Creando turno de prueba:', turnoPrueba)
                      setTurnos(prev => {
                        console.log('🔧 Debug: Turnos anteriores:', prev.length)
                        const nuevosTurnos = [turnoPrueba, ...prev]
                        console.log('🔧 Debug: Nuevos turnos:', nuevosTurnos.length)
                        return nuevosTurnos
                      })
                      
                      // Crear notificación de prueba
                      const notificacionPrueba = {
                        id: Date.now().toString(),
                        tipo: 'nuevo_turno',
                        titulo: 'Turno de Prueba',
                        mensaje: `Cliente Prueba reservó un turno para ${turnoPrueba.fecha} a las ${turnoPrueba.horario}`,
                        turno: turnoPrueba,
                        leida: false,
                        timestamp: new Date().toISOString()
                      }
                      
                      console.log('🔧 Debug: Creando notificación de prueba:', notificacionPrueba)
                      setNotifications(prev => {
                        console.log('🔧 Debug: Notificaciones anteriores:', prev.length)
                        const nuevasNotificaciones = [notificacionPrueba, ...prev]
                        console.log('🔧 Debug: Nuevas notificaciones:', nuevasNotificaciones.length)
                        return nuevasNotificaciones
                      })
                      
                      toast.success('Turno de prueba creado')
                      console.log('🔧 Debug: Toast mostrado')
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
                  >
                    🧪 Crear Turno Prueba
                  </button>
                          <button
          onClick={() => {
            console.log('🔧 Debug: Botón "Crear Pedido Prueba" clickeado')
            
            // Crear un pedido de prueba
            const pedidoPrueba = {
              _id: Date.now().toString(),
              numero: `PED-${String(Date.now()).slice(-6)}`,
              fecha: new Date().toISOString(),
              mayorista: 'AutoParts S.A.',
              items: [
                { producto: 'Aceite de Motor 5W-30', cantidad: 3, precio: 2500 },
                { producto: 'Filtro de Aceite', cantidad: 5, precio: 800 }
              ],
              total: 11500,
              estado: 'pendiente',
              notas: 'Pedido de prueba para testing'
            }
            
            console.log('🔧 Debug: Creando pedido de prueba:', pedidoPrueba)
            setPedidos(prev => {
              console.log('🔧 Debug: Pedidos anteriores:', prev.length)
              const nuevosPedidos = [pedidoPrueba, ...prev]
              console.log('🔧 Debug: Nuevos pedidos:', nuevosPedidos.length)
              return nuevosPedidos
            })
            
            // Crear notificación de pedido de prueba
            crearNotificacionPedido(pedidoPrueba)
            
            toast.success('Pedido de prueba creado')
            console.log('🔧 Debug: Toast mostrado')
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs"
        >
          📦 Crear Pedido Prueba
        </button>
        
        <button
          onClick={() => {
            console.log('🔧 Debug: Verificando estado actual...')
            console.log('🔧 Debug: Turnos actuales:', turnos.length)
            console.log('🔧 Debug: Notificaciones actuales:', notifications.length)
            console.log('🔧 Debug: Turnos en localStorage:', localStorage.getItem('turnos'))
            console.log('🔧 Debug: Notificaciones en localStorage:', localStorage.getItem('notifications'))
            
            // Mostrar en consola los últimos 3 turnos
            console.log('🔧 Debug: Últimos 3 turnos:', turnos.slice(0, 3))
            
            // Mostrar en consola las últimas 3 notificaciones
            console.log('🔧 Debug: Últimas 3 notificaciones:', notifications.slice(0, 3))
            
            updateDebugInfo()
            toast.success('Estado verificado en consola')
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
        >
          🔍 Verificar Estado
        </button>
                </div>
              </div>

              <div className="space-y-4">
                {turnos.filter(t => 
                  t.fecha === format(selectedDate, 'yyyy-MM-dd') &&
                  (selectedEstado === 'todos' || t.estado === selectedEstado) &&
                  (selectedSucursal === 'todas' || t.sucursal === selectedSucursal)
                ).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">📅</div>
                    <p className="text-gray-500">No hay turnos para esta fecha</p>
                  </div>
                ) : (
                  turnos.filter(t => 
                    t.fecha === format(selectedDate, 'yyyy-MM-dd') &&
                    (selectedEstado === 'todos' || t.estado === selectedEstado) &&
                    (selectedSucursal === 'todas' || t.sucursal === selectedSucursal)
                  ).map((turno) => (
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
          <div className="space-y-6">
            {/* Header con botón agregar */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h2>
                  <p className="text-gray-600">Administra órdenes de compra y pedidos a proveedores</p>
                </div>
                <button
                  onClick={() => setShowPedidoForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Nuevo Pedido</span>
                </button>
              </div>

              {/* Filtros y búsqueda */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <input
                    type="text"
                    placeholder="Buscar pedidos..."
                    value={searchPedido}
                    onChange={(e) => setSearchPedido(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <select
                    value={filterEstadoPedido}
                    onChange={(e) => setFilterEstadoPedido(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="enviado">Enviado</option>
                    <option value="recibido">Recibido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filterMayoristaPedido}
                    onChange={(e) => setFilterMayoristaPedido(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los proveedores</option>
                    <option value="aceites">Proveedores de Aceites</option>
                    <option value="filtros">Proveedores de Filtros</option>
                    <option value="repuestos">Proveedores de Repuestos</option>
                  </select>
                </div>
                <div>
                  <select
                    value={sortPedidos}
                    onChange={(e) => setSortPedidos(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="fecha">Ordenar por fecha</option>
                    <option value="total">Ordenar por total</option>
                    <option value="estado">Ordenar por estado</option>
                    <option value="mayorista">Ordenar por proveedor</option>
                  </select>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Pedidos</p>
                      <p className="text-2xl font-bold text-blue-800">{filteredPedidos.length}</p>
                    </div>
                    <div className="text-3xl">📋</div>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                      <p className="text-2xl font-bold text-yellow-800">{pedidos.filter(p => p.estado === 'pendiente').length}</p>
                    </div>
                    <div className="text-3xl">⏳</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Recibidos</p>
                      <p className="text-2xl font-bold text-green-800">{pedidos.filter(p => p.estado === 'recibido').length}</p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Total Invertido</p>
                      <p className="text-2xl font-bold text-purple-800">${totalInvertido.toLocaleString()}</p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                </div>
              </div>

              {/* Lista de pedidos */}
              <div className="space-y-4">
                {filteredPedidos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <p className="text-gray-500 text-lg">No se encontraron pedidos</p>
                    <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                ) : (
                  filteredPedidos.map((pedido) => (
                    <div key={pedido._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="font-semibold text-lg text-gray-800">Pedido #{pedido.numero}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                              pedido.estado === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                              pedido.estado === 'enviado' ? 'bg-purple-100 text-purple-800' :
                              pedido.estado === 'recibido' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {pedido.estado}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">Proveedor: {pedido.mayorista}</p>
                          <p className="text-sm text-gray-500 mb-3">
                            Fecha: {new Date(pedido.fecha).toLocaleDateString('es-AR')}
                          </p>
                          
                          {/* Items del pedido */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-gray-800 mb-2">Productos:</h4>
                            <div className="space-y-1">
                              {pedido.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.producto} x{item.cantidad}</span>
                                  <span>${item.precio.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {pedido.notas && (
                            <p className="text-sm text-gray-600 italic">"{pedido.notas}"</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-green-600">${pedido.total.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{pedido.items.length} productos</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPedido(pedido)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeletePedido(pedido._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          🗑️ Eliminar
                        </button>
                        <button
                          onClick={() => handleUpdateEstadoPedido(pedido._id, getNextEstado(pedido.estado))}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          {getNextEstadoLabel(pedido.estado)}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h2>
                  <p className="text-gray-600">Análisis completo del negocio y métricas de rendimiento</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setReportPeriod('mes')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      reportPeriod === 'mes' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Este Mes
                  </button>
                  <button
                    onClick={() => setReportPeriod('trimestre')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      reportPeriod === 'trimestre' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Este Trimestre
                  </button>
                  <button
                    onClick={() => setReportPeriod('año')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      reportPeriod === 'año' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Este Año
                  </button>
                </div>
              </div>

              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Ingresos Totales</p>
                      <p className="text-3xl font-bold">${reportData.ingresosTotales.toLocaleString()}</p>
                      <p className="text-blue-200 text-sm">+12% vs mes anterior</p>
                    </div>
                    <div className="text-4xl">💰</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Turnos Completados</p>
                      <p className="text-3xl font-bold">{reportData.turnosCompletados}</p>
                      <p className="text-green-200 text-sm">+8% vs mes anterior</p>
                    </div>
                    <div className="text-4xl">✅</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Clientes Nuevos</p>
                      <p className="text-3xl font-bold">{reportData.clientesNuevos}</p>
                      <p className="text-purple-200 text-sm">+15% vs mes anterior</p>
                    </div>
                    <div className="text-4xl">👥</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Satisfacción</p>
                      <p className="text-3xl font-bold">{reportData.satisfaccion}/5</p>
                      <p className="text-orange-200 text-sm">+0.2 vs mes anterior</p>
                    </div>
                    <div className="text-4xl">⭐</div>
                  </div>
                </div>
              </div>

              {/* Gráficos y análisis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Servicios más populares */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Servicios Más Populares</h3>
                  <div className="space-y-4">
                    {reportData.serviciosPopulares.map((servicio, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{servicio.nombre}</p>
                            <p className="text-sm text-gray-500">{servicio.porcentaje}% del total</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">{servicio.cantidad}</p>
                          <p className="text-sm text-gray-500">turnos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ingresos por sucursal */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Ingresos por Sucursal</h3>
                  <div className="space-y-4">
                    {reportData.ingresosPorSucursal.map((sucursal, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${
                            index === 0 ? 'bg-blue-500' : 
                            index === 1 ? 'bg-green-500' : 'bg-purple-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-800">{sucursal.nombre}</p>
                            <p className="text-sm text-gray-500">{sucursal.porcentaje}% del total</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">${sucursal.ingresos.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{sucursal.turnos} turnos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tendencias de crecimiento */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Tendencias de Crecimiento</h3>
                  <div className="space-y-4">
                    {reportData.tendencias.map((tendencia, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{tendencia.metrica}</p>
                          <p className="text-sm text-gray-500">Últimos 30 días</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            tendencia.cambio > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tendencia.cambio > 0 ? '+' : ''}{tendencia.cambio}%
                          </p>
                          <p className="text-sm text-gray-500">{tendencia.valor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Análisis de clientes */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Análisis de Clientes</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Clientes Recurrentes</p>
                        <p className="text-sm text-gray-500">Más de 3 visitas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{reportData.clientesRecurrentes}</p>
                        <p className="text-sm text-gray-500">{reportData.porcentajeRecurrentes}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Clientes Nuevos</p>
                        <p className="text-sm text-gray-500">Primera visita</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{reportData.clientesNuevos}</p>
                        <p className="text-sm text-gray-500">{reportData.porcentajeNuevos}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Valor Promedio</p>
                        <p className="text-sm text-gray-500">Por cliente</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">${reportData.valorPromedioCliente}</p>
                        <p className="text-sm text-gray-500">por visita</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones recomendadas */}
              <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Acciones Recomendadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportData.recomendaciones.map((recomendacion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        recomendacion.prioridad === 'alta' ? 'bg-red-100 text-red-600' :
                        recomendacion.prioridad === 'media' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {recomendacion.prioridad === 'alta' ? '🔥' :
                         recomendacion.prioridad === 'media' ? '⚡' : '💡'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{recomendacion.titulo}</p>
                        <p className="text-sm text-gray-600">{recomendacion.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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