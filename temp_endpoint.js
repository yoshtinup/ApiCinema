// Endpoint para actualizar el status de una orden SOLO por orderId (sin NFC)
PagoRouter.put("/pago/order/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false,
        error: 'El campo status es requerido' 
      });
    }

    // Importar y usar el caso de uso específico
    const { UpdateOrderStatusById } = await import('../../../../Aplicativo/UpdateOrderStatusById.js');
    const { PagoRepository } = await import('../../../adapters/repositories/PagoRepository.js');
    const pagoRepo = new PagoRepository();
    const updateUseCase = new UpdateOrderStatusById(pagoRepo);
    
    const result = await updateUseCase.execute(orderId, status);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.order
    });

  } catch (error) {
    console.error('Error updating order status by orderId:', error);
    
    if (error.message.includes('No se encontró') ||
        error.message.includes('Status inválido') ||
        error.message.includes('es requerido') ||
        error.message.includes('Transición de estado no válida')) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});
