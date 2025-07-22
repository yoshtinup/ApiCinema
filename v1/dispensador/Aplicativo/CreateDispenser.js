import { Dispenser } from '../Dominio/models/Dispenser.js';

export class CreateDispenser {
  constructor(dispenserRepository) {
    this.dispenserRepository = dispenserRepository;
  }
  
  async execute(dispenserData) {
    try {
      console.log('📝 CreateDispenser - Datos recibidos:', dispenserData);
      
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
      
      console.log('🏗️  Modelo Dispenser creado:', dispenser);
      
      const result = await this.dispenserRepository.createDispenser(dispenser);
      
      console.log('✅ Dispensador creado exitosamente:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error en CreateDispenser:', error.message);
      console.error('📊 Stack trace:', error.stack);
      throw error;
    }
  }
}
