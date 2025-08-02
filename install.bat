@echo off
echo ========================================
echo    INSTALADOR LUBRICENTRO MONTEROS
echo ========================================
echo.

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo [2/5] Instalando dependencias del backend...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del backend
    pause
    exit /b 1
)
echo ✅ Dependencias del backend instaladas

echo.
echo [3/5] Instalando dependencias del frontend...
cd ../frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del frontend
    pause
    exit /b 1
)
echo ✅ Dependencias del frontend instaladas

echo.
echo [4/5] Configurando variables de entorno...
cd ../backend
if not exist .env (
    copy env.example .env
    echo ✅ Archivo .env creado
) else (
    echo ✅ Archivo .env ya existe
)

echo.
echo [5/5] Inicializando base de datos...
npm run init-db
if %errorlevel% neq 0 (
    echo ⚠️  Error inicializando la base de datos. Asegúrate de que MongoDB esté ejecutándose
)

echo.
echo ========================================
echo    ✅ INSTALACIÓN COMPLETADA
echo ========================================
echo.
echo Para iniciar el sistema:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo URLs de acceso:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
echo Credenciales de prueba:
echo   Admin: admin@lubricentro.com / admin123
echo   Mayorista: mayorista@test.com / mayorista123
echo.
pause 