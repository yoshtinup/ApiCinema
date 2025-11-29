# 🚀 Instrucciones de Deploy - Sistema de Pagos con Logs

## ⚠️ IMPORTANTE: Orden de Ejecución

Sigue estos pasos **EN ORDEN** para evitar errores:

---

## 1️⃣ Ejecutar Migración de Base de Datos

**🚨 ESTE PASO ES OBLIGATORIO ANTES DEL DEPLOY**

### Opción A: SSH al servidor de producción

```bash
# Conectar por SSH
ssh usuario@cinesnacksapi.chuy7x.space

# Conectar a MySQL
mysql -u root -p cine_snacks

# Ejecutar migración manualmente
ALTER TABLE orders 
ADD COLUMN external_reference VARCHAR(255) DEFAULT NULL,
ADD INDEX idx_external_reference (external_reference);

# Verificar
DESCRIBE orders;
# Deberías ver: external_reference | varchar(255) | YES | MUL | NULL |

# Salir de MySQL
exit;
```

### Opción B: Usando script de migración

```bash
# SSH al servidor
ssh usuario@cinesnacksapi.chuy7x.space

# Ir al directorio del proyecto
cd ~/ApiCinema

# Ejecutar el archivo de migración
mysql -u root -p cine_snacks < database/migrations/add_external_reference_to_orders.sql

# Verificar
mysql -u root -p cine_snacks -e "DESCRIBE orders;"
```

---

## 2️⃣ Deploy del Código Backend

```bash
# SSH al servidor (si no estás conectado)
ssh usuario@cinesnacksapi.chuy7x.space

# Ir al directorio del proyecto
cd ~/ApiCinema

# Hacer pull de los cambios
git pull origin master

# Verificar que los cambios se descargaron
ls -la LOGS_DIAGNOSTICO.md
# Debe existir el archivo

# Reiniciar PM2
pm2 restart cinesnacks-api

# Verificar que el servicio esté corriendo
pm2 status

# Ver logs en tiempo real
pm2 logs cinesnacks-api --lines 50
```

---

## 3️⃣ Verificar que Todo Funciona

### A. Verificar campo en BD

```bash
mysql -u root -p cine_snacks -e "SELECT external_reference FROM orders LIMIT 1;"
```

Si no da error, el campo existe ✅

### B. Verificar logs del servidor

```bash
pm2 logs cinesnacks-api --lines 100
```

Deberías ver:
```
✔  success   Server online on port 3002
```

### C. Probar endpoint de status

```bash
curl "https://cinesnacksapi.chuy7x.space:3002/api/v1/payment/status?external_reference=TEST&user_id=1"
```

Deberías recibir:
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "message": "Pago en proceso, por favor espera unos segundos",
    "order": null
  }
}
```

---

## 4️⃣ Probar Flujo Completo de Pago

### Paso 1: Crear pago desde frontend
1. Ir a https://cinesnacks.chuy7x.space
2. Agregar productos al carrito
3. Hacer clic en "Pagar"
4. Completar pago en MercadoPago (usar tarjeta de prueba)

### Paso 2: Monitorear logs en servidor

```bash
# Terminal 1: Ver todos los logs
pm2 logs cinesnacks-api

# Terminal 2: Ver solo polling
pm2 logs cinesnacks-api | grep "CHECK PAYMENT STATUS"

# Terminal 3: Ver solo webhooks
pm2 logs cinesnacks-api | grep "WEBHOOK"
```

### Paso 3: Verificar que aparezcan estos logs (en orden)

```
# 1. Creación de preferencia
📝 Creando preferencia de MercadoPago
✅ Preferencia creada (API directa): 1511044485-...

# 2. Polling del frontend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 [CHECK PAYMENT STATUS] Iniciando verificación
📋 Query params: { external_reference: 'USER_5_...', user_id: '5' }
⚠️ No se encontró ninguna orden con ese external_reference

# 3. Webhook de MercadoPago (puede o no llegar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📨 [WEBHOOK] Notificación recibida de MercadoPago
📦 Body completo: { "type": "payment", "data": { "id": "..." } }

# 4. Orden encontrada
✅ Orden encontrada: {
  order_id: 'ORDER_...',
  external_reference: 'USER_5_...',
  payment_status: 'approved'
}
```

---

## 🐛 Solución de Problemas

### Error: "Unknown column 'external_reference'"

**Causa:** No ejecutaste la migración de BD

**Solución:**
```bash
mysql -u root -p cine_snacks < ~/ApiCinema/database/migrations/add_external_reference_to_orders.sql
pm2 restart cinesnacks-api
```

---

### Error: "Cannot find module..."

**Causa:** Dependencias no instaladas

**Solución:**
```bash
cd ~/ApiCinema
npm install
pm2 restart cinesnacks-api
```

---

### Frontend va directo a error

**Causa:** Parámetros no se envían correctamente desde frontend

**Verificar en logs:**
```bash
pm2 logs cinesnacks-api | grep "Faltan parámetros"
```

**Solución:** Revisar que frontend esté enviando `external_reference` y `user_id` en la URL

---

### Webhook no llega

**Verificar en logs:**
```bash
pm2 logs cinesnacks-api | grep "WEBHOOK"
```

Si no hay logs de webhook después de 10 segundos del pago:

1. **Verificar URL en MercadoPago Dashboard:**
   - Debe ser: `https://cinesnacksapi.chuy7x.space:3002/webhooks/mercadopago?source=notification`

2. **Verificar firewall:**
   ```bash
   sudo ufw status
   # Puerto 3002 debe estar abierto
   ```

3. **Verificar que el servidor esté escuchando:**
   ```bash
   netstat -tulpn | grep 3002
   ```

**Nota:** El sistema funciona AUNQUE el webhook no llegue, gracias al polling.

---

## ✅ Checklist de Deploy

- [ ] Migración de BD ejecutada (`ALTER TABLE orders ADD COLUMN external_reference`)
- [ ] Campo verificado (`DESCRIBE orders` muestra `external_reference`)
- [ ] Código actualizado (`git pull`)
- [ ] PM2 reiniciado (`pm2 restart cinesnacks-api`)
- [ ] Servidor corriendo (`pm2 status` muestra "online")
- [ ] Logs visibles (`pm2 logs` muestra logs detallados)
- [ ] Endpoint `/status` responde correctamente (curl test exitoso)
- [ ] Pago de prueba completado exitosamente

---

## 📞 Si Todo Falla

```bash
# Ver logs de PM2 por si hay errores de sintaxis
pm2 logs cinesnacks-api --err --lines 50

# Ver logs del sistema
journalctl -u pm2-root -n 50

# Reiniciar todo desde cero
pm2 stop cinesnacks-api
pm2 delete cinesnacks-api
cd ~/ApiCinema
git pull
pm2 start server.js --name cinesnacks-api
pm2 save
```

---

¡Listo! Sigue estos pasos y tu sistema de pagos con logs detallados estará funcionando. 🎉
