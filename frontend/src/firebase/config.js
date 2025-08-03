import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Configuración de Firebase (reemplaza con tus credenciales reales)
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "lubricentro-app.firebaseapp.com",
  databaseURL: "https://lubricentro-app-default-rtdb.firebaseio.com",
  projectId: "lubricentro-app",
  storageBucket: "lubricentro-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Obtener la instancia de Realtime Database
export const database = getDatabase(app)

export default app 