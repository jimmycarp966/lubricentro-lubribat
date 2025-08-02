import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const SimpleCalendar = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const isClosed = (date) => {
    const day = date.getDay()
    return day === 0 // Solo domingo cerrado
  }

  const isSelected = (date) => isSameDay(date, selectedDate)

  // Obtener el primer día del mes para alinear correctamente
  const firstDayOfMonth = monthStart.getDay()
  const daysToAdd = firstDayOfMonth

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaChevronLeft className="text-gray-600" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-800">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaChevronRight className="text-gray-600" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Espacios vacíos para alinear el primer día */}
        {Array.from({ length: daysToAdd }, (_, index) => (
          <div key={`empty-${index}`} className="p-3"></div>
        ))}
        
        {/* Días del mes */}
        {monthDays.map((day, index) => {
          const isTodayDate = isToday(day)
          const isSelectedDate = isSelected(day)
          const isClosedDate = isClosed(day)
          
          const dayOfWeek = day.getDay()
          const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeek]

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              disabled={isClosedDate}
              title={`${format(day, 'dd/MM/yyyy')} - ${dayName}`}
              className={`
                p-3 text-sm font-medium rounded-lg transition-all duration-200
                ${isTodayDate ? 'bg-green-100 text-green-700 font-bold' : ''}
                ${isSelectedDate ? 'bg-green-600 text-white font-bold' : ''}
                ${isClosedDate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                ${!isClosedDate && !isTodayDate && !isSelectedDate ? 'hover:bg-green-50 hover:text-green-600' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span>Hoy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>No disponible (Domingo)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleCalendar 