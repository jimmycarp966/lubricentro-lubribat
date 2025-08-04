import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProductos } from '../contexts/ProductosContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ref, push, set, get, update } from 'firebase/database'
import { database } from '../firebase/config'
import DebugAuth from '../components/DebugAuth'
import { checkAndCreateMayoristaUser, verifyMayoristaInFirebase } from '../utils/checkMayoristaUser'

const PortalMayorista = () => {
  const { user, forceUpdateUserRole } = useAuth()
  const navigate = useNavigate()
  const { productos, loading, actualizarProducto } = useProductos()
  
  const [carrito, setCarrito] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [activeTab, setActiveTab] = useState('catalogo')
  const [showCheckout, setShowCheckout] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [procesandoPedido, setProcesandoPedido] = useState(false)

  // Datos simulados de pedidos
  const pedidosSimulados = [
    {
      _id: '1',
      numero: 'PED-001',
      fecha: '2024-01-15T10:00:00.000Z',
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
      items: [
        { producto: { nombre: 'Líquido de Frenos' }, cantidad: 3, precio: 1200 }
      ],
      total: 3600,
      estado: 'listo',
      notas: ''
    }
  ]

  // Cargar pedidos desde localStorage o usar datos simulados
  useEffect(() => {
    const pedidosGuardados = localStorage.getItem('pedidos')
    
    if (pedidosGuardados) {
      setPedidos(JSON.parse(pedidosGuardados))
    } else {
      // Primera vez: usar datos simulados
      setPedidos(pedidosSimulados)
      localStorage.setItem('pedidos', JSON.stringify(pedidosSimulados))
    }
  }, [])

  // Guardar pedidos en localStorage cuando cambien
  useEffect(() => {
    if (pedidos.length > 0) {
      localStorage.setItem('pedidos', JSON.stringify(pedidos))
    }
  }, [pedidos])

  useEffect(() => {
    console.log('🔍 PortalMayorista - Debug info:')
    console.log('👤 User:', user)
    console.log('🎭 User role:', user?.role)
    console.log('📧 User email:', user?.email)
    console.log('🆔 User UID:', user?.uid)
    console.log('📦 Productos:', productos?.length || 0)
    console.log('🔗 Current URL:', window.location.href)
    
    // Esperar a que el usuario esté completamente cargado
    if (user === null) {
      console.log('⏳ Esperando carga del usuario...')
      return
    }
    
    if (!user) {
      console.log('❌ No hay usuario, redirigiendo a login')
      navigate('/mayorista/login')
      return
    }
    
    if (user.role !== 'mayorista') {
      console.log('❌ Usuario no es mayorista, redirigiendo a login')
      console.log('❌ Rol actual:', user.role)
      console.log('❌ Email del usuario:', user.email)
      toast.error(`Acceso denegado. Rol actual: ${user.role}. Solo para mayoristas.`)
      navigate('/mayorista/login')
      return
    }
    
    console.log('✅ Usuario mayorista autenticado correctamente')
    console.log('✅ Rol verificado:', user.role)
    
    // Verificar y crear usuario mayorista en Firebase si es necesario
    const verifyMayorista = async () => {
      try {
        const mayoristaExists = await verifyMayoristaInFirebase()
        if (!mayoristaExists) {
          console.log('🔄 Usuario mayorista no encontrado en Firebase, creando...')
          const result = await checkAndCreateMayoristaUser()
          if (result.created) {
            toast.success('✅ Usuario mayorista configurado correctamente')
          }
        }
      } catch (error) {
        console.error('❌ Error verificando usuario mayorista:', error)
      }
    }
    
    verifyMayorista()
  }, [user, navigate])

  const handleForceUpdateRole = async () => {
    try {
      console.log('🔄 Forzando actualización del rol...')
      const newRole = await forceUpdateUserRole()
      console.log('🔄 Nuevo rol:', newRole)
      
      if (newRole === 'mayorista') {
        toast.success('✅ Rol actualizado correctamente')
        window.location.reload() // Recargar para aplicar cambios
      } else {
        toast.error(`❌ Rol no es mayorista: ${newRole}`)
      }
    } catch (error) {
      console.error('❌ Error actualizando rol:', error)
      toast.error('❌ Error actualizando rol')
    }
  }

  const agregarAlCarrito = (producto) => {
    // Verificar stock disponible
    if (producto.stock <= 0) {
      toast.error('Producto sin stock disponible')
      return
    }
    
    setCarrito(prev => {
      const itemExistente = prev.find(item => item._id === producto._id)
      if (itemExistente) {
        // Verificar que no exceda el stock
        if (itemExistente.cantidad + 1 > producto.stock) {
          toast.error(`Solo quedan ${producto.stock} unidades disponibles`)
          return prev
        }
        return prev.map(item =>
          item._id === producto._id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      } else {
        return [...prev, { ...producto, cantidad: 1 }]
      }
    })
    toast.success(`${producto.nombre} agregado al carrito`)
  }

  const removerDelCarrito = (productoId) => {
    setCarrito(prev => prev.filter(item => item._id !== productoId))
    toast.success('Producto removido del carrito')
  }

  const actualizarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      removerDelCarrito(productoId)
      return
    }
    
    // Verificar stock disponible
    const producto = productos.find(p => p._id === productoId)
    if (producto && cantidad > producto.stock) {
      toast.error(`Solo quedan ${producto.stock} unidades disponibles`)
      return
    }
    
    setCarrito(prev =>
      prev.map(item =>
        item._id === productoId ? { ...item, cantidad } : item
      )
    )
  }

  const limpiarCarrito = () => {
    setCarrito([])
  }

  const getTotalCarrito = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0)
  }

  const getCantidadCarrito = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0)
  }

  const handleCheckout = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío')
      return
    }
    setShowCheckout(true)
  }

  // Función para actualizar stock en Firebase
  const actualizarStockProductos = async (items) => {
    try {
      console.log('📦 Actualizando stock de productos...')
      
      for (const item of items) {
        const producto = productos.find(p => p._id === item._id)
        if (producto) {
          const nuevoStock = producto.stock - item.cantidad
          if (nuevoStock < 0) {
            throw new Error(`Stock insuficiente para ${producto.nombre}`)
          }
          
          // Actualizar en Firebase
          await update(ref(database, `productos/${producto._id}`), {
            stock: nuevoStock
          })
          
          console.log(`✅ Stock actualizado para ${producto.nombre}: ${producto.stock} → ${nuevoStock}`)
        }
      }
      
      return true
    } catch (error) {
      console.error('❌ Error actualizando stock:', error)
      throw error
    }
  }

  // Función para crear pedido en Firebase
  const crearPedidoEnFirebase = async (pedidoData) => {
    try {
      console.log('📋 Creando pedido en Firebase...')
      
      // Crear referencia para el nuevo pedido
      const pedidosRef = ref(database, 'pedidos')
      const nuevoPedidoRef = push(pedidosRef)
      
      // Agregar ID del pedido y datos del mayorista
      const pedidoCompleto = {
        ...pedidoData,
        _id: nuevoPedidoRef.key,
        mayorista: {
          uid: user.uid,
          email: user.email,
          nombre: user.displayName || 'Mayorista'
        },
        createdAt: new Date().toISOString()
      }
      
      // Guardar en Firebase
      await set(nuevoPedidoRef, pedidoCompleto)
      
      console.log('✅ Pedido creado en Firebase:', nuevoPedidoRef.key)
      return nuevoPedidoRef.key
    } catch (error) {
      console.error('❌ Error creando pedido en Firebase:', error)
      throw error
    }
  }

  const handleConfirmarPedido = async (e) => {
    e.preventDefault()
    setProcesandoPedido(true)
    
    try {
      const formData = new FormData(e.target)
      
      console.log('🔄 Procesando pedido...')
      
      // 1. Verificar stock disponible
      for (const item of carrito) {
        const producto = productos.find(p => p._id === item._id)
        if (!producto) {
          throw new Error(`Producto ${item.nombre} no encontrado`)
        }
        if (producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`)
        }
      }
      
      // 2. Crear datos del pedido
      const pedidoData = {
        numero: `PED-${String(Date.now()).slice(-6)}`,
        fecha: new Date().toISOString(),
        items: carrito.map(item => ({
          producto: { 
            _id: item._id,
            nombre: item.nombre,
            codigo: item.codigo || ''
          },
          cantidad: item.cantidad,
          precio: item.precio,
          subtotal: item.precio * item.cantidad
        })),
        total: getTotalCarrito(),
        notas: formData.get('notas') || '',
        estado: 'pendiente'
      }
      
      // 3. Crear pedido en Firebase
      const pedidoId = await crearPedidoEnFirebase(pedidoData)
      
      // 4. Actualizar stock de productos
      await actualizarStockProductos(carrito)
      
      // 5. Actualizar estado local
      const nuevoPedido = {
        ...pedidoData,
        _id: pedidoId
      }
      
      setPedidos(prev => [nuevoPedido, ...prev])
      
      // 6. Limpiar carrito y cerrar modal
      limpiarCarrito()
      setShowCheckout(false)
      
      toast.success('¡Pedido realizado con éxito!')
      console.log('✅ Pedido procesado completamente')
      
    } catch (error) {
      console.error('❌ Error procesando pedido:', error)
      toast.error(`Error al realizar el pedido: ${error.message}`)
    } finally {
      setProcesandoPedido(false)
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'en_preparacion':
        return 'bg-blue-100 text-blue-800'
      case 'listo':
        return 'bg-green-100 text-green-800'
      case 'entregado':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente'
      case 'en_preparacion':
        return 'En Preparación'
      case 'listo':
        return 'Listo para Retirar'
      case 'entregado':
        return 'Entregado'
      default:
        return estado
    }
  }

  // Si el usuario está cargando, mostrar loading
  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, redirigir
  if (!user) {
    console.log('🚫 No hay usuario, redirigiendo...')
    navigate('/mayorista/login')
    return null
  }

  // Si el usuario no es mayorista, mostrar error
  if (user.role !== 'mayorista') {
    console.log('🚫 Usuario no es mayorista - Usuario:', user?.email, 'Rol:', user?.role)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-yellow-50 p-4 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Debug:</strong> Usuario: {user?.email} | Rol: {user?.role}
            </p>
            <button
              onClick={handleForceUpdateRole}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              🔄 Forzar actualización de rol
            </button>
          </div>
        </div>
      </div>
    )
  }

  console.log('✅ Mostrando portal mayorista para:', user.email)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <DebugAuth />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Portal Mayorista
        </h1>
        <p className="text-gray-600">
          Bienvenido, {user.displayName || user.email}. Aquí podés realizar tus pedidos y ver el historial.
        </p>
        
        {/* Botón de debug */}
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700"
        >
          {debugMode ? '🔽 Ocultar debug' : '🔼 Mostrar debug'}
        </button>
        
        {debugMode && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Debug Info:</h3>
            <div className="text-xs space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>UID:</strong> {user.uid}</p>
              <p><strong>Rol:</strong> {user.role}</p>
              <p><strong>Productos:</strong> {productos?.length || 0}</p>
            </div>
            <button
              onClick={handleForceUpdateRole}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
            >
              🔄 Actualizar rol
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'catalogo'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Catálogo
          </button>
          <button
            onClick={() => setActiveTab('carrito')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'carrito'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Carrito ({getCantidadCarrito()})
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'historial'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historial de Pedidos
          </button>
        </nav>
      </div>

      {/* Catálogo */}
      {activeTab === 'catalogo' && (
        <div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando productos...</p>
              </div>
            ) : productos && productos.length > 0 ? (
              productos.map((producto) => (
                <div key={producto._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
                    <div className="flex items-center justify-center h-48 bg-gray-100">
                      <span className="text-gray-400 text-4xl">📦</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{producto.nombre}</h3>
                  <p className="text-gray-600 text-sm mb-2">{producto.descripcion}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-green-600">
                      ${producto.precio}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {producto.stock}
                    </span>
                  </div>
                  <button
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={producto.stock <= 0}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      producto.stock > 0
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin productos</h3>
                <p className="text-gray-600">No hay productos disponibles en el catálogo</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Carrito */}
      {activeTab === 'carrito' && (
        <div>
          {carrito.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Carrito vacío</h3>
              <p className="text-gray-600 mb-6">Agregá productos desde el catálogo</p>
              <button
                onClick={() => setActiveTab('catalogo')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Ver catálogo
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {carrito.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.nombre}</h3>
                      <p className="text-gray-600 text-sm">{item.descripcion}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => actualizarCantidad(item._id, item.cantidad - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidad(item._id, item.cantidad + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${item.precio * item.cantidad}</div>
                        <div className="text-sm text-gray-500">${item.precio} c/u</div>
                      </div>
                      <button
                        onClick={() => removerDelCarrito(item._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${getTotalCarrito()}
                  </span>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={limpiarCarrito}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Limpiar carrito
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex-1"
                  >
                    Finalizar pedido
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      {activeTab === 'historial' && (
        <div>
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div key={pedido._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Pedido #{pedido.numero}</h3>
                    <p className="text-gray-600">
                      {new Date(pedido.fecha).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(pedido.estado)}`}>
                    {getEstadoText(pedido.estado)}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {pedido.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.producto.nombre} x{item.cantidad}</span>
                      <span>${item.precio * item.cantidad}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">${pedido.total}</span>
                  </div>
                  {pedido.notas && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Notas:</strong> {pedido.notas}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {pedidos.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin pedidos</h3>
                <p className="text-gray-600">Aún no tenés pedidos realizados</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Finalizar Pedido</h2>
            <form onSubmit={handleConfirmarPedido} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  name="notas"
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Especificaciones especiales, horarios de entrega, etc."
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Resumen del pedido:</h3>
                <div className="space-y-1 text-sm">
                  {carrito.map((item) => (
                    <div key={item._id} className="flex justify-between">
                      <span>{item.nombre} x{item.cantidad}</span>
                      <span>${item.precio * item.cantidad}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${getTotalCarrito()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors" disabled={procesandoPedido}>
                  {procesandoPedido ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortalMayorista 