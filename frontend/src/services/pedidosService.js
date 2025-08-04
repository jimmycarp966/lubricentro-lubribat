import { ref, get, push, set, update, remove, query, orderByChild, equalTo } from 'firebase/database'
import { database } from '../firebase/config'

// Obtener todos los pedidos
export const getPedidos = async () => {
  try {
    console.log('📋 Obteniendo pedidos desde Firebase...')
    const pedidosRef = ref(database, 'pedidos')
    const snapshot = await get(pedidosRef)
    
    if (snapshot.exists()) {
      const pedidos = []
      snapshot.forEach((childSnapshot) => {
        pedidos.push({
          _id: childSnapshot.key,
          ...childSnapshot.val()
        })
      })
      
      // Ordenar por fecha de creación (más recientes primero)
      pedidos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      console.log(`✅ ${pedidos.length} pedidos obtenidos`)
      return pedidos
    } else {
      console.log('📋 No hay pedidos en Firebase')
      return []
    }
  } catch (error) {
    console.error('❌ Error obteniendo pedidos:', error)
    throw error
  }
}

// Obtener pedidos por mayorista
export const getPedidosByMayorista = async (mayoristaUid) => {
  try {
    console.log(`📋 Obteniendo pedidos del mayorista: ${mayoristaUid}`)
    const pedidosRef = ref(database, 'pedidos')
    const mayoristaQuery = query(pedidosRef, orderByChild('mayorista/uid'), equalTo(mayoristaUid))
    const snapshot = await get(mayoristaQuery)
    
    if (snapshot.exists()) {
      const pedidos = []
      snapshot.forEach((childSnapshot) => {
        pedidos.push({
          _id: childSnapshot.key,
          ...childSnapshot.val()
        })
      })
      
      // Ordenar por fecha de creación (más recientes primero)
      pedidos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      console.log(`✅ ${pedidos.length} pedidos obtenidos para el mayorista`)
      return pedidos
    } else {
      console.log('📋 No hay pedidos para este mayorista')
      return []
    }
  } catch (error) {
    console.error('❌ Error obteniendo pedidos del mayorista:', error)
    throw error
  }
}

// Crear nuevo pedido
export const crearPedido = async (pedidoData) => {
  try {
    console.log('📋 Creando nuevo pedido...')
    const pedidosRef = ref(database, 'pedidos')
    const nuevoPedidoRef = push(pedidosRef)
    
    const pedidoCompleto = {
      ...pedidoData,
      _id: nuevoPedidoRef.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await set(nuevoPedidoRef, pedidoCompleto)
    
    console.log('✅ Pedido creado exitosamente:', nuevoPedidoRef.key)
    return nuevoPedidoRef.key
  } catch (error) {
    console.error('❌ Error creando pedido:', error)
    throw error
  }
}

// Actualizar estado de pedido
export const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
  try {
    console.log(`📋 Actualizando estado del pedido ${pedidoId} a: ${nuevoEstado}`)
    const pedidoRef = ref(database, `pedidos/${pedidoId}`)
    
    await update(pedidoRef, {
      estado: nuevoEstado,
      updatedAt: new Date().toISOString()
    })
    
    console.log('✅ Estado del pedido actualizado correctamente')
    return true
  } catch (error) {
    console.error('❌ Error actualizando estado del pedido:', error)
    throw error
  }
}

// Actualizar pedido completo
export const actualizarPedido = async (pedidoId, pedidoData) => {
  try {
    console.log(`📋 Actualizando pedido: ${pedidoId}`)
    const pedidoRef = ref(database, `pedidos/${pedidoId}`)
    
    await update(pedidoRef, {
      ...pedidoData,
      updatedAt: new Date().toISOString()
    })
    
    console.log('✅ Pedido actualizado correctamente')
    return true
  } catch (error) {
    console.error('❌ Error actualizando pedido:', error)
    throw error
  }
}

// Eliminar pedido
export const eliminarPedido = async (pedidoId) => {
  try {
    console.log(`📋 Eliminando pedido: ${pedidoId}`)
    const pedidoRef = ref(database, `pedidos/${pedidoId}`)
    
    await remove(pedidoRef)
    
    console.log('✅ Pedido eliminado correctamente')
    return true
  } catch (error) {
    console.error('❌ Error eliminando pedido:', error)
    throw error
  }
}

// Obtener pedido por ID
export const getPedidoById = async (pedidoId) => {
  try {
    console.log(`📋 Obteniendo pedido: ${pedidoId}`)
    const pedidoRef = ref(database, `pedidos/${pedidoId}`)
    const snapshot = await get(pedidoRef)
    
    if (snapshot.exists()) {
      const pedido = {
        _id: snapshot.key,
        ...snapshot.val()
      }
      console.log('✅ Pedido obtenido:', pedido)
      return pedido
    } else {
      console.log('❌ Pedido no encontrado')
      return null
    }
  } catch (error) {
    console.error('❌ Error obteniendo pedido:', error)
    throw error
  }
}

// Obtener estadísticas de pedidos
export const getPedidosStats = async () => {
  try {
    console.log('📊 Obteniendo estadísticas de pedidos...')
    const pedidos = await getPedidos()
    
    const stats = {
      total: pedidos.length,
      pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
      enPreparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
      listos: pedidos.filter(p => p.estado === 'listo').length,
      entregados: pedidos.filter(p => p.estado === 'entregado').length,
      totalValor: pedidos.reduce((sum, p) => sum + (p.total || 0), 0),
      promedioValor: pedidos.length > 0 ? pedidos.reduce((sum, p) => sum + (p.total || 0), 0) / pedidos.length : 0
    }
    
    console.log('✅ Estadísticas obtenidas:', stats)
    return stats
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error)
    throw error
  }
} 