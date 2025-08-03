import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { productosService } from '../services/firebaseService'

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

  // Cargar productos desde Firebase
  useEffect(() => {
    const loadProductos = async () => {
      setLoading(true)
      try {
        console.log('🔥 Firebase: Cargando productos...')
        const productosData = await productosService.getProductos()
        console.log('🔥 Firebase: Productos cargados:', productosData.length)
        setProductos(productosData)
      } catch (error) {
        console.error('🔥 Firebase: Error cargando productos:', error)
        toast.error('Error conectando con la base de datos')
      } finally {
        setLoading(false)
      }
    }

    loadProductos()
  }, [])

  // Escuchar cambios en tiempo real
  useEffect(() => {
    console.log('🔥 Firebase: Configurando listener para productos...')
    
    const unsubscribeProductos = productosService.onProductosChange((productosData) => {
      console.log('🔥 Firebase: Productos actualizados en tiempo real:', productosData.length)
      setProductos(productosData)
    })

    return () => {
      console.log('🔥 Firebase: Limpiando listener de productos...')
      unsubscribeProductos()
    }
  }, [])

  const agregarProducto = async (producto) => {
    try {
      console.log('🔥 Firebase: Agregando producto:', producto)
      const nuevoProducto = await productosService.createProducto(producto)
      console.log('🔥 Firebase: Producto agregado exitosamente:', nuevoProducto.id)
      toast.success('Producto agregado correctamente')
      return { success: true, producto: nuevoProducto }
    } catch (error) {
      console.error('🔥 Firebase: Error agregando producto:', error)
      toast.error('Error al agregar producto')
      return { success: false, error: error.message }
    }
  }

  const actualizarProducto = async (id, producto) => {
    try {
      console.log('🔥 Firebase: Actualizando producto:', id, producto)
      await productosService.updateProducto(id, producto)
      console.log('🔥 Firebase: Producto actualizado exitosamente')
      toast.success('Producto actualizado correctamente')
      return { success: true }
    } catch (error) {
      console.error('🔥 Firebase: Error actualizando producto:', error)
      toast.error('Error al actualizar producto')
      return { success: false, error: error.message }
    }
  }

  const eliminarProducto = async (id) => {
    try {
      console.log('🔥 Firebase: Eliminando producto:', id)
      await productosService.deleteProducto(id)
      console.log('🔥 Firebase: Producto eliminado exitosamente')
      toast.success('Producto eliminado correctamente')
      return { success: true }
    } catch (error) {
      console.error('🔥 Firebase: Error eliminando producto:', error)
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