import { createContext, useContext, useState } from 'react'

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
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    // Simulación de login para pruebas
    if (email === 'admin@lubricentro.com' && password === 'admin123') {
      const mockUser = {
        id: 1,
        email: 'admin@lubricentro.com',
        nombre: 'Administrador',
        role: 'admin'
      }
      setUser(mockUser)
      return { success: true, user: mockUser }
    } else if (email === 'mayorista@test.com' && password === 'mayorista123') {
      const mockUser = {
        id: 2,
        email: 'mayorista@test.com',
        nombre: 'Mayorista',
        role: 'mayorista'
      }
      setUser(mockUser)
      return { success: true, user: mockUser }
    } else {
      return { 
        success: false, 
        error: 'Credenciales incorrectas' 
      }
    }
  }

  const logout = () => {
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 