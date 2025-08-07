# Instrucciones para Actualizar URL Pública

## Paso 1: Obtener URL de ngrok
1. Ejecuta: `.\ngrok.exe http 5000`
2. Copia la URL HTTPS que aparece (ej: https://abc123.ngrok.io)

## Paso 2: Actualizar el código
Reemplaza esta línea en `frontend/src/components/admin/LegacySync.jsx`:

```javascript
const API_BASE = 'http://localhost:5000/api';
```

Por:

```javascript
const API_BASE = 'https://TU-URL-DE-NGROK/api';
```

## Paso 3: Subir cambios
```bash
git add .
git commit -m "Configurar URL pública del backend"
git push
```

## Paso 4: Probar
1. Ve a tu página web en Vercel
2. Inicia sesión como administrador
3. Ve al Panel de Administración → Sincronización
4. Prueba "Sincronizar Todo"

## Nota importante
- La URL de ngrok cambia cada vez que lo reinicias
- Para una solución permanente, considera usar Railway o Render
