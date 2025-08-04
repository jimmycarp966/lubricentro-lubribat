import { ref, get, query, orderByChild, equalTo, push, set } from 'firebase/database'
import { database } from '../firebase/config'

// Buscar cliente por WhatsApp
export const buscarClientePorWhatsApp = async (whatsapp) => {
  try {
    console.log('🔍 Buscando cliente por WhatsApp:', whatsapp)
    
    // Buscar en turnos por WhatsApp
    const turnosRef = ref(database, 'turnos')
    const snapshot = await get(turnosRef)
    
    console.log('📊 Total de turnos en Firebase:', snapshot.numChildren())
    
    if (snapshot.exists()) {
      const turnos = []
      snapshot.forEach((childSnapshot) => {
        const turno = childSnapshot.val()
        console.log('🔍 Revisando turno:', turno)
        console.log('📱 WhatsApp del turno:', turno.cliente?.whatsapp)
        console.log('🔍 WhatsApp buscado:', whatsapp)
        
        if (turno.cliente && turno.cliente.whatsapp === whatsapp) {
          console.log('✅ Coincidencia encontrada!')
          turnos.push({
            id: childSnapshot.key,
            ...turno
          })
        }
      })
      
      if (turnos.length > 0) {
        // Agrupar por cliente
        const cliente = {
          whatsapp: whatsapp,
          nombre: turnos[0].cliente.nombre,
          vehiculos: [],
          historial: turnos.map(turno => ({
            fecha: turno.fecha,
            servicio: turno.servicio,
            sucursal: turno.sucursal,
            patente: turno.cliente.patente,
            estado: turno.estado,
            total: turno.total || 0
          }))
        }
        
        // Extraer vehículos únicos
        const vehiculosUnicos = new Map()
        turnos.forEach(turno => {
          if (turno.cliente.patente && turno.cliente.modelo) {
            vehiculosUnicos.set(turno.cliente.patente, {
              patente: turno.cliente.patente,
              modelo: turno.cliente.modelo
            })
          }
        })
        cliente.vehiculos = Array.from(vehiculosUnicos.values())
        
        // Calcular estadísticas
        cliente.totalTurnos = turnos.length
        cliente.ultimaVisita = turnos[0].fecha
        cliente.primeraVisita = turnos[turnos.length - 1].fecha
        
        console.log('✅ Cliente encontrado:', cliente)
        return cliente
      }
    }
    
    console.log('❌ Cliente no encontrado')
    return null
  } catch (error) {
    console.error('❌ Error buscando cliente por WhatsApp:', error)
    return null
  }
}

// Buscar cliente por patente
export const buscarClientePorPatente = async (patente) => {
  try {
    console.log('🔍 Buscando cliente por patente:', patente)
    
    // Buscar en turnos por patente
    const turnosRef = ref(database, 'turnos')
    const snapshot = await get(turnosRef)
    
    console.log('📊 Total de turnos en Firebase:', snapshot.numChildren())
    
    if (snapshot.exists()) {
      const turnos = []
      snapshot.forEach((childSnapshot) => {
        const turno = childSnapshot.val()
        console.log('🔍 Revisando turno:', turno)
        console.log('🚗 Patente del turno:', turno.cliente?.patente)
        console.log('🔍 Patente buscada:', patente)
        
        if (turno.cliente && turno.cliente.patente && 
            turno.cliente.patente.toUpperCase() === patente.toUpperCase()) {
          console.log('✅ Coincidencia encontrada!')
          turnos.push({
            id: childSnapshot.key,
            ...turno
          })
        }
      })
      
      if (turnos.length > 0) {
        // Agrupar por cliente
        const cliente = {
          whatsapp: turnos[0].cliente.whatsapp,
          nombre: turnos[0].cliente.nombre,
          vehiculos: [],
          historial: turnos.map(turno => ({
            fecha: turno.fecha,
            servicio: turno.servicio,
            sucursal: turno.sucursal,
            patente: turno.cliente.patente,
            estado: turno.estado,
            total: turno.total || 0
          }))
        }
        
        // Extraer vehículos únicos
        const vehiculosUnicos = new Map()
        turnos.forEach(turno => {
          if (turno.cliente.patente && turno.cliente.modelo) {
            vehiculosUnicos.set(turno.cliente.patente, {
              patente: turno.cliente.patente,
              modelo: turno.cliente.modelo
            })
          }
        })
        cliente.vehiculos = Array.from(vehiculosUnicos.values())
        
        // Calcular estadísticas
        cliente.totalTurnos = turnos.length
        cliente.ultimaVisita = turnos[0].fecha
        cliente.primeraVisita = turnos[turnos.length - 1].fecha
        
        console.log('✅ Cliente encontrado por patente:', cliente)
        return cliente
      }
    }
    
    console.log('❌ Cliente no encontrado por patente')
    return null
  } catch (error) {
    console.error('❌ Error buscando cliente por patente:', error)
    return null
  }
}

// Obtener todos los clientes (para admin)
export const obtenerTodosLosClientes = async () => {
  try {
    console.log('👥 Obteniendo todos los clientes...')
    
    const turnosRef = ref(database, 'turnos')
    const snapshot = await get(turnosRef)
    
    if (snapshot.exists()) {
      const clientesMap = new Map()
      
      snapshot.forEach((childSnapshot) => {
        const turno = childSnapshot.val()
        if (turno.cliente && turno.cliente.whatsapp) {
          const whatsapp = turno.cliente.whatsapp
          
          if (!clientesMap.has(whatsapp)) {
            clientesMap.set(whatsapp, {
              whatsapp,
              nombre: turno.cliente.nombre,
              vehiculos: [],
              historial: [],
              totalTurnos: 0,
              ultimaVisita: turno.fecha,
              primeraVisita: turno.fecha
            })
          }
          
          const cliente = clientesMap.get(whatsapp)
          cliente.historial.push({
            fecha: turno.fecha,
            servicio: turno.servicio,
            sucursal: turno.sucursal,
            patente: turno.cliente.patente,
            estado: turno.estado,
            total: turno.total || 0
          })
          cliente.totalTurnos++
          
          // Actualizar fechas
          if (new Date(turno.fecha) > new Date(cliente.ultimaVisita)) {
            cliente.ultimaVisita = turno.fecha
          }
          if (new Date(turno.fecha) < new Date(cliente.primeraVisita)) {
            cliente.primeraVisita = turno.fecha
          }
          
          // Agregar vehículo si no existe
          if (turno.cliente.patente && turno.cliente.modelo) {
            const vehiculoExiste = cliente.vehiculos.some(v => v.patente === turno.cliente.patente)
            if (!vehiculoExiste) {
              cliente.vehiculos.push({
                patente: turno.cliente.patente,
                modelo: turno.cliente.modelo
              })
            }
          }
        }
      })
      
      const clientes = Array.from(clientesMap.values())
      console.log(`✅ ${clientes.length} clientes encontrados`)
      return clientes
    }
    
    return []
  } catch (error) {
    console.error('❌ Error obteniendo clientes:', error)
    return []
  }
}

// Guardar cliente al crear turno
export const guardarClienteEnTurno = async (turnoData) => {
  try {
    console.log('💾 Guardando datos del cliente en turno:', turnoData)
    
    // Los datos del cliente ya están incluidos en turnoData
    // No necesitamos hacer nada adicional porque el turno ya se guarda
    // con toda la información del cliente
    
    return { success: true }
  } catch (error) {
    console.error('❌ Error guardando cliente:', error)
    return { success: false, error: error.message }
  }
} 