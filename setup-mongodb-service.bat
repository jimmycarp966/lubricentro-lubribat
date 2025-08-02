@echo off
echo ========================================
echo    Configurando MongoDB como Servicio
echo ========================================
echo.

REM Verificar si MongoDB está instalado
echo Verificando instalación de MongoDB...
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB no está instalado o no está en el PATH.
    echo Instalando MongoDB...
    winget install MongoDB.Server
    echo.
    echo Por favor, reinicia tu computadora después de la instalación.
    pause
    exit /b 1
)

REM Crear directorio de datos si no existe
echo Creando directorio de datos...
if not exist "C:\data\db" mkdir "C:\data\db"

REM Configurar MongoDB como servicio
echo.
echo Configurando MongoDB como servicio de Windows...
mongod --install --dbpath "C:\data\db" --logpath "C:\data\mongodb.log"

REM Iniciar el servicio
echo.
echo Iniciando servicio de MongoDB...
net start MongoDB

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    ¡MongoDB configurado exitosamente!
    echo ========================================
    echo.
    echo MongoDB ahora se iniciará automáticamente con Windows.
    echo.
) else (
    echo.
    echo Error al configurar MongoDB como servicio.
    echo Intenta ejecutar como administrador.
    echo.
)

echo Presiona cualquier tecla para continuar...
pause >nul 