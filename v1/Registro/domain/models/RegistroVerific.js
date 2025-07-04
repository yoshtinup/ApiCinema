
export class RegistroVerific {
    constructor(id, codigo='') {
      this.id = id ?? null;
      this.codigo = codigo ; 
      
    }

    getFullName() {
      return `${this.codigo}`;
    }
  }
  