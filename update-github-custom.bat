@echo off
echo.
echo ========================================
echo    🚀 ACTUALIZANDO GITHUB - LUBRI-BAT
echo ========================================
echo.

echo 📝 Agregando archivos modificados...
git add .

echo.
echo 💬 ¿Qué cambios hiciste? (escribe un mensaje descriptivo)
echo    Ejemplo: "Mejoré la versión móvil" o "Agregué nueva funcionalidad"
echo.
set /p commit_message="Mensaje del commit: "

echo.
echo 💬 Creando commit con tu mensaje...
git commit -m "🔄 %commit_message% - %date% %time%"

echo.
echo 📤 Subiendo a GitHub...
git push

echo.
echo ✅ ¡Actualización completada!
echo 🌐 Repositorio: https://github.com/jimmycarp966/lubricentro-lubribat
echo.
echo ⏰ Vercel se actualizará automáticamente en 1-2 minutos
echo.

pause 