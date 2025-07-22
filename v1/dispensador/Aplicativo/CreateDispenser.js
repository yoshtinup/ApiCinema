import { Dispenser } from '../Dominio/models/Dispenser.js';

export class CreateDispenser {
  constructor(dispenserRepository) {
    this.dispenserRepository = dispenserRepository;
  }
  
  async execute(dispenserData) {
    // Validar datos requeridos
    if (!dispenserData.location || dispenserData.location.trim() === '') {
      throw new Error('Location is required');
    }
    
    // Crear instancia del modelo con valores por defecto seguros
    const dispenser = new Dispenser({
      dispenser_id: dispenserData.dispenser_id,
      location: dispenserData.location.trim(),
      status: dispenserData.status || 'online',
      products: Array.isArray(dispenserData.products) ? dispenserData.products : [],
      last_maintenance: dispenserData.last_maintenance || new Date().toISOString(),
      error_count: dispenserData.error_count || 0,
      // Pasar datos adicionales si existen (como apartados)
      apartados: dispenserData.apartados
    });
    
    return await this.dispenserRepository.createDispenser(dispenser);
  }
}
