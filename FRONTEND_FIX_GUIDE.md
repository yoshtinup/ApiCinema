# 🛒 Integración Frontend MercadoPago - CORREGIDO

## 🎯 PROBLEMA Y SOLUCIÓN
Tu backend está funcionando perfectamente, pero hay **3 errores críticos en el frontend** que causan el error 404 y "Bad JSON format".

## 🚨 ERROR PRINCIPAL: URL INCORRECTA (404)
Tu frontend envía: `https://cinesnacksapi.chuy7x.space/payment/create-preference`
Debe ser: `https://cinesnacksapi.chuy7x.space/api/v1/payment/create-preference`

## ⚠️ ERRORES DETECTADOS

### Error 1: ❌ URL INCORRECTA - 404 ERROR
- ❌ **Frontend usa**: `/payment/create-preference`
- ✅ **URL correcta**: `/api/v1/payment/create-preference`

### Error 2: Nombres de campos incorrectos
- ❌ **Frontend envía**: `{ userId: 4 }`
- ✅ **Backend espera**: `{ user_id: 4 }`

### Error 3: Estructura de respuesta mal manejada
- ❌ **Frontend busca**: `data.preferenceId` y `data.init_point`
- ✅ **Backend devuelve**: `data.success` y `data.data.init_point`

## 🔧 CÓDIGO CORREGIDO PARA FRONTEND

### 1. BodyPago.jsx - VERSIÓN CORREGIDA

```javascript
const handlePayment = async () => {
  try {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(); // Tu función existente
    
    console.log('🔄 Enviando request con user_id:', userId);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/payment/create-preference`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // ✅ CORREGIDO: user_id (no userId)
      body: JSON.stringify({ user_id: userId })
    });

    const data = await response.json();
    console.log('📦 Respuesta del servidor:', data);
    
    // ✅ CORREGIDO: data.success y data.data.init_point
    if (data.success && data.data && data.data.init_point) {
      console.log('✅ Redirigiendo a MercadoPago:', data.data.init_point);
      window.location.href = data.data.init_point;
    } else {
      console.error('❌ Respuesta inválida:', data);
      // Mostrar error al usuario
    }
  } catch (error) {
    console.error('❌ Error en handlePayment:', error);
    // Mostrar error al usuario
  }
};
```

### 2. PaymentSuccess.jsx - VERSIÓN CORREGIDA

```javascript
import { useEffect } from 'react';

const PaymentSuccess = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_id');
    const status = urlParams.get('status');
    const merchantOrderId = urlParams.get('merchant_order_id');

    console.log('🔍 Parámetros de URL:', { paymentId, status, merchantOrderId });

    if (paymentId && status === 'approved') {
      completePayment(paymentId, status, merchantOrderId);
    }
  }, []);

  const completePayment = async (paymentId, status, merchantOrderId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken();
      
      console.log('🔄 Completando pago con datos:', { userId, paymentId, status, merchantOrderId });
      
      const response = await fetch(`${API_BASE_URL}/api/v1/payment/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // ✅ CORREGIDO: user_id, payment_id, merchant_order_id (no camelCase)
        body: JSON.stringify({ 
          user_id: userId, 
          payment_id: paymentId, 
          status: status, 
          merchant_order_id: merchantOrderId 
        })
      });

      const result = await response.json();
      console.log('📦 Resultado de completar pago:', result);
      
      if (result.success) {
        console.log('✅ Pago completado exitosamente');
        // Mostrar mensaje de éxito
        // Limpiar carrito local si tienes
        // Redirigir a historial de órdenes
      } else {
        console.error('❌ Error completando pago:', result);
      }
    } catch (error) {
      console.error('❌ Error en completePayment:', error);
    }
  };

  return (
    <div>
      <h2>¡Pago Exitoso!</h2>
      <p>Tu pago ha sido procesado correctamente.</p>
    </div>
  );
};

export default PaymentSuccess;
```

## 📡 ENDPOINTS CORRECTOS

### Crear Preferencia de Pago
```
POST /api/v1/payment/create-preference
Headers: { 
  'Authorization': 'Bearer ' + userToken,
  'Content-Type': 'application/json' 
}
Body: { "user_id": 4 }  // ✅ user_id (no userId)
Response: { 
  "success": true,
  "data": {
    "preferenceId": "string",
    "init_point": "string"
  }
}
```

### Completar Pago
```
POST /api/v1/payment/complete
Headers: { 
  'Authorization': 'Bearer ' + userToken,
  'Content-Type': 'application/json' 
}
Body: { 
  "user_id": 4,
  "payment_id": "string", 
  "status": "approved", 
  "merchant_order_id": "string" 
}
Response: { 
  "success": true,
  "data": { "orderId": "string" }
}
```

## 🔧 CONFIGURACIÓN apiConfig.js

```javascript
// Producción
const API_BASE_URL = 'https://cinesnacksapi.chuy7x.space:3002';

// Desarrollo local  
// const API_BASE_URL = 'http://localhost:3002';

export { API_BASE_URL };
```

## 🚀 PASOS PARA ARREGLAR

1. **🔥 CRÍTICO - Agregar /api/v1 a las URLs**: 
   - `/payment/create-preference` → `/api/v1/payment/create-preference`
   - `/payment/complete` → `/api/v1/payment/complete`
2. **Cambiar nombres de campos**: `userId` → `user_id`, `paymentId` → `payment_id`, etc.
3. **Corregir manejo de respuesta**: `data.preferenceId` → `data.data.init_point`
4. **Agregar logs para debugging**: Como se muestra en los ejemplos
5. **Validar estructura de respuesta**: Verificar `data.success` antes de acceder a `data.data`

## ✅ VALIDACIONES IMPORTANTES

- ✅ Usuario debe tener items en el carrito
- ✅ Token de autenticación válido en localStorage
- ✅ user_id debe extraerse correctamente del token
- ✅ Verificar que `data.success === true` antes de procesar
- ✅ Manejar errores de red y respuestas del servidor

## 🔍 DEBUGGING PASO A PASO

1. **Verificar request**: Console debe mostrar "🔄 Enviando request con user_id: 4"
2. **Verificar respuesta**: Console debe mostrar "📦 Respuesta del servidor: {...}"
3. **Verificar estructura**: `data.success` debe ser `true` y `data.data` debe existir
4. **Verificar redirección**: Debe redirigir a URL de MercadoPago

## 🎯 EJEMPLO DE RESPUESTA CORRECTA

```javascript
// Lo que devuelve el backend:
{
  "success": true,
  "data": {
    "preferenceId": "1234567890-abcd-1234-abcd-123456789012",
    "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890-abcd-1234-abcd-123456789012"
  }
}

// Cómo accederlo en frontend:
if (data.success && data.data) {
  window.location.href = data.data.init_point; // ✅ CORRECTO
}
```

---

## 📊 ESTADO ACTUAL

**✅ BACKEND**: Completamente funcional, corriendo en puerto 3002
- ✅ Rutas `/api/v1/payment/*` configuradas correctamente
- ✅ PaymentService optimizado (removidos campos opcionales que causaban problemas)
- ✅ MercadoPago SDK inicializado con token de producción
- ✅ Logs detallados para debugging

**🔧 FRONTEND**: Necesita estos cambios específicos para funcionar
- ✅ URL correcta: `/api/v1/payment/create-preference` (ya corregido en los logs)
- ✅ Payload correcto: `{ user_id: 4 }` (ya corregido en los logs)  
- 🔄 Pendiente: Manejo de respuesta `data.data.init_point`

**Con estos cambios, la integración funcionará perfectamente.** 🚀

## 🔍 SI AÚN HAY ERRORES

Si después de aplicar los cambios aún hay error "Bad JSON format", verifica:
1. **Carrito no vacío**: El usuario debe tener productos en el carrito
2. **Stock disponible**: Los productos deben tener stock > 0
3. **Precios válidos**: Los productos deben tener precio > 0
4. **Token válido**: El token JWT debe estar vigente (no expirado)