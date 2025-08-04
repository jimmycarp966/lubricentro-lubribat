import { ref, get, set } from 'firebase/database'
import { database } from '../firebase/config'

export const checkAndCreateMayoristaUser = async () => {
  try {
    console.log('🔍 Verificando usuario mayorista en Firebase...')
    
    // Buscar el usuario mayorista por email
    const usersRef = ref(database, 'users')
    const snapshot = await get(usersRef)
    
    if (snapshot.exists()) {
      const users = snapshot.val()
      const mayoristaUser = Object.values(users).find(user => 
        user.email === 'mayorista@test.com'
      )
      
      if (mayoristaUser) {
        console.log('✅ Usuario mayorista encontrado:', mayoristaUser)
        return { exists: true, user: mayoristaUser }
      }
    }
    
    // Si no existe, crear el usuario mayorista
    console.log('🔄 Creando usuario mayorista...')
    
    const mayoristaData = {
      email: 'mayorista@test.com',
      nombre: 'Mayorista Test',
      role: 'mayorista',
      empresa: 'Empresa Mayorista Test',
      direccion: 'Av. Test 123, Monteros',
      telefono: '+54 9 381 123-4567',
      createdAt: new Date().toISOString(),
      activo: true
    }
    
    // Crear una nueva referencia para el usuario
    const newUserRef = ref(database, `users/mayorista_test`)
    await set(newUserRef, mayoristaData)
    
    console.log('✅ Usuario mayorista creado exitosamente')
    return { exists: false, created: true, user: mayoristaData }
    
  } catch (error) {
    console.error('❌ Error verificando/creando usuario mayorista:', error)
    return { exists: false, error: error.message }
  }
}

export const verifyMayoristaInFirebase = async () => {
  try {
    console.log('🔍 Verificando usuarios en Firebase...')
    
    const usersRef = ref(database, 'users')
    const snapshot = await get(usersRef)
    
    if (snapshot.exists()) {
      const users = snapshot.val()
      console.log('📋 Usuarios encontrados en Firebase:')
      Object.entries(users).forEach(([key, user]) => {
        console.log(`  - ${key}: ${user.email} (${user.role})`)
      })
      
      const mayoristaUser = Object.values(users).find(user => 
        user.email === 'mayorista@test.com'
      )
      
      if (mayoristaUser) {
        console.log('✅ Mayorista encontrado:', mayoristaUser)
        return true
      } else {
        console.log('❌ Mayorista no encontrado')
        return false
      }
    } else {
      console.log('❌ No hay usuarios en Firebase')
      return false
    }
  } catch (error) {
    console.error('❌ Error verificando usuarios:', error)
    return false
  }
} 