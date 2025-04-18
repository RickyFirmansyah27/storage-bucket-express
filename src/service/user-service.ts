import { executeSQLQuery } from '../config/dbPoolInfra';
import * as cuid from 'cuid';


const getAllUsers = () => {
  const query = 'SELECT * FROM "User"';

  return executeSQLQuery(query);
};

export const getUserByIdCard = async (idCard: string) => {
  const query = `SELECT * FROM "User" WHERE idCard = $1`;
  const params = [idCard];

  return executeSQLQuery(query, params);
};

export const getUserByName = async (name: string) => {
  const query = `SELECT * FROM "User" WHERE name = $1`;
  const params = [name];

  return executeSQLQuery(query, params);
};

export const createUser = async (idCard: string, name: string, position: string, departement: string, role: string) => {
  const id = cuid.default();
  const query = `
    INSERT INTO "User" (id, idCard, name, position, departement, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const queryParams = [id, idCard, name, position, departement, role];

  return executeSQLQuery(query, queryParams);
};


export default {
  getAllUsers,
  createUser,
};
