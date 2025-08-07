@echo off
echo ========================================
echo    SISTEMA DE SINCRONIZACIÓN LEGACY
echo ========================================
echo.

echo Paso 1: Iniciando backend...
cd backend
start "Backend Server" cmd /k "node server.js"
cd ..

echo.
echo Paso 2: Esperando que el backend esté listo...
timeout /t 3 /nobreak > nul

echo.
echo Paso 3: Iniciando localtunnel...
start "Localtunnel" cmd /k "lt --port 5000 --subdomain lubricentro-backend"

echo.
echo Paso 4: Esperando que localtunnel esté listo...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo    SISTEMA LISTO PARA SINCRONIZACIÓN
echo ========================================
echo.
echo Backend: http://localhost:5000
echo URL Pública: https://lubricentro-backend.loca.lt
echo.
echo Instrucciones:
echo 1. Ve a tu página web en Vercel
echo 2. Inicia sesión como administrador
echo 3. Ve al Panel de Administración -> Sincronización
echo 4. Prueba "Sincronizar Todo"
echo.
echo IMPORTANTE: Mantén las ventanas de backend y localtunnel abiertas
echo.
pause
