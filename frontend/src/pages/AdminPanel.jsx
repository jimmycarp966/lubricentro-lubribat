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
  const location = useLocation()

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

  // Manejar navegación desde notificaciones
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
      // Limpiar el estado para evitar que se mantenga en navegaciones posteriores
      navigate(location.pathname, { replace: true })
    }
  }, [location.state, navigate])

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
      try {
        await eliminarTurno(turnoId)
        // Forzar actualización del estado local para que se refleje en el calendario
        setTurnos(prev => prev.filter(t => t.id !== turnoId))
        toast.success('Turno eliminado correctamente')
      } catch (error) {
        console.error('Error eliminando turno:', error)
        toast.error('Error al eliminar el turno')
      }
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

  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
    return null
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
                  // Debug completo del sistema con Firebase
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
                    // Crear turno de prueba con Firebase
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
                    // Limpiar todos los datos de Firebase
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

        {/* ... rest of existing tabs ... */}
      </div>
    </div>
  )
}

export default AdminPanel 