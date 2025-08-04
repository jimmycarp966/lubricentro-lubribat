import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthChange, loginWithEmail, loginWithGoogle, logout as logoutService, registerWithEmail, resetPassword } from '../services/authService'
import { ref, get } from 'firebase/database'
import { database } from '../firebase/config'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  console.log('🔄 AuthProvider - Estado actual:', { user, loading })

  // Función para obtener el rol del usuario desde la base de datos
  const getUserRole = async (uid) => {
    try {
      console.log('🔍 Obteniendo rol para UID:', uid)
      const userRef = ref(database, `users/${uid}`)
      const snapshot = await get(userRef)
      
      if (snapshot.exists()) {
        const userData = snapshot.val()
        console.log('📋 Datos del usuario en DB:', userData)
        const role = userData.role || 'client'
        console.log('🎭 Rol obtenido:', role)
        return role
      }
      
      console.log('⚠️ Usuario no encontrado en DB, usando rol por defecto')
      return 'client' // Por defecto
    } catch (error) {
      console.error('❌ Error obteniendo rol del usuario:', error)
      return 'client' // Por defecto
    }
  }

  // Función para forzar actualización del rol
  const forceUpdateUserRole = async () => {
    if (!user) return
    
    try {
      console.log('🔄 Forzando actualización del rol...')
      const newRole = await getUserRole(user.uid)
      console.log('🔄 Nuevo rol obtenido:', newRole)
      
      setUser(prev => ({
        ...prev,
        role: newRole
      }))
      
      console.log('✅ Rol actualizado en el contexto')
      return newRole
    } catch (error) {
      console.error('❌ Error actualizando rol:', error)
      return null
    }
  }

  // Login con email y contraseña
  const login = async (email, password) => {
    try {
      const result = await loginWithEmail(email, password)
      if (result.success && result.user) {
        const userRole = await getUserRole(result.user.uid)
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: userRole
        }
        setUser(userData)
        toast.success('¡Bienvenido!')
        return { success: true, user: userData }
      } else {
        const errorMessage = result.error || 'Error al iniciar sesión'
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('❌ Error en login:', error)
      const errorMessage = error.message || 'Error al iniciar sesión'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Login con Google
  const loginWithGoogleService = async () => {
    try {
      const result = await loginWithGoogle()
      if (result.success && result.user) {
        const userRole = await getUserRole(result.user.uid)
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: userRole
        }
        setUser(userData)
        toast.success('¡Bienvenido con Google!')
        return { success: true, user: userData }
      } else {
        const errorMessage = result.error || 'Error al iniciar sesión con Google'
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('❌ Error en login con Google:', error)
      const errorMessage = error.message || 'Error al iniciar sesión con Google'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Registro
  const register = async (email, password, displayName) => {
    try {
      const result = await registerWithEmail(email, password, displayName)
      if (result.success && result.user) {
        const userRole = await getUserRole(result.user.uid)
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: userRole
        }
        setUser(userData)
        toast.success('¡Cuenta creada exitosamente!')
        return { success: true, user: userData }
      } else {
        const errorMessage = result.error || 'Error al crear cuenta'
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('❌ Error en registro:', error)
      const errorMessage = error.message || 'Error al crear cuenta'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Logout
  const logout = async () => {
    try {
      await logoutService()
      setUser(null)
      toast.success('Sesión cerrada')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  // Recuperar contraseña
  const resetPasswordService = async (email) => {
    try {
      const result = await resetPassword(email)
      if (result.success) {
        toast.success('Email de recuperación enviado')
        return { success: true }
      } else {
        toast.error(result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      toast.error('Error al enviar email de recuperación')
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthChange(async (user) => {
      console.log('🔄 Auth state changed:', user ? user.email : 'null')
      
      if (user) {
        try {
          const userRole = await getUserRole(user.uid)
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: userRole
          }
          console.log('✅ User data set:', userData)
          setUser(userData)
        } catch (error) {
          console.error('❌ Error setting user data:', error)
          setUser(null)
        }
      } else {
        console.log('❌ No user, setting to null')
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    login,
    loginWithGoogle: loginWithGoogleService,
    register,
    logout,
    resetPassword: resetPasswordService,
    loading,
    forceUpdateUserRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 