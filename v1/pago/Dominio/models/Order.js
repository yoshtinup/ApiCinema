import { v4 as uuidv4 } from 'uuid';

export class Order {
  constructor(
    order_id = uuidv4(),
    user_id,
    items = [],
    total = 0.00,
    status = 'pending',
    created_at = new Date().toISOString(),
    dispenser_id = null
  ) {
    this.order_id = order_id;
    this.user_id = user_id;
    this.items = items;
    this.total = total;
    this.status = status;
    this.created_at = created_at;
    this.dispenser_id = dispenser_id;
  }

  getOrderSummary() {
    return `Order ID: ${this.order_id}, User ID: ${this.user_id}, Total: ${this.total}, Status: ${this.status}, Created At: ${this.created_at}`;
  }
}