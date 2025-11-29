# 🚨 CAMBIOS REQUERIDOS EN FRONTEND - URGENTE

## ❌ Problema Detectado en los Logs

```javascript
// ❌ ESTO ES LO QUE ESTÁ PASANDO AHORA (INCORRECTO):
📋 Body recibido: {
  "user_id": "5",
  "dispenser_id": "Dispensador Sala B"
}
📋 payment_id: undefined  // ⚠️ FALTA payment_id
❌ Falta payment_id
```

**El frontend está llamando a `POST /payment/complete` sin `payment_id`**, lo cual es incorrecto en el nuevo flujo.

---

## 🔄 Flujo VIEJO vs Flujo NUEVO

### ❌ Flujo VIEJO (el que tienes ahora - INCORRECTO)

```javascript
// ❌ NO USAR ESTE CÓDIGO
const handlePayment = async () => {
  try {
    // 1. Crear preferencia
    const preferenceResponse = await axios.post('/api/v1/payment/create-preference', {
      user_id: userId,
      dispenser_id: dispenserId
    });

    // 2. ❌ PROBLEMA: Llamar a /complete sin payment_id
    const completeResponse = await axios.post('/api/v1/payment/complete', {
      user_id: userId,
      dispenser_id: dispenserId
      // ❌ Falta payment_id: '...'
    });

    // 3. Abrir MercadoPago
    window.location.href = preferenceResponse.data.data.init_point;
  } catch (error) {
    console.error(error);
  }
};
```

### ✅ Flujo NUEVO (el que debes usar - CORRECTO)

```javascript
// ✅ USAR ESTE CÓDIGO
const handlePayment = async () => {
  try {
    // 1. Crear preferencia
    const preferenceResponse = await axios.post('/api/v1/payment/create-preference', {
      user_id: userId,
      dispenser_id: dispenserId
    });

    // 2. ✅ CORRECTO: NO llamar a /complete aquí
    // El pago se completará automáticamente cuando el usuario pague

    // 3. Guardar external_reference para usar en polling
    const externalReference = preferenceResponse.data.data.external_reference;
    localStorage.setItem('pending_external_reference', externalReference);

    // 4. Abrir MercadoPago directamente
    window.location.href = preferenceResponse.data.data.init_point;
  } catch (error) {
    console.error(error);
  }
};
```

---

## 📝 Cambios en el Botón de Pago

### ❌ ANTES (Incorrecto)

```jsx
// ❌ Cart.jsx o CartPage.jsx - FLUJO VIEJO
const handleCheckout = async () => {
  try {
    // Crear preferencia
    const response = await axios.post('/api/v1/payment/create-preference', {
      user_id: user.id,
      dispenser_id: selectedDispenser
    });

    // ❌ Completar pago ANTES de que el usuario pague
    await axios.post('/api/v1/payment/complete', {
      user_id: user.id,
      dispenser_id: selectedDispenser
    });

    // Abrir checkout
    window.location.href = response.data.data.init_point;
  } catch (error) {
    console.error(error);
  }
};
```

### ✅ DESPUÉS (Correcto)

```jsx
// ✅ Cart.jsx o CartPage.jsx - FLUJO NUEVO
const handleCheckout = async () => {
  try {
    // Crear preferencia
    const response = await axios.post('/api/v1/payment/create-preference', {
      user_id: user.id,
      dispenser_id: selectedDispenser
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // ✅ NO llamar a /complete aquí
    
    // Abrir checkout de MercadoPago
    window.location.href = response.data.data.init_point;
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    alert('Error al iniciar el pago. Intenta nuevamente.');
  }
};

return (
  <button onClick={handleCheckout}>
    Pagar con MercadoPago
  </button>
);
```

---

## 🎯 Componente PaymentSuccess.jsx (CON POLLING)

Este componente debe manejar el polling después de que MercadoPago redirige:

```jsx
// ✅ PaymentSuccess.jsx - COMPONENTE COMPLETO
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Procesando tu pago...');
  const [orderDetails, setOrderDetails] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 20; // 40 segundos máximo

  useEffect(() => {
    let intervalId = null;

    const checkPaymentStatus = async () => {
      try {
        const externalReference = searchParams.get('external_reference');
        const userId = searchParams.get('user_id');

        console.log('🔍 Verificando pago:', { externalReference, userId, attempt: attempts });

        if (!externalReference || !userId) {
          throw new Error('Faltan parámetros en la URL');
        }

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay sesión activa');
        }

        // ✅ Hacer polling al endpoint de status
        const response = await axios.get(
          'https://cinesnacksapi.chuy7x.space:3002/api/v1/payment/status',
          {
            params: { external_reference: externalReference, user_id: userId },
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        console.log('📊 Estado del pago:', response.data);

        if (response.data.success && response.data.data.order) {
          // ✅ ORDEN ENCONTRADA - PAGO EXITOSO
          if (intervalId) clearInterval(intervalId);
          setStatus('success');
          setMessage('¡Pago completado exitosamente!');
          setOrderDetails(response.data.data.order);

          setTimeout(() => navigate('/my-orders'), 3000);
        } else {
          // ⏳ AÚN PENDIENTE
          setAttempts(prev => prev + 1);
          
          if (attempts >= MAX_ATTEMPTS) {
            if (intervalId) clearInterval(intervalId);
            setStatus('timeout');
            setMessage('El pago está tomando más tiempo del esperado. Revisa tu correo o consulta tus pedidos más tarde.');
          }
        }
      } catch (error) {
        console.error('❌ Error verificando pago:', error);
        if (intervalId) clearInterval(intervalId);
        setStatus('error');
        setMessage(error.response?.data?.error || error.message || 'Error al verificar el pago');
      }
    };

    // Primera verificación inmediata
    checkPaymentStatus();

    // Luego verificar cada 2 segundos
    intervalId = setInterval(checkPaymentStatus, 2000);

    // Cleanup al desmontar
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [searchParams, navigate, attempts]);

  return (
    <div className="payment-success-container">
      {status === 'processing' && (
        <div className="processing">
          <div className="spinner"></div>
          <h2>Procesando tu pago...</h2>
          <p>Verificando estado del pago con MercadoPago</p>
          <p className="attempts">Intento {attempts}/{MAX_ATTEMPTS}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="success">
          <div className="success-icon">✅</div>
          <h2>¡Pago Exitoso!</h2>
          <p>{message}</p>
          {orderDetails && (
            <div className="order-details">
              <p><strong>Orden:</strong> #{orderDetails.order_id}</p>
              <p><strong>Total:</strong> ${parseFloat(orderDetails.total).toFixed(2)}</p>
              <p><strong>Estado:</strong> {orderDetails.status}</p>
            </div>
          )}
          <p className="redirect-msg">Redirigiendo a tus pedidos en 3 segundos...</p>
        </div>
      )}

      {status === 'timeout' && (
        <div className="timeout">
          <div className="timeout-icon">⏳</div>
          <h2>Pago en Proceso</h2>
          <p>{message}</p>
          <button onClick={() => navigate('/my-orders')}>Ver mis pedidos</button>
        </div>
      )}

      {status === 'error' && (
        <div className="error">
          <div className="error-icon">❌</div>
          <h2>Error al Procesar el Pago</h2>
          <p>{message}</p>
          <button onClick={() => navigate('/cart')}>Volver al carrito</button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
```

---

## 🗺️ Rutas en React Router

```jsx
// ✅ App.jsx o Routes.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaymentSuccess from './pages/PaymentSuccess';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/my-orders" element={<MyOrders />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 📋 Checklist de Cambios en Frontend

- [ ] **Eliminar** la llamada a `POST /payment/complete` del botón "Pagar"
- [ ] **Verificar** que solo se llame a `POST /payment/create-preference`
- [ ] **Crear** componente `PaymentSuccess.jsx` con sistema de polling
- [ ] **Configurar** ruta `/payment-success` en React Router
- [ ] **Probar** flujo completo:
  - Agregar productos al carrito
  - Hacer clic en "Pagar"
  - Completar pago en MercadoPago
  - Verificar que redirige a `/payment-success?external_reference=XXX&user_id=Y`
  - Verificar que el polling encuentra la orden
  - Verificar que redirige a `/my-orders`

---

## 🔍 Cómo Verificar que Funciona

### En el Browser Console (F12)

Deberías ver estos logs mientras hace polling:

```
🔍 Verificando pago: { externalReference: 'USER_5_1764399470368', userId: '5', attempt: 0 }
📊 Estado del pago: { success: true, data: { status: 'pending', order: null } }

🔍 Verificando pago: { externalReference: 'USER_5_1764399470368', userId: '5', attempt: 1 }
📊 Estado del pago: { success: true, data: { status: 'pending', order: null } }

...

🔍 Verificando pago: { externalReference: 'USER_5_1764399470368', userId: '5', attempt: 5 }
📊 Estado del pago: { success: true, data: { status: 'approved', order: {...} } }
✅ Orden encontrada, redirigiendo...
```

### En los Logs del Backend (PM2)

```bash
pm2 logs cinesnacks-api | grep "CHECK PAYMENT STATUS"
```

Deberías ver:

```
🔍 [CHECK PAYMENT STATUS] Iniciando verificación
📋 Query params: { external_reference: 'USER_5_1764399470368', user_id: '5' }
⚠️ No se encontró ninguna orden
⏳ Pago aún pendiente

# ... después de que el webhook crea la orden ...

🔍 [CHECK PAYMENT STATUS] Iniciando verificación
📋 Query params: { external_reference: 'USER_5_1764399470368', user_id: '5' }
✅ Orden encontrada: { order_id: 'ORDER_...', status: 'paid' }
```

---

## 🚨 RESUMEN DE CAMBIOS URGENTES

1. **ELIMINAR** esta línea de tu componente de carrito:
   ```javascript
   // ❌ ELIMINAR ESTO
   await axios.post('/api/v1/payment/complete', { user_id, dispenser_id });
   ```

2. **IMPLEMENTAR** el componente `PaymentSuccess.jsx` con polling (código arriba)

3. **VERIFICAR** que las rutas de React Router incluyen `/payment-success`

4. **PROBAR** el flujo completo con una tarjeta de prueba de MercadoPago

---

¡Estos son los cambios críticos que necesitas hacer en el frontend! 🎯
