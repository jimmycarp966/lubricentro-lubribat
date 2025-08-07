@echo off
echo ========================================
echo    CONFIGURAR TUNNEL FIJO
echo ========================================
echo.

echo IMPORTANTE: Para una URL fija, necesitas:
echo 1. Un dominio personalizado (ej: lubricentro.com)
echo 2. O usar Railway/Render para desplegar el backend
echo.

echo Opciones disponibles:
echo.
echo 1. Configurar Cloudflare Tunnel con subdominio personalizado
echo 2. Desplegar en Railway (Recomendado)
echo 3. Desplegar en Render
echo 4. Usar URL temporal (se cambia cada vez)
echo.

set /p choice="Selecciona una opción (1-4): "

if "%choice%"=="1" goto :personalized
if "%choice%"=="2" goto :railway
if "%choice%"=="3" goto :render
if "%choice%"=="4" goto :temporary
goto :end

:personalized
echo.
echo Configurando Cloudflare Tunnel con subdominio personalizado...
echo.
set /p domain="Ingresa tu dominio (ej: lubricentro.com): "
echo.
echo Ejecutando: .\cloudflared.exe tunnel --url http://localhost:5000 --hostname api.%domain%
echo.
.\cloudflared.exe tunnel --url http://localhost:5000 --hostname api.%domain%
goto :end

:railway
echo.
echo Para desplegar en Railway:
echo 1. Ve a https://railway.app
echo 2. Crea una cuenta gratuita
echo 3. Conecta tu repositorio de GitHub
echo 4. Configura el directorio raíz como 'backend'
echo 5. Agrega las variables de entorno
echo.
echo Una vez desplegado, actualiza el código con la URL fija.
echo.
pause
goto :end

:render
echo.
echo Para desplegar en Render:
echo 1. Ve a https://render.com
echo 2. Crea una cuenta gratuita
echo 3. Crea un nuevo "Web Service"
echo 4. Conecta tu repositorio de GitHub
echo 5. Configura el directorio raíz como 'backend'
echo.
echo Una vez desplegado, actualiza el código con la URL fija.
echo.
pause
goto :end

:temporary
echo.
echo Usando URL temporal...
echo URL actual: https://bands-anxiety-switches-airlines.trycloudflare.com
echo.
echo IMPORTANTE: Esta URL cambiará cada vez que reinicies Cloudflare Tunnel
echo.
.\cloudflared.exe tunnel --url http://localhost:5000
goto :end

:end
echo.
echo Configuración completada.
pause
