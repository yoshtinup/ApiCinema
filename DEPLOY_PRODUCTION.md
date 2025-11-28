# 🚀 Deploy a Producción - Corrección MercadoPago

## 📋 Comandos para Actualizar Producción

Ejecuta estos comandos en tu servidor EC2 (ubuntu@ip-172-31-30-209):

```bash
# 1. Ir al directorio del proyecto
cd ~/ApiCinema

# 2. Verificar branch actual
git branch

# 3. Asegurarse de estar en master y obtener últimos cambios
git fetch origin
git reset --hard origin/master

# 4. Verificar que el archivo tiene los cambios correctos
head -n 70 v1/Services/Infrestructura/adapters/Services/PaymentService.js | tail -n 20

# 5. Parar PM2 completamente
pm2 stop cinesnacks-api

# 6. Eliminar instancia anterior
pm2 delete cinesnacks-api

# 7. Limpiar caché de Node.js
rm -rf node_modules/.cache

# 8. Reiniciar la aplicación con PM2
pm2 start server.js --name cinesnacks-api

# 9. Verificar que esté corriendo
pm2 status

# 10. Ver los logs en tiempo real
pm2 logs cinesnacks-api --lines 50
```

## 🔍 Verificación de Cambios

El archivo `PaymentService.js` debe tener este código (alrededor de línea 49-66):

```javascript
const mpItem = {
  id: String(item.idproducto || item.product_id || item.id),
  title: item.nombre || item.name || 'Producto',
  quantity: quantity,
  unit_price: unitPrice,
  currency_id: 'MXN'
};

// Solo agregar campos opcionales si tienen valor
if (item.descripcion || item.description) {
  mpItem.description = item.descripcion || item.description;
}

if (item.imagen || item.image) {
  mpItem.picture_url = item.imagen || item.image;
}

return mpItem;
```

Y alrededor de línea 70-82 debe tener:

```javascript
// Crear preferencia
const preferenceData = {
  items: mpItems,
  back_urls: {
    success: `${process.env.FRONTEND_URL || 'https://cinesnacks.chuy7x.space'}/payment-success`,
    failure: `${process.env.FRONTEND_URL || 'https://cinesnacks.chuy7x.space'}/payment-failure`,
    pending: `${process.env.FRONTEND_URL || 'https://cinesnacks.chuy7x.space'}/payment-pending`
  },
  auto_return: 'approved',
  external_reference: `USER_${user_id}_${Date.now()}`,
  statement_descriptor: 'CINESNACKS'
};
```

## ⚠️ Si `git pull` dice "Already up to date"

Eso es CORRECTO. Los cambios ya están en el servidor. El problema es que PM2 está usando código cacheado.

La solución es:
1. **Eliminar la instancia de PM2 completamente** (`pm2 delete`)
2. **Iniciar una nueva instancia** (`pm2 start`)

NO uses solo `pm2 restart` porque mantiene el código en memoria.

## ✅ Prueba Después del Deploy

Una vez reiniciado, prueba desde el frontend:
1. Ir a la página de pago
2. Hacer clic en "Pagar"
3. Verificar en los logs: `pm2 logs cinesnacks-api`

Deberías ver:
```
📝 Creando preferencia de MercadoPago: { items_count: 2, total: '103.00', user_id: 4 }
✅ Preferencia creada: [ID de MercadoPago]
```

Y NO deberías ver:
```
❌ Error creando preferencia de MercadoPago: { message: 'Bad JSON format', ... }
```

## 🎯 Commit Actual en Producción

El commit correcto es: `9e8b7a2 - solving bad format json`

Verifica con:
```bash
git log --oneline -1
```

Debe mostrar: `9e8b7a2 (HEAD -> master, origin/master) solving bad format json`
