import {Column, Entity} from '../../src/decorators'
import { BasicModel } from './basic';

type PaymentStatus = 'paying' | 'paid' | 'canceled';

@Entity('payment')
export class Payment extends BasicModel {
  @Column('project_id')
  order_id: number;

  @Column('user_id')
  user_id: number;

  @Column('total_paied')
  total_paied: number;

  @Column('status')
  status: PaymentStatus;
}