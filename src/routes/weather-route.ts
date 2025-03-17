import { Hono } from 'hono';
import { addWeather, getHistoryWeather, getWeather, getListWeather, getForecastWeather } from '../controller/weather-controller';

const userRoutes = new Hono();

userRoutes.get('/', getWeather);
userRoutes.get('/history', getHistoryWeather);
userRoutes.get('/check', addWeather);
userRoutes.get('/list', getListWeather);
userRoutes.get('/forcast', getForecastWeather);

export default userRoutes;
