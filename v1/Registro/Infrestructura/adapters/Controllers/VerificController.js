
import { CreateVerific } from "../../../aplicationVerific/CreateVerific.js";
import { GetAllVerific } from "../../../aplicationVerific/GetAllVerific.js";

export class VerificController {
  constructor(clientRepository) {
    this.createClientUseVerific = new CreateVerific(clientRepository);
    this.getAllVereficsUseCase = new GetAllVerific(clientRepository);
  }
  // Método para manejar la solicitud HTTP POST /clients
  async createNewVerific(req, res) {
    try {
      const {codigo} = req.body;

      // Crear los datos del cliente y ejecutar el caso de uso para crear al cliente
      const clientData = {
        codigo: codigo ?? ''
      };

      const newClient = await this.createClientUseVerific.execute(clientData);

      // Responder con los datos del cliente creado
      res.status(201).json(newClient);


    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async getAllVerific(req, res) {
    try {
      const clients = await this.getAllVereficsUseCase.execute();
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }


}

