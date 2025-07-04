import { v4 as uuidv4 } from 'uuid';

export class CarritosUser {
  constructor(id, iduser, idproducto, fecha, hora) {
    this.id = id;
    this.iduser = iduser;
    this.idproducto = idproducto;
    this.fecha = fecha;
    this.hora = hora;
  }
  // Método para obtener el resumen del producto
  getProductoSummary() {
    return `ID: ${this.id}, ID Usuario: ${this.iduser}, ID Producto: ${this.idproducto}, Fecha: ${this.fecha}, Hora: ${this.hora}`;
  }
}
