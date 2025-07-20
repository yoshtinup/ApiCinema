import { CreateOrder } from "../../Aplicativo/CreateOrder.js";

export class OrderController {
  constructor(pagoRepository) {
    this.createOrderUseCase = new CreateOrder(pagoRepository);
  }

  // Endpoint para crear una orden
  async createOrder(req, res) {
    try {
      // Recibe los datos de la orden
      const orderData = req.body;
      
      // Agregar el NFC del usuario autenticado si está disponible
      if (req.user?.nfc && !orderData.nfc) {
        orderData.nfc = req.user.nfc;
      }
      
      const newOrder = await this.createOrderUseCase.execute(orderData);
      res.status(201).json({ message: "Orden creada correctamente", order: newOrder });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
