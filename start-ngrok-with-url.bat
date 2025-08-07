@echo off
echo Iniciando ngrok para exponer el backend...
echo.

REM Verificar que el backend esté corriendo
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
echo Iniciando ngrok...
echo.
echo IMPORTANTE: Cuando aparezca la URL HTTPS, cópiala y actualiza el código.
echo.

REM Iniciar ngrok y mostrar la URL
.\ngrok.exe http 5000 --log=stdout

echo.
echo Si ngrok no funciona, puedes:
echo 1. Descargar ngrok manualmente desde https://ngrok.com
echo 2. O usar un servicio como Railway/Render para el backend
pause
