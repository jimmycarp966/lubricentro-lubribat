@echo off
echo ========================================
echo    SISTEMA COMPLETO DE SINCRONIZACIÓN
echo ========================================
echo.

echo Paso 1: Iniciando backend...
cd backend
start "Backend Server" cmd /k "node server.js"
cd ..

echo.
echo Paso 2: Esperando que el backend esté listo...
timeout /t 5 /nobreak > nul

echo.
echo Paso 3: Verificando que el backend esté funcionando...
curl -s http://localhost:5000/api/health > nul
if %errorlevel% neq 0 (
    echo ERROR: El backend no está respondiendo
    echo Esperando más tiempo...
    timeout /t 10 /nobreak > nul
)

echo.
echo Paso 4: Iniciando Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k ".\cloudflared.exe tunnel --url http://localhost:5000"

echo.
echo Paso 5: Esperando que el tunnel esté listo...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo    SISTEMA LISTO PARA SINCRONIZACIÓN
echo ========================================
echo.
echo Backend: http://localhost:5000
echo.
echo Instrucciones:
echo 1. En la ventana de Cloudflare Tunnel, copia la URL HTTPS
echo 2. Actualiza el código con esa URL
echo 3. Ve a tu página web en Vercel
echo 4. Inicia sesión como administrador
echo 5. Ve al Panel de Administración -> Sincronización
echo 6. Prueba "Sincronizar Todo"
echo.
echo IMPORTANTE: Mantén las ventanas de backend y tunnel abiertas
echo.
pause
