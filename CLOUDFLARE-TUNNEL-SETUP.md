# Configuración de Cloudflare Tunnel para Sincronización

## Estado Actual
✅ **URL del Backend**: `https://comply-scotia-advertisements-specialist.trycloudflare.com`
✅ **Backend**: Funcionando correctamente
✅ **Código**: Actualizado con la URL de Cloudflare
✅ **Git**: Cambios subidos a Vercel

## Cómo Usar

### 1. Mantener el Backend Corriendo
```bash
cd backend
node server.js
```

### 2. Mantener Cloudflare Tunnel Corriendo
```bash
.\cloudflared.exe tunnel --url http://localhost:5000
```

### 3. Probar desde Vercel
1. Ve a tu página web en Vercel
2. Inicia sesión como administrador
3. Ve al Panel de Administración → Sincronización
4. Prueba "Sincronizar Todo"

## Scripts Disponibles

### Inicio Automático Completo
```bash
start-complete-sync-system.bat
```

### Solo Cloudflare Tunnel
```bash
start-cloudflare-tunnel.bat
```

## Ventajas de Cloudflare Tunnel
- ✅ Más estable que ngrok o localtunnel
- ✅ URL HTTPS automática
- ✅ Sin problemas de autenticación
- ✅ Mejor rendimiento
- ✅ Gratuito y sin límites

## Información Importante
- **URL actual**: `https://comply-scotia-advertisements-specialist.trycloudflare.com`
- **Esta URL cambiará** si reinicias Cloudflare Tunnel
- **Para URL fija**: Considera usar un dominio personalizado
- **Mantén las ventanas abiertas** mientras uses la sincronización

## Datos que se Sincronizan
- **Productos**: Todos los productos del sistema legacy
- **Ventas**: Solo las del 4 y 5 de agosto de 2025
- **Clientes**: Todos los clientes del sistema legacy
- **Origen**: Todos marcados como "legacy_sync"
