/**
 * Cliente JavaScript para gestionar órdenes con sistema de prioridades
 * Este archivo demuestra cómo implementar la funcionalidad desde el frontend
 */

class OrderPriorityManager {
  constructor(baseUrl = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtener todas las órdenes pendientes de dispensar para un NFC
   * @param {string} nfc - Código NFC del usuario
   * @returns {Promise<Array>} - Lista de órdenes pendientes
   */
  async getPendingOrders(nfc) {
    try {
      const response = await fetch(`${this.baseUrl}/pago/nfc/${nfc}/pending`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message);
      }
      
      return data.orders;
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      throw error;
    }
  }

  /**
   * Seleccionar una orden específica para dispensar
   * @param {string} orderId - ID de la orden a dispensar
   * @param {string} nfc - Código NFC del usuario
   * @param {string} dispenserId - ID del dispensador (opcional)
   * @returns {Promise<Object>} - Orden seleccionada
   */
  async selectOrderForDispensing(orderId, nfc, dispenserId = null) {
    try {
      const response = await fetch(`${this.baseUrl}/pago/select/${orderId}/nfc/${nfc}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dispenserId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message);
      }
      
      return data.order;
    } catch (error) {
      console.error('Error selecting order for dispensing:', error);
      throw error;
    }
  }

  /**
   * Obtener la orden que está preparada para dispensar en un NFC
   * @param {string} nfc - Código NFC del usuario
   * @returns {Promise<Object>} - Orden preparada
   */
  async getReadyOrder(nfc) {
    try {
      const response = await fetch(`${this.baseUrl}/pago/nfc/${nfc}/ready`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching ready order:', error);
      throw error;
    }
  }

  /**
   * Dispensar la orden cargada en el NFC
   * @param {string} nfc - Código NFC del usuario
   * @param {string} dispenserId - ID del dispensador
   * @returns {Promise<Object>} - Orden dispensada
   */
  async dispenseOrder(nfc, dispenserId) {
    try {
      const response = await fetch(`${this.baseUrl}/pago/nfc/${nfc}/dispense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dispenserId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message);
      }
      
      return data;
    } catch (error) {
      console.error('Error dispensing order:', error);
      throw error;
    }
  }

  /**
   * Crear la interfaz de selección de órdenes
   * @param {string} nfc - Código NFC del usuario
   * @param {string} containerId - ID del contenedor HTML
   */
  async renderOrderSelector(nfc, containerId) {
    const container = document.getElementById(containerId);
    
    try {
      // Obtener órdenes pendientes
      const pendingOrders = await this.getPendingOrders(nfc);
      
      if (pendingOrders.length === 0) {
        container.innerHTML = `
          <div class="no-orders">
            <h3>No hay órdenes pendientes de dispensar</h3>
            <p>El usuario con NFC: ${nfc} no tiene órdenes pagadas pendientes de dispensar.</p>
          </div>
        `;
        return;
      }

      // Crear lista de órdenes con prioridades
      const ordersList = pendingOrders.map((order, index) => `
        <div class="order-card" data-order-id="${order.order_id}">
          <div class="order-header">
            <h4>Orden #${order.order_id}</h4>
            <span class="priority-badge">Prioridad ${index + 1}</span>
          </div>
          <div class="order-details">
            <p><strong>Total:</strong> $${order.total}</p>
            <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Items:</strong> ${order.items.length} producto(s)</p>
          </div>
          <div class="order-items">
            ${order.items.map(item => `
              <div class="item">
                <span>${item.name || item.title} x${item.quantity}</span>
                <span>$${(item.price || item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <button class="select-order-btn" onclick="orderManager.selectOrder('${order.order_id}', '${nfc}')">
            🔄 Cargar al NFC
          </button>
        </div>
      `).join('');

      container.innerHTML = `
        <div class="orders-container">
          <h3>Órdenes Pendientes de Dispensar</h3>
          <p class="orders-count">Encontradas ${pendingOrders.length} orden(es) para NFC: ${nfc}</p>
          <div class="priority-info">
            <small>📋 Las órdenes están ordenadas por prioridad (más antiguas primero)</small>
          </div>
          <div class="orders-list">
            ${ordersList}
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="error">
          <h3>Error al cargar órdenes</h3>
          <p>${error.message}</p>
          <button onclick="orderManager.renderOrderSelector('${nfc}', '${containerId}')">
            Reintentar
          </button>
        </div>
      `;
    }
  }

  /**
   * Seleccionar orden y mostrar confirmación
   * @param {string} orderId - ID de la orden
   * @param {string} nfc - Código NFC
   */
  async selectOrder(orderId, nfc) {
    try {
      // Mostrar loading
      const button = document.querySelector(`[data-order-id="${orderId}"] .select-order-btn`);
      const originalText = button.textContent;
      button.textContent = '⏳ Cargando al NFC...';
      button.disabled = true;

      // Seleccionar orden
      const selectedOrder = await this.selectOrderForDispensing(orderId, nfc);
      
      // Mostrar confirmación
      this.showLoadConfirmation(selectedOrder, nfc);
      
      // Actualizar el botón para mostrar que ya está cargada
      button.textContent = '✅ Cargada en NFC';
      button.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
      
      // Deshabilitar otros botones
      this.disableOtherButtons(orderId);
      
    } catch (error) {
      alert(`Error al cargar orden al NFC: ${error.message}`);
      
      // Restaurar botón
      const button = document.querySelector(`[data-order-id="${orderId}"] .select-order-btn`);
      button.textContent = '🔄 Cargar al NFC';
      button.disabled = false;
    }
  }

  /**
   * Deshabilitar otros botones cuando una orden ya está cargada
   * @param {string} selectedOrderId - ID de la orden seleccionada
   */
  disableOtherButtons(selectedOrderId) {
    const allButtons = document.querySelectorAll('.select-order-btn');
    allButtons.forEach(button => {
      const orderCard = button.closest('.order-card');
      const orderId = orderCard.getAttribute('data-order-id');
      
      if (orderId !== selectedOrderId) {
        button.textContent = '❌ Otra orden cargada';
        button.disabled = true;
        button.style.background = '#6c757d';
      }
    });
  }

  /**
   * Mostrar confirmación de orden cargada al NFC
   * @param {Object} order - Orden seleccionada
   * @param {string} nfc - Código NFC
   */
  showLoadConfirmation(order, nfc) {
    const confirmationHtml = `
      <div class="confirmation-modal">
        <div class="confirmation-content">
          <h3>🎯 ¡Orden Cargada al NFC!</h3>
          <div class="nfc-loaded-message">
            <p><strong>✅ Tu orden está lista para dispensar</strong></p>
            <p>Simplemente escanea tu NFC en cualquier dispensador</p>
          </div>
          <div class="selected-order-details">
            <p><strong>Orden:</strong> ${order.order_id}</p>
            <p><strong>Total:</strong> $${order.total}</p>
            <p><strong>Estado:</strong> ${order.status}</p>
            <p><strong>NFC:</strong> ${nfc}</p>
          </div>
          <div class="instructions">
            <h4>📋 Instrucciones:</h4>
            <ol>
              <li>Ve a cualquier dispensador del cinema</li>
              <li>Escanea tu código NFC: <strong>${nfc}</strong></li>
              <li>Tu orden se dispensará automáticamente</li>
              <li>¡Disfruta tu pedido! 🍿</li>
            </ol>
          </div>
          <div class="confirmation-actions">
            <button onclick="this.closest('.confirmation-modal').remove()">
              Entendido
            </button>
            <button onclick="orderManager.showReadyOrder('${nfc}')">
              Ver Orden Cargada
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHtml);
  }

  /**
   * Mostrar la orden que está cargada en el NFC
   * @param {string} nfc - Código NFC
   */
  async showReadyOrder(nfc) {
    try {
      const readyData = await this.getReadyOrder(nfc);
      
      const readyOrderHtml = `
        <div class="confirmation-modal">
          <div class="confirmation-content">
            <h3>📱 Orden Cargada en NFC: ${nfc}</h3>
            <div class="ready-order-info">
              <p><strong>Tipo:</strong> ${readyData.isUserSelected ? '👤 Seleccionada por ti' : '🔄 Orden por defecto'}</p>
              <p><strong>Estado:</strong> Lista para dispensar</p>
            </div>
            <div class="selected-order-details">
              <p><strong>Orden ID:</strong> ${readyData.order.order_id}</p>
              <p><strong>Total:</strong> $${readyData.order.total}</p>
              <p><strong>Items:</strong> ${readyData.order.items.length} producto(s)</p>
            </div>
            <div class="dispenser-simulation">
              <h4>🤖 Simular Dispensado</h4>
              <p>Prueba el proceso de dispensado:</p>
              <input type="text" id="dispenser-id" placeholder="ID del Dispensador (ej: DISP-001)" style="width: 100%; padding: 8px; margin: 10px 0;">
              <button onclick="orderManager.simulateDispense('${nfc}')" style="width: 100%; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 5px;">
                🎯 Dispensar Orden
              </button>
            </div>
            <div class="confirmation-actions">
              <button onclick="this.closest('.confirmation-modal').remove()">Cerrar</button>
            </div>
          </div>
        </div>
      `;
      
      // Cerrar modal anterior si existe
      const existingModal = document.querySelector('.confirmation-modal');
      if (existingModal) existingModal.remove();
      
      document.body.insertAdjacentHTML('beforeend', readyOrderHtml);
    } catch (error) {
      alert(`Error al obtener orden cargada: ${error.message}`);
    }
  }

  /**
   * Simular el dispensado de la orden
   * @param {string} nfc - Código NFC
   */
  async simulateDispense(nfc) {
    try {
      const dispenserId = document.getElementById('dispenser-id').value || 'DISP-001';
      
      const dispensedData = await this.dispenseOrder(nfc, dispenserId);
      
      // Mostrar confirmación de dispensado
      const modal = document.querySelector('.confirmation-modal');
      modal.innerHTML = `
        <div class="confirmation-content">
          <h3>🎉 ¡Orden Dispensada Exitosamente!</h3>
          <div class="success-message">
            <p>✅ Tu orden ha sido dispensada correctamente</p>
            <p><strong>Orden:</strong> ${dispensedData.order.order_id}</p>
            <p><strong>Dispensador:</strong> ${dispenserId}</p>
            <p><strong>Hora:</strong> ${new Date(dispensedData.order.dispensedAt).toLocaleString()}</p>
          </div>
          <div class="instructions">
            <p>🍿 Por favor recoge tus productos del dispensador</p>
            <p>Tu NFC ahora está libre para futuras órdenes</p>
          </div>
          <div class="confirmation-actions">
            <button onclick="this.closest('.confirmation-modal').remove(); orderManager.renderOrderSelector('${nfc}', 'orders-container')">
              Ver Órdenes Restantes
            </button>
          </div>
        </div>
      `;
    } catch (error) {
      alert(`Error al dispensar orden: ${error.message}`);
    }
  }
}

// Instancia global para usar en el HTML
const orderManager = new OrderPriorityManager();

// Ejemplo de uso básico
/*
// En tu HTML, incluye un contenedor:
// <div id="orders-container"></div>

// Luego llama a la función para renderizar:
document.addEventListener('DOMContentLoaded', () => {
  const nfcCode = 'ABC123'; // Obtener del escáner NFC o input
  orderManager.renderOrderSelector(nfcCode, 'orders-container');
});
*/
