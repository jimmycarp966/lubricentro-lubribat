import React, { useState, useEffect, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { Icon } from '@iconify/react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'

const IntelligentCalendar = ({ turnos, onDateSelect, onTurnoSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [view, setView] = useState('month') // month, week, day
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])

  // Calcular días del mes actual
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  // Calcular días de la semana actual
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  // Obtener turnos para una fecha específica
  const getTurnosForDate = (date) => {
    return turnos.filter(turno => isSameDay(new Date(turno.fecha), date))
  }

  // Calcular disponibilidad para una fecha
  const getAvailabilityForDate = (date) => {
    const turnosDelDia = getTurnosForDate(date)
    const totalSlots = 8 // 8 horas de trabajo
    const usedSlots = turnosDelDia.length
    const availableSlots = totalSlots - usedSlots
    
    return {
      used: usedSlots,
      available: availableSlots,
      percentage: (usedSlots / totalSlots) * 100
    }
  }

  // IA: Sugerir horarios óptimos
  const generateAISuggestions = (date) => {
    const turnosDelDia = getTurnosForDate(date)
    const availability = getAvailabilityForDate(date)
    
    const suggestions = []
    
    // Analizar patrones de ocupación
    const horariosOcupados = turnosDelDia.map(t => t.horario)
    const horariosDisponibles = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
      .filter(h => !horariosOcupados.includes(h))
    
    // Sugerir horarios libres
    if (horariosDisponibles.length > 0) {
      suggestions.push({
        type: 'available',
        title: 'Horarios Disponibles',
        description: `Hay ${horariosDisponibles.length} horarios libres`,
        horarios: horariosDisponibles.slice(0, 3),
        priority: 'high'
      })
    }
    
    // Sugerir optimización si hay muchos turnos
    if (availability.percentage > 80) {
      suggestions.push({
        type: 'optimization',
        title: 'Día Muy Ocupado',
        description: 'Considera distribuir algunos turnos',
        priority: 'medium'
      })
    }
    
    // Sugerir recordatorios si hay turnos pendientes
    const turnosPendientes = turnosDelDia.filter(t => t.estado === 'pendiente')
    if (turnosPendientes.length > 0) {
      suggestions.push({
        type: 'reminder',
        title: 'Turnos Pendientes',
        description: `${turnosPendientes.length} turnos requieren confirmación`,
        count: turnosPendientes.length,
        priority: 'high'
      })
    }
    
    return suggestions
  }

  // Navegación del calendario
  const goToPreviousMonth = () => {
    setCurrentDate(prev => subDays(startOfMonth(prev), 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => addDays(endOfMonth(prev), 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Manejar selección de fecha
  const handleDateSelect = (date) => {
    setSelectedDate(date)
    const suggestions = generateAISuggestions(date)
    setAiSuggestions(suggestions)
    setShowSuggestions(true)
    onDateSelect?.(date)
  }

  // Renderizar día del calendario
  const renderDay = (date) => {
    const turnosDelDia = getTurnosForDate(date)
    const availability = getAvailabilityForDate(date)
    const isSelected = selectedDate && isSameDay(date, selectedDate)
    const isCurrentDay = isToday(date)
    
    return (
      <div
        key={date.toISOString()}
        onClick={() => handleDateSelect(date)}
        className={`
          min-h-[80px] p-2 border border-gray-200 cursor-pointer transition-all duration-200
          ${isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}
          ${isCurrentDay ? 'bg-green-50 border-green-300' : ''}
          ${date.getMonth() !== currentDate.getMonth() ? 'opacity-50' : ''}
        `}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${isCurrentDay ? 'text-green-600' : 'text-gray-700'}`}>
            {format(date, 'd')}
          </span>
          {turnosDelDia.length > 0 && (
            <Badge variant="info" size="sm">
              {turnosDelDia.length}
            </Badge>
          )}
        </div>
        
        {/* Indicador de disponibilidad */}
        <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              availability.percentage > 80 ? 'bg-red-500' :
              availability.percentage > 60 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${availability.percentage}%` }}
          />
        </div>
        
        {/* Turnos del día */}
        <div className="space-y-1">
          {turnosDelDia.slice(0, 2).map((turno, index) => (
            <div
              key={index}
              className={`text-xs p-1 rounded ${
                turno.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                turno.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {turno.horario} - {turno.servicio}
            </div>
          ))}
          {turnosDelDia.length > 2 && (
            <div className="text-xs text-gray-500">
              +{turnosDelDia.length - 2} más
            </div>
          )}
        </div>
      </div>
    )
  }

  // Renderizar vista de mes
  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Días de la semana */}
      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
          {day}
        </div>
      ))}
      
      {/* Días del mes */}
      {monthDays.map(renderDay)}
    </div>
  )

  // Renderizar vista de semana
  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Días de la semana */}
      {weekDays.map(day => (
        <div key={day.toISOString()} className="min-h-[120px] p-2 border border-gray-200">
          <div className="text-center mb-2">
            <div className="text-sm font-medium text-gray-700">
              {format(day, 'EEE', { locale: es })}
            </div>
            <div className={`text-lg font-bold ${isToday(day) ? 'text-green-600' : 'text-gray-900'}`}>
              {format(day, 'd')}
            </div>
          </div>
          
          {/* Turnos del día */}
          {getTurnosForDate(day).map((turno, index) => (
            <div
              key={index}
              className={`text-xs p-1 mb-1 rounded ${
                turno.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                turno.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {turno.horario} - {turno.servicio}
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header del calendario */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-gray-900">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView('month')}
                  className={view === 'month' ? 'bg-blue-100' : ''}
                >
                  Mes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView('week')}
                  className={view === 'week' ? 'bg-blue-100' : ''}
                >
                  Semana
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                icon="mdi:chevron-left"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                icon="mdi:chevron-right"
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {view === 'month' ? renderMonthView() : renderWeekView()}
        </Card.Body>
      </Card>

      {/* Sugerencias de IA */}
      {showSuggestions && selectedDate && (
        <Card>
          <Card.Header>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon icon="mdi:brain" className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sugerencias IA - {format(selectedDate, 'dd/MM/yyyy')}
                </h3>
                <p className="text-sm text-gray-600">Análisis inteligente de disponibilidad</p>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    suggestion.priority === 'high' ? 'border-red-200 bg-red-50' :
                    suggestion.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {suggestion.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {suggestion.description}
                      </p>
                      {suggestion.horarios && (
                        <div className="flex flex-wrap gap-2">
                          {suggestion.horarios.map((horario, idx) => (
                            <Badge key={idx} variant="success" size="sm">
                              {horario}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={suggestion.priority === 'high' ? 'error' : 'warning'}
                      size="sm"
                    >
                      {suggestion.priority === 'high' ? 'Alta' : 'Media'}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {aiSuggestions.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Icon icon="mdi:check-circle" className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>No hay sugerencias para este día</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

export default IntelligentCalendar 