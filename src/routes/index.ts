// src/routes/index.ts
import "reflect-metadata";
import { Hono } from 'hono';
import StorageRoute from './storage-route';

const router = new Hono();
const basePath = '/v1';

// Mount routes with base path
router.route(`${basePath}/s3`, StorageRoute);


export { router as routes };