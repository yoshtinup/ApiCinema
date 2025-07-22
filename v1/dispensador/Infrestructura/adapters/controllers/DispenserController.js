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
      const dispenser = await this.createDispenser.execute(req.body);
       console.log('Datos recibidos:', req.body);
  console.log('Name:', req.body.name);
  console.log('Status:', req.body.status);
  console.log('Items:', req.body.items);
  
      res.status(201).json(dispenser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
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
