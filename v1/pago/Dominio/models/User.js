import { v4 as uuidv4 } from 'uuid';

export class User {
  constructor(id, iduser, idproducto, cantidad, codigo) {
    this.id = id;
    this.iduser = iduser;
    this.idproducto = idproducto; // Ahora se asigna un UUID por defecto si no se pasa un valor
    this.cantidad = cantidad;
    this.codigo = codigo;
  }

  // Método para obtener el resumen del producto
  getProductoSummary() {
    return `ID: ${this.id}, ID Usuario: ${this.iduser}, Código: ${this.idproducto}, Total: ${this.cantidad}, Fecha: ${this.codigo}`;
  }
}
