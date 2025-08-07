@echo off
echo ========================================
echo    REINICIANDO SISTEMA DE SINCRONIZACIÓN
echo ========================================
echo.

echo Paso 1: Deteniendo procesos existentes...
taskkill /f /im node.exe > nul 2>&1
taskkill /f /im cloudflared.exe > nul 2>&1

echo.
echo Paso 2: Esperando que los procesos se detengan...
timeout /t 3 /nobreak > nul

echo.
echo Paso 3: Iniciando backend...
cd backend
start "Backend Server" cmd /k "node server.js"
cd ..

echo.
echo Paso 4: Esperando que el backend esté listo...
timeout /t 5 /nobreak > nul

echo.
echo Paso 5: Verificando que el backend esté funcionando...
curl -s http://localhost:5000/api/health > nul
if %errorlevel% neq 0 (
    echo ERROR: El backend no está respondiendo
    echo Esperando más tiempo...
    timeout /t 10 /nobreak > nul
)

echo.
echo Paso 6: Iniciando Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k ".\cloudflared.exe tunnel --url http://localhost:5000"

echo.
echo Paso 7: Esperando que el tunnel esté listo...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo    SISTEMA REINICIADO
echo ========================================
echo.
echo Backend: http://localhost:5000
echo URL Pública: https://comply-scotia-advertisements-specialist.trycloudflare.com
echo.
echo Instrucciones:
echo 1. Espera unos segundos más para que todo esté listo
echo 2. Ve a tu página web en Vercel
echo 3. Inicia sesión como administrador
echo 4. Ve al Panel de Administración -> Sincronización
echo 5. Prueba "Sincronizar Todo"
echo.
echo IMPORTANTE: Mantén las ventanas de backend y tunnel abiertas
echo.
pause
