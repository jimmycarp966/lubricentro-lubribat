import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Icon } from '@iconify/react'
import Card from '../ui/Card'

const TurnosChart = ({ turnos, type = 'line' }) => {
  // Procesar datos para los últimos 7 días
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  const last7Days = getLast7Days()

  // Datos para gráfico de línea (turnos por día)
  const lineData = last7Days.map(date => {
    const turnosDelDia = turnos.filter(turno => turno.fecha === date)
    return {
      date: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }),
      turnos: turnosDelDia.length,
      confirmados: turnosDelDia.filter(t => t.estado === 'confirmado').length,
      completados: turnosDelDia.filter(t => t.estado === 'completado').length
    }
  })

  // Datos para gráfico de barras (estados de turnos)
  const barData = [
    { name: 'Pendientes', value: turnos.filter(t => t.estado === 'pendiente').length, color: '#f59e0b' },
    { name: 'Confirmados', value: turnos.filter(t => t.estado === 'confirmado').length, color: '#10b981' },
    { name: 'Completados', value: turnos.filter(t => t.estado === 'completado').length, color: '#3b82f6' },
    { name: 'Cancelados', value: turnos.filter(t => t.estado === 'cancelado').length, color: '#ef4444' }
  ]

  // Datos para gráfico de pie (servicios)
  const servicios = turnos.reduce((acc, turno) => {
    acc[turno.servicio] = (acc[turno.servicio] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(servicios).map(([servicio, count]) => ({
    name: servicio,
    value: count
  }))

  const COLORS = ['#16a34a', '#eab308', '#3b82f6', '#ef4444', '#8b5cf6']

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={lineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="turnos" stroke="#16a34a" strokeWidth={2} />
        <Line type="monotone" dataKey="confirmados" stroke="#10b981" strokeWidth={2} />
        <Line type="monotone" dataKey="completados" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={barData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#16a34a" />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )

  const getChartTitle = () => {
    switch (type) {
      case 'line':
        return 'Turnos por Día'
      case 'bar':
        return 'Estados de Turnos'
      case 'pie':
        return 'Servicios Más Populares'
      default:
        return 'Estadísticas de Turnos'
    }
  }

  const getChartIcon = () => {
    switch (type) {
      case 'line':
        return 'mdi:chart-line'
      case 'bar':
        return 'mdi:chart-bar'
      case 'pie':
        return 'mdi:chart-pie'
      default:
        return 'mdi:chart'
    }
  }

  return (
    <Card className="animate-fade-in">
      <Card.Header>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Icon icon={getChartIcon()} className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{getChartTitle()}</h3>
            <p className="text-sm text-gray-600">Últimos 7 días</p>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {type === 'line' && renderLineChart()}
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
      </Card.Body>
    </Card>
  )
}

export default TurnosChart 