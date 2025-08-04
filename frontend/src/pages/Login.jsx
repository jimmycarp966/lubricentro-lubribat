import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Icon } from '@iconify/react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { testFirebaseConfig, testAuthState, testProductosAccess, testTurnosAccess } from '../utils/firebaseTest'
import { createAdminUser, checkAdminUser } from '../utils/createAdminUser'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  
  const { login, loginWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await login(email, password)
    setLoading(false)
    
    if (result.success) {
      navigate('/')
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const result = await loginWithGoogle()
    setLoading(false)
    
    if (result.success) {
      navigate('/')
    }
  }

  const handleResetPassword = async () => {
    setResetLoading(true)
    const result = await resetPassword(resetEmail)
    setResetLoading(false)
    
    if (result.success) {
      setShowResetModal(false)
      setResetEmail('')
    }
  }

  // Función de diagnóstico temporal
  const handleDiagnostic = async () => {
    console.log('🔍 Iniciando diagnóstico completo de Firebase...')
    
    // Pruebas básicas
    testFirebaseConfig()
    testAuthState()
    
    // Pruebas específicas de acceso
    console.log('\n🔍 Probando acceso a datos...')
    await testProductosAccess()
    await testTurnosAccess()
  }

  // Función para crear usuario admin
  const handleCreateAdmin = async () => {
    console.log('🔧 Iniciando creación de usuario admin...')
    const result = await createAdminUser()
    
    if (result.success) {
      alert('✅ Usuario admin creado exitosamente!\n\n📧 Email: admin@lubribat.com\n🔑 Contraseña: admin123456')
    } else if (result.code === 'ALREADY_EXISTS') {
      alert('ℹ️ El usuario admin ya existe!\n\n📧 Email: admin@lubribat.com\n🔑 Contraseña: admin123456')
    } else {
      alert('❌ Error creando usuario admin: ' + result.error)
    }
  }

  // Función para verificar usuario admin
  const handleCheckAdmin = async () => {
    console.log('🔍 Verificando usuario admin...')
    const result = await checkAdminUser()
    
    if (result.exists) {
      alert('✅ Usuario admin existe!\n\n📧 Email: admin@lubribat.com\n🔑 Contraseña: admin123456')
    } else {
      alert('❌ Usuario admin no existe. Usa el botón "Crear Admin" para crearlo.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="animate-zoom-in">
          <Card.Body className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:account" className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-gray-600">
                Accede a tu cuenta de LUBRI-BAT
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                leftIcon={<Icon icon="mdi:email" className="w-5 h-5" />}
                required
              />

              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Icon icon="mdi:lock" className="w-5 h-5" />}
                required
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth
              >
                Iniciar Sesión
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              variant="outline"
              size="lg"
              onClick={handleGoogleLogin}
              loading={loading}
              fullWidth
            >
              Continuar con Google
            </Button>

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                  Regístrate aquí
                </Link>
              </p>
            </div>

            {/* Botones de diagnóstico y admin temporal */}
            <div className="text-center mt-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiagnostic}
                className="text-xs"
              >
                🔍 Diagnóstico Firebase
              </Button>
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckAdmin}
                  className="text-xs"
                >
                  👤 Verificar Admin
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreateAdmin}
                  className="text-xs"
                >
                  🔧 Crear Admin
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Recuperar Contraseña"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          
          <Input
            label="Email"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="tu@email.com"
            icon="mdi:email"
            required
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowResetModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleResetPassword}
              loading={resetLoading}
              className="flex-1"
              icon="mdi:send"
            >
              Enviar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Login 