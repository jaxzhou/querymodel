import {Column, Entity} from '../../src/decorators'

@Entity('user')
export class User {
  @Column()
  id: number;

  @Column('first_name')
  fisrtName: string;

  @Column('last_name')
  lastName: string;

  @Column()
  age: number;
}