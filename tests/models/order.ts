import {Column, Entity} from '../../src/decorators'
import { BasicModel } from './basic';

@Entity('order')
export class Order extends BasicModel {
  @Column()
  id: number;

  @Column('name')
  name: string;

  @Column('type')
  type: string;

  @Column('price')
  price: number;

}