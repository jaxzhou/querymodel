import { User } from "../models/user_with_selection";
import { MySql } from "../source/mysql";
import { sqlClient } from "../source/sql_client";

describe('User', () => {
  describe('Sql Validate', () => {
    let mySql = new MySql();
    it('get', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, {});
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age, concat(fist_name,last_name) as fullName from `user` as `user`', [])
    });

    it('condition', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { id: 10 });
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age, concat(fist_name,last_name) as fullName from `user` as `user` where id = ?', [10])
    });

    it('condition', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { id: 10 });
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age, concat(fist_name,last_name) as fullName from `user` as `user` where id = ?', [10])
    });
  })
})