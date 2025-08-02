import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import logo from '../assets/logo.png'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-gray-100 shadow-xl border-b-2 border-green-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Logo y nombre */}
          <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-all duration-300 transform hover:scale-105">
            <img src={logo} alt="LUBRI-BAT" className="h-12 w-12" />
            <span className="text-2xl font-bold text-green-600">LUBRI-BAT</span>
          </Link>

          {/* Enlaces de navegación */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/turnos"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Turnos
            </Link>
            <Link
              to="/sobre-nosotros"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Sobre Nosotros
            </Link>
            <Link
              to="/resenas"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Reseñas
            </Link>
                         <Link
               to="/contacto"
               className="text-gray-700 hover:text-green-600 font-medium transition-colors"
             >
               Contáctanos
             </Link>
             {user && (user.role === 'admin' || user.role === 'employee') && (
               <Link
                 to="/buscar-cliente"
                 className="text-gray-700 hover:text-green-600 font-medium transition-colors"
               >
                 Buscar Cliente
               </Link>
             )}
          </div>

                    {/* Login/Logout */}
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-6">
                <span className="text-sm text-gray-600 font-medium bg-white px-4 py-2 rounded-lg shadow-sm">
                  Hola, {user.nombre}
                </span>
                {user.role === 'admin' && (
                  <Link
                    to="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-sm hover:shadow-md"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link
                to="/mayorista/login"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4 px-6">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg"
              >
                Inicio
              </Link>
              <Link
                to="/turnos"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg"
              >
                Turnos
              </Link>
              <Link
                to="/sobre-nosotros"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg"
              >
                Sobre Nosotros
              </Link>
              <Link
                to="/resenas"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg"
              >
                Reseñas
              </Link>
              <Link
                to="/contacto"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg"
              >
                Contáctanos
              </Link>
              {user && (user.role === 'admin' || user.role === 'employee') && (
                <Link
                  to="/buscar-cliente"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors py-3 text-lg"
                >
                  Buscar Cliente
                </Link>
              )}
              
              {/* Login/Logout en móvil */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 font-medium bg-gray-100 px-4 py-3 rounded-lg">
                      Hola, {user.nombre}
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold text-center"
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/mayorista/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors font-semibold text-center"
                  >
                    Iniciar Sesión
                  </Link>
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