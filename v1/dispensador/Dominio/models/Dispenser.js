import { v4 as uuidv4 } from 'uuid';

export class Dispenser {
  constructor({
    dispenser_id = uuidv4(),
    location = '',
    status = 'online',
    products = [],
    last_maintenance = new Date().toISOString(),
    error_count = 0
  } = {}) {
    this.dispenser_id = dispenser_id;
    this.location = location;
    this.status = status;
    this.products = products;
    this.last_maintenance = last_maintenance;
    this.error_count = error_count;
  }

  getSummary() {
    return `Dispenser ID: ${this.dispenser_id}, Location: ${this.location}, Status: ${this.status}, Last Maintenance: ${this.last_maintenance}, Error Count: ${this.error_count}`;
  }
}
