import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '../firebase/config'

// Proveedor de Google
const googleProvider = new GoogleAuthProvider()

// Registro con email y contraseña
export const registerWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Actualizar perfil con nombre
    await updateProfile(user, {
      displayName: displayName
    })
    
    return { success: true, user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Login con email y contraseña
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Login con Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return { success: true, user: result.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Recuperar contraseña
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Escuchar cambios en el estado de autenticación
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Obtener usuario actual
export const getCurrentUser = () => {
  return auth.currentUser
}

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!auth.currentUser
} 