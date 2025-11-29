# 🎉 Integración de Payment Success con POLLING (VERSIÓN MEJORADA)

## ⚠️ CAMBIO IMPORTANTE EN EL FLUJO

**ANTES (Flujo viejo - NO USAR):**
```
1. Usuario hace clic en "Pagar"
2. Frontend llama POST /payment/create-preference
3. Frontend LLAMA POST /payment/complete ❌ ESTO YA NO SE USA
4. Frontend abre MercadoPago
```

**AHORA (Flujo nuevo - CORRECTO):**
```
1. Usuario hace clic en "Pagar"
2. Frontend llama POST /payment/create-preference
3. Frontend abre MercadoPago (NO llama a /complete)
4. Usuario completa pago
5. MercadoPago redirige a /payment-success?external_reference=XXX
6. Frontend hace POLLING a GET /payment/status cada 2 segundos
7. Cuando encuentra la orden, muestra éxito
```

## 🔧 Cambios Realizados en Backend

### ✅ Nuevos Endpoints
1. `GET /api/v1/payment/status?external_reference=XXX&user_id=Y` - Verificar estado del pago
2. `POST /api/v1/payment/complete` - Completar pago (webhook alternativo)

### ✅ Campos Agregados
- `external_reference` en preferencia (formato: `USER_{userId}_{timestamp}`)
- `external_reference` en back_urls para tracking
- `notification_url` con puerto correcto

## 🎯 Nuevo Flujo de Pago (CON POLLING)

```
1. Usuario hace clic en "Pagar"
2. Frontend llama → POST /api/v1/payment/create-preference
3. Backend devuelve: {init_point, external_reference}
4. Frontend abre MercadoPago checkout
5. Usuario completa el pago
6. MercadoPago redirige a: /payment-success?user_id=X&external_reference=Y
7. Frontend hace POLLING cada 2 segundos:
   → GET /api/v1/payment/status?external_reference=Y&user_id=X
8. Cuando status === 'approved':
   → Frontend muestra éxito y redirige a /my-orders
9. Si después de 40seg no hay respuesta:
   → Frontend muestra mensaje de "toma más tiempo del esperado"
```

## 📝 Componente Frontend MEJORADO

### PaymentSuccess.jsx (CON SISTEMA DE POLLING)

```jsx
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
  const MAX_ATTEMPTS = 20; // 20 intentos × 2seg = 40 segundos máximo

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

        const response = await axios.get(
          'https://cinesnacksapi.chuy7x.space:3002/api/v1/payment/status',
          {
            params: { external_reference: externalReference, user_id: userId },
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        console.log('📊 Estado del pago:', response.data);

        if (response.data.success) {
          const paymentStatus = response.data.data.status;
          
          if (paymentStatus === 'approved' || paymentStatus === 'paid') {
            // ✅ PAGO EXITOSO
            if (intervalId) clearInterval(intervalId);
            setStatus('success');
            setMessage('¡Pago completado exitosamente!');
            setOrderDetails(response.data.data.order);

            setTimeout(() => navigate('/my-orders'), 3000);
          } else if (paymentStatus === 'pending') {
            // ⏳ AÚN PENDIENTE
            setAttempts(prev => prev + 1);
            
            if (attempts >= MAX_ATTEMPTS) {
              if (intervalId) clearInterval(intervalId);
              setStatus('timeout');
              setMessage('El pago está tomando más tiempo del esperado. Revisa tu correo o consulta tus pedidos más tarde.');
            }
          } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
            // ❌ PAGO RECHAZADO
            if (intervalId) clearInterval(intervalId);
            setStatus('error');
            setMessage('El pago fue rechazado o cancelado');
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
          <div className="actions">
            <button onClick={() => navigate('/my-orders')}>
              Ver mis pedidos
            </button>
            <button onClick={() => navigate('/')}>
              Ir al inicio
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="error">
          <div className="error-icon">❌</div>
          <h2>Error al Procesar el Pago</h2>
          <p>{message}</p>
          <div className="actions">
            <button onClick={() => navigate('/cart')}>
              Volver al carrito
            </button>
            <button onClick={() => navigate('/my-orders')}>
              Ver mis pedidos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
```

## 🎨 Estilos CSS Actualizados

```css
.payment-success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.processing, .success, .error, .timeout {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 500px;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon, .error-icon, .timeout-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: scaleIn 0.6s ease-out;
}

@keyframes scaleIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.attempts {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.order-details {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin: 1.5rem 0;
}

.order-details p {
  margin: 0.5rem 0;
}

.redirect-msg {
  color: #666;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}
```

## 📊 Diagrama de Flujo Mejorado

```
┌─────────────────┐
│ Usuario paga    │
│ en MercadoPago  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ MercadoPago     │
│ redirige a      │
│ /payment-success│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Frontend inicia │◄────┐
│ POLLING cada 2s │     │
└────────┬────────┘     │
         │              │
         ↓              │
┌─────────────────┐     │
│ GET /status     │     │
│ ?external_ref   │     │
└────────┬────────┘     │
         │              │
    ┌────┴────┐         │
    │ Estado? │         │
    └────┬────┘         │
         │              │
    ┌────┴────┐         │
    │approved?│─NO──────┘
    └────┬────┘   (retry)
         │YES
         ↓
    ┌─────────┐
    │ Mostrar │
    │ Éxito ✅│
    └─────────┘
```

## ✅ Ventajas del Sistema de Polling

1. **No depende de redirección automática de MercadoPago**
2. **Maneja delays en webhook**
3. **Feedback visual en tiempo real** (contador de intentos)
4. **Timeout graceful** después de 40 segundos
5. **Más robusto** ante problemas de red

## 🚀 Deploy

```bash
# Backend
cd ~/ApiCinema
git pull
pm2 restart cinesnacks-api

# Frontend
# Reemplazar PaymentSuccess.jsx con la nueva versión
# npm run build && deploy
```

¡Listo! Ahora el sistema es mucho más robusto y no depende de la redirección automática de MercadoPago. 🎉
