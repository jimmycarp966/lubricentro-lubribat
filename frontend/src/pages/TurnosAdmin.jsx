import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTurnos } from '../contexts/TurnosContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { sendWhatsAppMessage, sendPendingReminderMessage } from '../utils/whatsappService'

const TurnosAdmin = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { turnos, loading, fetchTurnos, actualizarTurno, eliminarTurno } = useTurnos()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editingTurno, setEditingTurno] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [activeTab, setActiveTab] = useState('pendientes') // 'pendientes' o 'finalizados'

  // Filtrar turnos por fecha seleccionada y estado
  const filteredTurnos = turnos.filter(turno => {
    // Usar directamente la fecha del turno sin crear un nuevo Date object
    // para evitar problemas de zona horaria
    const turnoDateStr = turno.fecha
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
    const estadoMatch = activeTab === 'pendientes' ? 
      (turno.estado === 'pendiente' || turno.estado === 'confirmado') : 
      turno.estado === 'finalizado'
    
    console.log('Filtering turno:', turno.fecha, 'vs selected:', selectedDateStr, 'match:', turnoDateStr === selectedDateStr, 'estado:', turno.estado, 'tab:', activeTab)
    return turnoDateStr === selectedDateStr && estadoMatch
  })

  // Contar turnos por estado para mostrar en las pestañas
  const turnosPendientes = turnos.filter(turno => {
    const turnoDateStr = turno.fecha
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
    return turnoDateStr === selectedDateStr && (turno.estado === 'pendiente' || turno.estado === 'confirmado')
  })

  const turnosFinalizados = turnos.filter(turno => {
    const turnoDateStr = turno.fecha
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
    return turnoDateStr === selectedDateStr && turno.estado === 'finalizado'
  })

  useEffect(() => {
    console.log('TurnosAdmin useEffect - User:', user)
    if (user?.role !== 'admin') {
      console.log('User is not admin, redirecting...')
      navigate('/')
      return
    }
    console.log('Fetching turnos...')
    fetchTurnos()
  }, [user, navigate, fetchTurnos])

  const handleEdit = (turno) => {
    setEditingTurno(turno)
    setShowEditForm(true)
  }

  const handleDelete = async (turnoId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este turno?')) {
      await eliminarTurno(turnoId)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const updatedData = {
      fecha: formData.get('fecha'),
      horario: formData.get('horario'),
      servicio: formData.get('servicio'),
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      whatsapp: formData.get('whatsapp'),
      patente: formData.get('patente'),
      modelo: formData.get('modelo'),
      estado: formData.get('estado')
    }

    await actualizarTurno(editingTurno._id, updatedData)
    setShowEditForm(false)
    setEditingTurno(null)
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'confirmado':
        return 'bg-green-100 text-green-800'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'finalizado':
        return 'bg-blue-100 text-blue-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleConfirmarTurno = async (turnoId) => {
    if (window.confirm('¿Confirmar este turno? Se enviará un mensaje de WhatsApp automáticamente.')) {
      const result = await actualizarTurno(turnoId, { estado: 'confirmado' })
      if (result.success) {
        // Enviar mensaje de WhatsApp automáticamente
        const turno = turnos.find(t => t._id === turnoId)
        if (turno) {
          const whatsappData = {
            nombre: turno.cliente?.nombre?.split(' ')[0] || turno.nombre || '',
            apellido: turno.cliente?.nombre?.split(' ').slice(1).join(' ') || turno.apellido || '',
            whatsapp: turno.cliente?.telefono || turno.whatsapp || '',
            fecha: turno.fecha,
            horario: turno.horario,
            servicio: turno.servicio,
            sucursal: turno.sucursal || 'LUBRI-BAT'
          }
          
          const whatsappResult = sendWhatsAppMessage(whatsappData)
          console.log('📱 WhatsApp enviado:', whatsappResult)
          
          // Abrir WhatsApp automáticamente
          window.open(whatsappResult.url, '_blank')
        }
      }
    }
  }

  const handleEnviarRecordatorio = async (turnoId) => {
    const turno = turnos.find(t => t._id === turnoId)
    if (turno && turno.estado === 'pendiente') {
      const whatsappData = {
        nombre: turno.cliente?.nombre?.split(' ')[0] || turno.nombre || '',
        apellido: turno.cliente?.nombre?.split(' ').slice(1).join(' ') || turno.apellido || '',
        whatsapp: turno.cliente?.telefono || turno.whatsapp || '',
        fecha: turno.fecha,
        horario: turno.horario,
        servicio: turno.servicio,
        sucursal: turno.sucursal || 'LUBRI-BAT'
      }
      
      const whatsappResult = sendPendingReminderMessage(whatsappData)
      console.log('📱 Recordatorio enviado:', whatsappResult)
      
      // Abrir WhatsApp automáticamente
      window.open(whatsappResult.url, '_blank')
    }
  }

  const handleFinalizarTurno = async (turnoId) => {
    if (window.confirm('¿Confirmar que el turno ha sido finalizado?')) {
      await actualizarTurno(turnoId, { estado: 'finalizado' })
    }
  }

  // Verificar si el usuario es admin
  if (user?.role !== 'admin') {
    console.log('User not admin, returning null')
    return null
  }

  console.log('TurnosAdmin render - User:', user)
  console.log('TurnosAdmin render - Turnos:', turnos)
  console.log('TurnosAdmin render - Loading:', loading)

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Test message */}
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        ✅ Página de Administración de Turnos cargada correctamente
      </div>
      
             <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
         <p>Debug Info:</p>
         <p>• User Role: {user?.role || 'No user'}</p>
         <p>• Total Turnos: {turnos?.length || 0}</p>
         <p>• Turnos Filtrados: {filteredTurnos?.length || 0}</p>
         <p>• Loading: {loading?.toString()}</p>
         <p>• Selected Date: {selectedDate?.toString()}</p>
       </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Administración de Turnos
        </h1>
        <div className="text-sm text-gray-600">
          {format(selectedDate, 'EEEE dd/MM/yyyy', { locale: es })}
        </div>
      </div>

      {/* Date selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Seleccionar fecha</h2>
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => {
            // Corregir problema de zona horaria - usar la fecha directamente
            const dateValue = e.target.value
            const [year, month, day] = dateValue.split('-')
            const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            console.log('Date changed from:', selectedDate, 'to:', newDate, 'input value:', dateValue)
            setSelectedDate(newDate)
          }}
          className="border border-gray-300 rounded px-3 py-2 max-w-xs"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pendientes')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'pendientes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Turnos Pendientes ({turnosPendientes.length})
          </button>
          <button
            onClick={() => setActiveTab('finalizados')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'finalizados'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Turnos Finalizados ({turnosFinalizados.length})
          </button>
        </div>
      </div>

      {/* Turnos list */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          {activeTab === 'pendientes' ? 'Turnos Pendientes y Confirmados' : 'Turnos Finalizados'} para el {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando turnos...</p>
          </div>
                 ) : filteredTurnos.length === 0 ? (
           <div className="text-center py-8">
             <p className="text-gray-600">
               {activeTab === 'pendientes' ? 'No hay turnos pendientes' : 'No hay turnos finalizados'} para esta fecha
             </p>
           </div>
         ) : (
           <div className="space-y-4">
             {filteredTurnos.map((turno) => (
              <div key={turno._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                                         <div className="flex items-center space-x-4 mb-2">
                       <span className="font-semibold text-lg">{turno.horario || 'Sin horario'}</span>
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(turno.estado)}`}>
                         {turno.estado || 'Sin estado'}
                       </span>
                     </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">{turno.cliente?.nombre || `${turno.nombre || ''} ${turno.apellido || ''}` || 'Sin nombre'}</p>
                        <p className="text-gray-600">WhatsApp: {turno.cliente?.telefono || turno.whatsapp || 'No disponible'}</p>
                        <p className="text-gray-600">Vehículo: {turno.vehiculo?.patente || turno.patente || 'No disponible'} - {turno.vehiculo?.modelo || turno.modelo || 'No disponible'}</p>
                        <p className="text-gray-600">Sucursal: {turno.sucursal || 'No especificada'}</p>
                      </div>
                      <div>
                        <p className="font-medium">{turno.servicio || 'Servicio no especificado'}</p>
                        <p className="text-gray-600">Puntos: {turno.puntosServicio || 0}</p>
                        <p className="text-gray-600">Creado: {turno.fechaCreacion ? new Date(turno.fechaCreacion).toLocaleDateString() : 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                                     <div className="flex space-x-2">
                     <button
                       onClick={() => handleEdit(turno)}
                       className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                     >
                       Editar
                     </button>
                     {activeTab === 'pendientes' && turno.estado === 'pendiente' && (
                       <>
                         <button
                           onClick={() => handleConfirmarTurno(turno._id)}
                           className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                         >
                           Confirmar
                         </button>
                         <button
                           onClick={() => handleEnviarRecordatorio(turno._id)}
                           className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                         >
                           Recordatorio
                         </button>
                       </>
                     )}
                     {activeTab === 'pendientes' && turno.estado === 'confirmado' && (
                       <button
                         onClick={() => handleFinalizarTurno(turno._id)}
                         className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                       >
                         Finalizar
                       </button>
                     )}
                     <button
                       onClick={() => handleDelete(turno._id)}
                       className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                     >
                       Eliminar
                     </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
                 )}
       </div>

       {/* Edit Modal */}
       {showEditForm && editingTurno && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <h2 className="text-2xl font-bold mb-6">Editar Turno</h2>
             <form onSubmit={handleUpdate} className="space-y-4">
               <div className="grid md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Fecha
                   </label>
                   <input
                     type="date"
                     name="fecha"
                     defaultValue={editingTurno.fecha}
                     required
                     className="border border-gray-300 rounded px-3 py-2 w-full"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Horario
                   </label>
                   <input
                     type="time"
                     name="horario"
                     defaultValue={editingTurno.horario}
                     required
                     className="border border-gray-300 rounded px-3 py-2 w-full"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Servicio
                 </label>
                 <input
                   type="text"
                   name="servicio"
                   defaultValue={editingTurno.servicio}
                   required
                   className="border border-gray-300 rounded px-3 py-2 w-full"
                 />
               </div>

               <div className="grid md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Nombre
                   </label>
                   <input
                     type="text"
                     name="nombre"
                     defaultValue={editingTurno.cliente?.nombre || editingTurno.nombre}
                     required
                     className="border border-gray-300 rounded px-3 py-2 w-full"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Apellido
                   </label>
                   <input
                     type="text"
                     name="apellido"
                     defaultValue={editingTurno.cliente?.apellido || editingTurno.apellido}
                     required
                     className="border border-gray-300 rounded px-3 py-2 w-full"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   WhatsApp
                 </label>
                 <input
                   type="tel"
                   name="whatsapp"
                   defaultValue={editingTurno.cliente?.telefono || editingTurno.whatsapp}
                   required
                   className="border border-gray-300 rounded px-3 py-2 w-full"
                 />
               </div>

               <div className="grid md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Patente
                   </label>
                   <input
                     type="text"
                     name="patente"
                     defaultValue={editingTurno.vehiculo?.patente || editingTurno.patente}
                     required
                     className="border border-gray-300 rounded px-3 py-2 w-full"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Modelo
                   </label>
                   <input
                     type="text"
                     name="modelo"
                     defaultValue={editingTurno.vehiculo?.modelo || editingTurno.modelo}
                     required
                     className="border border-gray-300 rounded px-3 py-2 w-full"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Estado
                 </label>
                                   <select name="estado" defaultValue={editingTurno.estado} className="border border-gray-300 rounded px-3 py-2 w-full">
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
               </div>

               <div className="flex justify-end space-x-4 pt-4">
                 <button
                   type="button"
                   onClick={() => setShowEditForm(false)}
                   className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                   type="submit" 
                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                 >
                   Guardar Cambios
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   )
 }

export default TurnosAdmin 