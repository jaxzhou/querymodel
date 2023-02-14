import { BETWEEN, GT, LIKE, LTE } from "../../src/schema";
import { UserPaidByDate } from "../models/queries/user_paid_by_date";
import { MySql } from "../source/mysql";
import { sqlClient } from "../source/sql_client";

describe('Payment', () => {
  let mySql = new MySql();
  describe('Sql Validate', () => {
    it('selection', async () => {
        const query = jest.spyOn(sqlClient, 'query');
        await mySql.getMany(UserPaidByDate, {});
        expect(query).toBeCalledWith('select user.id as user_id, date(payment.paied_time) as paid_date, sum(payment.total) as total_paid from `payment` as `payment` left join `user` as `user` on (payment.user_id = user.id) group by `user_id`, 2', [])
    });
    
    it('condition', async () => {
        const query = jest.spyOn(sqlClient, 'query');
        await mySql.getMany(UserPaidByDate, {user_id: 'testId'});
        expect(query).toBeCalledWith('select user.id as user_id, date(payment.paied_time) as paid_date, sum(payment.total) as total_paid from `payment` as `payment` left join `user` as `user` on (payment.user_id = user.id) where user.id = ? group by `user_id`, 2', ['testId'])
    });
    
    it('condition - func column', async () => {
        const query = jest.spyOn(sqlClient, 'query');
        const d = new Date();
        await mySql.getMany(UserPaidByDate, {paid_date: LTE(d)});
        expect(query).toBeCalledWith('select user.id as user_id, date(payment.paied_time) as paid_date, sum(payment.total) as total_paid from `payment` as `payment` left join `user` as `user` on (payment.user_id = user.id) where date(payment.paied_time) <= ? group by `user_id`, 2', [d])
    });
    
    it('condition - having column', async () => {
        const query = jest.spyOn(sqlClient, 'query');
        await mySql.getMany(UserPaidByDate, {total_paid: LTE(100)});
        expect(query).toBeCalledWith('select user.id as user_id, date(payment.paied_time) as paid_date, sum(payment.total) as total_paid from `payment` as `payment` left join `user` as `user` on (payment.user_id = user.id) group by `user_id`, 2 having sum(payment.total) <= ?', [100])
    });
  })
});