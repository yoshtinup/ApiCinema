import { v4 as uuidv4 } from 'uuid';

export class User {
  constructor(id, iduser, codigo = uuidv4(), total, fecha) {
    this.id = id;
    this.iduser = iduser;
    this.codigo = codigo; // Ahora se asigna un UUID por defecto si no se pasa un valor
    this.total = total;
    this.fecha = fecha;
  }

  // Método para obtener el resumen del producto
  getProductoSummary() {
    return `ID: ${this.id}, ID Usuario: ${this.iduser}, Código: ${this.codigo}, Total: ${this.total}, Fecha: ${this.fecha}`;
  }
}
