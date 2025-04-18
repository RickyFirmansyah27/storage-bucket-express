import { executeSQLQuery } from '../config/dbPoolInfra';
import * as cuid from 'cuid';

export const getAllAttendances = async () => {
    const query = `
        SELECT * FROM "Attendance"
        WHERE "date" >= date('now', 'start of day') 
          AND "date" < date('now', 'start of day', '+1 day')
        ORDER BY "createdAt" ASC;
    `;
    return executeSQLQuery(query);
};



export const attendancesToday = async (id: string, today: string, tomorrow: string) => {
    const query = `
        SELECT * FROM "Attendance"
        WHERE "userId" = $1
        AND "date" >= $2 AND "date" < $3
        ORDER BY "createdAt" ASC;
      `;

    const queryParams = [id, today, tomorrow];
    return executeSQLQuery(query, queryParams);
}

export const insertAttendance = async (
    userId: string, 
    idCard: string, 
    name: string, 
    date: string, 
    timeIn: string
  ) => {
    const id = cuid.default();
  
    const insertQuery = `
      INSERT INTO "Attendance" 
      ("id", "userId", "idCard", "name", "date", "timeIn", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
  
    const values = [
      id,
      userId,
      idCard,
      name,
      date,
      timeIn,
      new Date().toISOString(),
      new Date().toISOString()
    ];
  
    return executeSQLQuery(insertQuery, values);
  };
  
  

export const addTimeOutAttendance = async (id: string) => {
    const updateQuery = `
        UPDATE "Attendance"
        SET "timeOut" = $1, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
    `;

    const queryParams = [new Date(), id];

    return executeSQLQuery(updateQuery, queryParams);
}