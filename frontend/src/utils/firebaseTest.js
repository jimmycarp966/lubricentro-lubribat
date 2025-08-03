import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { ref, get, set } from 'firebase/database'

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBHW56sDJ5VmXh3S0NM439zUWPpLJFFVA",
  authDomain: "lubricentro-app.firebaseapp.com",
  databaseURL: "https://lubricentro-app-default-rtdb.firebaseio.com",
  projectId: "lubricentro-app",
  storageBucket: "lubricentro-app.firebasestorage.app",
  messagingSenderId: "641217777553",
  appId: "1:641217777553:web:611859db45b98e0cb6d430",
  measurementId: "G-RYL0Y9ZC61"
}

// Función para probar la configuración de Firebase
export const testFirebaseConfig = () => {
  try {
    console.log('🔍 Probando configuración de Firebase...')
    
    // Verificar que la configuración existe
    if (!firebaseConfig) {
      throw new Error('Configuración de Firebase no encontrada')
    }
    
    console.log('✅ Configuración encontrada:', firebaseConfig)
    
    // Intentar inicializar la app
    const app = initializeApp(firebaseConfig)
    console.log('✅ Firebase App inicializada:', app)
    
    // Intentar obtener Auth
    const auth = getAuth(app)
    console.log('✅ Firebase Auth inicializado:', auth)
    
    // Intentar obtener Database
    const database = getDatabase(app)
    console.log('✅ Firebase Database inicializado:', database)
    
    return {
      success: true,
      app,
      auth,
      database
    }
  } catch (error) {
    console.error('❌ Error en configuración de Firebase:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Función para verificar el estado de autenticación
export const testAuthState = async () => {
  try {
    const { auth } = testFirebaseConfig()
    if (!auth) {
      throw new Error('Auth no disponible')
    }
    
    console.log('🔍 Verificando estado de autenticación...')
    console.log('Usuario actual:', auth.currentUser)
    
    return {
      success: true,
      currentUser: auth.currentUser
    }
  } catch (error) {
    console.error('❌ Error verificando autenticación:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Función para probar acceso a productos
export const testProductosAccess = async () => {
  try {
    console.log('🔍 Probando acceso a productos...')
    
    const { database } = testFirebaseConfig()
    if (!database) {
      throw new Error('Database no disponible')
    }
    
    // Intentar leer productos
    const productosRef = ref(database, 'productos')
    console.log('📖 Intentando leer productos...')
    
    const snapshot = await get(productosRef)
    console.log('✅ Productos leídos exitosamente:', snapshot.val())
    
    // Intentar escribir un producto de prueba
    console.log('📝 Intentando escribir producto de prueba...')
    const testProductoRef = ref(database, 'productos/test-producto')
    await set(testProductoRef, {
      nombre: 'Producto de Prueba',
      precio: 100,
      stock: 10,
      timestamp: Date.now()
    })
    console.log('✅ Producto de prueba escrito exitosamente')
    
    // Limpiar producto de prueba
    await set(testProductoRef, null)
    console.log('✅ Producto de prueba eliminado')
    
    return {
      success: true,
      message: 'Acceso a productos funcionando correctamente'
    }
  } catch (error) {
    console.error('❌ Error accediendo a productos:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Función para probar acceso a turnos
export const testTurnosAccess = async () => {
  try {
    console.log('🔍 Probando acceso a turnos...')
    
    const { database } = testFirebaseConfig()
    if (!database) {
      throw new Error('Database no disponible')
    }
    
    // Intentar leer turnos
    const turnosRef = ref(database, 'turnos')
    console.log('📖 Intentando leer turnos...')
    
    const snapshot = await get(turnosRef)
    console.log('✅ Turnos leídos exitosamente:', snapshot.val())
    
    return {
      success: true,
      message: 'Acceso a turnos funcionando correctamente'
    }
  } catch (error) {
    console.error('❌ Error accediendo a turnos:', error)
    return {
      success: false,
      error: error.message
    }
  }
} 