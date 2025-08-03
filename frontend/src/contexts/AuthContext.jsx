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

  // Función para obtener el rol del usuario desde la base de datos
  const getUserRole = async (uid) => {
    try {
      const userRef = ref(database, `users/${uid}`)
      const snapshot = await get(userRef)
      
      if (snapshot.exists()) {
        const userData = snapshot.val()
        return userData.role || 'client'
      }
      
      return 'client' // Por defecto
    } catch (error) {
      console.error('Error obteniendo rol del usuario:', error)
      return 'client' // Por defecto
    }
  }

  // Login con email y contraseña
  const login = async (email, password) => {
    try {
      const result = await loginWithEmail(email, password)
      if (result.success) {
        const userRole = await getUserRole(result.user.uid)
        setUser({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: userRole
        })
        toast.success('¡Bienvenido!')
        return { success: true }
      } else {
        toast.error(result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      toast.error('Error al iniciar sesión')
      return { success: false, error: error.message }
    }
  }

  // Login con Google
  const loginWithGoogleService = async () => {
    try {
      const result = await loginWithGoogle()
      if (result.success) {
        const userRole = await getUserRole(result.user.uid)
        setUser({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: userRole
        })
        toast.success('¡Bienvenido con Google!')
        return { success: true }
      } else {
        toast.error(result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      toast.error('Error al iniciar sesión con Google')
      return { success: false, error: error.message }
    }
  }

  // Registro
  const register = async (email, password, displayName) => {
    try {
      const result = await registerWithEmail(email, password, displayName)
      if (result.success) {
        const userRole = await getUserRole(result.user.uid)
        setUser({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: userRole
        })
        toast.success('¡Cuenta creada exitosamente!')
        return { success: true }
      } else {
        toast.error(result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      toast.error('Error al crear cuenta')
      return { success: false, error: error.message }
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
      if (user) {
        const userRole = await getUserRole(user.uid)
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: userRole
        })
      } else {
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
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 