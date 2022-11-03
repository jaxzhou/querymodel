import {Column} from '../../src/decorators'

export class BasicModel {
  @Column('create_at')
  createAt: Date;

  @Column('update_at')
  updateAt: Date;
}