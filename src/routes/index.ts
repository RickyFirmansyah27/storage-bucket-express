// src/routes/index.ts
import "reflect-metadata";
import { Hono } from 'hono';
import AuthRoutes from './auth-route';
import UserRoutes from './user-route';
import AttendanceRoutes from './attendance-route';

const router = new Hono();
const basePath = '/v1';

// Mount routes with base path
router.route(`${basePath}/auth`, AuthRoutes);
router.route(`${basePath}/users`, UserRoutes);
router.route(`${basePath}/attendance`, AttendanceRoutes);

export { router as routes };