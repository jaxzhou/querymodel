import {Column, Entity} from '../../src/decorators'
import { BasicModel } from './basic';

@Entity('transfer')
export class Transfer extends BasicModel {
  @Column('id')
  id: number;

  @Column('project_id')
  order_id: number;

  @Column('transfer_name')
  express_name: string;

  @Column('transfer_id')
  express_id: number;

  @Column('status')
  status: string;

}