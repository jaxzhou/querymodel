# QueryModel

## Why Query Model

Do you have used the Object Relational Mapping (ORM) before? The ORM resolve the code model type with table defination in database. That would make the database operate easy with code.

But the problem is the simple table selection is enough? If we in a data project the ORM seems to be too simple for our needs. so we still need to write sqls in code, most time the sql would be a string that not easy to be review and reuse.

Also in typescript, the query with sql string may need data struct defination or use *any* type. that make the coding duplicate and boring.

So if we need to defined the return data, why not just defined the query with it. That is the query model. focuse on the query and return type, not the table in database.

## How To

### Install

```npm install --save querymodel```

### HOW TO USE

- We could use querymodel like ORM to defined the simple query of a table

```typescript
import {Column, Entity} from 'querymodel';

@Entity('user')
export class User {
  @Column()
  id: number;

  @Column('first_name')
  firstName: string;

  @Column('last_name')
  lastName: string;

  @Column()
  age: number;
}
```

*Entity* is the simple selection with ```select ... from ${table_name}```

*Column* is the colum as ```select ${column_name} as ${filedName} ...```

- But we may need to do some selection

```typescript
import {Column, Entity, Select, concat} from 'querymodel';

@Entity('user')
export class User {
  @Column()
  id: number;

  @Column('first_name')
  firstName: string;

  @Column('last_name')
  lastName: string;
  
  @Select(concat('fist_name', '\' \'', 'last_name'))
  fullName: string;

  @Column()
  age: number;
}
```

*Select* allow to return new field.

- Or we use it as a totoally query

```typescript
import {Query, SelectQueryBuilder,  Select, coalesce} from 'querymodel';

@Query((qb: SelectQueryBuilder) => {
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
```

that a commmon sence that we need to join two or more tabel to fetch the data back in one sql. Use ```Query``` decorator to defined how the data composed, and use ```Select``` to defined how the fields to be computed.

Also The *from* and *join* would be a simpel table or a defined query. Then you could defined the common query would be used in multi query and resue it in the defination of multi query models.

### EXAMPLES

view the model defined in ```tests/models```  and ```tests/models/queries```

### SUPPORT

mail to jaxzhou@hotmail.com

### LICENSE

MIT