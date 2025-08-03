# Configuración de Firebase para Lubricentro

## Paso 1: Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombre del proyecto: `lubricentro-app`
4. Desactiva Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

## Paso 2: Configurar Realtime Database

1. En el panel de Firebase, ve a "Realtime Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (para desarrollo)
4. Selecciona la ubicación más cercana (ej: `us-central1`)
5. Haz clic en "Listo"

## Paso 3: Obtener configuración

1. En el panel de Firebase, ve a "Configuración del proyecto" (ícono de engranaje)
2. Ve a la pestaña "General"
3. Desplázate hacia abajo hasta "Tus apps"
4. Haz clic en el ícono de web (</>)
5. Registra tu app con el nombre "Lubricentro Web"
6. Copia la configuración que aparece

## Paso 4: Actualizar configuración en el código

Reemplaza la configuración en `src/firebase/config.js` con tus credenciales reales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "lubricentro-app.firebaseapp.com",
  databaseURL: "https://lubricentro-app-default-rtdb.firebaseio.com",
  projectId: "lubricentro-app",
  storageBucket: "lubricentro-app.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
}
```

## Paso 5: Configurar reglas de seguridad

En Realtime Database > Reglas, actualiza las reglas:

```json
{
  "rules": {
    "turnos": {
      ".read": true,
      ".write": true
    },
    "notifications": {
      ".read": true,
      ".write": true
    }
  }
}
```

## Paso 6: Probar la conexión

1. Ejecuta `npm run dev`
2. Ve al panel de admin
3. Usa el botón "🧪 Crear Datos Prueba"
4. Verifica que aparezcan los datos en Firebase Console

## Notas importantes

- **Gratis**: Firebase tiene un plan gratuito generoso
- **Tiempo real**: Los datos se sincronizan automáticamente
- **Seguridad**: Las reglas actuales permiten lectura/escritura total (solo para desarrollo)
- **Producción**: Para producción, configura reglas más restrictivas

## Solución de problemas

### Error de conexión
- Verifica que la configuración sea correcta
- Asegúrate de que las reglas permitan lectura/escritura
- Revisa la consola del navegador para errores

### Datos no aparecen
- Verifica que Firebase esté inicializado correctamente
- Revisa los logs en la consola
- Usa el botón "🔍 Debug Completo" para diagnosticar

### Problemas de CORS
- Firebase maneja CORS automáticamente
- No se necesitan configuraciones adicionales 