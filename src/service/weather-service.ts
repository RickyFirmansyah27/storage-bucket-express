import { executeSQLQuery } from '../config/dbPoolInfra';

const getAllWeathers = () => {
  const query = 'SELECT * FROM "Weather"';

  return executeSQLQuery(query);
};

export const createWeather = async (
    location: string,
    time: string,
    condition: string,
    temperature: string,
    humidity: string,
    windSpeed: string,
    precipitation: string,
) => {
  // create Weather
  const query = `
        INSERT INTO "Weather" (location, time, condition, temperature, humidity, windSpeed, precipitation) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
    `;
  const params = [location, time, condition, temperature, humidity, windSpeed, precipitation];
  const Weather = await executeSQLQuery(query, params);


  return { Weather: Weather[0]};
};

export default {
  getAllWeathers,
  createWeather,
};
