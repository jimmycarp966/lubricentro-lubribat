@echo off
echo.
echo ========================================
echo    🚀 ACTUALIZANDO GITHUB - LUBRI-BAT
echo ========================================
echo.

echo 📝 Agregando archivos modificados...
git add .

echo.
echo 💬 Creando commit...
git commit -m "🔄 Actualización automática - %date% %time%"

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