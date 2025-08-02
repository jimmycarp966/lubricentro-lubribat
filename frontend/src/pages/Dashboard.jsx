import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProductos } from '../contexts/ProductosContext'
import { useTurnos } from '../contexts/TurnosContext'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { productos } = useProductos()
  const { turnos } = useTurnos()
  
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalTurnos: 0,
    turnosHoy: 0,
    turnosPendientes: 0,
    turnosConfirmados: 0,
    ingresosEstimados: 0,
    productosPopulares: [],
    serviciosPopulares: []
  })

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }

    // Calcular estadísticas
    const calcularStats = () => {
      const hoy = new Date().toISOString().split('T')[0]
      
      const turnosHoy = turnos.filter(t => t.fecha === hoy).length
      const turnosPendientes = turnos.filter(t => t.estado === 'pendiente').length
      const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado').length
      
      // Simular ingresos (promedio $5000 por turno)
      const ingresosEstimados = turnosConfirmados * 5000
      
      // Productos más populares (simulado)
      const productosPopulares = productos.slice(0, 3).map(p => ({
        nombre: p.nombre,
        ventas: Math.floor(Math.random() * 50) + 10
      }))
      
      // Servicios más populares
      const servicios = ['Cambio de Aceite', 'Revisión General', 'Cambio de Filtros', 'Lubricación Completa']
      const serviciosPopulares = servicios.map(s => ({
        nombre: s,
        turnos: Math.floor(Math.random() * 20) + 5
      }))

      setStats({
        totalProductos: productos.length,
        totalTurnos: turnos.length,
        turnosHoy,
        turnosPendientes,
        turnosConfirmados,
        ingresosEstimados,
        productosPopulares,
        serviciosPopulares
      })
    }

    calcularStats()
  }, [user, navigate, productos, turnos])

  if (user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-green-500">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="LUBRI-BAT" className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Panel de control LUBRI-BAT</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Bienvenido, {user.nombre}</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString('es-AR')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Turnos Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.turnosHoy}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.turnosPendientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-gray-900">${stats.ingresosEstimados.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Productos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProductos}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Productos Populares */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Productos Más Vendidos</h3>
            <div className="space-y-4">
              {stats.productosPopulares.map((producto, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-green-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-500">{producto.ventas} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(producto.ventas / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Servicios Populares */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Servicios Más Solicitados</h3>
            <div className="space-y-4">
              {stats.serviciosPopulares.map((servicio, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{servicio.nombre}</p>
                      <p className="text-sm text-gray-500">{servicio.turnos} turnos reservados</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(servicio.turnos / 25) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Panel Admin</p>
                <p className="text-sm text-gray-500">Gestión completa</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/turnos')}
              className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Ver Turnos</p>
                <p className="text-sm text-gray-500">Gestión de citas</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/mayorista/portal')}
              className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Portal Mayorista</p>
                <p className="text-sm text-gray-500">Gestión de pedidos</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 