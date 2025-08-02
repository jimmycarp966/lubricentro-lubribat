@echo off
echo ========================================
echo    LUBRI-BAT - Deteniendo Servidores
echo ========================================
echo.

REM Detener procesos de Node.js
echo Deteniendo procesos de Node.js...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo Procesos de Node.js detenidos.
) else (
    echo No se encontraron procesos de Node.js.
)

REM Detener MongoDB
echo.
echo Deteniendo MongoDB...
taskkill /f /im mongod.exe 2>nul
if %errorlevel% equ 0 (
    echo MongoDB detenido.
) else (
    echo No se encontró MongoDB corriendo.
)

REM Detener procesos de Vite
echo.
echo Deteniendo Vite...
taskkill /f /im vite.exe 2>nul
if %errorlevel% equ 0 (
    echo Vite detenido.
) else (
    echo No se encontró Vite corriendo.
)

echo.
echo ========================================
echo    ¡Todos los servidores detenidos!
echo ========================================
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul 