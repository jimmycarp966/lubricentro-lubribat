import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import Button from './ui/Button'
import Badge from './ui/Badge'
import logo from '../assets/logo.png'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg border-b-2 border-green-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Icon icon={isMenuOpen ? "mdi:close" : "mdi:menu"} className="w-6 h-6 text-gray-700" />
          </button>
          
          {/* Logo y nombre */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-all duration-300 transform hover:scale-105 group">
            <div className="relative">
              <img src={logo} alt="LUBRI-BAT" className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 group-hover:animate-bounce-gentle" />
              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 lg:-top-1 lg:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse-slow"></div>
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient">LUBRI-BAT</span>
          </Link>

          {/* Enlaces de navegación desktop */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group text-sm lg:text-base"
            >
              Inicio
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/turnos"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group text-sm lg:text-base"
            >
              Turnos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/sobre-nosotros"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group text-sm lg:text-base"
            >
              Sobre Nosotros
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/resenas"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group text-sm lg:text-base"
            >
              Reseñas
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/contacto"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group text-sm lg:text-base"
            >
              Contáctanos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {user && (user.role === 'admin' || user.role === 'employee') && (
              <Link
                to="/buscar-cliente"
                className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group text-sm lg:text-base"
              >
                Buscar Cliente
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
          </div>

          {/* Login/Logout */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
                <div className="hidden sm:flex items-center space-x-2 sm:space-x-3 bg-green-50 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl border border-green-200 shadow-sm">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Icon icon="mdi:account" className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-800 font-semibold hidden lg:block">
                    Hola, {user.displayName || user.email}
                  </span>
                </div>
                    
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:block"
                    >
                      Admin
                    </Button>
                  </Link>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-xs sm:text-sm"
                >
                  Cerrar
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* Enlaces móviles */}
              <div className="space-y-3">
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-green-600 font-medium transition-colors py-2 px-3 rounded-lg hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  to="/turnos"
                  className="block text-gray-700 hover:text-green-600 font-medium transition-colors py-2 px-3 rounded-lg hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Turnos
                </Link>
                <Link
                  to="/sobre-nosotros"
                  className="block text-gray-700 hover:text-green-600 font-medium transition-colors py-2 px-3 rounded-lg hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sobre Nosotros
                </Link>
                <Link
                  to="/resenas"
                  className="block text-gray-700 hover:text-green-600 font-medium transition-colors py-2 px-3 rounded-lg hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Reseñas
                </Link>
                <Link
                  to="/contacto"
                  className="block text-gray-700 hover:text-green-600 font-medium transition-colors py-2 px-3 rounded-lg hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contáctanos
                </Link>
                {user && (user.role === 'admin' || user.role === 'employee') && (
                  <Link
                    to="/buscar-cliente"
                    className="block text-gray-700 hover:text-green-600 font-medium transition-colors py-2 px-3 rounded-lg hover:bg-green-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Buscar Cliente
                  </Link>
                )}
              </div>

              {/* Usuario móvil */}
              {user ? (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center space-x-3 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Icon icon="mdi:account" className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm text-gray-800 font-semibold">
                      Hola, {user.displayName || user.email}
                    </span>
                  </div>
                  
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                      >
                        Panel Admin
                      </Button>
                    </Link>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    fullWidth
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar 