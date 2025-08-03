import React from 'react'
import { Icon } from '@iconify/react'
import Card from './ui/Card'
import Badge from './ui/Badge'

const DashboardStats = ({ turnos, productos }) => {
  // Calcular estadísticas
  const totalTurnos = turnos.length
  const turnosHoy = turnos.filter(turno => {
    const hoy = new Date().toISOString().split('T')[0]
    return turno.fecha === hoy
  }).length
  
  const turnosPendientes = turnos.filter(turno => turno.estado === 'pendiente').length
  const turnosConfirmados = turnos.filter(turno => turno.estado === 'confirmado').length
  const turnosCompletados = turnos.filter(turno => turno.estado === 'completado').length
  
  const totalProductos = productos.length
  const productosBajoStock = productos.filter(producto => 
    producto.stock && producto.stock < (producto.stockMinimo || 5)
  ).length

  const stats = [
    {
      title: 'Turnos Hoy',
      value: turnosHoy,
      icon: 'mdi:calendar-today',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Pendientes',
      value: turnosPendientes,
      icon: 'mdi:clock-outline',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Confirmados',
      value: turnosConfirmados,
      icon: 'mdi:check-circle',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Completados',
      value: turnosCompletados,
      icon: 'mdi:flag-checkered',
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Productos',
      value: totalProductos,
      icon: 'mdi:package-variant',
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Bajo Stock',
      value: productosBajoStock,
      icon: 'mdi:alert',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-xl transition-all duration-300">
          <Card.Body className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                <Icon icon={stat.icon} className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
            
            {stat.title === 'Bajo Stock' && productosBajoStock > 0 && (
              <div className="mt-3">
                <Badge variant="error" size="sm">
                  Requiere atención
                </Badge>
              </div>
            )}
            
            {stat.title === 'Turnos Hoy' && turnosHoy > 0 && (
              <div className="mt-3">
                <Badge variant="success" size="sm">
                  Activo
                </Badge>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  )
}

export default DashboardStats 