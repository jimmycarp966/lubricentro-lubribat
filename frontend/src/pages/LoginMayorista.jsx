import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'
import { initializeTestData, checkMayoristaExists, verifyAndFixMayoristaRole } from '../utils/createAdminUser'

const LoginMayorista = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await login(email, password)
      
      if (result.success) {
        toast.success('¡Bienvenido!')
        // Redirigir según el rol
        if (result.user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/mayorista/portal')
        }
      } else {
        toast.error(result.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      console.error('Error en login:', error)
      toast.error('Error de conexión. Verificá tu conexión a internet.')
    }
    
    setLoading(false)
  }

  const handleInitializeTestData = async () => {
    setInitializing(true)
    try {
      console.log('🔍 Verificando si el usuario mayorista existe...')
      const checkResult = await checkMayoristaExists()
      
      if (checkResult.exists) {
        console.log('✅ Usuario mayorista ya existe')
        toast.success('✅ Usuario mayorista ya está creado')
        
        // Verificar y corregir el rol
        console.log('🔧 Verificando rol de mayorista...')
        const roleResult = await verifyAndFixMayoristaRole()
        if (roleResult.success) {
          toast.success('✅ Rol de mayorista verificado y corregido')
        } else {
          toast.error('⚠️ Error verificando rol: ' + roleResult.error)
        }
        
        // Pre-llenar credenciales
        setEmail('mayorista@test.com')
        setPassword('mayorista123')
      } else {
        console.log('🔄 Creando datos de prueba...')
        const result = await initializeTestData()
        if (result.success) {
          toast.success('✅ Datos de prueba creados exitosamente')
          setEmail('mayorista@test.com')
          setPassword('mayorista123')
        } else {
          toast.error('❌ Error creando datos de prueba: ' + (result.error || 'Error desconocido'))
        }
      }
    } catch (error) {
      console.error('Error inicializando datos:', error)
      toast.error('❌ Error: ' + error.message)
    }
    setInitializing(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img className="mx-auto h-12 w-auto" src={logo} alt="Logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Portal Mayorista
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acceso exclusivo para mayoristas
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <div className="text-center space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">
              Credenciales de prueba:
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Admin:</strong> admin@lubricentro.com / admin123</p>
              <p><strong>Mayorista:</strong> mayorista@test.com / mayorista123</p>
            </div>
          </div>
          
          <button
            onClick={handleInitializeTestData}
            disabled={initializing}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {initializing ? 'Verificando/Creando datos...' : '🔄 Verificar/Crear datos de prueba'}
          </button>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>💡 Consejo:</strong> Si tenés problemas para iniciar sesión, hacé clic en el botón de arriba para verificar que los usuarios estén creados correctamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginMayorista 