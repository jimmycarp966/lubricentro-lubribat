@echo off
echo Iniciando localtunnel para exponer el backend...
echo.
echo Verificando que el backend esté corriendo...
curl -s http://localhost:5000/api/health > nul
if %errorlevel% neq 0 (
    echo ERROR: El backend no está corriendo en puerto 5000
    echo Por favor inicia el backend primero con: cd backend && node server.js
    pause
    exit /b 1
)

echo Backend detectado correctamente.
echo.
echo Iniciando localtunnel...
echo URL pública: https://lubricentro-backend.loca.lt
echo.
echo IMPORTANTE: Mantén esta ventana abierta para que funcione la conexión
echo.

lt --port 5000 --subdomain lubricentro-backend

echo.
echo localtunnel detenido.
pause
