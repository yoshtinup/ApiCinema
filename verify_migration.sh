#!/bin/bash

# Script para verificar y aplicar migración de external_reference

echo "======================================"
echo "🔍 Verificando estructura de tabla orders"
echo "======================================"
echo ""

# Configuración (ajustar según tu entorno)
DB_USER="root"
DB_NAME="cine_snacks"
DB_HOST="localhost"

echo "📋 Conectando a base de datos..."
echo ""

# Verificar si existe el campo external_reference
COLUMN_EXISTS=$(mysql -u $DB_USER -p $DB_NAME -se "SHOW COLUMNS FROM orders LIKE 'external_reference';" 2>/dev/null)

if [ -z "$COLUMN_EXISTS" ]; then
    echo "❌ Campo 'external_reference' NO existe en tabla orders"
    echo ""
    echo "🔧 Aplicando migración..."
    mysql -u $DB_USER -p $DB_NAME < database/migrations/add_external_reference_to_orders.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Migración aplicada exitosamente"
    else
        echo "❌ Error al aplicar migración"
        exit 1
    fi
else
    echo "✅ Campo 'external_reference' YA existe en tabla orders"
fi

echo ""
echo "📊 Estructura actual de tabla orders:"
echo ""
mysql -u $DB_USER -p $DB_NAME -e "DESCRIBE orders;"

echo ""
echo "======================================"
echo "✅ Verificación completa"
echo "======================================"
