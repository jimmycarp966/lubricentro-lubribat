import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProductos } from '../contexts/ProductosContext'
import { useTurnos } from '../contexts/TurnosContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Icon } from '@iconify/react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'
import logo from '../assets/logo.png'
import TurnosCalendar from '../components/TurnosCalendar'
import NotificationsPanel from '../components/NotificationsPanel'
import WhatsAppConfig from '../components/WhatsAppConfig'
import DashboardStats from '../components/DashboardStats'
import TurnosChart from '../components/dashboard/TurnosChart'
import AdvancedMetrics from '../components/dashboard/AdvancedMetrics'
import IntelligentCalendar from '../components/calendar/IntelligentCalendar'
import InventoryManager from '../components/admin/InventoryManager'
import PaymentManager from '../components/admin/PaymentManager'
import ReportsManager from '../components/admin/ReportsManager'
import { sendReminderMessage, sendCompletionMessage } from '../utils/whatsappService'
import { sendTurnoConfirmationNotification, sendWhatsAppNotification, notificationManager } from '../services/notificationService'
import { getPedidos, actualizarEstadoPedido, eliminarPedido, getPedidosStats } from '../services/pedidosService'
import { getPayments, getPaymentStats, updatePaymentStatus, confirmPayment } from '../services/paymentService'

const AdminPanel = () => {
  const { user } = useAuth()
  const { productos, agregarProducto, actualizarProducto, eliminarProducto } = useProductos()
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
  const navRef = useRef(null)
  const [showScrollArrow, setShowScrollArrow] = useState(false)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const [activeTab, setActiveTab] = useState('dashboard')
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
  const [pedidos, setPedidos] = useState([])
  const [loadingPedidos, setLoadingPedidos] = useState(false)
  const [pagos, setPagos] = useState([])
  const [loadingPagos, setLoadingPagos] = useState(false)

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

  // Efecto para manejar el scroll de las pestañas
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = navRef.current
        setShowLeftArrow(scrollLeft > 0)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
      }
    }

    const navElement = navRef.current
    if (navElement) {
      navElement.addEventListener('scroll', handleScroll)
      // Verificar estado inicial
      handleScroll()
      
      return () => {
        navElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

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
      ciudad: 'Concepción',
      estado: 'activo',
      fechaRegistro: '2024-01-15',
      pedidosRealizados: 12,
      totalComprado: 450000
    },
    {
      _id: '2',
      nombre: 'María González',
      empresa: 'Filtros Pro',
      tipo: 'filtros',
      email: 'maria@filtrospro.com',
      telefono: '+54 9 381 598-7654',
      contacto: 'María González',
      ciudad: 'Monteros',
      estado: 'activo',
      fechaRegistro: '2024-02-20',
      pedidosRealizados: 8,
      totalComprado: 320000
    },
    {
      _id: '3',
      nombre: 'Carlos Rodríguez',
      empresa: 'Lubricantes Premium',
      tipo: 'lubricantes',
      email: 'carlos@lubricantes.com',
      telefono: '+54 9 381 555-1234',
      contacto: 'Carlos Rodríguez',
      ciudad: 'San Miguel',
      estado: 'activo',
      fechaRegistro: '2024-03-10',
      pedidosRealizados: 5,
      totalComprado: 180000
    },
    {
      _id: '4',
      nombre: 'Ana Martínez',
      empresa: 'Repuestos Express',
      tipo: 'repuestos',
      email: 'ana@repuestos.com',
      telefono: '+54 9 381 444-5678',
      contacto: 'Ana Martínez',
      ciudad: 'Concepción',
      estado: 'inactivo',
      fechaRegistro: '2024-01-05',
      pedidosRealizados: 3,
      totalComprado: 95000
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
      { nombre: 'Alineación', cantidad: 28, porcentaje: 17.9 },
      { nombre: 'Limpieza de Inyectores', cantidad: 18, porcentaje: 11.5 },
      { nombre: 'Cambio de Frenos', cantidad: 15, porcentaje: 9.6 },
      { nombre: 'Otros Servicios', cantidad: 18, porcentaje: 11.5 }
    ],
    ingresosPorSucursal: [
      { nombre: 'Concepción', ingresos: 750000, turnos: 95, porcentaje: 60 },
      { nombre: 'Monteros', ingresos: 500000, turnos: 61, porcentaje: 40 }
    ],
    tendencias: [
      { metrica: 'Ingresos', cambio: 12, valor: '$1,250,000' },
      { metrica: 'Turnos', cambio: 8, valor: '156 turnos' },
      { metrica: 'Clientes', cambio: 15, valor: '23 nuevos' },
      { metrica: 'Satisfacción', cambio: 5, valor: '4.8/5.0' },
      { metrica: 'Retención', cambio: 3, valor: '89%' }
    ],
    clientesRecurrentes: 89,
    porcentajeRecurrentes: 57,
    porcentajeNuevos: 43,
    valorPromedioCliente: 8012,
    metricasDetalladas: {
      turnosPorDia: [12, 15, 8, 20, 18, 14, 10],
      ingresosPorDia: [45000, 52000, 38000, 65000, 58000, 48000, 42000],
      clientesPorDia: [8, 12, 6, 15, 13, 10, 7],
      serviciosPorDia: [
        { dia: 'Lunes', servicios: 12, ingresos: 45000 },
        { dia: 'Martes', servicios: 15, ingresos: 52000 },
        { dia: 'Miércoles', servicios: 8, ingresos: 38000 },
        { dia: 'Jueves', servicios: 20, ingresos: 65000 },
        { dia: 'Viernes', servicios: 18, ingresos: 58000 },
        { dia: 'Sábado', servicios: 14, ingresos: 48000 },
        { dia: 'Domingo', servicios: 10, ingresos: 42000 }
      ]
    },
    inventario: {
      totalProductos: 156,
      stockBajo: 12,
      stockCritico: 3,
      valorTotal: 850000,
      categorias: [
        { nombre: 'Aceites', cantidad: 45, valor: 250000 },
        { nombre: 'Filtros', cantidad: 38, valor: 180000 },
        { nombre: 'Repuestos', cantidad: 52, valor: 320000 },
        { nombre: 'Lubricantes', cantidad: 21, valor: 100000 }
      ]
    },
    finanzas: {
      ingresos: 1250000,
      gastos: 450000,
      ganancias: 800000,
      margen: 64,
      pagosPorMetodo: [
        { metodo: 'Efectivo', cantidad: 45, monto: 600000 },
        { metodo: 'Tarjeta', cantidad: 38, monto: 400000 },
        { metodo: 'Transferencia', cantidad: 25, monto: 200000 },
        { metodo: 'MercadoPago', cantidad: 12, monto: 50000 }
      ]
    },
    recomendaciones: [
      {
        titulo: 'Promocionar servicios premium',
        descripcion: 'Los clientes están dispuestos a pagar más por servicios especializados',
        prioridad: 'alta',
        impacto: 'Alto',
        implementacion: 'Inmediata'
      },
      {
        titulo: 'Expandir horarios en Monteros',
        descripcion: 'La sucursal tiene alta demanda pero horarios limitados',
        prioridad: 'media',
        impacto: 'Medio',
        implementacion: 'Próximo mes'
      },
      {
        titulo: 'Implementar programa de fidelización',
        descripcion: 'Aumentar retención de clientes con descuentos recurrentes',
        prioridad: 'alta',
        impacto: 'Alto',
        implementacion: 'Próximas 2 semanas'
      },
      {
        titulo: 'Optimizar inventario',
        descripcion: 'Reducir stock crítico y mejorar rotación de productos',
        prioridad: 'media',
        impacto: 'Medio',
        implementacion: 'Próximo mes'
      }
    ],
    alertas: [
      {
        tipo: 'stock',
        mensaje: '3 productos con stock crítico',
        prioridad: 'alta',
        accion: 'Reabastecer inmediatamente'
      },
      {
        tipo: 'financiero',
        mensaje: 'Margen de ganancia por debajo del objetivo',
        prioridad: 'media',
        accion: 'Revisar precios y costos'
      },
      {
        tipo: 'servicio',
        mensaje: 'Alta demanda en servicios de alineación',
        prioridad: 'baja',
        accion: 'Considerar contratar personal adicional'
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

  console.log('🔍 Debug - Pedidos antes del filtrado:', pedidos)
  const filteredPedidos = pedidos.filter(pedido => {
    const searchMatch = !searchPedido || (pedido.numero && pedido.numero.toLowerCase().includes(searchPedido.toLowerCase()))
    const estadoMatch = !filterEstadoPedido || pedido.estado === filterEstadoPedido
    const mayoristaMatch = !filterMayoristaPedido || (pedido.mayorista && (
      (typeof pedido.mayorista === 'string' && pedido.mayorista.includes(filterMayoristaPedido)) ||
      (pedido.mayorista.nombre && pedido.mayorista.nombre.includes(filterMayoristaPedido))
    ))
    return searchMatch && estadoMatch && mayoristaMatch
  }).sort((a, b) => {
    switch (sortPedidos) {
      case 'total': return (b.total || 0) - (a.total || 0)
      case 'estado': return (a.estado || '').localeCompare(b.estado || '')
      case 'mayorista': return (a.mayorista?.nombre || a.mayorista || '').localeCompare(b.mayorista?.nombre || b.mayorista || '')
      default: return new Date(b.fecha || b.createdAt || 0) - new Date(a.fecha || a.createdAt || 0)
    }
  })

  const totalInvertido = pedidos.reduce((total, pedido) => total + (pedido.total || 0), 0)

  // Definición de tabs
  const tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'calendario', name: 'Calendario' },
    { id: 'turnos', name: 'Turnos' },
    { id: 'productos', name: 'Productos' },
    { id: 'inventario', name: 'Inventario' },
    { id: 'pagos', name: 'Pagos' },
    { id: 'reportes', name: 'Reportes' },
    { id: 'mayoristas', name: 'Mayoristas' },
    { id: 'pedidos', name: 'Pedidos' },
    { id: 'notificaciones', name: 'Notificaciones' },
    { id: 'whatsapp', name: 'WhatsApp' }
  ]

  // Funciones de manejo
  const handleEstadoChange = async (turnoId, nuevoEstado) => {
    try {
      // Si se está confirmando el turno, enviar WhatsApp
      if (nuevoEstado === 'confirmado') {
        const turno = turnos.find(t => t.id === turnoId)
        if (turno) {
          console.log('🔍 Confirmando turno:', turno)
          
          // Preparar datos para WhatsApp
          const whatsappData = {
            nombre: turno.cliente?.nombre?.split(' ')[0] || '',
            apellido: turno.cliente?.nombre?.split(' ').slice(1).join(' ') || '',
            whatsapp: turno.cliente?.telefono || '',
            fecha: turno.fecha,
            horario: turno.horario,
            servicio: turno.servicio,
            sucursal: turno.sucursal || 'LUBRI-BAT'
          }
          
          console.log('📱 Datos para WhatsApp:', whatsappData)
          
          // Importar la función de WhatsApp
          const { sendWhatsAppMessage } = await import('../utils/whatsappService')
          
          // Generar y enviar WhatsApp
          const whatsappResult = sendWhatsAppMessage(whatsappData)
          console.log('📱 Resultado WhatsApp:', whatsappResult)
          
          // Abrir WhatsApp automáticamente
          console.log('🌐 Abriendo WhatsApp con URL:', whatsappResult.url)
          window.open(whatsappResult.url, '_blank')
          
          // Enviar notificaciones
          sendTurnoConfirmationNotification(turno)
          sendWhatsAppNotification(turno)
          
          toast.success('Turno confirmado y WhatsApp enviado')
        }
      }
      
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
        await eliminarProducto(productoId)
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
        await actualizarProducto(editingProduct._id, productoData)
        toast.success('Producto actualizado correctamente')
      } else {
        await agregarProducto(productoData)
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
        console.log(`🗑️ Eliminando pedido: ${pedidoId}`)
        
        // Eliminar de Firebase
        await eliminarPedido(pedidoId)
        
        // Eliminar del estado local
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
      console.log(`🔄 Actualizando estado del pedido ${pedidoId} a: ${nuevoEstado}`)
      
      // Actualizar en Firebase
      await actualizarEstadoPedido(pedidoId, nuevoEstado)
      
      // Actualizar en el estado local
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

  const handleConfirmarPago = async (pagoId) => {
    try {
      await confirmPayment(pagoId)
      setPagos(prev => prev.map(p => 
        p.id === pagoId ? { ...p, status: 'pagado' } : p
      ))
      toast.success('Pago confirmado e inventario actualizado')
    } catch (error) {
      console.error('Error confirmando pago:', error)
      toast.error('Error al confirmar pago')
    }
  }

  const handleUpdateEstadoPago = async (pagoId, nuevoEstado) => {
    try {
      await updatePaymentStatus(pagoId, nuevoEstado)
      setPagos(prev => prev.map(p => 
        p.id === pagoId ? { ...p, status: nuevoEstado } : p
      ))
      toast.success('Estado del pago actualizado')
    } catch (error) {
      console.error('Error actualizando estado del pago:', error)
      toast.error('Error al actualizar estado')
    }
  }

  // Cargar pedidos desde Firebase
  const cargarPedidos = async () => {
    try {
      setLoadingPedidos(true)
      console.log('📋 Cargando pedidos desde Firebase...')
      const pedidosReales = await getPedidos()
      console.log('📋 Pedidos obtenidos:', pedidosReales)
      console.log('📋 Estructura del primer pedido:', pedidosReales[0])
      console.log('📋 Items del primer pedido:', pedidosReales[0]?.items)
      setPedidos(pedidosReales)
      console.log(`✅ ${pedidosReales.length} pedidos cargados`)
    } catch (error) {
      console.error('❌ Error cargando pedidos:', error)
      toast.error('Error cargando pedidos')
    } finally {
      setLoadingPedidos(false)
    }
  }

  // Cargar pagos desde Firebase
  const cargarPagos = async () => {
    try {
      setLoadingPagos(true)
      console.log('💰 Cargando pagos desde Firebase...')
      const pagosReales = await getPayments()
      console.log('💰 Pagos obtenidos:', pagosReales)
      setPagos(pagosReales)
      console.log(`✅ ${pagosReales.length} pagos cargados`)
    } catch (error) {
      console.error('❌ Error cargando pagos:', error)
      toast.error('Error cargando pagos')
    } finally {
      setLoadingPagos(false)
    }
  }

  // Cargar datos cuando se active la pestaña
  useEffect(() => {
    if (activeTab === 'pedidos') {
      cargarPedidos()
    }
    if (activeTab === 'pagos') {
      cargarPagos()
    }
  }, [activeTab])

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
      {/* Admin Panel Header */}
      <div className="bg-white shadow-lg border-b-2 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <img src={logo} alt="LUBRI-BAT" className="h-10 w-10 sm:h-12 sm:w-12" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-xs sm:text-sm text-gray-600">LUBRI-BAT - Gestión Integral</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="text-right">
                <span className="text-xs sm:text-sm text-gray-500">
                  {new Date().toLocaleDateString('es-AR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="text-xs text-gray-400">
                  {new Date().toLocaleTimeString('es-AR')}
                </div>
              </div>
              {showDebug && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-yellow-200">
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
        <div className="border-b-2 border-green-200 mb-8 relative">
          <div className="relative">
            <nav
              ref={navRef}
              className="flex space-x-1 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white shadow-md'
                      : 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
            
            {/* Flecha izquierda */}
            {showLeftArrow && (
              <div 
                onClick={() => {
                  if (navRef.current) {
                    navRef.current.scrollBy({ left: -200, behavior: 'smooth' })
                  }
                }}
                className="absolute left-0 top-0 bottom-0 flex items-center bg-gradient-to-r from-white via-white to-transparent w-8 cursor-pointer hover:bg-green-50 transition-colors z-10"
              >
                <div className="w-6 h-6 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-green-600 text-xs font-bold">←</span>
                </div>
              </div>
            )}
            
            {/* Flecha derecha */}
            {showRightArrow && (
              <div 
                onClick={() => {
                  if (navRef.current) {
                    navRef.current.scrollBy({ left: 200, behavior: 'smooth' })
                  }
                }}
                className="absolute right-0 top-0 bottom-0 flex items-center bg-gradient-to-l from-white via-white to-transparent w-8 cursor-pointer hover:bg-green-50 transition-colors z-10"
              >
                <div className="w-6 h-6 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-green-600 text-xs font-bold">→</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Stats */}
            <DashboardStats turnos={turnos} productos={productos} />
            
            {/* Métricas Avanzadas */}
            <AdvancedMetrics turnos={turnos} productos={productos} />
            
            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TurnosChart turnos={turnos} type="line" />
              <TurnosChart turnos={turnos} type="bar" />
            </div>
            
            <TurnosChart turnos={turnos} type="pie" />
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-xl transition-all duration-300">
                <Card.Body className="p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon="mdi:calendar-plus" className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nuevo Turno</h3>
                  <p className="text-gray-600 mb-4">Crear un turno manualmente</p>
                  <Button variant="primary" size="sm" icon="mdi:plus">
                    Crear Turno
                  </Button>
                </Card.Body>
              </Card>
              
              <Card className="text-center hover:shadow-xl transition-all duration-300">
                <Card.Body className="p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon="mdi:package-variant-plus" className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nuevo Producto</h3>
                  <p className="text-gray-600 mb-4">Agregar producto al inventario</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    icon="mdi:plus"
                    onClick={() => setActiveTab('productos')}
                  >
                    Agregar Producto
                  </Button>
                </Card.Body>
              </Card>
              
              <Card className="text-center hover:shadow-xl transition-all duration-300">
                <Card.Body className="p-6">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon="mdi:chart-line" className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ver Reportes</h3>
                  <p className="text-gray-600 mb-4">Análisis y estadísticas</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    icon="mdi:chart-bar"
                    onClick={() => setActiveTab('reportes')}
                  >
                    Ver Reportes
                  </Button>
                </Card.Body>
              </Card>
            </div>
            
            {/* Recent Activity */}
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  {turnos.slice(0, 5).map((turno, index) => (
                    <div key={turno.id || index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon icon="mdi:calendar" className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{turno.cliente?.nombre}</p>
                        <p className="text-sm text-gray-600">{turno.fecha} - {turno.horario}</p>
                      </div>
                      <Badge 
                        variant={turno.estado === 'pendiente' ? 'warning' : 
                                turno.estado === 'confirmado' ? 'success' : 
                                turno.estado === 'completado' ? 'info' : 'default'}
                      >
                        {turno.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
        
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
                  <Button
                    variant="outline"
                    size="sm"
                    icon="mdi:refresh"
                    onClick={() => {
                      setSelectedSucursal('')
                      setSelectedDate(null)
                      setSelectedEstado('')
                    }}
                    className="w-full"
                  >
                    Limpiar Filtros
                  </Button>
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

              {/* Filtros y búsqueda */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Productos</p>
                      <p className="text-2xl font-bold text-blue-800">{filteredProductos.length}</p>
                    </div>
                    <div className="text-3xl">📦</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Disponible</p>
                      <p className="text-2xl font-bold text-green-800">{productos.filter(p => p.stock > 10).length}</p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Stock Bajo</p>
                      <p className="text-2xl font-bold text-yellow-800">{productos.filter(p => p.stock <= 10 && p.stock > 0).length}</p>
                    </div>
                    <div className="text-3xl">⚠️</div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
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
                    <div key={producto._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
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

        {activeTab === 'inventario' && (
          <InventoryManager />
        )}

        {activeTab === 'pagos' && (
          <PaymentManager />
        )}

        {activeTab === 'reportes' && (
          <ReportsManager />
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

              {/* Filtros y búsqueda */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <input
                    type="text"
                    placeholder="Buscar mayoristas..."
                    value={searchMayorista}
                    onChange={(e) => setSearchMayorista(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <select
                    value={filterTipoMayorista}
                    onChange={(e) => setFilterTipoMayorista(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="nombre">Ordenar por nombre</option>
                    <option value="tipo">Ordenar por tipo</option>
                    <option value="ciudad">Ordenar por ciudad</option>
                  </select>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Mayoristas</p>
                      <p className="text-2xl font-bold text-blue-800">{filteredMayoristas.length}</p>
                    </div>
                    <div className="text-3xl">🏢</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Aceites</p>
                      <p className="text-2xl font-bold text-green-800">{mayoristas.filter(m => m.tipo === 'aceites').length}</p>
                    </div>
                    <div className="text-3xl">🛢️</div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Filtros</p>
                      <p className="text-2xl font-bold text-purple-800">{mayoristas.filter(m => m.tipo === 'filtros').length}</p>
                    </div>
                    <div className="text-3xl">🔧</div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
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
                    <div key={mayorista._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
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

              {/* Filtros y búsqueda */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <input
                    type="text"
                    placeholder="Buscar pedidos..."
                    value={searchPedido}
                    onChange={(e) => setSearchPedido(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <select
                    value={filterEstadoPedido}
                    onChange={(e) => setFilterEstadoPedido(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Pedidos</p>
                      <p className="text-2xl font-bold text-blue-800">{filteredPedidos.length}</p>
                    </div>
                    <div className="text-3xl">📋</div>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                      <p className="text-2xl font-bold text-yellow-800">{pedidos.filter(p => p.estado === 'pendiente').length}</p>
                    </div>
                    <div className="text-3xl">⏳</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Recibidos</p>
                      <p className="text-2xl font-bold text-green-800">{pedidos.filter(p => p.estado === 'recibido').length}</p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
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
                {loadingPedidos ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando pedidos desde Firebase...</p>
                  </div>
                ) : filteredPedidos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <p className="text-gray-500 text-lg">No se encontraron pedidos</p>
                    <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                ) : (
                  filteredPedidos.map((pedido) => (
                    <div key={pedido._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
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
                          <p className="text-gray-600 mb-2">Proveedor: {pedido.mayorista?.nombre || pedido.mayorista || 'Sin proveedor'}</p>
                          <p className="text-sm text-gray-500 mb-3">
                            Fecha: {new Date(pedido.fecha).toLocaleDateString('es-AR')}
                          </p>
                          
                          {/* Items del pedido */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-gray-800 mb-2">Productos:</h4>
                            <div className="space-y-1">
                              {pedido.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.producto?.nombre || item.producto} x{item.cantidad}</span>
                                  <span>${(item.precio || 0).toLocaleString()}</span>
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
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>
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

        {activeTab === 'calendario' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Calendario Inteligente</h2>
                  <p className="text-gray-600">Gestión avanzada de turnos con IA</p>
                </div>
              </div>
              <IntelligentCalendar 
                turnos={turnos}
                onDateSelect={(date) => {
                  console.log('Fecha seleccionada:', date)
                }}
                onTurnoSelect={(turno) => {
                  console.log('Turno seleccionado:', turno)
                }}
              />
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

      {/* Modal para agregar/editar producto */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Aceite de Motor 5W-30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
                  <input
                    type="text"
                    name="codigo"
                    defaultValue={editingProduct?.codigo || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    name="categoria"
                    defaultValue={editingProduct?.categoria || 'aceites'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
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
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                  <input
                    type="text"
                    name="empresa"
                    defaultValue={editingMayorista?.empresa || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ejemplo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    defaultValue={editingMayorista?.telefono || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+54 9 381 512-3456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contacto</label>
                <input
                  type="text"
                  name="contacto"
                  defaultValue={editingMayorista?.contacto || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del contacto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  defaultValue={editingMayorista?.ciudad || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {editingMayorista ? 'Actualizar' : 'Agregar'} Mayorista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para agregar/editar pedido */}
      {showPedidoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingPedido ? 'Editar Pedido' : 'Nuevo Pedido'}
              </h2>
              <button
                onClick={() => {
                  setShowPedidoForm(false)
                  setEditingPedido(null)
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
              const pedidoData = {
                mayorista: formData.get('mayorista'),
                items: [
                  {
                    producto: formData.get('producto'),
                    cantidad: parseInt(formData.get('cantidad')),
                    precio: parseFloat(formData.get('precio'))
                  }
                ],
                total: parseFloat(formData.get('precio')) * parseInt(formData.get('cantidad')),
                estado: 'pendiente',
                notas: formData.get('notas')
              }
              handleSavePedido(pedidoData)
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
                <select
                  name="mayorista"
                  defaultValue={editingPedido?.mayorista || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar proveedor</option>
                  {mayoristas.map(mayorista => (
                    <option key={mayorista._id} value={mayorista.empresa}>
                      {mayorista.empresa} - {mayorista.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                  <input
                    type="text"
                    name="producto"
                    defaultValue={editingPedido?.items?.[0]?.producto || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Aceite de Motor 5W-30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                  <input
                    type="number"
                    name="cantidad"
                    defaultValue={editingPedido?.items?.[0]?.cantidad || ''}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unitario</label>
                  <input
                    type="number"
                    name="precio"
                    defaultValue={editingPedido?.items?.[0]?.precio || ''}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <textarea
                  name="notas"
                  defaultValue={editingPedido?.notas || ''}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notas adicionales del pedido"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPedidoForm(false)
                    setEditingPedido(null)
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {editingPedido ? 'Actualizar' : 'Crear'} Pedido
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