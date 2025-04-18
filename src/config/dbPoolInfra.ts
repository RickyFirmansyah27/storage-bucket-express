import { PrismaClient } from '@prisma/client';
import { Logger } from '../helper/logger';
import { config } from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../.env');
config({ path: envPath });

const contextLogger = '[Prisma DB - connection]';
const prisma = new PrismaClient();

/**
 * Function to test database connection
 */
export const DBConnection = async (): Promise<void> => {
  try {
    // Simple query to check connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    // For SQLite, use sqlite_version() instead of version()
    const version = await prisma.$queryRaw`SELECT sqlite_version() as version`;
    
    Logger.info(`${contextLogger} | Database connection successfully`, {
      connection: Array.isArray(result) && result.length > 0,
    });
    Logger.info(`${contextLogger} | version: ${version[0].version}`);
  } catch (err) {
    Logger.info(`${contextLogger} | Database connection error`, {
      error: (err as Error).message,
      errorDetail: (err as Error).stack,
    });
    throw err;
  }
};

/**
 * Execute SQL with parameters
 */
export const commandWithParams = async (
  sql: string,
  params: any[] = [],
): Promise<any[]> => {
  try {
    Logger.info(`${contextLogger} | Info - SQL: ${sql} - Params: ${JSON.stringify(params)}`);
    // Using $queryRawUnsafe for dynamic SQL with params
    const result = await prisma.$queryRawUnsafe(sql, ...params);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    Logger.error(`${contextLogger} | Database connection error`, {
      error: (err as Error).message,
      errorDetail: (err as Error).stack,
    });
    throw err;
  }
};

/**
 * Execute SQL query
 */
export const executeSQLQuery = async (
  sql: string,
  params: any[] = [],
): Promise<any[]> => {
  return commandWithParams(sql, params);
};

/**
 * Start a database transaction
 */
export const startTransaction = async () => {
  Logger.info(`${contextLogger} | Info | transaction`);
  return prisma;
};

/**
 * Execute SQL within a transaction
 */
export const executeSQLTransaction = async (
  client: PrismaClient,
  sql: string,
  params: any[] = [],
): Promise<any[]> => {
  Logger.info(`${contextLogger} | Info - SQL: ${sql} - Params: ${JSON.stringify(params)}`);
  try {
    const result = await client.$queryRawUnsafe(sql, ...params);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    Logger.info(`${contextLogger} | Database connection error`, {
      error: (err as Error).message,
      errorDetail: (err as Error).stack,
    });
    throw err;
  }
};

/**
 * Rollback a transaction
 */
export const rollbackTransaction = async (
  client: PrismaClient,
): Promise<void> => {
  // Implemented below in actual transaction functions
};

/**
 * Commit a transaction
 */
export const commitTransaction = async (
  client: PrismaClient,
): Promise<void> => {
  // Implemented below in actual transaction functions
};

/**
 * Disconnect from the database when shutting down
 */
export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
  Logger.info(`${contextLogger} | Database disconnected`);
};
