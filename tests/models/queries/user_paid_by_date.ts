import { Query, Select } from "../../../src/decorators";
import { date, sum } from "../../../src/schema";
import { User } from "../user";
import { Payment } from "../payment";

@Query((qb) => {
  return qb.from(Payment, 'payment')
  .leftJoin(User, 'user', {
    'payment.user_id': 'user.id',
  })
  .groupBy('user_id', 'paid_date')
})
export class UserPaidByDate {
  @Select('user.id')
  user_id: number;

  @Select(date('payment.paied_time'))
  paid_date: string;

  @Select(sum('payment.total'))
  total_paid: number;
}