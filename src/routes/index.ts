// src/routes/index.ts
import "reflect-metadata";
import { Hono } from 'hono';
import AuthRoutes from './auth-route';
import WeatherRoutes from './weather-route';

const router = new Hono();
const basePath = '/hono';

// Mount routes with base path
router.route(`${basePath}/auth`, AuthRoutes);
router.route(`${basePath}/weather`, WeatherRoutes);

export { router as routes };