import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

// 🔥 Configuración real de Firebase para Lubricentro
const firebaseConfig = {
  apiKey: "AIzaSyBBHW56sDJ5VmXh3S0NM439zUWPpLJFFVA",
  authDomain: "lubricentro-app.firebaseapp.com",
  databaseURL: "https://lubricentro-app-default-rtdb.firebaseio.com",
  projectId: "lubricentro-app",
  storageBucket: "lubricentro-app.firebasestorage.app",
  messagingSenderId: "641217777553",
  appId: "1:641217777553:web:611859db45b98e0cb6d430",
  measurementId: "G-RYL0Y9ZC61"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Obtener las instancias de servicios
export const database = getDatabase(app)
export const auth = getAuth(app)

export default app 