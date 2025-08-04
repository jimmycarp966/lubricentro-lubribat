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
    <nav className="bg-white shadow-brand border-b-2 border-green-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-green-500"
            aria-label="Toggle menu"
          >
            <Icon icon="mdi:menu" className="w-6 h-6 text-gray-700" />
          </button>
          
          {/* Logo y nombre */}
          <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-all duration-300 transform hover:scale-105 group">
            <div className="relative">
              <img src={logo} alt="LUBRI-BAT" className="h-12 w-12 group-hover:animate-bounce-gentle" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse-slow"></div>
            </div>
            <span className="text-2xl font-bold text-gradient">LUBRI-BAT</span>
          </Link>

          {/* Enlaces de navegación */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group"
            >
              Inicio
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/turnos"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group"
            >
              Turnos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/sobre-nosotros"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group"
            >
              Sobre Nosotros
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/resenas"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group"
            >
              Reseñas
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/contacto"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group"
            >
              Contáctanos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {user && (user.role === 'admin' || user.role === 'employee') && (
              <Link
                to="/buscar-cliente"
                className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group"
              >
                Buscar Cliente
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
          </div>

          {/* Login/Logout */}
          <div className="flex items-center space-x-4">
                            {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon icon="mdi:account" className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        Hola, {user.displayName || user.email}
                      </span>
                    </div>
                    
                    {user.role === 'admin' && (
                      <Link to="/admin">
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          Panel Admin
                        </Button>
                      </Link>
                    )}
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={logout}
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link to="/login">
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button
                        variant="primary"
                        size="sm"
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
          <div className="md:hidden bg-white border-t border-gray-200 py-4 animate-slide-up">
            <div className="flex flex-col space-y-2 px-6">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg rounded-lg hover:bg-gray-50 px-3"
              >
                <Icon icon="mdi:home" className="w-5 h-5" />
                Inicio
              </Link>
              <Link
                to="/turnos"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg rounded-lg hover:bg-gray-50 px-3"
              >
                <Icon icon="mdi:calendar" className="w-5 h-5" />
                Turnos
              </Link>
              <Link
                to="/sobre-nosotros"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg rounded-lg hover:bg-gray-50 px-3"
              >
                <Icon icon="mdi:information" className="w-5 h-5" />
                Sobre Nosotros
              </Link>
              <Link
                to="/resenas"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg rounded-lg hover:bg-gray-50 px-3"
              >
                <Icon icon="mdi:star" className="w-5 h-5" />
                Reseñas
              </Link>
              <Link
                to="/contacto"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg rounded-lg hover:bg-gray-50 px-3"
              >
                <Icon icon="mdi:phone" className="w-5 h-5" />
                Contáctanos
              </Link>
              {user && (user.role === 'admin' || user.role === 'employee') && (
                <Link
                  to="/buscar-cliente"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg rounded-lg hover:bg-gray-50 px-3"
                >
                  <Icon icon="mdi:account-search" className="w-5 h-5" />
                  Buscar Cliente
                </Link>
              )}
              
              {/* Login/Logout en móvil */}
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon icon="mdi:account" className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        Hola, {user.nombre}
                      </span>
                    </div>
                    
                    {user.role === 'admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon="mdi:view-dashboard"
                        as={Link}
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full"
                      >
                        Panel Admin
                      </Button>
                    )}
                    
                    <Button
                      variant="danger"
                      size="sm"
                      icon="mdi:logout"
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full"
                    >
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    icon="mdi:login"
                    as={Link}
                    to="/mayorista/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full"
                  >
                    Iniciar Sesión
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar 