import { Hono } from 'hono';
import { addWeather, getHistoryWeather, getWeather, getListWeather } from '../controller/weather-controller';

const userRoutes = new Hono();

userRoutes.get('/', getWeather);
userRoutes.get('/history', getHistoryWeather);
userRoutes.get('/check', addWeather);
userRoutes.get('/list', getListWeather);

export default userRoutes;
