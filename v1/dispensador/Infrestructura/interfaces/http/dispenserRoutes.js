import express from 'express';
import { DispenserController } from '../../adapters/controllers/DispenserController.js';
import { DispenserRepository } from '../../adapters/repositories/DispenserRepository.js';
import { CreateDispenser } from '../../../Aplicativo/CreateDispenser.js';
import { GetAllDispenser } from '../../../Aplicativo/GetAllDispenser.js';
import { GetDispenserById } from '../../../Aplicativo/GetDispenserById.js';
import { UpdateDispenserById } from '../../../Aplicativo/UpdateDispenserById.js';
import { DeleteDispenserById } from '../../../Aplicativo/DeleteDispenserById.js';
import { db } from '../../../../../database/mysql.js';
const router = express.Router();

const dispenserRepository = new DispenserRepository(db);

const dispenserController = new DispenserController({
  createDispenser: new CreateDispenser(dispenserRepository),
  getAllDispenser: new GetAllDispenser(dispenserRepository),
  getDispenserById: new GetDispenserById(dispenserRepository),
  updateDispenserById: new UpdateDispenserById(dispenserRepository),
  deleteDispenserById: new DeleteDispenserById(dispenserRepository)
});

router.post('/dispenser', (req, res) => dispenserController.create(req, res));
router.get('/dispenser', (req, res) => dispenserController.getAll(req, res));
router.get('/dispenser/:id', (req, res) => dispenserController.getById(req, res));
router.put('/dispenser/:id', (req, res) => dispenserController.updateById(req, res));
router.delete('/dispenser/:id', (req, res) => dispenserController.deleteById(req, res));

export default router;