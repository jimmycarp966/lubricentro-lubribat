@echo off
echo 🔧 Arreglando problemas del panel mayorista...

echo.
echo 📋 Pasos a seguir:
echo 1. Desplegar reglas de Firebase actualizadas
echo 2. Reiniciar servidores
echo 3. Verificar autenticación

echo.
echo 🔥 Desplegando reglas de Firebase...
cd frontend
firebase deploy --only database
cd ..

echo.
echo 🚀 Reiniciando servidores...
call stop-servers.bat
timeout /t 3 /nobreak >nul
call start-servers.bat

echo.
echo ✅ Proceso completado
echo.
echo 📝 Verificaciones:
echo - Asegúrate de estar logueado como mayorista
echo - Verifica que las reglas de Firebase se hayan desplegado
echo - Revisa la consola del navegador para errores
echo.
pause 