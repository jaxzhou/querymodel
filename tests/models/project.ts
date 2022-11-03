import {Column, Entity} from '../../src/decorators'
import { BasicModel } from './basic';

@Entity('project')
export class Project extends BasicModel {
  @Column()
  id: number;

  @Column('name')
  name: string;

  @Column('type')
  type: string;
}