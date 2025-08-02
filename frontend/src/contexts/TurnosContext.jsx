import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const TurnosContext = createContext()

export const useTurnos = () => {
  const context = useContext(TurnosContext)
  if (!context) {
    throw new Error('useTurnos debe ser usado dentro de un TurnosProvider')
  }
  return context
}

export const TurnosProvider = ({ children }) => {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(false)

  // Datos simulados de turnos
  const turnosSimulados = [
    {
      _id: '1',
      fecha: '2024-01-15',
      horario: '09:00',
      servicio: 'Cambio de Aceite',
      cliente: {
        nombre: 'Juan Pérez',
        telefono: '+5493815123456',
        email: 'juan@email.com'
      },
      vehiculo: {
        patente: 'ABC123',
        modelo: 'Toyota Corolla 2020'
      },
      estado: 'confirmado',
      createdAt: '2024-01-10T10:00:00.000Z'
    },
    {
      _id: '2',
      fecha: '2024-01-16',
      horario: '14:30',
      servicio: 'Revisión General',
      cliente: {
        nombre: 'María González',
        telefono: '+5493815987654',
        email: 'maria@email.com'
      },
      vehiculo: {
        patente: 'XYZ789',
        modelo: 'Ford Focus 2019'
      },
      estado: 'pendiente',
      createdAt: '2024-01-11T15:30:00.000Z'
    }
  ]

  // Cargar turnos desde localStorage o usar datos simulados
  useEffect(() => {
    setLoading(true)
    const turnosGuardados = localStorage.getItem('turnos')
    
    if (turnosGuardados) {
      setTurnos(JSON.parse(turnosGuardados))
    } else {
      // Primera vez: usar datos simulados
      setTurnos(turnosSimulados)
      localStorage.setItem('turnos', JSON.stringify(turnosSimulados))
    }
    
    setLoading(false)
  }, [])

  // Guardar turnos en localStorage cuando cambien
  useEffect(() => {
    if (turnos.length > 0) {
      localStorage.setItem('turnos', JSON.stringify(turnos))
    }
  }, [turnos])

  const crearTurno = async (turnoData) => {
    try {
      const nuevoTurno = {
        _id: Date.now().toString(),
        ...turnoData,
        estado: 'pendiente',
        createdAt: new Date().toISOString()
      }
      setTurnos(prev => [...prev, nuevoTurno])
      toast.success('Turno creado correctamente')
      return { success: true }
    } catch (error) {
      toast.error('Error al crear turno')
      return { success: false, error: error.message }
    }
  }

  const fetchTurnos = async () => {
    try {
      setLoading(true)
      const turnosGuardados = localStorage.getItem('turnos')
      
      if (turnosGuardados) {
        setTurnos(JSON.parse(turnosGuardados))
      } else {
        // Primera vez: usar datos simulados
        setTurnos(turnosSimulados)
        localStorage.setItem('turnos', JSON.stringify(turnosSimulados))
      }
      
      setLoading(false)
      return { success: true }
    } catch (error) {
      setLoading(false)
      toast.error('Error al cargar turnos')
      return { success: false, error: error.message }
    }
  }

  const actualizarTurno = async (id, turnoData) => {
    try {
      setTurnos(prev => prev.map(t => t._id === id ? { ...t, ...turnoData } : t))
      toast.success('Turno actualizado correctamente')
      return { success: true }
    } catch (error) {
      toast.error('Error al actualizar turno')
      return { success: false, error: error.message }
    }
  }

  const eliminarTurno = async (id) => {
    try {
      setTurnos(prev => prev.filter(t => t._id !== id))
      toast.success('Turno eliminado correctamente')
      return { success: true }
    } catch (error) {
      toast.error('Error al eliminar turno')
      return { success: false, error: error.message }
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      setTurnos(prev => prev.map(t => t._id === id ? { ...t, estado: nuevoEstado } : t))
      toast.success('Estado del turno actualizado')
      return { success: true }
    } catch (error) {
      toast.error('Error al cambiar estado')
      return { success: false, error: error.message }
    }
  }

  const value = {
    turnos,
    loading,
    fetchTurnos,
    crearTurno,
    actualizarTurno,
    eliminarTurno,
    cambiarEstado
  }

  return (
    <TurnosContext.Provider value={value}>
      {children}
    </TurnosContext.Provider>
  )
} 