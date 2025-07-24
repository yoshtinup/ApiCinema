export class UpdateOrderStatusByNFC {
    constructor(pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    async execute(nfc, newStatus) {
        try {
            // Validar que el status sea válido
            const validStatuses = ['pending', 'paid', 'dispensed', 'cancelled'];
            if (!validStatuses.includes(newStatus)) {
                throw new Error(`Status inválido. Los valores permitidos son: ${validStatuses.join(', ')}`);
            }

            // Validar que el NFC no esté vacío
            if (!nfc || nfc.trim() === '') {
                throw new Error('El NFC es requerido');
            }

            // Buscar la orden por NFC
            const order = await this.pagoRepository.findOrderByNFC(nfc);
            
            if (!order) {
                throw new Error(`No se encontró ninguna orden asociada al NFC: ${nfc}`);
            }

            // Si el estado actual ya es el mismo que se quiere establecer, retornar éxito sin hacer cambios
            if (order.status === newStatus) {
                return {
                    success: true,
                    message: `La orden ya se encuentra en estado '${newStatus}', no se requiere actualización`,
                    order: {
                        order_id: order.order_id,
                        previous_status: order.status,
                        new_status: order.status,
                        nfc: nfc,
                        updated_at: new Date().toISOString()
                    }
                };
            }

            // Validar transiciones de estado permitidas
            if (!this.isValidStatusTransition(order.status, newStatus)) {
                throw new Error(`Transición de estado no válida: de '${order.status}' a '${newStatus}'`);
            }

            // Actualizar el status de la orden
            const updatedOrder = await this.pagoRepository.updateOrderStatus(order.order_id, newStatus);

            return {
                success: true,
                message: `Orden actualizada exitosamente de '${order.status}' a '${newStatus}'`,
                order: {
                    order_id: updatedOrder.order_id,
                    previous_status: order.status,
                    new_status: newStatus,
                    nfc: nfc,
                    updated_at: new Date().toISOString()
                }
            };

        } catch (error) {
            throw new Error(`Error al actualizar orden por NFC: ${error.message}`);
        }
    }

    // Validar transiciones de estado lógicas
    isValidStatusTransition(currentStatus, newStatus) {
        const transitions = {
            'pending': ['paid', 'cancelled'],
            'paid': ['dispensed', 'cancelled'],
            'dispensed': [], // Estado final
            'cancelled': [] // Estado final
        };

        return transitions[currentStatus]?.includes(newStatus) || false;
    }
}
