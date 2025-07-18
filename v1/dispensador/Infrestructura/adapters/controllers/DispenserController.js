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

  async deleteById(req, res) {
    try {
      await this.deleteDispenserById.execute(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}
