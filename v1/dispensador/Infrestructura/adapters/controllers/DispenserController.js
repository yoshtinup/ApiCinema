export class DispenserController {
  constructor({
    createDispenser,
    getAllDispenser,
    getDispenserById,
    updateDispenserById,
    deleteDispenserById
  }) {
    this.createDispenser = createDispenser;
    this.getAllDispenser = getAllDispenser;
    this.getDispenserById = getDispenserById;
    this.updateDispenserById = updateDispenserById;
    this.deleteDispenserById = deleteDispenserById;
  }

  async create(req, res) {
    try {
      console.log('🔍 Datos originales del frontend:', req.body);
      
      // Mapear datos del frontend al formato del backend
      const mappedData = this._mapFrontendToBackend(req.body);
      
      console.log('🔄 Datos mapeados para el backend:', mappedData);
      
      const dispenser = await this.createDispenser.execute(mappedData);
      res.status(201).json(dispenser);
    } catch (err) {
      console.error('❌ Error creando dispensador:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  // Mapear datos del frontend al formato esperado por el backend
  _mapFrontendToBackend(frontendData) {
    // Mapear status del frontend al backend
    const statusMap = {
      'active': 'online',
      'inactive': 'offline',
      'maintenance': 'maintenance',
      'online': 'online',
      'offline': 'offline'
    };

    return {
      dispenser_id: frontendData.name || frontendData.dispenser_id, // Frontend envía 'name'
      location: frontendData.location,
      status: statusMap[frontendData.status] || 'online', // Mapear status
      products: frontendData.items || frontendData.products || [], // Frontend envía 'items'
      last_maintenance: frontendData.last_maintenance,
      error_count: frontendData.error_count || 0,
      // Pasar datos adicionales si existen
      apartados: frontendData.apartados
    };
  }

  async getAll(req, res) {
    try {
      const dispensers = await this.getAllDispenser.execute();
      res.json(dispensers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const dispenser = await this.getDispenserById.execute(req.params.id);
      if (!dispenser) return res.status(404).json({ error: 'Not found' });
      res.json(dispenser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateById(req, res) {
    try {
      const updated = await this.updateDispenserById.execute(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }


  // Endpoint para rellenar inventario del dispensador
  async refillInventory(req, res) {
    try {
      const { dispenser_id, selectedProductBySection, quantities } = req.body;
      if (!dispenser_id || !selectedProductBySection || !quantities) {
        return res.status(400).json({ error: 'Faltan datos requeridos.' });
      }
      // Ejecuta la actualización usando el caso de uso existente
      const result = await this.updateDispenserById.execute(
        dispenser_id,
        { selectedProductBySection, quantities }
      );
      res.status(200).json({ message: 'Rellenado confirmado.', result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
