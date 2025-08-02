import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTurnos } from '../contexts/TurnosContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const TurnosAdmin = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { turnos, loading, fetchTurnos, actualizarTurno, eliminarTurno } = useTurnos()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editingTurno, setEditingTurno] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)

  // Filtrar turnos por fecha seleccionada
  const filteredTurnos = turnos.filter(turno => {
    // Usar directamente la fecha del turno sin crear un nuevo Date object
    // para evitar problemas de zona horaria
    const turnoDateStr = turno.fecha
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
    console.log('Filtering turno:', turno.fecha, 'vs selected:', selectedDateStr, 'match:', turnoDateStr === selectedDateStr)
    return turnoDateStr === selectedDateStr
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
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
            const newDate = new Date(e.target.value + 'T00:00:00')
            console.log('Date changed from:', selectedDate, 'to:', newDate, 'input value:', e.target.value)
            setSelectedDate(newDate)
          }}
          className="border border-gray-300 rounded px-3 py-2 max-w-xs"
        />
      </div>

      {/* Turnos list */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Turnos para el {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando turnos...</p>
          </div>
                 ) : filteredTurnos.length === 0 ? (
           <div className="text-center py-8">
             <p className="text-gray-600">No hay turnos para esta fecha</p>
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