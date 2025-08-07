@echo off
echo Iniciando ngrok para exponer el backend...
echo.
echo Instrucciones:
echo 1. Se abrirá una ventana de ngrok
echo 2. Copia la URL HTTPS que aparece (ej: https://abc123.ngrok.io)
echo 3. Reemplaza 'https://tu-dominio-publico.com' en el código con esa URL
echo 4. Sube los cambios al Git
echo.
pause

REM Intentar iniciar ngrok
ngrok http 5000

echo.
echo Si ngrok no funciona, puedes:
echo 1. Instalar ngrok manualmente desde https://ngrok.com
echo 2. O usar un servicio como Railway/Render para el backend
pause
