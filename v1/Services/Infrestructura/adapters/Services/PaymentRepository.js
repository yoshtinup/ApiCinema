
import { IExteriorService } from '../../../Dominio/ports/IExteriorService.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export class PaymentRepository extends IExteriorService {
  constructor() {
    super();
    this.mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  }
    async createPayment(item) {
        try {
          const preference = new Preference(this.mpClient);

          const response = await preference.create({
            body: {
              items: [item],
              back_urls: {
                success: "https://www.tu-sitio.com/success",
                failure: "https://localhost:5173/carrito",
                pending: "https://www.tu-sitio.com/pending"
              },
              auto_return: "approved"
            }
          })
          return {
            init_point: response.init_point
          };
        } catch (error) {
          throw new Error(`Error creando preferencia de pago: ${error.message}`);
        }
      }
}
