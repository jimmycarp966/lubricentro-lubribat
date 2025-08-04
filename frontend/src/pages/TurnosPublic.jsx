import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTurnos } from '../contexts/TurnosContext'
import toast from 'react-hot-toast'
import SimpleCalendar from '../components/SimpleCalendar'
import BookingProgress from '../components/BookingProgress'
import { 
  processMercadoPagoPayment, 
  processCashPayment, 
  processTransferPayment, 
  processCardPayment,
  PAYMENT_METHODS 
} from '../services/paymentService'
import { sendWhatsAppMessage } from '../utils/whatsappService'
import PaymentMethodSelector from '../components/PaymentMethodSelector'


const TurnosPublic = () => {
  const [selectedSucursal, setSelectedSucursal] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [availableTimes, setAvailableTimes] = useState([])
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    whatsapp: '',
    patente: '',
    modelo: ''
  })
  const [step, setStep] = useState(1) // 1: sucursal, 2: fecha, 3: horario, 4: servicio, 5: datos, 6: confirmación
  const [confirmedTurno, setConfirmedTurno] = useState(null) // Para guardar los datos del turno confirmado
  const [debugInfo, setDebugInfo] = useState('')
  const [showDebug, setShowDebug] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [paymentResult, setPaymentResult] = useState(null)

  const { crearTurno } = useTurnos()

  const sucursales = [
    { id: 'monteros', nombre: 'Sucursal Monteros', direccion: 'Av. Principal 123, Monteros, Tucumán' },
    { id: 'concepcion', nombre: 'Sucursal Concepción', direccion: 'Calle Central 456, Concepción, Tucumán' }
  ]

  const servicios = [
    { id: 'cambio-aceite', nombre: 'Cambio de Aceite y Filtro', duracion: 45 },
    { id: 'revision-general', nombre: 'Revisión General', duracion: 60 },
    { id: 'cambio-filtros', nombre: 'Cambio de Filtros', duracion: 30 },
    { id: 'lubricacion', nombre: 'Lubricación Completa', duracion: 45 }
  ]

  // Generar horarios disponibles según el día
  const generateAvailableTimes = () => {
    const times = []
    const dayOfWeek = selectedDate.getDay() // 0 = Domingo, 6 = Sábado
    
    // Domingo cerrado
    if (dayOfWeek === 0) {
      return []
    }
    
    if (dayOfWeek === 6) {
      // Sábados: 08:30 a 13:00
      for (let hour = 8; hour < 13; hour++) {
        for (let minute = (hour === 8 ? 30 : 0); minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          if (Math.random() > 0.2) { // 80% de probabilidad de estar disponible
            times.push(time)
          }
        }
      }
    } else {
      // Lunes a Viernes: 08:00-13:00 y 16:00-20:00
      const morningTimes = []
      const afternoonTimes = []
      
      // Mañana: 08:00 a 13:00
      for (let hour = 8; hour < 13; hour++) {
        for (let minute = 0; minute < 60; minute += 45) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          if (Math.random() > 0.3) {
            morningTimes.push(time)
          }
        }
      }
      
      // Tarde: 16:00 a 20:00
      for (let hour = 16; hour < 20; hour++) {
        for (let minute = 0; minute < 60; minute += 45) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          if (Math.random() > 0.3) {
            afternoonTimes.push(time)
          }
        }
      }
      
      times.push(...morningTimes, ...afternoonTimes)
    }
    
    return times.sort()
  }

  useEffect(() => {
    if (selectedDate) {
      // Simular carga de horarios disponibles
      setTimeout(() => {
        const horarios = generateAvailableTimes()
        setAvailableTimes(horarios)
      }, 500)
    }
  }, [selectedDate])

  // Función para mostrar/ocultar debug con Ctrl+Shift+D
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        setShowDebug(prev => !prev)
        // Debug mode removido para producción
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showDebug])

  const handleSucursalSelect = (sucursal) => {
    setSelectedSucursal(sucursal)
    setStep(2)
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setSelectedTime('')
    setStep(3)
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    setStep(4)
  }

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setStep(5)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    // Validaciones específicas
    if (name === 'whatsapp') {
      // Formatear número de teléfono
      const cleaned = value.replace(/\D/g, '')
      if (cleaned.length <= 10) {
        formattedValue = cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '+54 9 $1 $2-$3')
      }
    }

    if (name === 'patente') {
      // Formatear patente (ej: ABC123)
      formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const turnoData = {
      sucursal: selectedSucursal.nombre,
      fecha: format(selectedDate, 'yyyy-MM-dd', { timeZone: 'America/Argentina/Buenos_Aires' }),
      horario: selectedTime,
      servicio: selectedService.nombre,
      cliente: {
        nombre: `${formData.nombre} ${formData.apellido}`,
        telefono: formData.whatsapp,
        email: ''
      },
      vehiculo: {
        patente: formData.patente,
        modelo: formData.modelo
      },
      // Datos para tracking del cliente
      puntosServicio: selectedService.duracion >= 60 ? 100 : 50, // Puntos según duración
      fechaCreacion: new Date(),
      estado: 'pendiente'
    }

    try {
      const result = await crearTurno(turnoData)
      
      if (result.success) {
        // Generar mensaje de WhatsApp
        const whatsappData = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          whatsapp: formData.whatsapp,
          fecha: selectedDate,
          horario: selectedTime,
          servicio: selectedService.nombre,
          sucursal: selectedSucursal.nombre
        }
        
        const whatsappResult = sendWhatsAppMessage(whatsappData)
        
        // Guardar los datos del turno confirmado antes de resetear
        setConfirmedTurno({
          sucursal: selectedSucursal.nombre,
          fecha: format(selectedDate, 'dd/MM/yyyy', { locale: es }),
          horario: selectedTime,
          servicio: selectedService.nombre,
          cliente: `${formData.nombre} ${formData.apellido}`,
          vehiculo: `${formData.patente} - ${formData.modelo}`,
          contacto: formData.whatsapp,
          whatsappUrl: whatsappResult.url // Agregar URL de WhatsApp
        })
        setStep(6)
        toast.success('¡Turno reservado! Te notificaremos cuando sea confirmado.')
        // Reset form
        setFormData({
          nombre: '',
          apellido: '',
          whatsapp: '',
          patente: '',
          modelo: ''
        })
        setSelectedTime('')
        setSelectedService('')
      } else {
        toast.error('Error al crear el turno')
      }
    } catch (error) {
      toast.error('Error al crear el turno')
    }
  }

  const handlePayment = async () => {
    if (!confirmedTurno) {
      toast.error('No hay turno confirmado para pagar')
      return
    }

    if (!selectedPaymentMethod) {
      toast.error('Por favor selecciona un método de pago')
      return
    }

    setPaymentLoading(true)
    
    try {
      const paymentData = {
        turnoId: confirmedTurno.id || `turno_${Date.now()}`,
        servicio: confirmedTurno.servicio,
        sucursal: confirmedTurno.sucursal,
        fecha: confirmedTurno.fecha,
        horario: confirmedTurno.horario,
        amount: confirmedTurno.precio || 5000,
        clientName: confirmedTurno.cliente,
        clientEmail: `${confirmedTurno.cliente.toLowerCase().replace(' ', '.')}@example.com`,
        vehiculo: confirmedTurno.vehiculo,
        clientPhone: confirmedTurno.contacto
      }

      let result

      switch (selectedPaymentMethod) {
        case PAYMENT_METHODS.MERCADOPAGO:
          result = await processMercadoPagoPayment(paymentData)
          break
        case PAYMENT_METHODS.EFECTIVO:
          result = await processCashPayment(paymentData)
          break
        case PAYMENT_METHODS.TRANSFERENCIA:
          result = await processTransferPayment(paymentData)
          break
        case PAYMENT_METHODS.TARJETA_PRESENCIAL:
          result = await processCardPayment(paymentData)
          break
        default:
          toast.error('Método de pago no válido')
          return
      }
      
      if (result.success) {
        setPaymentResult(result)
        
        if (result.paymentUrl) {
          toast.success('Redirigiendo al pago...')
          window.open(result.paymentUrl, '_blank')
        } else if (result.status === 'pagado') {
          toast.success('¡Pago procesado exitosamente!')
        } else {
          toast.success('Pago registrado correctamente')
        }
        
        // Guardar el ID del pago para tracking
        localStorage.setItem('currentPaymentId', result.paymentId)
      } else {
        toast.error(result.error || 'Error al procesar el pago')
      }
    } catch (error) {
      console.error('Error al procesar pago:', error)
      toast.error('Error al procesar el pago')
    } finally {
      setPaymentLoading(false)
    }
  }

    const renderStep1 = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <BookingProgress currentStep={1} />
      
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Selecciona una sucursal</h2>
        <p className="text-sm sm:text-base text-gray-600">Elige la sucursal donde quieres realizar tu servicio</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {sucursales.map((sucursal) => (
          <button
            key={sucursal.id}
            onClick={() => handleSucursalSelect(sucursal)}
            className="p-4 sm:p-6 lg:p-8 border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg sm:text-xl text-gray-800 group-hover:text-green-700 transition-colors">
                  {sucursal.nombre}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mt-2">{sucursal.direccion}</p>
                <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                  <p>• Horarios: Lunes a Viernes 08:00-13:00 y 16:00-20:00, Sábados 08:30-13:00</p>
                  <p>• Sábados: 8:00-12:00</p>
                  <p>• Servicio rápido y profesional</p>
                </div>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors ml-3 flex-shrink-0">
                <span className="text-green-600 font-bold text-sm sm:text-base">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <BookingProgress currentStep={2} />
      
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Selecciona una fecha</h2>
        <p className="text-sm sm:text-base text-gray-600">Elige el día que mejor te convenga para tu servicio en {selectedSucursal.nombre}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        <SimpleCalendar 
          selectedDate={selectedDate}
          onDateSelect={handleDateChange}
        />
        
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">Información importante</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                <span className="text-white text-xs sm:text-sm">✓</span>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base text-gray-800">Horarios disponibles</p>
                <p className="text-xs sm:text-sm text-gray-600">Lunes a Viernes: 08:00-13:00 y 16:00-20:00</p>
                <p className="text-xs sm:text-sm text-gray-600">Sábados: 08:30-13:00</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                <span className="text-white text-xs sm:text-sm">⏰</span>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base text-gray-800">Duración del servicio</p>
                <p className="text-xs sm:text-sm text-gray-600">Entre 30 y 60 minutos según el servicio</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                <span className="text-white text-xs sm:text-sm">📱</span>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base text-gray-800">Confirmación</p>
                <p className="text-xs sm:text-sm text-gray-600">Te enviaremos un recordatorio por WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <BookingProgress currentStep={3} />
      
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Elige un horario</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Para el {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
        </p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${
                selectedTime === time
                  ? 'bg-green-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 hover:shadow-md'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
        
        {availableTimes.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl sm:text-3xl">📅</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No hay horarios disponibles</h3>
            <p className="text-sm sm:text-base text-gray-600">Para esta fecha no hay horarios disponibles. Por favor, selecciona otra fecha.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <BookingProgress currentStep={4} />
      
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Selecciona el servicio</h2>
        <p className="text-sm sm:text-base text-gray-600">¿Qué necesitas para tu vehículo?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {servicios.map((servicio) => (
          <button
            key={servicio.id}
            onClick={() => handleServiceSelect(servicio)}
            className="p-4 sm:p-6 border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg sm:text-xl text-gray-800 group-hover:text-green-700 transition-colors">
                  {servicio.nombre}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mt-2">Duración: {servicio.duracion} minutos</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors ml-3 flex-shrink-0">
                <span className="text-green-600 font-bold text-sm sm:text-base">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <BookingProgress currentStep={5} />
      
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Completa tus datos</h2>
        <p className="text-sm sm:text-base text-gray-600">Necesitamos algunos datos para confirmar tu turno</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full border-2 border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
                className="w-full border-2 border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="Tu apellido"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de WhatsApp
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              required
              className="w-full border-2 border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="+54 9 11 1234-5678"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patente del vehículo
              </label>
              <input
                type="text"
                name="patente"
                value={formData.patente}
                onChange={handleInputChange}
                required
                className="w-full border-2 border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="ABC123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo del vehículo
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleInputChange}
                required
                className="w-full border-2 border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="Toyota Corolla 2020"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-green-200">
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-800 text-sm sm:text-base">Resumen del turno:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="font-medium text-gray-600">Sucursal</p>
                <p className="text-gray-800">{selectedSucursal.nombre}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Fecha</p>
                <p className="text-gray-800">{format(selectedDate, 'dd/MM/yyyy', { locale: es })}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Horario</p>
                <p className="text-gray-800">{selectedTime}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Servicio</p>
                <p className="text-gray-800">{selectedService.nombre}</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Confirmar Turno
          </button>
        </form>
      </div>
    </div>
  )

  const renderStep6 = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <BookingProgress currentStep={6} />
      
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-yellow-600">¡Turno reservado!</h2>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8">
          Tu turno ha sido reservado exitosamente. Te notificaremos cuando sea confirmado por nuestro equipo.
        </p>
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-green-200 mb-6 sm:mb-8">
          <h3 className="font-semibold mb-3 sm:mb-4 text-gray-800 text-sm sm:text-base">Detalles del turno:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <p className="font-medium text-gray-600">Sucursal</p>
              <p className="text-gray-800">{confirmedTurno?.sucursal || 'No disponible'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Fecha</p>
              <p className="text-gray-800">{confirmedTurno?.fecha || 'No disponible'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Horario</p>
              <p className="text-gray-800">{confirmedTurno?.horario || 'No disponible'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Servicio</p>
              <p className="text-gray-800">{confirmedTurno?.servicio || 'No disponible'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Cliente</p>
              <p className="text-gray-800">{confirmedTurno?.cliente || 'No disponible'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Vehículo</p>
              <p className="text-gray-800">{confirmedTurno?.vehiculo || 'No disponible'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Contacto</p>
              <p className="text-gray-800">{confirmedTurno?.contacto || 'No disponible'}</p>
            </div>
          </div>
        </div>

        {/* Selector de métodos de pago */}
        <div className="mb-6 sm:mb-8">
          <PaymentMethodSelector
            onMethodSelect={setSelectedPaymentMethod}
            selectedMethod={selectedPaymentMethod}
            disabled={paymentLoading}
          />
        </div>

        {/* Información específica para transferencia */}
        {selectedPaymentMethod === PAYMENT_METHODS.TRANSFERENCIA && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 text-lg">Pago por Transferencia</h3>
                <p className="text-blue-600 text-sm">Sin comisiones adicionales</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-medium text-gray-800 mb-3">📋 Datos bancarios:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Banco:</span>
                    <p className="text-gray-800">Banco Tucumán</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Cuenta:</span>
                    <p className="text-gray-800">123-456789/0</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">CBU:</span>
                    <p className="text-gray-800 font-mono text-xs">1234567890123456789012</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Titular:</span>
                    <p className="text-gray-800">Lubri-Bat S.R.L.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">📱 Pasos a seguir:</h4>
                    <ol className="text-sm text-green-700 space-y-1">
                      <li>1. Realiza la transferencia con los datos bancarios</li>
                      <li>2. Toma una foto del comprobante de pago</li>
                      <li>3. Envía el comprobante por WhatsApp al: <strong>+54 9 381 123-4567</strong></li>
                      <li>4. Incluye tu nombre y datos del turno en el mensaje</li>
                      <li>5. Una vez confirmado, se te acreditará el turno automáticamente</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">⏰</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">⏱️ Tiempo de confirmación:</h4>
                    <p className="text-sm text-yellow-700">
                      La confirmación se realiza en un plazo máximo de 2 horas durante días hábiles. 
                      Te notificaremos por WhatsApp cuando el pago sea confirmado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={handlePayment}
            disabled={paymentLoading || !selectedPaymentMethod}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {paymentLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>
                {selectedPaymentMethod === PAYMENT_METHODS.EFECTIVO && '💵 Pagar en Efectivo'}
                {selectedPaymentMethod === PAYMENT_METHODS.TRANSFERENCIA && '🏦 Pagar por Transferencia'}
                {selectedPaymentMethod === PAYMENT_METHODS.TARJETA_PRESENCIAL && '💳 Pagar con Tarjeta'}
                {selectedPaymentMethod === PAYMENT_METHODS.MERCADOPAGO && '🟡 Pagar con MercadoPago'}
                {selectedPaymentMethod === PAYMENT_METHODS.PAGO_FACIL && '🏪 Pagar con Pago Fácil'}
                {selectedPaymentMethod === PAYMENT_METHODS.RAPIPAGO && '🏪 Pagar con Rapipago'}
                {!selectedPaymentMethod && 'Selecciona método de pago'}
              </>
            )}
          </button>
          <button
            onClick={() => {
              setStep(1)
              setSelectedSucursal('')
              setSelectedDate(new Date())
              setSelectedTime('')
              setSelectedService('')
              setConfirmedTurno(null)
              setFormData({
                nombre: '',
                apellido: '',
                whatsapp: '',
                patente: '',
                modelo: ''
              })
            }}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Reservar otro turno
          </button>
          <a
            href="/"
            className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Debug Panel - Solo visible con Ctrl+Shift+D */}
      {showDebug && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              🔧 Panel de Debug Cliente (Ctrl+Shift+D para ocultar)
            </h3>
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Estado del Formulario:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Paso Actual:</span> {step}
                </div>
                <div>
                  <span className="font-medium">Sucursal:</span> {selectedSucursal || 'No seleccionada'}
                </div>
                <div>
                  <span className="font-medium">Fecha:</span> {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'No seleccionada'}
                </div>
                <div>
                  <span className="font-medium">Horario:</span> {selectedTime || 'No seleccionado'}
                </div>
                <div>
                  <span className="font-medium">Servicio:</span> {selectedService || 'No seleccionado'}
                </div>
                <div>
                  <span className="font-medium">Cliente:</span> {formData.nombre || 'No ingresado'}
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span> {formData.whatsapp || 'No ingresado'}
                </div>
                <div>
                  <span className="font-medium">WhatsApp:</span> {formData.whatsapp || 'No ingresado'}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Información del Vehículo:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Marca:</span> {formData.patente || 'No ingresada'}
                </div>
                <div>
                  <span className="font-medium">Modelo:</span> {formData.modelo || 'No ingresado'}
                </div>
                <div>
                  <span className="font-medium">Año:</span> {formData.patente || 'No ingresado'}
                </div>
                <div>
                  <span className="font-medium">Patente:</span> {formData.patente || 'No ingresada'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Reservar Turno</h1>
              <p className="text-gray-600 mt-2">Agenda tu servicio de lubricentro</p>
            </div>
            {showDebug && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                🔧 DEBUG MODE
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex items-center ${
                    stepNumber < 6 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      stepNumber < step
                        ? 'bg-green-600 text-white'
                        : stepNumber === step
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {stepNumber < step ? '✓' : stepNumber}
                  </div>
                  {stepNumber < 6 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                        step > stepNumber ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className={step > 1 ? 'text-green-600 font-medium' : 'text-gray-600'}>Sucursal</span>
              <span className={step > 2 ? 'text-green-600 font-medium' : 'text-gray-600'}>Fecha</span>
              <span className={step > 3 ? 'text-green-600 font-medium' : 'text-gray-600'}>Horario</span>
              <span className={step > 4 ? 'text-green-600 font-medium' : 'text-gray-600'}>Servicio</span>
              <span className={step > 5 ? 'text-green-600 font-medium' : 'text-gray-600'}>Datos</span>
              <span className={step === 6 ? 'text-blue-600 font-medium' : 'text-gray-600'}>Confirmar</span>
            </div>
          </div>

          {step === 1 && renderStep1()}
       {step === 2 && renderStep2()}
       {step === 3 && renderStep3()}
       {step === 4 && renderStep4()}
       {step === 5 && renderStep5()}
              {step === 6 && renderStep6()}
        </div>
      </div>
    </div>
  )
}

export default TurnosPublic 