@echo off
echo Iniciando sincronizacion automatica...
cd /d "D:\Daniel\Paginas\Lubricentro\backend"
node scripts/auto-sync.js
echo Sincronizacion completada.
pause
