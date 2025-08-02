import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProductos } from '../contexts/ProductosContext'
import { useTurnos } from '../contexts/TurnosContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

const AdminPanel = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { productos, agregarProducto, actualizarProducto, eliminarProducto } = useProductos()
  const { turnos, cambiarEstado } = useTurnos()
  
  const [activeTab, setActiveTab] = useState('productos')
  const [mayoristas, setMayoristas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [showMayoristaForm, setShowMayoristaForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingMayorista, setEditingMayorista] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

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

  // Cargar mayoristas desde localStorage o usar datos simulados
  useEffect(() => {
    const mayoristasGuardados = localStorage.getItem('mayoristas')
    
    if (mayoristasGuardados) {
      setMayoristas(JSON.parse(mayoristasGuardados))
    } else {
      // Primera vez: usar datos simulados
      setMayoristas(mayoristasSimulados)
      localStorage.setItem('mayoristas', JSON.stringify(mayoristasSimulados))
    }
  }, [])

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

  // Guardar mayoristas en localStorage cuando cambien
  useEffect(() => {
    if (mayoristas.length > 0) {
      localStorage.setItem('mayoristas', JSON.stringify(mayoristas))
    }
  }, [mayoristas])

  // Guardar pedidos en localStorage cuando cambien
  useEffect(() => {
    if (pedidos.length > 0) {
      localStorage.setItem('pedidos', JSON.stringify(pedidos))
    }
  }, [pedidos])

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }
  }, [user, navigate])

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const productData = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      precio: parseFloat(formData.get('precio')),
      stock: parseInt(formData.get('stock')),
      categoria: formData.get('categoria') || 'General',
      marca: formData.get('marca') || 'Sin marca'
    }

    if (editingProduct) {
      await actualizarProducto(editingProduct._id, productData)
      setEditingProduct(null)
    } else {
      await agregarProducto(productData)
    }
    setShowProductForm(false)
  }

  const handleMayoristaSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const mayoristaData = {
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      direccion: formData.get('direccion'),
      tipoPrecio: formData.get('tipoPrecio')
    }

    try {
      if (editingMayorista) {
        setMayoristas(prev => prev.map(m => m._id === editingMayorista._id ? { ...m, ...mayoristaData } : m))
        toast.success('Mayorista actualizado correctamente')
      } else {
        const nuevoMayorista = {
          _id: Date.now().toString(),
          ...mayoristaData
        }
        setMayoristas(prev => [...prev, nuevoMayorista])
        toast.success('Mayorista creado correctamente')
      }
      setShowMayoristaForm(false)
      setEditingMayorista(null)
    } catch (error) {
      toast.error('Error al guardar mayorista')
    }
  }

  const handleUpdatePedidoEstado = async (pedidoId, nuevoEstado) => {
    try {
      setPedidos(prev => prev.map(p => p._id === pedidoId ? { ...p, estado: nuevoEstado } : p))
      toast.success('Estado del pedido actualizado')
    } catch (error) {
      toast.error('Error al actualizar estado')
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

  if (user?.role !== 'admin') {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-center mb-6">
          <img src={logo} alt="LUBRI-BAT" className="h-16 w-16 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600">
              Gestión completa del sistema LUBRI-BAT
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('productos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'productos'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab('turnos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'turnos'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Turnos
          </button>
          <button
            onClick={() => setActiveTab('mayoristas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mayoristas'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mayoristas
          </button>
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pedidos'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pedidos
          </button>
        </nav>
      </div>

      {/* Productos */}
      {activeTab === 'productos' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Gestión de Productos</h2>
            <button
              onClick={() => setShowProductForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Agregar Producto
            </button>
          </div>

          {/* Búsqueda y Filtros */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="todos">Todos los productos</option>
                <option value="aceites">Aceites</option>
                <option value="filtros">Filtros</option>
                <option value="liquidos">Líquidos</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos
              .filter(producto => {
                const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesFilter = filterStatus === 'todos' || 
                                    producto.categoria.toLowerCase().includes(filterStatus.toLowerCase())
                return matchesSearch && matchesFilter
              })
              .map((producto) => (
              <div key={producto._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                    <p className="text-gray-600 text-sm">{producto.descripcion}</p>
                    <p className="text-sm text-gray-500">Categoría: {producto.categoria}</p>
                    <p className="text-sm text-gray-500">Marca: {producto.marca}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${producto.precio}
                    </div>
                    <div className="text-sm text-gray-500">
                      Stock: {producto.stock}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingProduct(producto)
                      setShowProductForm(true)
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarProducto(producto._id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
                 </div>
       )}

       {/* Turnos */}
       {activeTab === 'turnos' && (
         <div>
           <h2 className="text-2xl font-bold mb-6">Gestión de Turnos</h2>
           <div className="space-y-4">
             {turnos.map((turno) => (
               <div key={turno._id} className="bg-white rounded-lg shadow-md p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="font-semibold text-lg">
                       Turno - {turno.cliente?.nombre || 'Cliente'}
                     </h3>
                     <p className="text-gray-600">
                       {new Date(turno.fecha).toLocaleDateString('es-AR')} a las {turno.horario}
                     </p>
                     <p className="text-gray-600">Servicio: {turno.servicio}</p>
                     {turno.vehiculo && (
                       <p className="text-gray-600">
                         Vehículo: {turno.vehiculo.patente} - {turno.vehiculo.modelo}
                       </p>
                     )}
                     {turno.cliente?.telefono && (
                       <p className="text-gray-600">Tel: {turno.cliente.telefono}</p>
                     )}
                   </div>
                   <div className="flex items-center space-x-4">
                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                       turno.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                       turno.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                       turno.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                       'bg-gray-100 text-gray-800'
                     }`}>
                       {turno.estado}
                     </span>
                     <select
                       value={turno.estado}
                       onChange={(e) => cambiarEstado(turno._id, e.target.value)}
                       className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                     >
                       <option value="pendiente">Pendiente</option>
                       <option value="confirmado">Confirmado</option>
                       <option value="cancelado">Cancelado</option>
                     </select>
                   </div>
                 </div>
                 
                 <div className="border-t pt-4">
                   <p className="text-sm text-gray-600">
                     <strong>Creado:</strong> {new Date(turno.createdAt).toLocaleString('es-AR')}
                   </p>
                 </div>
               </div>
             ))}
             {turnos.length === 0 && (
               <div className="text-center py-8">
                 <p className="text-gray-500">No hay turnos registrados</p>
               </div>
             )}
           </div>
         </div>
       )}

       {/* Mayoristas */}
      {activeTab === 'mayoristas' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Gestión de Mayoristas</h2>
            <button
              onClick={() => setShowMayoristaForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Agregar Mayorista
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mayoristas.map((mayorista) => (
              <div key={mayorista._id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-2">{mayorista.nombre}</h3>
                <p className="text-gray-600 text-sm mb-2">{mayorista.email}</p>
                <p className="text-gray-600 text-sm mb-2">{mayorista.telefono}</p>
                <p className="text-gray-600 text-sm mb-3">{mayorista.direccion}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-600">
                    {mayorista.tipoPrecio}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingMayorista(mayorista)
                        setShowMayoristaForm(true)
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos */}
      {activeTab === 'pedidos' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Gestión de Pedidos</h2>
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div key={pedido._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Pedido #{pedido.numero}</h3>
                    <p className="text-gray-600">
                      {new Date(pedido.fecha).toLocaleDateString('es-AR')} - {pedido.mayorista?.nombre}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                    <select
                      value={pedido.estado}
                      onChange={(e) => handleUpdatePedidoEstado(pedido._id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_preparacion">En Preparación</option>
                      <option value="listo">Listo para Retirar</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </div>
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
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  defaultValue={editingProduct?.nombre}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  defaultValue={editingProduct?.descripcion}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    name="precio"
                    defaultValue={editingProduct?.precio}
                    step="0.01"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={editingProduct?.stock}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    name="categoria"
                    defaultValue={editingProduct?.categoria}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    name="marca"
                    defaultValue={editingProduct?.marca}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false)
                    setEditingProduct(null)
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mayorista Form Modal */}
      {showMayoristaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              {editingMayorista ? 'Editar Mayorista' : 'Agregar Mayorista'}
            </h2>
            <form onSubmit={handleMayoristaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  defaultValue={editingMayorista?.nombre}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingMayorista?.email}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  defaultValue={editingMayorista?.telefono}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  defaultValue={editingMayorista?.direccion}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Precio
                </label>
                <select name="tipoPrecio" defaultValue={editingMayorista?.tipoPrecio} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="minorista">Minorista</option>
                  <option value="mayorista">Mayorista</option>
                  <option value="taller_amigo">Taller Amigo</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMayoristaForm(false)
                    setEditingMayorista(null)
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  {editingMayorista ? 'Actualizar' : 'Crear'}
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