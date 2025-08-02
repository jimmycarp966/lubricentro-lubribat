import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

const TurnosCalendar = ({ selectedDate, onDateSelect, turnos }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  // Obtener todos los días del mes actual
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Función para obtener el color del día basado en los turnos
  const getDayColor = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const turnosDelDia = turnos.filter(turno => turno.fecha === dayStr)
    
    if (turnosDelDia.length === 0) return 'bg-white'
    
    // Contar turnos por estado
    const pendientes = turnosDelDia.filter(t => t.estado === 'pendiente' || t.estado === 'confirmado').length
    const finalizados = turnosDelDia.filter(t => t.estado === 'finalizado').length
    
    if (pendientes > 0 && finalizados > 0) {
      return 'bg-gradient-to-r from-yellow-200 to-green-200' // Mixto
    } else if (pendientes > 0) {
      return 'bg-yellow-200' // Pendientes
    } else if (finalizados > 0) {
      return 'bg-green-200' // Finalizados
    }
    
    return 'bg-gray-200' // Otros estados
  }

  // Función para obtener el número de turnos del día
  const getTurnosCount = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return turnos.filter(turno => turno.fecha === dayStr).length
  }

  // Función para obtener el tooltip con información del día
  const getDayTooltip = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const turnosDelDia = turnos.filter(turno => turno.fecha === dayStr)
    
    if (turnosDelDia.length === 0) return 'Sin turnos'
    
    const pendientes = turnosDelDia.filter(t => t.estado === 'pendiente' || t.estado === 'confirmado').length
    const finalizados = turnosDelDia.filter(t => t.estado === 'finalizado').length
    
    let tooltip = `${turnosDelDia.length} turno${turnosDelDia.length > 1 ? 's' : ''}`
    if (pendientes > 0) tooltip += `\n${pendientes} pendiente${pendientes > 1 ? 's' : ''}`
    if (finalizados > 0) tooltip += `\n${finalizados} finalizado${finalizados > 1 ? 's' : ''}`
    
    return tooltip
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          →
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = isSameDay(day, selectedDate)
          const turnosCount = getTurnosCount(day)
          const dayColor = getDayColor(day)
          const tooltip = getDayTooltip(day)

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              className={`
                relative p-2 h-12 rounded-lg transition-all duration-200 hover:shadow-md
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                ${dayColor}
                ${turnosCount > 0 ? 'font-semibold' : 'font-normal'}
              `}
              title={tooltip}
            >
              <span className="text-sm">{format(day, 'd')}</span>
              {turnosCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {turnosCount}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-200 rounded"></div>
            <span>Pendientes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span>Finalizados</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-200 to-green-200 rounded"></div>
            <span>Mixtos</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TurnosCalendar 