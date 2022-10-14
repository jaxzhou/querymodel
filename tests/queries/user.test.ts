import { User } from "../models/user";
import { MySql } from "../source/mysql";
import { sqlClient } from "../source/sql_client";

describe('User', () => {
  describe('Sql Validate', () => {
    let mySql = new MySql();
    it('get', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, {});
      expect(query).toBeCalledWith('select id, first_name, last_name, age from `user` as `user`', [])
    });

    it('condition', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { id: 10 });
      expect(query).toBeCalledWith('select id, first_name, last_name, age from `user` as `user` where id = ?', [10])
    });

    it('condition', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { id: 10 });
      expect(query).toBeCalledWith('select id, first_name, last_name, age from `user` as `user` where id = ?', [10])
    });
  })
})