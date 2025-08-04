import { ref, push, set, get, update, query, orderByChild } from 'firebase/database'
import { database } from '../firebase/config'

// Estados de reseñas
export const REVIEW_STATUS = {
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada'
}

// Crear una nueva reseña
export const createReview = async (reviewData) => {
  try {
    const reviewsRef = ref(database, 'reseñas')
    const newReviewRef = push(reviewsRef)
    
    const review = {
      id: newReviewRef.key,
      ...reviewData,
      status: REVIEW_STATUS.PENDIENTE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await set(newReviewRef, review)
    console.log('✅ Reseña creada:', review)
    return { success: true, reviewId: newReviewRef.key, review }
  } catch (error) {
    console.error('❌ Error creando reseña:', error)
    return { success: false, error: error.message }
  }
}

// Obtener todas las reseñas
export const getReviews = async () => {
  try {
    const reviewsRef = ref(database, 'reseñas')
    const snapshot = await get(reviewsRef)
    
    if (snapshot.exists()) {
      const reviews = []
      snapshot.forEach((childSnapshot) => {
        reviews.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        })
      })
      return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    return []
  } catch (error) {
    console.error('❌ Error obteniendo reseñas:', error)
    return []
  }
}

// Obtener reseñas aprobadas (para mostrar públicamente)
export const getApprovedReviews = async () => {
  try {
    const reviews = await getReviews()
    return reviews.filter(review => review.status === REVIEW_STATUS.APROBADA)
  } catch (error) {
    console.error('❌ Error obteniendo reseñas aprobadas:', error)
    return []
  }
}

// Obtener reseñas por cliente
export const getReviewsByClient = async (clientId) => {
  try {
    const reviewsRef = ref(database, 'reseñas')
    const snapshot = await get(reviewsRef)
    
    if (snapshot.exists()) {
      const reviews = []
      snapshot.forEach((childSnapshot) => {
        const review = childSnapshot.val()
        if (review.clientId === clientId) {
          reviews.push({
            id: childSnapshot.key,
            ...review
          })
        }
      })
      return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    return []
  } catch (error) {
    console.error('❌ Error obteniendo reseñas del cliente:', error)
    return []
  }
}

// Actualizar estado de reseña
export const updateReviewStatus = async (reviewId, status) => {
  try {
    const reviewRef = ref(database, `reseñas/${reviewId}`)
    await update(reviewRef, {
      status,
      updatedAt: new Date().toISOString()
    })
    
    console.log(`✅ Estado de reseña actualizado: ${reviewId} -> ${status}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Error actualizando estado de reseña:', error)
    return { success: false, error: error.message }
  }
}

// Eliminar reseña
export const deleteReview = async (reviewId) => {
  try {
    const reviewRef = ref(database, `reseñas/${reviewId}`)
    await set(reviewRef, null)
    
    console.log(`✅ Reseña eliminada: ${reviewId}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Error eliminando reseña:', error)
    return { success: false, error: error.message }
  }
}

// Obtener estadísticas de reseñas
export const getReviewStats = async () => {
  try {
    const reviews = await getReviews()
    
    const stats = {
      total: reviews.length,
      aprobadas: reviews.filter(r => r.status === REVIEW_STATUS.APROBADA).length,
      pendientes: reviews.filter(r => r.status === REVIEW_STATUS.PENDIENTE).length,
      rechazadas: reviews.filter(r => r.status === REVIEW_STATUS.RECHAZADA).length,
      promedioRating: 0,
      porRating: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    }
    
    // Calcular promedio de rating
    const approvedReviews = reviews.filter(r => r.status === REVIEW_STATUS.APROBADA)
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0)
      stats.promedioRating = (totalRating / approvedReviews.length).toFixed(1)
      
      // Contar por rating
      approvedReviews.forEach(review => {
        const rating = review.rating || 0
        if (stats.porRating[rating] !== undefined) {
          stats.porRating[rating]++
        }
      })
    }
    
    return stats
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de reseñas:', error)
    return {
      total: 0,
      aprobadas: 0,
      pendientes: 0,
      rechazadas: 0,
      promedioRating: 0,
      porRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  }
} 