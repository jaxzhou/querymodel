import { GT } from "../../src/schema";
import { Order } from "../models/order";
import { OrderWithStatus } from "../models/queries/order_with_status";
import { MySql } from "../source/mysql";
import { sqlClient } from "../source/sql_client";

describe('Order', () => {
  describe('Sql Validate', () => {
    let mySql = new MySql();
    it('get', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(Order, {});
      expect(query).toBeCalledWith('select create_at as createAt, update_at as updateAt, id as id, name as name, type as type, price as price from `order` as `order`', [])
    });

    it('get - extend property condition', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      const date = new Date('2022-01-01');
      await mySql.getOne(Order, {createAt: GT(date)});
      expect(query).toBeCalledWith('select create_at as createAt, update_at as updateAt, id as id, name as name, type as type, price as price from `order` as `order` where create_at > ?', [date])
    });
  });
});

describe('Order With Status', () => {
  describe('Sql Validate', () => {
    let mySql = new MySql();
    it('get', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(OrderWithStatus, {});
      expect(query).toBeCalledWith('select order.id as order_id, payment.status as payment_status, transfer.status as transfer_status, coalesce(trans.update_at,payment.update_at,order.update_at) as updateAt from `order` as `order` left join `payment` as `payment` on (payment.order_id = order.id) left join `transfer` as `trans` on (trans.order_id = order.id)', [])
    });

    it('get - extend property condition', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      const date = new Date('2022-01-01');
      await mySql.getOne(OrderWithStatus, {updateAt: GT(date)});
      expect(query).toBeCalledWith('select order.id as order_id, payment.status as payment_status, transfer.status as transfer_status, coalesce(trans.update_at,payment.update_at,order.update_at) as updateAt from `order` as `order` left join `payment` as `payment` on (payment.order_id = order.id) left join `transfer` as `trans` on (trans.order_id = order.id) where coalesce(trans.update_at,payment.update_at,order.update_at) > ?', [date])
    });
  });
});