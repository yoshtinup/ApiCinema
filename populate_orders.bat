@echo off
echo 📊 Poblando base de datos con datos de prueba para Analytics...
echo.

echo Conectando a MySQL y ejecutando script de inserción...
mysql -u yosh2 -p basecine < "database\seed_orders_data.sql"

if %errorlevel% == 0 (
    echo.
    echo ✅ ÉXITO: Se han insertado 60+ órdenes de prueba
    echo.
    echo 📈 Datos generados:
    echo    • 60+ órdenes distribuidas en 6 meses
    echo    • 11 usuarios únicos activos
    echo    • 5 productos diferentes
    echo    • Rangos de precios: $10-$100
    echo    • Estados: dispensed, paid, pending, cancelled
    echo    • Dispensador único: Dispensador_001
    echo.
    echo 🎯 Ya puedes probar tu sistema de analytics en:
    echo    GET /api/v1/statistics/dashboard?period=month
    echo.
) else (
    echo.
    echo ❌ ERROR: No se pudo ejecutar el script
    echo Verifica tu conexión a MySQL y que la base de datos 'apicinema' exista
    echo.
)

pause
