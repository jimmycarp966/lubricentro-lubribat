@echo off
echo ========================================
echo    CLOUDFLARE TUNNEL PARA SINCRONIZACIÓN
echo ========================================
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
echo Iniciando Cloudflare Tunnel...
echo.
echo IMPORTANTE: 
echo - Mantén esta ventana abierta
echo - Copia la URL HTTPS que aparezca
echo - Actualiza el código con esa URL
echo.

.\cloudflared.exe tunnel --url http://localhost:5000

echo.
echo Tunnel detenido.
pause
