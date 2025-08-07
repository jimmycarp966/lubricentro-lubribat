# Sincronización Automática con Sistema Legacy

## Opciones Disponibles

### 1. **Sincronización Manual (Actual)**
- Ve al Panel de Administración → Sincronización
- Usa los botones para sincronizar manualmente
- Control total sobre cuándo sincronizar

### 2. **Sincronización Automática por Monitoreo de Archivos**
- **Activar**: Ve al Panel de Administración → Sincronización → Activar
- **Funcionamiento**: Monitorea cambios en los archivos DBF del sistema legacy
- **Ventaja**: Sincroniza automáticamente cuando detecta cambios
- **Desventaja**: Requiere que el servidor esté corriendo

### 3. **Sincronización Programada (Recomendado)**
- **Configuración**: Usar el Programador de Tareas de Windows
- **Frecuencia**: Cada 30 minutos o según necesidad
- **Archivo**: `auto-sync.bat`

## Configuración del Programador de Tareas

### Paso 1: Abrir Programador de Tareas
1. Presiona `Win + R`
2. Escribe `taskschd.msc`
3. Presiona Enter

### Paso 2: Crear Tarea Básica
1. Click derecho en "Biblioteca del Programador de Tareas"
2. Seleccionar "Crear tarea básica"
3. Nombre: "Sincronización Lubricentro"
4. Descripción: "Sincroniza datos del sistema legacy"

### Paso 3: Configurar Disparador
1. Seleccionar "Diariamente"
2. Configurar hora de inicio (ej: 8:00 AM)
3. Repetir cada: 30 minutos
4. Duración: Sin límite

### Paso 4: Configurar Acción
1. Seleccionar "Iniciar un programa"
2. Programa/script: `D:\Daniel\Paginas\Lubricentro\auto-sync.bat`
3. Iniciar en: `D:\Daniel\Paginas\Lubricentro`

### Paso 5: Finalizar
1. Revisar configuración
2. Marcar "Abrir las propiedades de esta tarea"
3. Click en "Finalizar"

### Paso 6: Configuración Avanzada
1. En la pestaña "General":
   - Marcar "Ejecutar con los privilegios más altos"
   - Configurar para "Ejecutar independientemente de si el usuario ha iniciado sesión"

2. En la pestaña "Condiciones":
   - Desmarcar "Iniciar la tarea solo si el equipo está conectado a CA"
   - Marcar "Iniciar la tarea solo si el equipo está inactivo"

3. En la pestaña "Configuración":
   - Marcar "Permitir que la tarea se ejecute a petición"
   - Marcar "Si la tarea falla, reiniciar cada: 5 minutos"
   - Intentar hasta: 3 veces

## Monitoreo y Logs

### Verificar Estado
- Ve al Panel de Administración → Sincronización
- Revisa el estado de la sincronización automática
- Verifica las estadísticas de datos sincronizados

### Logs del Sistema
- Los logs se guardan en la consola del servidor
- Revisar la carpeta `backend/logs/` (si existe)
- Verificar eventos del Programador de Tareas en Windows

## Solución de Problemas

### Error: "No se puede acceder al archivo"
- Verificar que la ruta `D:\Daniel\Visual\Sistema` existe
- Confirmar permisos de lectura en los archivos DBF

### Error: "Conexión a MongoDB fallida"
- Verificar que MongoDB esté corriendo
- Revisar configuración de conexión en `backend/server.js`

### Error: "Token de autenticación inválido"
- Verificar que el servidor backend esté corriendo
- Revisar configuración de JWT en el backend

## Recomendaciones

1. **Frecuencia de Sincronización**: 
   - Durante horario comercial: Cada 30 minutos
   - Fuera de horario: Cada 2 horas

2. **Monitoreo**:
   - Revisar logs semanalmente
   - Verificar estadísticas en el panel de administración

3. **Backup**:
   - Mantener copias de seguridad de los archivos DBF
   - Hacer backup de la base de datos MongoDB regularmente

4. **Notificaciones**:
   - Configurar alertas por email en caso de errores
   - Implementar notificaciones por WhatsApp para eventos importantes
