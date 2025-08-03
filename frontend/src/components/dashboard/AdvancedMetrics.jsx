import React from 'react'
import { Icon } from '@iconify/react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'

const AdvancedMetrics = ({ turnos, productos }) => {
  // Calcular métricas avanzadas
  const totalTurnos = turnos.length
  const turnosHoy = turnos.filter(turno => {
    const hoy = new Date().toISOString().split('T')[0]
    return turno.fecha === hoy
  }).length

  const turnosEstaSemana = turnos.filter(turno => {
    const fechaTurno = new Date(turno.fecha)
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - 7)
    return fechaTurno >= inicioSemana
  }).length

  const turnosEsteMes = turnos.filter(turno => {
    const fechaTurno = new Date(turno.fecha)
    const inicioMes = new Date()
    inicioMes.setDate(1)
    return fechaTurno >= inicioMes
  }).length

  // Tasa de conversión (pendientes a confirmados)
  const turnosPendientes = turnos.filter(t => t.estado === 'pendiente').length
  const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado').length
  const tasaConversion = totalTurnos > 0 ? ((turnosConfirmados / totalTurnos) * 100).toFixed(1) : 0

  // Servicios más populares
  const servicios = turnos.reduce((acc, turno) => {
    acc[turno.servicio] = (acc[turno.servicio] || 0) + 1
    return acc
  }, {})

  const servicioMasPopular = Object.entries(servicios).sort((a, b) => b[1] - a[1])[0]

  // Horarios más solicitados
  const horarios = turnos.reduce((acc, turno) => {
    acc[turno.horario] = (acc[turno.horario] || 0) + 1
    return acc
  }, {})

  const horarioMasPopular = Object.entries(horarios).sort((a, b) => b[1] - a[1])[0]

  // Productos con bajo stock
  const productosBajoStock = productos.filter(producto => 
    producto.stock && producto.stock < (producto.stockMinimo || 5)
  )

  // Ingresos estimados (simulado)
  const ingresosEstimados = turnosConfirmados * 15000 // $15.000 promedio por turno

  const metrics = [
    {
      title: 'Tasa de Conversión',
      value: `${tasaConversion}%`,
      icon: 'mdi:trending-up',
      color: 'green',
      description: 'Pendientes a Confirmados',
      progress: parseFloat(tasaConversion)
    },
    {
      title: 'Ingresos Estimados',
      value: `$${ingresosEstimados.toLocaleString()}`,
      icon: 'mdi:currency-usd',
      color: 'yellow',
      description: 'Este mes',
      progress: 75
    },
    {
      title: 'Servicio Popular',
      value: servicioMasPopular ? servicioMasPopular[0] : 'N/A',
      icon: 'mdi:star',
      color: 'blue',
      description: `${servicioMasPopular ? servicioMasPopular[1] : 0} reservas`,
      progress: 60
    },
    {
      title: 'Horario Pico',
      value: horarioMasPopular ? horarioMasPopular[0] : 'N/A',
      icon: 'mdi:clock',
      color: 'purple',
      description: `${horarioMasPopular ? horarioMasPopular[1] : 0} turnos`,
      progress: 80
    }
  ]

  const alerts = [
    {
      type: 'warning',
      message: `${turnosPendientes} turnos pendientes de confirmación`,
      icon: 'mdi:alert-circle'
    },
    {
      type: 'error',
      message: `${productosBajoStock.length} productos con bajo stock`,
      icon: 'mdi:package-variant-remove'
    },
    {
      type: 'info',
      message: `${turnosHoy} turnos programados para hoy`,
      icon: 'mdi:calendar-today'
    }
  ]

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <Card.Body className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${metric.color}-100 rounded-full flex items-center justify-center`}>
                  <Icon icon={metric.icon} className={`w-6 h-6 text-${metric.color}-600`} />
                </div>
                <Badge variant={metric.color === 'green' ? 'success' : metric.color === 'yellow' ? 'warning' : 'info'}>
                  {metric.progress}%
                </Badge>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </h3>
              <p className="text-sm font-medium text-gray-600 mb-2">
                {metric.title}
              </p>
              <p className="text-xs text-gray-500">
                {metric.description}
              </p>
              
              <div className="mt-4">
                <ProgressBar 
                  value={metric.progress} 
                  max={100} 
                  size="sm" 
                  showLabel={false}
                  variant={metric.color === 'green' ? 'success' : metric.color === 'yellow' ? 'warning' : 'info'}
                />
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Alertas y Notificaciones */}
      <Card>
        <Card.Header>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Icon icon="mdi:bell" className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Alertas y Notificaciones</h3>
              <p className="text-sm text-gray-600">Estado actual del sistema</p>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-8 h-8 bg-${alert.type === 'warning' ? 'yellow' : alert.type === 'error' ? 'red' : 'blue'}-100 rounded-full flex items-center justify-center`}>
                  <Icon icon={alert.icon} className={`w-4 h-4 text-${alert.type === 'warning' ? 'yellow' : alert.type === 'error' ? 'red' : 'blue'}-600`} />
                </div>
                <span className="text-sm text-gray-700">{alert.message}</span>
                <Badge variant={alert.type} size="sm">
                  {alert.type === 'warning' ? 'Atención' : alert.type === 'error' ? 'Crítico' : 'Info'}
                </Badge>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Body className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Icon icon="mdi:calendar-week" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Esta Semana</h4>
                <p className="text-2xl font-bold text-green-600">{turnosEstaSemana}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Turnos programados</p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon icon="mdi:calendar-month" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Este Mes</h4>
                <p className="text-2xl font-bold text-blue-600">{turnosEsteMes}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Turnos programados</p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Icon icon="mdi:package-variant" className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Inventario</h4>
                <p className="text-2xl font-bold text-yellow-600">{productosBajoStock.length}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Productos bajo stock</p>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default AdvancedMetrics 