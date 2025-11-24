# 📝 Guía de Integración Frontend - API CineSnacks

## 🚀 Endpoints Principales

**Base URL:** `http://localhost:3002/api/v1`

---

## 1️⃣ Registro de Usuario

### Endpoint:
```
POST /registro/create
```

### Request Body:
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+529611234567",
  "gmail": "juan@ejemplo.com",
  "codigo": "micontraseña123",
  "usuario": "juanperez"
}
```

### Respuesta Exitosa (201 Created):
```json
{
  "success": true,
  "message": "¡Cuenta creada exitosamente!",
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "gmail": "juan@ejemplo.com",
    "telefono": "+529611234567",
    "usuario": "juanperez",
    "id_role_fk": 1,
    "nfc": null,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Errores Posibles:

#### Email ya existe (409 Conflict):
```json
{
  "success": false,
  "error": "EMAIL_ALREADY_EXISTS",
  "message": "Este correo electrónico ya está registrado",
  "suggestion": "¿Ya tienes una cuenta? Intenta iniciar sesión",
  "action": "login",
  "field": "gmail"
}
```

#### Campos faltantes (400 Bad Request):
```json
{
  "success": false,
  "error": "MISSING_REQUIRED_FIELDS",
  "message": "El correo electrónico y la contraseña son requeridos",
  "fields": {
    "gmail": "El correo electrónico es requerido",
    "codigo": null
  }
}
```

#### Email inválido (400 Bad Request):
```json
{
  "success": false,
  "error": "INVALID_EMAIL_FORMAT",
  "message": "El formato del correo electrónico no es válido",
  "field": "gmail",
  "example": "ejemplo@correo.com"
}
```

#### Contraseña muy corta (400 Bad Request):
```json
{
  "success": false,
  "error": "PASSWORD_TOO_SHORT",
  "message": "La contraseña debe tener al menos 4 caracteres",
  "field": "codigo"
}
```

### Código Frontend (Vanilla JS):

```javascript
async function register(formData) {
  try {
    const response = await fetch('http://localhost:3002/api/v1/registro/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        gmail: formData.gmail,
        codigo: formData.password, // Nota: el campo se llama "codigo"
        usuario: formData.usuario
      })
    });

    const result = await response.json();

    if (result.success && result.data?.token) {
      // ✅ Registro exitoso
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('userId', result.data.id);
      localStorage.setItem('userName', result.data.nombre);
      
      alert('¡Cuenta creada exitosamente!');
      window.location.href = '/dashboard.html';
    } else {
      // ❌ Error en el registro
      handleError(result);
    }
  } catch (error) {
    alert('Error de conexión. Verifica tu internet.');
  }
}

function handleError(error) {
  // Crear modal personalizado en lugar de alert genérico
  const modal = document.createElement('div');
  modal.className = 'error-modal';
  
  switch (error.error) {
    case 'EMAIL_ALREADY_EXISTS':
      // Modal con mensaje claro y botón para ir a login
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-icon error-icon">⚠️</div>
          <h2>Correo ya registrado</h2>
          <p>${error.message}</p>
          <div class="modal-buttons">
            <button onclick="window.location.href='/login.html'" class="btn-primary">
              Ir a Iniciar Sesión
            </button>
            <button onclick="this.closest('.error-modal').remove()" class="btn-secondary">
              Cerrar
            </button>
          </div>
        </div>
      `;
      break;
      
    case 'INVALID_EMAIL_FORMAT':
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-icon">📧</div>
          <h2>Email inválido</h2>
          <p>${error.message}</p>
          <button onclick="this.closest('.error-modal').remove()" class="btn-primary">
            Entendido
          </button>
        </div>
      `;
      // Resaltar campo de email
      document.getElementById('gmail')?.classList.add('input-error');
      break;
      
    case 'PASSWORD_TOO_SHORT':
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-icon">🔒</div>
          <h2>Contraseña muy corta</h2>
          <p>${error.message}</p>
          <button onclick="this.closest('.error-modal').remove()" class="btn-primary">
            Entendido
          </button>
        </div>
      `;
      // Resaltar campo de contraseña
      document.getElementById('password')?.classList.add('input-error');
      break;
      
    default:
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-icon error-icon">❌</div>
          <h2>Error en el registro</h2>
          <p>${error.message || 'Error al crear la cuenta. Intenta nuevamente.'}</p>
          <button onclick="this.closest('.error-modal').remove()" class="btn-primary">
            Cerrar
          </button>
        </div>
      `;
  }
  
  document.body.appendChild(modal);
  
  // Auto-cerrar después de 5 segundos (excepto para EMAIL_ALREADY_EXISTS)
  if (error.error !== 'EMAIL_ALREADY_EXISTS') {
    setTimeout(() => modal.remove(), 5000);
  }
}

// CSS básico para el modal (agregar a tu styles.css)
/*
.error-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-icon {
  color: #e74c3c;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.input-error {
  border: 2px solid #e74c3c !important;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
*/
```

---

## 2️⃣ Inicio de Sesión (Login)

### Endpoint:
```
POST /registro/login
```

### Request Body:
```json
{
  "gmail": "juan@ejemplo.com",
  "password": "micontraseña123"
}
```

### Respuesta Exitosa (200 OK):
```json
{
  "success": true,
  "message": "¡Inicio de sesión exitoso!",
  "data": {
    "userId": 1,
    "nombre": "Juan",
    "gmail": "juan@ejemplo.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "nfc": null,
    "usuario": "juanperez",
    "id_role_fk": 1
  }
}
```

### Errores Posibles:

#### Usuario no encontrado (404 Not Found):
```json
{
  "success": false,
  "error": "USER_NOT_FOUND",
  "message": "No existe una cuenta con este correo electrónico",
  "suggestion": "¿Quieres crear una cuenta nueva?",
  "action": "register"
}
```

#### Contraseña incorrecta (401 Unauthorized):
```json
{
  "success": false,
  "error": "INVALID_PASSWORD",
  "message": "La contraseña es incorrecta",
  "suggestion": "Verifica tu contraseña e intenta de nuevo",
  "field": "password"
}
```

#### Email faltante (400 Bad Request):
```json
{
  "success": false,
  "error": "MISSING_EMAIL",
  "message": "Por favor ingresa tu correo electrónico",
  "field": "gmail"
}
```

### Código Frontend (Vanilla JS):

```javascript
async function login(gmail, password) {
  try {
    const response = await fetch('http://localhost:3002/api/v1/registro/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gmail, password })
    });

    const result = await response.json();

    if (result.success && result.data?.token) {
      // ✅ Login exitoso - IMPORTANTE: El token está en result.data.token
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('userId', result.data.userId);
      localStorage.setItem('userName', result.data.nombre);
      
      alert(`¡Bienvenido ${result.data.nombre}!`);
      window.location.href = '/dashboard.html';
    } else {
      // ❌ Error en el login
      handleLoginError(result);
    }
  } catch (error) {
    alert('Error de conexión. Verifica tu internet.');
  }
}

function handleLoginError(error) {
  switch (error.error) {
    case 'USER_NOT_FOUND':
      alert(error.message);
      if (confirm('¿Quieres crear una cuenta?')) {
        window.location.href = '/register.html';
      }
      break;
    case 'INVALID_PASSWORD':
      alert('Contraseña incorrecta. Intenta de nuevo.');
      break;
    case 'MISSING_EMAIL':
      alert('Por favor ingresa tu correo electrónico');
      break;
    case 'INVALID_EMAIL_FORMAT':
      alert('El formato del correo no es válido');
      break;
    default:
      alert(error.message || 'Error al iniciar sesión');
  }
}
```

---

## 3️⃣ Crear Producto (con imagen S3)

### Endpoint:
```
POST /producto
Content-Type: multipart/form-data
```

### Form Data:
```javascript
const formData = new FormData();
formData.append('nombre', 'Palomitas Grandes');
formData.append('descripcion', 'Palomitas con mantequilla');
formData.append('precio', '45.00');
formData.append('peso', '355');
formData.append('cantidad', '100');
formData.append('categoria', 'snacks');
formData.append('ingreso', '2025-11-23'); // Formato YYYY-MM-DD
formData.append('no_apartado', '0');
formData.append('imagen', fileInput.files[0]); // Archivo de imagen
```

### Respuesta Exitosa (201 Created):
```json
{
  "id": 1,
  "nombre": "Palomitas Grandes",
  "descripcion": "Palomitas con mantequilla",
  "precio": 45.00,
  "peso": "355",
  "cantidad": 100,
  "categoria": "snacks",
  "ingreso": "2025-11-23",
  "imagen": "https://cinesnacks-images.s3.us-east-1.amazonaws.com/productos/1732345678901-palomitas.jpg",
  "no_apartado": 0
}
```

### Código Frontend:

```javascript
async function createProduct(formData) {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('http://localhost:3002/api/v1/producto', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}` // Token si es necesario
      },
      body: formData // NO incluyas Content-Type, FormData lo maneja automáticamente
    });

    const result = await response.json();
    
    if (response.ok) {
      alert('Producto creado exitosamente');
      console.log('URL de imagen:', result.imagen);
    } else {
      alert(result.message || 'Error al crear producto');
    }
  } catch (error) {
    alert('Error de conexión');
  }
}

// Ejemplo de uso con formulario
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('nombre', document.getElementById('nombre').value);
  formData.append('descripcion', document.getElementById('descripcion').value);
  formData.append('precio', document.getElementById('precio').value);
  formData.append('peso', document.getElementById('peso').value);
  formData.append('cantidad', document.getElementById('cantidad').value);
  formData.append('categoria', document.getElementById('categoria').value);
  formData.append('ingreso', document.getElementById('ingreso').value);
  formData.append('no_apartado', '0');
  
  // Agregar imagen si existe
  const imageFile = document.getElementById('imagen').files[0];
  if (imageFile) {
    formData.append('imagen', imageFile);
  }
  
  await createProduct(formData);
});
```

---

## 5️⃣ Carrito de Compras (con Incremento/Decremento)

### 📌 Obtener Carrito del Usuario

#### Endpoint:
```
GET /carrito/user/:userId
```

#### Respuesta Exitosa (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "iduser": "123",
        "idproducto": 5,
        "cantidad": 2,
        "nombre": "Palomitas Grandes",
        "descripcion": "Palomitas con mantequilla",
        "precio": 45.00,
        "peso": "355",
        "categoria": "snacks",
        "imagen": "https://cinesnacks-images.s3.us-east-1.amazonaws.com/productos/palomitas.jpg",
        "stock_disponible": 100,
        "subtotal": "90.00"
      }
    ],
    "total": "90.00",
    "itemCount": 1,
    "totalQuantity": 2
  }
}
```

### ➕ Agregar Producto al Carrito

#### Endpoint:
```
POST /carrito
```

#### Request Body:
```json
{
  "iduser": "123",
  "idproducto": 5,
  "cantidad": 1
}
```

**Nota:** Si el producto ya existe en el carrito, automáticamente incrementará la cantidad.

#### Respuesta (201 Created):
```json
{
  "id": 1,
  "iduser": "123",
  "idproducto": 5,
  "cantidad": 1,
  "fecha": "2025-11-23",
  "hora": "14:30:00",
  "action": "created"
}
```

### ⬆️ Incrementar Cantidad

#### Endpoint:
```
POST /carrito/:userId/increment/:productId
```

#### Ejemplo:
```
POST /carrito/123/increment/5
```

#### Respuesta (200 OK):
```json
{
  "success": true,
  "message": "Cantidad incrementada",
  "cantidad": 3
}
```

### ⬇️ Decrementar Cantidad

#### Endpoint:
```
POST /carrito/:userId/decrement/:productId
```

#### Ejemplo:
```
POST /carrito/123/decrement/5
```

#### Respuesta si cantidad > 1 (200 OK):
```json
{
  "success": true,
  "message": "Cantidad decrementada",
  "cantidad": 2,
  "removed": false
}
```

#### Respuesta si cantidad = 1 (elimina el producto):
```json
{
  "success": true,
  "message": "Producto eliminado del carrito",
  "cantidad": 0,
  "removed": true
}
```

### 🔢 Actualizar Cantidad Directamente

#### Endpoint:
```
PUT /carrito/:userId/quantity/:productId
```

#### Request Body:
```json
{
  "cantidad": 5
}
```

#### Respuesta (200 OK):
```json
{
  "success": true,
  "message": "Cantidad actualizada",
  "cantidad": 5,
  "removed": false
}
```

### Código Frontend (Vanilla JS):

```javascript
// Obtener carrito del usuario
async function getCart(userId) {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`http://localhost:3002/api/v1/carrito/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      displayCart(result.data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Agregar producto al carrito
async function addToCart(productId, quantity = 1) {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  
  try {
    const response = await fetch('http://localhost:3002/api/v1/carrito', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        iduser: userId,
        idproducto: productId,
        cantidad: quantity
      })
    });

    const result = await response.json();
    
    alert('Producto agregado al carrito');
    getCart(userId); // Refrescar carrito
  } catch (error) {
    alert('Error al agregar producto');
  }
}

// Incrementar cantidad
async function incrementItem(productId) {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  
  try {
    const response = await fetch(`http://localhost:3002/api/v1/carrito/${userId}/increment/${productId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      // Actualizar UI
      document.getElementById(`qty-${productId}`).textContent = result.cantidad;
      updateTotal();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Decrementar cantidad
async function decrementItem(productId) {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  
  try {
    const response = await fetch(`http://localhost:3002/api/v1/carrito/${userId}/decrement/${productId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      if (result.removed) {
        // Eliminar item del DOM
        document.getElementById(`item-${productId}`).remove();
      } else {
        // Actualizar cantidad
        document.getElementById(`qty-${productId}`).textContent = result.cantidad;
      }
      updateTotal();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Mostrar carrito en HTML
function displayCart(cartData) {
  const cartContainer = document.getElementById('cart-items');
  cartContainer.innerHTML = '';
  
  cartData.items.forEach(item => {
    const itemHTML = `
      <div class="cart-item" id="item-${item.idproducto}">
        <img src="${item.imagen || '/placeholder.png'}" alt="${item.nombre}">
        <div class="item-details">
          <h3>${item.nombre}</h3>
          <p class="price">$${item.precio}</p>
          <p class="stock">+${item.stock_disponible} disponibles</p>
        </div>
        <div class="quantity-controls">
          <button onclick="decrementItem(${item.idproducto})" class="btn-qty">-</button>
          <span id="qty-${item.idproducto}" class="quantity">${item.cantidad}</span>
          <button onclick="incrementItem(${item.idproducto})" class="btn-qty">+</button>
        </div>
        <div class="subtotal">
          $${item.subtotal}
        </div>
        <button onclick="removeItem(${item.idproducto})" class="btn-remove">Eliminar</button>
      </div>
    `;
    cartContainer.innerHTML += itemHTML;
  });
  
  // Mostrar total
  document.getElementById('cart-total').textContent = `$${cartData.total}`;
  document.getElementById('item-count').textContent = `(${cartData.itemCount} productos)`;
}

// Actualizar total del carrito
function updateTotal() {
  const userId = localStorage.getItem('userId');
  getCart(userId);
}
```

### Ejemplo HTML del Carrito:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Carrito - CineSnacks</title>
  <style>
    .cart-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #ddd;
      margin-bottom: 1rem;
      border-radius: 8px;
    }
    
    .cart-item img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .item-details {
      flex: 1;
    }
    
    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-qty {
      width: 32px;
      height: 32px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 18px;
    }
    
    .btn-qty:hover {
      background: #f0f0f0;
    }
    
    .quantity {
      min-width: 40px;
      text-align: center;
      font-weight: bold;
    }
    
    .subtotal {
      font-weight: bold;
      min-width: 80px;
      text-align: right;
    }
    
    .btn-remove {
      color: #e74c3c;
      border: none;
      background: none;
      cursor: pointer;
      text-decoration: underline;
    }
    
    .cart-total {
      text-align: right;
      padding: 1rem;
      border-top: 2px solid #333;
      font-size: 1.5rem;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>Mi Carrito <span id="item-count"></span></h1>
  
  <div id="cart-items"></div>
  
  <div class="cart-total">
    Total: <span id="cart-total">$0.00</span>
  </div>
  
  <button onclick="checkout()" class="btn-checkout">Proceder al Pago</button>
  
  <script src="cart.js"></script>
  <script>
    // Cargar carrito al iniciar
    window.onload = () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        getCart(userId);
      } else {
        window.location.href = '/login.html';
      }
    };
  </script>
</body>
</html>
```

---

## 4️⃣ Completar Pago (con validación)

### Endpoint:
```
POST /pago/complete
Authorization: Bearer {token}
```

### Request Body:
```json
{
  "user_id": "1",
  "payment_id": "1234567890",
  "dispenser_id": "5",
  "nfc": "ABC123DEF"
}
```

### Respuesta Exitosa (201 Created):
```json
{
  "success": true,
  "message": "Orden creada exitosamente con pago verificado",
  "order": {
    "order_id": "123",
    "user_id": "1",
    "total": 150.00,
    "status": "paid",
    "payment_id": "1234567890",
    "items": [...]
  }
}
```

### Errores Posibles:

#### Pago no aprobado (400 Bad Request):
```json
{
  "success": false,
  "error": "El pago está pendiente de confirmación. Por favor espera."
}
```

#### Payment ID faltante (400 Bad Request):
```json
{
  "success": false,
  "error": "payment_id es requerido para completar el pago",
  "message": "Debes proporcionar el ID del pago de MercadoPago para verificar que fue exitoso"
}
```

### Código Frontend:

```javascript
async function completePayment(paymentId) {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  
  try {
    const response = await fetch('http://localhost:3002/api/v1/pago/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        payment_id: paymentId // MUY IMPORTANTE
      })
    });

    const result = await response.json();

    if (result.success) {
      alert('¡Pago completado! Tu orden ha sido creada.');
      window.location.href = '/orders.html';
    } else {
      alert(result.error || 'Error al completar el pago');
    }
  } catch (error) {
    alert('Error de conexión');
  }
}

// Después del pago en MercadoPago
// URL: /payment-success?payment_id=1234567890&status=approved
const urlParams = new URLSearchParams(window.location.search);
const paymentId = urlParams.get('payment_id');
const status = urlParams.get('status');

if (status === 'approved' && paymentId) {
  completePayment(paymentId);
}
```

---

## 📦 Estructura de Respuestas

### ✅ Respuestas Exitosas:
Todas las respuestas exitosas incluyen:
```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { ... }
}
```

### ❌ Respuestas de Error:
Todas las respuestas de error incluyen:
```json
{
  "success": false,
  "error": "CODIGO_ERROR",
  "message": "Mensaje legible para el usuario",
  "field": "campo_con_error",
  "suggestion": "Qué hacer"
}
```

---

## 🔑 Manejo de Tokens

### Guardar Token:
```javascript
// Después del login o registro
localStorage.setItem('authToken', result.data.token);
localStorage.setItem('userId', result.data.userId);
```

### Usar Token en Peticiones:
```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:3002/api/v1/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // ← Incluir token aquí
  },
  body: JSON.stringify(data)
});
```

### Verificar si el usuario está autenticado:
```javascript
function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

// Redirigir si no está autenticado
if (!isAuthenticated()) {
  window.location.href = '/login.html';
}
```

### Cerrar Sesión:
```javascript
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  window.location.href = '/login.html';
}
```

---

## 🎯 Códigos de Error Comunes

| Código HTTP | Significado | Qué hacer |
|-------------|-------------|-----------|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos inválidos o faltantes |
| 401 | Unauthorized | Credenciales incorrectas |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Datos duplicados (email ya existe) |
| 500 | Server Error | Error interno del servidor |

---

## 🛠️ Funciones Helper Reutilizables

```javascript
// api.js - Helpers para todas las peticiones
const API_URL = 'http://localhost:3002/api/v1';

// Petición genérica con token
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    // Si el token expiró (401), redirigir al login
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = '/login.html';
      throw new Error('Sesión expirada');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Login
export async function login(gmail, password) {
  const result = await apiRequest('/registro/login', {
    method: 'POST',
    body: JSON.stringify({ gmail, password })
  });
  
  if (result.success && result.data?.token) {
    localStorage.setItem('authToken', result.data.token);
    localStorage.setItem('userId', result.data.userId);
    return result;
  }
  throw new Error(result.message);
}

// Registro
export async function register(userData) {
  const result = await apiRequest('/registro/create', {
    method: 'POST',
    body: JSON.stringify({
      ...userData,
      codigo: userData.password
    })
  });
  
  if (result.success && result.data?.token) {
    localStorage.setItem('authToken', result.data.token);
    localStorage.setItem('userId', result.data.id);
    return result;
  }
  throw new Error(result.message);
}

// Completar pago
export async function completePayment(paymentId) {
  return apiRequest('/pago/complete', {
    method: 'POST',
    body: JSON.stringify({
      user_id: localStorage.getItem('userId'),
      payment_id: paymentId
    })
  });
}
```

---

## ✨ Ejemplo Completo - Página de Registro

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Registro - CineSnacks</title>
</head>
<body>
  <h1>Crear Cuenta</h1>
  
  <form id="registerForm">
    <input type="text" id="nombre" placeholder="Nombre" required>
    <input type="text" id="apellido" placeholder="Apellido" required>
    <input type="tel" id="telefono" placeholder="+529611234567" required>
    <input type="email" id="gmail" placeholder="Correo electrónico" required>
    <input type="password" id="password" placeholder="Contraseña (mín. 4 caracteres)" required>
    <input type="text" id="usuario" placeholder="Nombre de usuario" required>
    <button type="submit">Crear Cuenta</button>
  </form>
  
  <p>¿Ya tienes cuenta? <a href="/login.html">Inicia sesión</a></p>
  
  <script>
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        telefono: document.getElementById('telefono').value,
        gmail: document.getElementById('gmail').value,
        codigo: document.getElementById('password').value,
        usuario: document.getElementById('usuario').value
      };
      
      try {
        const response = await fetch('http://localhost:3002/api/v1/registro/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success && result.data?.token) {
          localStorage.setItem('authToken', result.data.token);
          localStorage.setItem('userId', result.data.id);
          alert('¡Cuenta creada exitosamente!');
          window.location.href = '/dashboard.html';
        } else {
          // Manejar errores
          if (result.error === 'EMAIL_ALREADY_EXISTS') {
            if (confirm('Este email ya está registrado. ¿Quieres iniciar sesión?')) {
              window.location.href = '/login.html';
            }
          } else {
            alert(result.message || 'Error al crear cuenta');
          }
        }
      } catch (error) {
        alert('Error de conexión. Intenta de nuevo.');
      }
    });
  </script>
</body>
</html>
```

---

## 📝 Notas Importantes

1. **Token en data.token**: El token siempre está en `response.data.token`, NO en `response.token`
2. **Contraseña es "codigo"**: El campo de contraseña se llama `codigo` en el backend
3. **Fecha formato YYYY-MM-DD**: Las fechas deben enviarse en formato ISO (ej: "2025-11-23")
4. **FormData para imágenes**: Usa `FormData` para subir archivos, no JSON
5. **Bearer Token**: Incluye el token como `Bearer ${token}` en el header Authorization
6. **payment_id requerido**: Para completar pagos, el `payment_id` de MercadoPago es OBLIGATORIO

---

¡Con esta guía tu frontend puede integrarse perfectamente con el backend de CineSnacks! 🎉
