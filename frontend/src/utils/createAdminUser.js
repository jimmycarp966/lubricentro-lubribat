import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { ref, set } from 'firebase/database'
import { auth, database } from '../firebase/config'

// Función para crear usuario admin
export const createAdminUser = async () => {
  try {
    console.log('🔧 Creando usuario admin...')
    
    // Datos del admin
    const adminEmail = 'admin@lubribat.com'
    const adminPassword = 'admin123456'
    const adminName = 'Administrador'
    
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword)
    const user = userCredential.user
    
    // Actualizar perfil con nombre
    await updateProfile(user, {
      displayName: adminName
    })
    
    // Crear registro de admin en la base de datos
    const adminRef = ref(database, `users/${user.uid}`)
    await set(adminRef, {
      uid: user.uid,
      email: adminEmail,
      displayName: adminName,
      role: 'admin',
      createdAt: Date.now(),
      isActive: true
    })
    
    console.log('✅ Usuario admin creado exitosamente:')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Contraseña:', adminPassword)
    console.log('👤 Nombre:', adminName)
    console.log('🔐 UID:', user.uid)
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: adminEmail,
        displayName: adminName,
        role: 'admin'
      }
    }
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error)
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ El usuario admin ya existe')
      return {
        success: false,
        error: 'El usuario admin ya existe',
        code: 'ALREADY_EXISTS'
      }
    }
    
    return {
      success: false,
      error: error.message
    }
  }
}

// Función para verificar si existe un usuario admin
export const checkAdminUser = async () => {
  try {
    console.log('🔍 Verificando si existe usuario admin...')
    
    const adminEmail = 'admin@lubribat.com'
    
    // Intentar iniciar sesión para verificar si existe
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, 'admin123456')
      console.log('✅ Usuario admin existe')
      
      // Cerrar sesión inmediatamente
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
      
      return {
        exists: true,
        user: userCredential.user
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ Usuario admin no existe')
        return {
          exists: false
        }
      } else if (error.code === 'auth/wrong-password') {
        console.log('⚠️ Usuario admin existe pero contraseña incorrecta')
        return {
          exists: true,
          wrongPassword: true
        }
      }
      throw error
    }
  } catch (error) {
    console.error('❌ Error verificando usuario admin:', error)
    return {
      exists: false,
      error: error.message
    }
  }
} 