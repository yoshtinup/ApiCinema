# 🔐 API de Login - Guía de Errores para Frontend

## 📋 Endpoint de Login

```
POST /api/v1/registro/login
Content-Type: application/json

{
  "gmail": "usuario@ejemplo.com",
  "password": "micontraseña"
}
```

---

## ✅ Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "message": "¡Inicio de sesión exitoso!",
  "data": {
    "userId": 123,
    "nombre": "Juan",
    "gmail": "usuario@ejemplo.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "nfc": "ABC123DEF",
    "usuario": "juanperez",
    "id_role_fk": 1
  }
}
```

### Uso en Frontend:
```javascript
if (response.success) {
  // Guardar token
  localStorage.setItem('authToken', response.data.token);
  localStorage.setItem('userId', response.data.userId);
  localStorage.setItem('userName', response.data.nombre);
  
  // Redirigir al dashboard
  router.push('/dashboard');
  
  // Mostrar mensaje de bienvenida
  showSuccessMessage(`¡Bienvenido ${response.data.nombre}!`);
}
```

---

## ❌ Errores Posibles

### 1. **Campos Faltantes** (400 Bad Request)

#### Ambos campos vacíos:
```json
{
  "success": false,
  "error": "MISSING_CREDENTIALS",
  "message": "Por favor ingresa tu correo electrónico y contraseña",
  "details": {
    "gmail": "El correo electrónico es requerido",
    "password": "La contraseña es requerida"
  }
}
```

**Frontend debe:**
```javascript
if (error.error === 'MISSING_CREDENTIALS') {
  showError('Por favor completa todos los campos');
  highlightFields(['gmail', 'password']); // Resaltar ambos campos en rojo
}
```

---

#### Email faltante:
```json
{
  "success": false,
  "error": "MISSING_EMAIL",
  "message": "Por favor ingresa tu correo electrónico",
  "field": "gmail"
}
```

**Frontend debe:**
```javascript
if (error.error === 'MISSING_EMAIL') {
  showError(error.message);
  focusField('gmail'); // Enfocar el campo de email
  highlightField('gmail'); // Resaltar en rojo
}
```

---

#### Contraseña faltante:
```json
{
  "success": false,
  "error": "MISSING_PASSWORD",
  "message": "Por favor ingresa tu contraseña",
  "field": "password"
}
```

**Frontend debe:**
```javascript
if (error.error === 'MISSING_PASSWORD') {
  showError(error.message);
  focusField('password');
  highlightField('password');
}
```

---

### 2. **Formato de Email Inválido** (400 Bad Request)

```json
{
  "success": false,
  "error": "INVALID_EMAIL_FORMAT",
  "message": "El formato del correo electrónico no es válido",
  "field": "gmail",
  "example": "ejemplo@correo.com"
}
```

**Frontend debe:**
```javascript
if (error.error === 'INVALID_EMAIL_FORMAT') {
  showError('Por favor ingresa un correo electrónico válido');
  showHint('Ejemplo: usuario@correo.com');
  highlightField('gmail');
  focusField('gmail');
}
```

---

### 3. **Contraseña Muy Corta** (400 Bad Request)

```json
{
  "success": false,
  "error": "PASSWORD_TOO_SHORT",
  "message": "La contraseña debe tener al menos 4 caracteres",
  "field": "password"
}
```

**Frontend debe:**
```javascript
if (error.error === 'PASSWORD_TOO_SHORT') {
  showError(error.message);
  highlightField('password');
  showHint('Mínimo 4 caracteres');
}
```

---

### 4. **Usuario No Encontrado** (404 Not Found)

```json
{
  "success": false,
  "error": "USER_NOT_FOUND",
  "message": "No existe una cuenta con este correo electrónico",
  "suggestion": "¿Quieres crear una cuenta nueva?",
  "action": "register"
}
```

**Frontend debe:**
```javascript
if (error.error === 'USER_NOT_FOUND') {
  showError(error.message);
  
  // Mostrar botón de registro
  showActionButton({
    text: '¿Quieres crear una cuenta?',
    action: () => router.push('/register')
  });
  
  highlightField('gmail');
}
```

---

### 5. **Contraseña Incorrecta** (401 Unauthorized)

```json
{
  "success": false,
  "error": "INVALID_PASSWORD",
  "message": "La contraseña es incorrecta",
  "suggestion": "Verifica tu contraseña e intenta de nuevo",
  "field": "password"
}
```

**Frontend debe:**
```javascript
if (error.error === 'INVALID_PASSWORD') {
  showError(error.message);
  
  // Mostrar opción de recuperar contraseña
  showLink({
    text: '¿Olvidaste tu contraseña?',
    url: '/forgot-password'
  });
  
  highlightField('password');
  clearField('password'); // Limpiar el campo
  focusField('password');
}
```

---

### 6. **Credenciales Inválidas** (401 Unauthorized)

```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Las credenciales son inválidas",
  "suggestion": "Verifica tu correo y contraseña"
}
```

**Frontend debe:**
```javascript
if (error.error === 'INVALID_CREDENTIALS') {
  showError('Correo o contraseña incorrectos');
  highlightFields(['gmail', 'password']);
  clearField('password');
}
```

---

### 7. **Error del Servidor** (500 Internal Server Error)

```json
{
  "success": false,
  "error": "SERVER_ERROR",
  "message": "Ocurrió un error al iniciar sesión. Por favor intenta de nuevo.",
  "details": "Error description..."
}
```

**Frontend debe:**
```javascript
if (error.error === 'SERVER_ERROR') {
  showError('Algo salió mal. Por favor intenta de nuevo en unos momentos.');
  
  // Opcional: Mostrar botón de reintentar
  showRetryButton();
  
  // Log para debugging
  console.error('Server error:', error.details);
}
```

---

## 🎨 Implementación Completa en Frontend

### React/Vue/Angular Example:

```javascript
async function handleLogin(gmail, password) {
  try {
    // Mostrar loading
    setLoading(true);
    
    const response = await fetch('/api/v1/registro/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ gmail, password })
    });
    
    const data = await response.json();
    
    // Login exitoso
    if (response.ok && data.success) {
      // Guardar datos
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('userId', data.data.userId);
      localStorage.setItem('userName', data.data.nombre);
      
      // Mostrar mensaje de éxito
      showSuccess(`¡Bienvenido ${data.data.nombre}!`);
      
      // Redirigir
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
      return;
    }
    
    // Manejar errores específicos
    handleLoginError(data);
    
  } catch (error) {
    // Error de red o timeout
    showError('No se pudo conectar al servidor. Verifica tu conexión a internet.');
    console.error('Network error:', error);
  } finally {
    setLoading(false);
  }
}

function handleLoginError(error) {
  // Limpiar estados previos
  clearAllHighlights();
  
  switch (error.error) {
    case 'MISSING_CREDENTIALS':
      showError(error.message);
      highlightFields(['gmail', 'password']);
      break;
      
    case 'MISSING_EMAIL':
      showError(error.message);
      highlightField('gmail');
      focusField('gmail');
      break;
      
    case 'MISSING_PASSWORD':
      showError(error.message);
      highlightField('password');
      focusField('password');
      break;
      
    case 'INVALID_EMAIL_FORMAT':
      showError('Por favor ingresa un correo electrónico válido');
      showHint('Ejemplo: usuario@correo.com');
      highlightField('gmail');
      focusField('gmail');
      break;
      
    case 'PASSWORD_TOO_SHORT':
      showError(error.message);
      highlightField('password');
      showHint('Mínimo 4 caracteres');
      break;
      
    case 'USER_NOT_FOUND':
      showError(error.message);
      showActionButton({
        text: '¿Quieres crear una cuenta?',
        action: () => router.push('/register')
      });
      highlightField('gmail');
      break;
      
    case 'INVALID_PASSWORD':
      showError(error.message);
      showLink({
        text: '¿Olvidaste tu contraseña?',
        url: '/forgot-password'
      });
      highlightField('password');
      clearField('password');
      focusField('password');
      break;
      
    case 'INVALID_CREDENTIALS':
      showError('Correo o contraseña incorrectos');
      highlightFields(['gmail', 'password']);
      clearField('password');
      break;
      
    case 'SERVER_ERROR':
      showError('Algo salió mal. Por favor intenta de nuevo.');
      showRetryButton();
      break;
      
    default:
      showError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
      console.error('Unknown error:', error);
  }
}

// Funciones auxiliares
function showError(message) {
  // Mostrar toast/snackbar/alert con el mensaje
  toast.error(message, { duration: 4000 });
}

function showSuccess(message) {
  toast.success(message, { duration: 3000 });
}

function highlightField(fieldName) {
  document.querySelector(`[name="${fieldName}"]`).classList.add('error');
}

function highlightFields(fieldNames) {
  fieldNames.forEach(field => highlightField(field));
}

function clearAllHighlights() {
  document.querySelectorAll('.error').forEach(el => {
    el.classList.remove('error');
  });
}

function focusField(fieldName) {
  document.querySelector(`[name="${fieldName}"]`).focus();
}

function clearField(fieldName) {
  document.querySelector(`[name="${fieldName}"]`).value = '';
}

function showHint(text) {
  // Mostrar hint debajo del campo
}

function showActionButton(config) {
  // Mostrar botón de acción (ej: "Crear cuenta")
}

function showLink(config) {
  // Mostrar link (ej: "¿Olvidaste tu contraseña?")
}

function showRetryButton() {
  // Mostrar botón de reintentar
}
```

---

## 📱 Ejemplo de UI con Mensajes

### HTML del Formulario:

```html
<div class="login-form">
  <h2>Iniciar Sesión</h2>
  
  <!-- Email Field -->
  <div class="form-group">
    <label for="gmail">Correo Electrónico</label>
    <input 
      type="email" 
      id="gmail" 
      name="gmail"
      placeholder="ejemplo@correo.com"
      class="form-control"
    />
    <span class="hint" id="gmail-hint"></span>
    <span class="error-message" id="gmail-error"></span>
  </div>
  
  <!-- Password Field -->
  <div class="form-group">
    <label for="password">Contraseña</label>
    <input 
      type="password" 
      id="password" 
      name="password"
      placeholder="Tu contraseña"
      class="form-control"
    />
    <span class="hint" id="password-hint"></span>
    <span class="error-message" id="password-error"></span>
  </div>
  
  <!-- Error General -->
  <div class="alert alert-error" id="general-error" style="display: none;">
    <span id="general-error-message"></span>
  </div>
  
  <!-- Action Button (para "Crear cuenta", etc.) -->
  <div id="action-container" style="display: none;"></div>
  
  <!-- Submit Button -->
  <button 
    type="submit" 
    class="btn btn-primary"
    id="login-btn"
  >
    Iniciar Sesión
  </button>
  
  <!-- Link de recuperar contraseña -->
  <div class="text-center mt-3">
    <a href="/forgot-password" class="text-link" id="forgot-password-link" style="display: none;">
      ¿Olvidaste tu contraseña?
    </a>
  </div>
</div>
```

---

## 🎯 CSS para Estados de Error

```css
/* Campo con error */
.form-control.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.form-control.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

/* Mensaje de error */
.error-message {
  display: none;
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-message.show {
  display: block;
}

/* Hint text */
.hint {
  display: none;
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.hint.show {
  display: block;
}

/* Alert general */
.alert-error {
  background-color: #f8d7da;
  border: 1px solid #f5c2c7;
  color: #842029;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

/* Success alert */
.alert-success {
  background-color: #d1e7dd;
  border: 1px solid #badbcc;
  color: #0f5132;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Tipo | Cuándo ocurre |
|--------|------|---------------|
| **200** | ✅ Success | Login exitoso |
| **400** | ❌ Bad Request | Campos faltantes, formato inválido, contraseña muy corta |
| **401** | ❌ Unauthorized | Contraseña incorrecta, credenciales inválidas |
| **404** | ❌ Not Found | Usuario no encontrado |
| **500** | ❌ Server Error | Error interno del servidor |

---

## 🔄 Flujo Completo de Manejo de Errores

```
Usuario ingresa credenciales
         ↓
  Validación en Frontend
  (opcional, pero recomendado)
         ↓
    Enviar a API
         ↓
   ¿Respuesta OK?
         ↓
    NO ─→ ¿Qué error?
         ↓
  ┌──────┴──────┐
  │   400       │ → Mostrar error específico del campo
  │   401       │ → Mostrar error de credenciales + link recuperar contraseña
  │   404       │ → Mostrar error + botón de registro
  │   500       │ → Mostrar error genérico + botón reintentar
  └─────────────┘
         ↓
  Enfocar campo con error
         ↓
  Usuario corrige y reintenta
```

---

## ✨ Mejores Prácticas

### ✅ Hacer:
- Mostrar mensajes claros y específicos
- Resaltar el campo con error
- Enfocar automáticamente el campo que necesita corrección
- Ofrecer acciones útiles (crear cuenta, recuperar contraseña)
- Limpiar la contraseña después de un error
- Mostrar hints cuando sea apropiado
- Usar loading states durante la petición
- Guardar el token de forma segura

### ❌ No hacer:
- Mostrar errores técnicos al usuario ("Error 500", "Database connection failed")
- Decir exactamente qué campo está mal en credenciales inválidas (seguridad)
- Bloquear la cuenta después de intentos fallidos (sin implementar)
- Mostrar el password en texto plano
- Recargar la página innecesariamente

---

## 🚀 Testing

### Casos de prueba para el frontend:

```javascript
describe('Login Error Handling', () => {
  
  test('debe mostrar error cuando falta email', async () => {
    await login('', 'password123');
    expect(screen.getByText('Por favor ingresa tu correo electrónico')).toBeInTheDocument();
  });
  
  test('debe mostrar error cuando falta contraseña', async () => {
    await login('user@test.com', '');
    expect(screen.getByText('Por favor ingresa tu contraseña')).toBeInTheDocument();
  });
  
  test('debe mostrar error de formato de email', async () => {
    await login('invalid-email', 'password123');
    expect(screen.getByText(/formato del correo electrónico no es válido/i)).toBeInTheDocument();
  });
  
  test('debe mostrar botón de registro cuando usuario no existe', async () => {
    mockAPI.post('/login').mockRejectedValue({ error: 'USER_NOT_FOUND' });
    await login('newuser@test.com', 'password123');
    expect(screen.getByText(/¿Quieres crear una cuenta?/i)).toBeInTheDocument();
  });
  
  test('debe limpiar contraseña cuando es incorrecta', async () => {
    mockAPI.post('/login').mockRejectedValue({ error: 'INVALID_PASSWORD' });
    await login('user@test.com', 'wrongpass');
    expect(passwordInput.value).toBe('');
  });
  
});
```

---

## 📝 Resumen

Todos los errores ahora incluyen:
- ✅ **`success: false`** - Para fácil verificación
- ✅ **`error`** - Código de error único para programación
- ✅ **`message`** - Mensaje legible para mostrar al usuario
- ✅ **`field`** (opcional) - Campo específico con error
- ✅ **`suggestion`** (opcional) - Sugerencia de qué hacer
- ✅ **`action`** (opcional) - Acción recomendada

¡Esto hace que tu frontend pueda proporcionar una experiencia de usuario excepcional! 🎉
