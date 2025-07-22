# Archivo con ejemplos de cURL para probar el endpoint

# 1. Actualizar orden a "dispensed" (dispensado)
curl -X PUT "https://apiempresacinesnack.acstree.xyz/api/v1/pago/nfc/ABC123/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "dispensed"}'

# 2. Actualizar orden a "cancelled" (cancelado)
curl -X PUT "https://apiempresacinesnack.acstree.xyz/api/v1/pago/nfc/ABC123/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "cancelled"}'

# 3. Probar con un NFC que no existe (debería devolver error 404)
curl -X PUT "https://apiempresacinesnack.acstree.xyz/api/v1/pago/nfc/INVALID_NFC/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "dispensed"}'

# 4. Probar con un status inválido (debería devolver error 400)
curl -X PUT "https://apiempresacinesnack.acstree.xyz/api/v1/pago/nfc/ABC123/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "invalid_status"}'

# 5. Para desarrollo local (si tienes el servidor corriendo localmente)
curl -X PUT "http://localhost:3002/api/v1/pago/nfc/ABC123/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "dispensed"}'
