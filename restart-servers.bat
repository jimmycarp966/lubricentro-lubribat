@echo off
echo ========================================
echo    LUBRI-BAT - Reiniciando Servidores
echo ========================================
echo.

REM Detener servidores primero
echo Deteniendo servidores actuales...
call "%~dp0stop-servers.bat"

REM Esperar un momento
echo.
echo Esperando 3 segundos...
timeout /t 3 /nobreak >nul

REM Iniciar servidores
echo.
echo Reiniciando servidores...
call "%~dp0start-servers.bat" 