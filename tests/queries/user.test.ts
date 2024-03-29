import { BETWEEN, GT, LIKE, LTE } from "../../src/schema";
import { User } from "../models/user";
import { MySql } from "../source/mysql";
import { sqlClient } from "../source/sql_client";

describe('User', () => {
  describe('Sql Validate', () => {
    let mySql = new MySql();
    it('get', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, {});
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age from `user` as `user`', [])
    });

    it('condition', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { id: 10 });
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age from `user` as `user` where id = ?', [10])
    });

    it('condition - like', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { lastName: LIKE('Foo') });
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age from `user` as `user` where last_name like ?', ['Foo'])
    });

    it('condition - gt', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { age: GT(18) });
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age from `user` as `user` where age > ?', [18])
    });

    it('condition - lte', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { age: LTE(18) });
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age from `user` as `user` where age <= ?', [18])
    });

    it('condition - between', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { age: BETWEEN(18, 40) });
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age from `user` as `user` where age between ? and ?', [18, 40])
    });

    it('condition - IN', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { firstName: ['john', 'smith'] });
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age from `user` as `user` where first_name IN (?,?)', ['john', 'smith'])
    });

    it('condition - field compare', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { firstName: 'lastName' });
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age from `user` as `user` where first_name = last_name', [])
    });

    it('condition - Multi Fields', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(User, { firstName: ['john', 'smith'], age: BETWEEN(18, 60) });
      expect(query).toBeCalledWith('select id as id, first_name as firstName, last_name as lastName, age as age from `user` as `user` where first_name IN (?,?) and age between ? and ?', ['john', 'smith', 18, 60])
    });

    it('count', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getCount(User, {});
      expect(query).toBeCalledWith('select count(*) as count from `user` as `user`', [])
    });

    it('count - with condition', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getCount(User, { age: BETWEEN(18, 40) });
      expect(query).toBeCalledWith('select count(*) as count from `user` as `user` where age between ? and ?', [18, 40])
    });
  })
})