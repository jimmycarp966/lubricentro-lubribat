@echo off
echo ========================================
echo    LUBRI-BAT - Iniciando Servidores
echo ========================================
echo.

REM Configurar PATH para Node.js
set PATH=%PATH%;C:\Program Files\nodejs

REM Verificar si MongoDB está corriendo
echo Verificando MongoDB...
netstat -an | findstr :27017 >nul
if %errorlevel% neq 0 (
    echo MongoDB no está corriendo. Iniciando...
    start "MongoDB" cmd /k "mongod"
    timeout /t 3 /nobreak >nul
) else (
    echo MongoDB ya está corriendo.
)

REM Iniciar Backend
echo.
echo Iniciando Backend...
cd /d "D:\Daniel\Paginas\Lubricentro\backend"
start "Backend Server" cmd /k "npm start"

REM Esperar un momento para que el backend inicie
timeout /t 3 /nobreak >nul

REM Iniciar Frontend
echo.
echo Iniciando Frontend...
cd /d "D:\Daniel\Paginas\Lubricentro\frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo    ¡Servidores iniciados!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul 