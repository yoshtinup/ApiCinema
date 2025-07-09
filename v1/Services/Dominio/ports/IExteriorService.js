export class IExteriorService {
    createPaymentPreference(item) {
      throw new Error('IPaymentService: Method createPaymentPreference must be implemented');
    }
    sendMessage(to, body){
      throw new Error('IPaymentService: Method senMessage must be implemented'); 
    }
    sendCorreo(to, body){
      throw new Error('IPaymentService: Method senMessage must be implemented'); 
    }   
}