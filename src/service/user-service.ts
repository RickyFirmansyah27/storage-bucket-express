import { executeSQLQuery } from '../config/dbPoolInfra';

const getAllUsers = () => {
  const query = 'SELECT * FROM "User"';

  return executeSQLQuery(query);
};

export const getUserByEmail = async (email: string) => {
  const query = `SELECT * FROM "User" WHERE email = $1`;
  const params = [email];

  return executeSQLQuery(query, params);
};

export const getUserDetail = async (id: string) => {
  const query = `SELECT u.id, u.name, u.password, u."createdAt", up.id AS "profileId", up.address, up.email, up.fullname, up.phone, up.role FROM "User" u JOIN "UserProfile" up ON u.id = up."userId" WHERE u.id = $1`;
  const params = [parseInt(id)];

  return executeSQLQuery(query, params);
};

export const createUser = async (
  name: string,
  email: string,
  hashedPassword: string
) => {
  // create user
  const query = `
        INSERT INTO "User" (name, password, email) 
        VALUES ($1, $2, $3) 
        RETURNING *
    `;
  const params = [name, hashedPassword, email];
  const user = await executeSQLQuery(query, params);


  return { user: user[0]};
};

export default {
  getAllUsers,
  getUserByEmail,
  getUserDetail,
  createUser,
};
