import { ref, set, get } from 'firebase/database'
import { database } from '../firebase/config'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase/config'

// Crear usuario admin
export const createAdminUser = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@lubricentro.com',
      'admin123'
    )
    
    await updateProfile(userCredential.user, {
      displayName: 'Administrador'
    })
    
    // Guardar en Firebase Database
    await set(ref(database, `users/${userCredential.user.uid}`), {
      email: 'admin@lubricentro.com',
      nombre: 'Administrador',
      role: 'admin',
      createdAt: new Date().toISOString()
    })
    
    console.log('✅ Usuario admin creado exitosamente')
    return { success: true }
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️ El usuario admin ya existe')
      return { success: true }
    }
    console.error('❌ Error creando usuario admin:', error)
    return { success: false, error: error.message }
  }
}

// Crear usuario mayorista de prueba
export const createMayoristaUser = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'mayorista@test.com',
      'mayorista123'
    )
    
    await updateProfile(userCredential.user, {
      displayName: 'Mayorista Test'
    })
    
    // Guardar en Firebase Database
    await set(ref(database, `users/${userCredential.user.uid}`), {
      email: 'mayorista@test.com',
      nombre: 'Mayorista Test',
      role: 'mayorista',
      empresa: 'Empresa Mayorista Test',
      telefono: '+54 9 381 123-4567',
      direccion: 'Av. Test 123, Monteros',
      createdAt: new Date().toISOString()
    })
    
    console.log('✅ Usuario mayorista creado exitosamente')
    return { success: true }
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️ El usuario mayorista ya existe')
      return { success: true }
    }
    console.error('❌ Error creando usuario mayorista:', error)
    return { success: false, error: error.message }
  }
}

// Crear productos simulados
export const createSimulatedProducts = async () => {
  try {
    const productosSimulados = [
      {
        _id: 'prod_001',
        nombre: 'Aceite de Motor 5W-30',
        descripcion: 'Aceite sintético de alta calidad para motores modernos',
        precio: 2500,
        stock: 50,
        categoria: 'Aceites',
        marca: 'CASTROL',
        codigo: 'AM-5W30-001'
      },
      {
        _id: 'prod_002',
        nombre: 'Aceite de Motor 10W-40',
        descripcion: 'Aceite mineral para motores convencionales',
        precio: 1800,
        stock: 30,
        categoria: 'Aceites',
        marca: 'SHELL',
        codigo: 'AM-10W40-002'
      },
      {
        _id: 'prod_003',
        nombre: 'Filtro de Aceite',
        descripcion: 'Filtro de aceite de alta eficiencia',
        precio: 800,
        stock: 100,
        categoria: 'Filtros',
        marca: 'MANN FILTER',
        codigo: 'FA-001'
      },
      {
        _id: 'prod_004',
        nombre: 'Filtro de Aire',
        descripcion: 'Filtro de aire para motor',
        precio: 600,
        stock: 80,
        categoria: 'Filtros',
        marca: 'FRAM',
        codigo: 'FA-002'
      },
      {
        _id: 'prod_005',
        nombre: 'Líquido de Frenos DOT 4',
        descripcion: 'Líquido de frenos de alto punto de ebullición',
        precio: 1200,
        stock: 40,
        categoria: 'Líquidos',
        marca: 'FERCOL',
        codigo: 'LB-DOT4-001'
      },
      {
        _id: 'prod_006',
        nombre: 'Anticongelante Verde',
        descripcion: 'Anticongelante de larga duración',
        precio: 1500,
        stock: 25,
        categoria: 'Líquidos',
        marca: 'WEGA',
        codigo: 'AC-VERDE-001'
      },
      {
        _id: 'prod_007',
        nombre: 'Aceite de Transmisión ATF',
        descripcion: 'Aceite para transmisiones automáticas',
        precio: 3000,
        stock: 20,
        categoria: 'Aceites',
        marca: 'YPF',
        codigo: 'AT-ATF-001'
      },
      {
        _id: 'prod_008',
        nombre: 'Grasa Multipropósito',
        descripcion: 'Grasa de alta temperatura para múltiples aplicaciones',
        precio: 900,
        stock: 60,
        categoria: 'Grasas',
        marca: 'SHELL',
        codigo: 'GM-001'
      }
    ]

    // Guardar productos en Firebase
    for (const producto of productosSimulados) {
      await set(ref(database, `productos/${producto._id}`), {
        ...producto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    
    console.log('✅ Productos simulados creados exitosamente')
    return { success: true }
  } catch (error) {
    console.error('❌ Error creando productos simulados:', error)
    return { success: false, error: error.message }
  }
}

// Verificar si existe usuario admin
export const checkAdminUser = async () => {
  try {
    const adminRef = ref(database, 'users')
    const snapshot = await get(adminRef)
    
    if (snapshot.exists()) {
      const users = snapshot.val()
      const adminUser = Object.values(users).find(user => user.role === 'admin')
      return !!adminUser
    }
    
    return false
  } catch (error) {
    console.error('❌ Error verificando usuario admin:', error)
    return false
  }
}

// Verificar si existe usuario mayorista
export const checkMayoristaUser = async () => {
  try {
    const usersRef = ref(database, 'users')
    const snapshot = await get(usersRef)
    
    if (snapshot.exists()) {
      const users = snapshot.val()
      const mayoristaUser = Object.values(users).find(user => user.role === 'mayorista')
      return !!mayoristaUser
    }
    
    return false
  } catch (error) {
    console.error('❌ Error verificando usuario mayorista:', error)
    return false
  }
}

// Inicializar todos los datos de prueba
export const initializeTestData = async () => {
  try {
    console.log('🚀 Inicializando datos de prueba...')
    
    // Crear usuarios de prueba
    await createAdminUser()
    await createMayoristaUser()
    
    // Crear productos simulados
    await createSimulatedProducts()
    
    console.log('✅ Datos de prueba inicializados correctamente')
    return { success: true }
  } catch (error) {
    console.error('❌ Error inicializando datos de prueba:', error)
    return { success: false, error: error.message }
  }
} 