import { Query, Select } from "../../../src/decorators";
import { coalesce } from "../../../src/schema";
import { Order } from "../order";
import { Payment } from "../payment";
import { Transfer } from "../transfer";

@Query((qb) => {
  return qb.from(Order, 'order')
  .leftJoin(Payment, 'payment', {
    'payment.order_id': 'order.id'
  })
  .leftJoin(Transfer, 'trans', {
    'trans.order_id': 'order.id'
  })
})
export class OrderWithStatus {
  @Select('order.id')
  order_id: number;

  @Select('payment.status')
  payment_status: string;

  @Select('transfer.status')
  transfer_status: string;

  @Select(coalesce('trans.update_at', 'payment.update_at', 'order.update_at'))
  updateAt: Date;
}