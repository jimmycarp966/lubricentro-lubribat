@echo off
echo Iniciando frontend localmente para probar sincronización...
echo.
echo Instrucciones:
echo 1. Se abrirá el navegador automáticamente
echo 2. Inicia sesión como administrador
echo 3. Ve al Panel de Administración -> Sincronización
echo 4. Prueba "Sincronizar Todo"
echo.
echo URL: http://localhost:5173
echo.
pause

cd frontend
npm run dev
