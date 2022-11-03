import { BETWEEN, GT, LIKE, LTE } from "../../src/schema";
import { Project } from "../models/project";
import { MySql } from "../source/mysql";
import { sqlClient } from "../source/sql_client";

describe('Project', () => {
  describe('Sql Validate', () => {
    let mySql = new MySql();
    it('get', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      await mySql.getOne(Project, {});
      expect(query).toBeCalledWith('select create_at as createAt, update_at as updateAt, id as id, name as name, type as type from `project` as `project`', [])
    });

    it('get - extend property condition', async () => {
      const query = jest.spyOn(sqlClient, 'query');
      const date = new Date('2022-01-01');
      await mySql.getOne(Project, {createAt: GT(date)});
      expect(query).toBeCalledWith('select create_at as createAt, update_at as updateAt, id as id, name as name, type as type from `project` as `project` where create_at > ?', [date])
    });
  });
});
