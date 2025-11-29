# 🎉 Integración de Payment Success/Failure

## 📋 Cambios Realizados en Backend

### PaymentService.js
Ahora la preferencia de pago incluye:
- ✅ `external_reference`: `USER_{user_id}_{timestamp}` - Identificador único
- ✅ `notification_url`: Webhook de MercadoPago
- ✅ `payer.email`: Email del usuario
- ✅ `back_urls` con `user_id`: Para que el frontend sepa qué usuario completó el pago
- ✅ `id` y `description` en items: Para mejor tracking

## 🎯 Flujo de Pago Completo

```
1. Usuario hace clic en "Pagar"
2. Frontend llama → POST /api/v1/payment/create-preference
3. Backend crea preferencia → MercadoPago devuelve init_point
4. Frontend abre init_point (checkout de MercadoPago)
5. Usuario completa el pago
6. MercadoPago redirige a:
   - Success: /payment-success?user_id=X&payment_id=Y&status=approved
   - Failure: /payment-failure?user_id=X
   - Pending: /payment-pending?user_id=X&payment_id=Y
7. Frontend extrae payment_id de URL
8. Frontend llama → POST /api/v1/payment/complete con {payment_id, user_id}
9. Backend valida pago con MercadoPago y crea orden
10. Frontend muestra mensaje de éxito
```

## 🔧 Cambios Necesarios en Frontend

### 1. Componente PaymentSuccess.jsx

```jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Procesando tu pago...');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const completePayment = async () => {
      try {
        // Obtener parámetros de la URL
        const paymentId = searchParams.get('payment_id');
        const userId = searchParams.get('user_id');
        const paymentStatus = searchParams.get('status');

        console.log('📋 Parámetros recibidos:', { paymentId, userId, paymentStatus });

        if (!paymentId || !userId) {
          throw new Error('Faltan parámetros en la URL');
        }

        // Obtener token del localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay sesión activa');
        }

        // Llamar al endpoint de completar pago
        const response = await axios.post(
          'https://cinesnacksapi.chuy7x.space/api/v1/payment/complete',
          {
            payment_id: paymentId,
            user_id: parseInt(userId)
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Respuesta del servidor:', response.data);

        if (response.data.success) {
          setStatus('success');
          setMessage('¡Pago completado exitosamente!');
          setOrderDetails(response.data.data.order);

          // Redirigir a mis pedidos después de 3 segundos
          setTimeout(() => {
            navigate('/my-orders');
          }, 3000);
        } else {
          throw new Error(response.data.error || 'Error al procesar el pago');
        }

      } catch (error) {
        console.error('❌ Error completando pago:', error);
        setStatus('error');
        setMessage(error.response?.data?.error || error.message || 'Error al procesar el pago');
      }
    };

    completePayment();
  }, [searchParams, navigate]);

  return (
    <div className="payment-success-container">
      {status === 'processing' && (
        <div className="processing">
          <div className="spinner"></div>
          <h2>Procesando tu pago...</h2>
          <p>Por favor espera un momento</p>
        </div>
      )}

      {status === 'success' && (
        <div className="success">
          <div className="success-icon">✅</div>
          <h2>¡Pago Exitoso!</h2>
          <p>{message}</p>
          {orderDetails && (
            <div className="order-details">
              <p><strong>Orden ID:</strong> {orderDetails.order_id}</p>
              <p><strong>Total:</strong> ${orderDetails.total}</p>
              <p><strong>Estado:</strong> {orderDetails.status}</p>
            </div>
          )}
          <p className="redirect-msg">Serás redirigido a tus pedidos en 3 segundos...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="error">
          <div className="error-icon">❌</div>
          <h2>Error al procesar el pago</h2>
          <p>{message}</p>
          <button onClick={() => navigate('/cart')}>
            Volver al carrito
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
```

### 2. Componente PaymentFailure.jsx

```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Opcional: limpiar carrito o hacer alguna acción
    console.log('❌ Pago rechazado o cancelado');
  }, []);

  return (
    <div className="payment-failure-container">
      <div className="failure">
        <div className="failure-icon">❌</div>
        <h2>Pago Cancelado</h2>
        <p>Tu pago no pudo ser procesado o fue cancelado</p>
        <div className="actions">
          <button onClick={() => navigate('/cart')}>
            Volver al carrito
          </button>
          <button onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
```

### 3. Componente PaymentPending.jsx

```jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="payment-pending-container">
      <div className="pending">
        <div className="pending-icon">⏳</div>
        <h2>Pago Pendiente</h2>
        <p>Tu pago está siendo procesado</p>
        {paymentId && (
          <p className="payment-id">
            <strong>ID de pago:</strong> {paymentId}
          </p>
        )}
        <p>Recibirás una notificación cuando se complete el proceso</p>
        <button onClick={() => navigate('/my-orders')}>
          Ver mis pedidos
        </button>
      </div>
    </div>
  );
};

export default PaymentPending;
```

### 4. Actualizar React Router

```jsx
// En tu App.jsx o main router file
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import PaymentPending from './components/PaymentPending';

// Agregar las rutas:
<Route path="/payment-success" element={<PaymentSuccess />} />
<Route path="/payment-failure" element={<PaymentFailure />} />
<Route path="/payment-pending" element={<PaymentPending />} />
```

## 🎨 Estilos CSS Sugeridos

```css
.payment-success-container,
.payment-failure-container,
.payment-pending-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.processing, .success, .error, .pending, .failure {
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

.success-icon, .error-icon, .pending-icon, .failure-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: scaleIn 0.6s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
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

.order-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem 0;
}

.redirect-msg {
  color: #666;
  font-size: 0.9rem;
  margin-top: 1rem;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  margin: 0.5rem;
  transition: all 0.3s ease;
}

button:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
```

## 📝 Resumen de URLs

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/payment/create-preference` | POST | Crear preferencia de pago |
| `/api/v1/payment/complete` | POST | Completar pago y crear orden |
| `/webhooks/mercadopago` | POST | Webhook de MercadoPago (automático) |

## 🔍 Parámetros de URL de MercadoPago

Cuando MercadoPago redirige al usuario, incluye estos parámetros:
- `payment_id`: ID del pago en MercadoPago
- `status`: Estado del pago (approved, pending, rejected)
- `merchant_order_id`: ID de la orden de MercadoPago
- `preference_id`: ID de la preferencia
- `user_id`: Tu user_id personalizado (ahora en back_urls)

## ✅ Checklist de Implementación

- [x] Backend: Agregar `external_reference` a preferencia
- [x] Backend: Agregar `notification_url` para webhook
- [x] Backend: Incluir `user_id` en `back_urls`
- [x] Backend: Endpoint `/complete` funcional
- [ ] Frontend: Crear componente `PaymentSuccess`
- [ ] Frontend: Crear componente `PaymentFailure`
- [ ] Frontend: Crear componente `PaymentPending`
- [ ] Frontend: Agregar rutas en React Router
- [ ] Frontend: Agregar estilos CSS
- [ ] Testing: Probar flujo completo de pago

## 🚀 Deploy

```bash
# Backend (ya hecho)
cd ~/ApiCinema
git pull
pm2 restart cinesnacks-api

# Frontend (tu proyecto)
# Implementar los componentes anteriores
# Build y deploy
```

¡Listo! Ahora el flujo completo funcionará correctamente 🎉
