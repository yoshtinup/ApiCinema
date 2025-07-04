import { v4 as uuidv4 } from 'uuid';

export class ProductoUser {
  constructor(id, nombre, descripcion, precio, peso, cantidad, categoria, ingreso, imagen= null) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio; 
    this.peso = peso;
    this.cantidad = cantidad;
    this.categoria = categoria;
    this.ingreso = ingreso;
    this.imagen = imagen;
  }



  // Método para obtener el resumen del producto
  getProductoSummary() {
    return `ID: ${this.id}, Nombre: ${this.nombre}, Descripción: ${this.descripcion}, Precio: ${this.precio}, Peso: ${this.peso}, Cantidad: ${this.cantidad}, Categoría: ${this.categoria}, Ingreso: ${this.ingreso}`;
  }
}
