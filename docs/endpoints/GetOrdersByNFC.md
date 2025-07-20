# Endpoint para Consultar Órdenes por NFC

## Descripción
Este endpoint permite consultar todas las órdenes asociadas a un usuario mediante su código NFC, siguiendo los principios de arquitectura hexagonal y diseño por capas.

## Arquitectura Implementada

### Capa de Aplicación
- **GetOrdersByNFC.js**: Caso de uso que orquesta la consulta de órdenes por NFC

### Capa de Dominio
- **Order.js**: Modelo de dominio que representa una orden
- **IPagoRepository.js**: Puerto (interfaz) que define el contrato para el repositorio

### Capa de Infraestructura
- **PagoRepository.js**: Adaptador que implementa el acceso a datos
- **PagoController.js**: Controlador que maneja las peticiones HTTP
- **PagoRouter.js**: Enrutador que define los endpoints

## Endpoint

### GET /api/v1/pago/nfc/:nfc

Obtiene todas las órdenes asociadas a un código NFC específico.

#### Parámetros
- **nfc** (string, requerido): Código NFC del usuario

#### Respuestas

##### Éxito (200)
```json
{
  "message": "Found 2 order(s) for NFC: ABC123",
  "orders": [
    {
      "id": 1,
      "order_id": "ORD-12345",
      "user_id": "user-123",
      "items": [
        {
          "name": "Producto 1",
          "quantity": 2,
          "price": 10.50
        }
      ],
      "total": 21.00,
      "status": "paid",
      "created_at": "2025-01-19T12:00:00.000Z",
      "dispenser_id": null
    }
  ]
}
```

##### Sin órdenes (200)
```json
{
  "message": "No orders found for this NFC",
  "orders": []
}
```

##### Error de validación (400)
```json
{
  "message": "NFC parameter is required"
}
```

##### Error del servidor (500)
```json
{
  "error": "Error retrieving orders by NFC"
}
```

## Ejemplos de Uso

### cURL
```bash
curl -X GET "http://localhost:3000/api/v1/pago/nfc/ABC123"
```

### JavaScript (Fetch)
```javascript
const nfc = 'ABC123';

fetch(`/api/v1/pago/nfc/${nfc}`)
  .then(response => response.json())
  .then(data => {
    if (data.orders && data.orders.length > 0) {
      console.log('Órdenes encontradas:', data.orders);
    } else {
      console.log('No se encontraron órdenes para este NFC');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Axios
```javascript
import axios from 'axios';

async function getOrdersByNFC(nfc) {
  try {
    const response = await axios.get(`/api/v1/pago/nfc/${nfc}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching orders: ${error.message}`);
  }
}

// Uso
getOrdersByNFC('ABC123')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

## Estructura de la Base de Datos

El endpoint utiliza la siguiente consulta SQL:
```sql
SELECT o.* 
FROM orders o 
INNER JOIN usuario u ON o.user_id = u.id 
WHERE u.nfc = ? 
ORDER BY o.created_at DESC
```

### Tablas involucradas:
- **orders**: Contiene la información de las órdenes
- **usuario**: Contiene la información de usuarios incluido el campo NFC

## Estados de Órdenes

Las órdenes pueden tener los siguientes estados:
- `pending`: Orden pendiente de pago
- `paid`: Orden pagada
- `dispensed`: Orden dispensada
- `cancelled`: Orden cancelada

## Notas Técnicas

1. **Inyección de Dependencias**: El caso de uso recibe el repositorio como dependencia
2. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad específica
3. **Manejo de Errores**: Incluye manejo de errores en todas las capas
4. **Validaciones**: Valida la presencia del parámetro NFC
5. **Ordenamiento**: Las órdenes se devuelven ordenadas por fecha de creación (más recientes primero)

## Testing

Se incluye un archivo de pruebas unitarias en:
`tests/unit/application/message/GetOrdersByNFC.test.js`

Para ejecutar las pruebas:
```bash
npm test
```
