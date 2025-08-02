import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const ProductosContext = createContext()

export const useProductos = () => {
  const context = useContext(ProductosContext)
  if (!context) {
    throw new Error('useProductos debe ser usado dentro de un ProductosProvider')
  }
  return context
}

export const ProductosProvider = ({ children }) => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)

  // Datos simulados de productos
  const productosSimulados = [
    {
      _id: '1',
      nombre: 'Aceite de Motor 5W-30',
      descripcion: 'Aceite sintético de alta calidad',
      precio: 2500,
      stock: 50,
      categoria: 'Aceites',
      marca: 'Shell'
    },
    {
      _id: '2',
      nombre: 'Filtro de Aceite',
      descripcion: 'Filtro de aceite universal',
      precio: 800,
      stock: 100,
      categoria: 'Filtros',
      marca: 'Fram'
    },
    {
      _id: '3',
      nombre: 'Líquido de Frenos',
      descripcion: 'Líquido de frenos DOT 4',
      precio: 1200,
      stock: 30,
      categoria: 'Líquidos',
      marca: 'Castrol'
    }
  ]

  // Cargar productos desde localStorage o usar datos simulados
  useEffect(() => {
    setLoading(true)
    const productosGuardados = localStorage.getItem('productos')
    
    if (productosGuardados) {
      setProductos(JSON.parse(productosGuardados))
    } else {
      // Primera vez: usar datos simulados
      setProductos(productosSimulados)
      localStorage.setItem('productos', JSON.stringify(productosSimulados))
    }
    
    setLoading(false)
  }, [])

  // Guardar productos en localStorage cuando cambien
  useEffect(() => {
    if (productos.length > 0) {
      localStorage.setItem('productos', JSON.stringify(productos))
    }
  }, [productos])

  const agregarProducto = async (producto) => {
    try {
      const nuevoProducto = {
        _id: Date.now().toString(),
        ...producto,
        createdAt: new Date().toISOString()
      }
      setProductos(prev => [...prev, nuevoProducto])
      toast.success('Producto agregado correctamente')
      return { success: true }
    } catch (error) {
      toast.error('Error al agregar producto')
      return { success: false, error: error.message }
    }
  }

  const actualizarProducto = async (id, producto) => {
    try {
      setProductos(prev => prev.map(p => p._id === id ? { ...p, ...producto } : p))
      toast.success('Producto actualizado correctamente')
      return { success: true }
    } catch (error) {
      toast.error('Error al actualizar producto')
      return { success: false, error: error.message }
    }
  }

  const eliminarProducto = async (id) => {
    try {
      setProductos(prev => prev.filter(p => p._id !== id))
      toast.success('Producto eliminado correctamente')
      return { success: true }
    } catch (error) {
      toast.error('Error al eliminar producto')
      return { success: false, error: error.message }
    }
  }

  const value = {
    productos,
    loading,
    agregarProducto,
    actualizarProducto,
    eliminarProducto
  }

  return (
    <ProductosContext.Provider value={value}>
      {children}
    </ProductosContext.Provider>
  )
} 