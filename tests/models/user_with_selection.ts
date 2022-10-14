import {Column, Entity, Select} from '../../src/decorators'
import { concat } from '../../src/schema';

@Entity('user')
export class User {
  @Column()
  id: number;

  @Column('first_name')
  firstName: string;

  @Column('last_name')
  lastName: string;

  @Select(concat('fist_name', 'last_name'))
  fullName: string;

  @Column()
  age: number;
}