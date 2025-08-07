# Desplegar Backend en Railway (Solución Permanente)

## Problema Actual
- ❌ URL de Cloudflare Tunnel cambia cada vez
- ❌ Necesitas mantener el servidor local corriendo
- ❌ No es una solución de producción

## Solución: Railway

### Ventajas de Railway
- ✅ **URL fija** que nunca cambia
- ✅ **Siempre disponible** (24/7)
- ✅ **Gratuito** para proyectos pequeños
- ✅ **Despliegue automático** desde Git
- ✅ **HTTPS automático**

### Pasos para Desplegar

#### 1. Crear cuenta en Railway
1. Ve a https://railway.app
2. Crea una cuenta gratuita
3. Conecta tu cuenta de GitHub

#### 2. Crear nuevo proyecto
1. Haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Selecciona tu repositorio: `jimmycarp966/lubricentro-lubribat`

#### 3. Configurar el proyecto
1. Railway detectará automáticamente que es un proyecto Node.js
2. En la configuración, establece:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

#### 4. Configurar variables de entorno
En Railway, ve a la pestaña "Variables" y agrega:
```
MONGODB_URI=mongodb+srv://lubricentro:lubricentro123@cluster0.mongodb.net/lubricentro?retryWrites=true&w=majority
JWT_SECRET=lubricentro-super-secret-jwt-key-2025
NODE_ENV=production
```

#### 5. Desplegar
1. Railway desplegará automáticamente
2. Obtendrás una URL fija como: `https://lubricentro-backend-production.up.railway.app`

#### 6. Actualizar el código
Una vez que tengas la URL fija, actualiza:
```javascript
const API_BASE = 'https://tu-url-railway.up.railway.app/api';
```

### Alternativa: Render
Si Railway no funciona, puedes usar Render:
1. Ve a https://render.com
2. Crea un nuevo "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura igual que Railway

## Beneficios de esta solución
- ✅ **URL fija** que nunca cambia
- ✅ **Siempre disponible**
- ✅ **No necesitas mantener servidor local**
- ✅ **Escalable**
- ✅ **Profesional**

¿Quieres que te ayude a configurar Railway o prefieres otra alternativa?
