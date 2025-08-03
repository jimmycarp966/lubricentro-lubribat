import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTurnos } from '../contexts/TurnosContext'
import toast from 'react-hot-toast'
import SimpleCalendar from '../components/SimpleCalendar'
import BookingProgress from '../components/BookingProgress'
import { sendWhatsAppMessage } from '../utils/whatsappService'


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
    console.log('🔧 Debug: Iniciando creación de turno...')
    setDebugInfo('🔧 Iniciando creación de turno...')
    setStep(5)

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
      estado: 'confirmado'
    }

    console.log('🔧 Debug: Datos del turno a crear:', turnoData)
    setDebugInfo(prev => prev + '\n📋 Datos del turno: ' + JSON.stringify(turnoData, null, 2))

    try {
      console.log('🔧 Debug: Llamando a crearTurno...')
      setDebugInfo(prev => prev + '\n🔄 Llamando a crearTurno...')
      const result = await crearTurno(turnoData)
      console.log('🔧 Debug: Resultado de crearTurno:', result)
      setDebugInfo(prev => prev + '\n✅ Resultado: ' + JSON.stringify(result, null, 2))
      
      if (result.success) {
        console.log('🔧 Debug: Turno creado exitosamente')
        setDebugInfo(prev => prev + '\n🎉 Turno creado exitosamente')
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
        toast.success('¡Turno confirmado! Te enviaremos un mensaje de WhatsApp.')
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
        console.log('🔧 Debug: Error en crearTurno:', result.error)
        setDebugInfo(prev => prev + '\n❌ Error: ' + result.error)
        toast.error('Error al crear el turno')
      }
    } catch (error) {
      console.log('🔧 Debug: Excepción en handleSubmit:', error)
      setDebugInfo(prev => prev + '\n💥 Excepción: ' + error.message)
      toast.error('Error al crear el turno')
    }
  }

    const renderStep1 = () => (
    <div className="max-w-6xl mx-auto">
      <BookingProgress currentStep={1} />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Selecciona una sucursal</h2>
        <p className="text-gray-600">Elige la sucursal donde quieres realizar tu servicio</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {sucursales.map((sucursal) => (
          <button
            key={sucursal.id}
            onClick={() => handleSucursalSelect(sucursal)}
            className="p-8 border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-xl text-gray-800 group-hover:text-green-700 transition-colors">
                  {sucursal.nombre}
                </h3>
                <p className="text-gray-600 mt-2">{sucursal.direccion}</p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>• Horarios: Lunes a Viernes 8:00-18:00</p>
                  <p>• Sábados: 8:00-12:00</p>
                  <p>• Servicio rápido y profesional</p>
                </div>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <span className="text-green-600 font-bold">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="max-w-6xl mx-auto">
      <BookingProgress currentStep={2} />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Selecciona una fecha</h2>
        <p className="text-gray-600">Elige el día que mejor te convenga para tu servicio en {selectedSucursal.nombre}</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <SimpleCalendar 
          selectedDate={selectedDate}
          onDateSelect={handleDateChange}
        />
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Información importante</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Horarios disponibles</p>
                <p className="text-sm text-gray-600">Lunes a Viernes: 08:00-13:00 y 16:00-20:00</p>
                <p className="text-sm text-gray-600">Sábados: 08:30-13:00</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">⏰</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Duración del servicio</p>
                <p className="text-sm text-gray-600">Entre 30 y 60 minutos según el servicio</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">📱</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Confirmación</p>
                <p className="text-sm text-gray-600">Te enviaremos un recordatorio por WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      <BookingProgress currentStep={3} />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Elige un horario</h2>
        <p className="text-gray-600">
          Para el {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
        </p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className="p-4 rounded-xl border-2 border-green-200 hover:border-green-500 hover:bg-green-50 text-green-700 transition-all duration-200 font-medium hover:scale-105"
            >
              {time}
            </button>
          ))}
        </div>
        {availableTimes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No hay horarios disponibles para esta fecha.
            </p>
            <button
              onClick={() => setStep(1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Elegir otra fecha
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="max-w-4xl mx-auto">
      <BookingProgress currentStep={4} />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Selecciona el servicio</h2>
        <p className="text-gray-600">¿Qué necesitas para tu vehículo?</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {servicios.map((servicio) => (
          <button
            key={servicio.id}
            onClick={() => handleServiceSelect(servicio)}
            className="p-6 border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-xl text-gray-800 group-hover:text-green-700 transition-colors">
                  {servicio.nombre}
                </h3>
                <p className="text-gray-600 mt-2">Duración: {servicio.duracion} minutos</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <span className="text-green-600 font-bold">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="max-w-4xl mx-auto">
      <BookingProgress currentStep={5} />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Completa tus datos</h2>
        <p className="text-gray-600">Necesitamos algunos datos para confirmar tu turno</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
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
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="+54 9 11 1234-5678"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
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
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Toyota Corolla 2020"
              />
            </div>
          </div>

                     <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
             <h3 className="font-semibold mb-4 text-gray-800">Resumen del turno:</h3>
             <div className="grid md:grid-cols-2 gap-4 text-sm">
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
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Confirmar Turno
          </button>
        </form>
      </div>
    </div>
  )

  const renderStep6 = () => (
    <div className="max-w-4xl mx-auto">
      <BookingProgress currentStep={6} />
      
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-green-600">¡Turno confirmado!</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Tu turno ha sido reservado exitosamente. Te enviaremos un recordatorio por WhatsApp.
        </p>
        
                   <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200 mb-8">
             <h3 className="font-semibold mb-4 text-gray-800">Detalles del turno:</h3>
             <div className="grid md:grid-cols-2 gap-4 text-sm">
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
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {confirmedTurno?.whatsappUrl && (
            <a
              href={confirmedTurno.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              📱 Enviar WhatsApp
            </a>
          )}
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
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Reservar otro turno
          </button>
          <a
            href="/"
            className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Reserva tu Turno
          </h1>

          {/* Debug Panel - Visible for testing */}
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-yellow-800">🔧 Panel de Debug</h3>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs bg-yellow-600 text-white px-2 py-1 rounded"
              >
                {showDebug ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {showDebug && (
              <div className="text-xs text-yellow-800">
                <pre className="whitespace-pre-wrap">{debugInfo || 'Sin información de debug'}</pre>
              </div>
            )}
          </div>

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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step <= stepNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 6 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Sucursal</span>
              <span>Fecha</span>
              <span>Horario</span>
              <span>Servicio</span>
              <span>Datos</span>
              <span>Confirmar</span>
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