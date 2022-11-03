import {Column, Entity} from '../../src/decorators'
import { BasicModel } from './basic';

@Entity('project')
export class ProjectMember extends BasicModel {
  @Column('project_id')
  project_id: number;

  @Column('user_id')
  user_id: number;
}