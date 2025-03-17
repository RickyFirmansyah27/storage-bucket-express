import { BaseResponse, Logger } from '../helper';
import { Context } from 'hono';
import WeatherService from '../service/weather-service';
import axios from 'axios';

const API_KEY = '715c761658e94947baa52463aececb51';
const BASE_URL = 'http://api.weatherbit.io/v2.0/current';
const HISTORY_URL = 'https://api.weatherbit.io/v2.0/history/hourly';
const OPEN_WEATHER_URL ='https://api.openweathermap.org/data/2.5/forecast'
const OPEN_WEATHER_KEY = '68caf45e70ed9f5648a6c878b7c369da';

const weatherService = {
  getWeatherData: async (lat: number, lon: number, include: string) => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          lat,
          lon,
          include,
          key: API_KEY,
        },
      });
      Logger.info('Weather data fetched successfully', { data: response.data });
      return response.data;
    } catch (error) {
      Logger.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  },

  getHistoryWeatherData: async (lat: number, lon: number, startDate: string, endDate: string) => {
    try {
      const response = await axios.get(HISTORY_URL, {
        params: {
          lat,
          lon,
          start_date: startDate,
          end_date: endDate,
          tz:'local',
          key: API_KEY,
        },
      });

      return response.data;
    } catch (error) {
      Logger.error('Error fetching history weather data:', error);
    }
  },

  getForecastWeatherData: async (lat: number, lon: number) => {
    try {
      const response = await axios.get(OPEN_WEATHER_URL, {
        params: {
          lat,
          lon,
          units: 'metric',
          appid: OPEN_WEATHER_KEY,
        },
      });
      Logger.info('Weather data fetched successfully', { data: response.data });
      return response.data;
    } catch (error) {
      Logger.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  },
};

export const getWeather = async (c: Context) => {
  const contextWeatherController = 'WeatherController';
  const { latitude, longitude, include } = c.req.query();

  if (!latitude || !longitude) {
    return BaseResponse(c, 'Latitude and longitude are required', 'error', { data: [] });
  }

  // Convert latitude and longitude to numbers
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  // Check for invalid latitude and longitude
  if (isNaN(lat) || isNaN(lon)) {
    return BaseResponse(c, 'Invalid latitude or longitude', 'error', { data: [] });
  }

  try {
    const weatherData = await weatherService.getWeatherData(lat, lon, include);
    const weather = weatherData.data.map((data: any) => {
      const date = new Date(data.ts * 1000);
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
      };
      
      // Format waktu menjadi HH:mm:ss
      const timeString = new Intl.DateTimeFormat('id-ID', options).format(date);

    
      return {
        location: data.city_name,  // Lokasi berdasarkan timezone
        time: timeString,  // Waktu dalam format HH:mm:ss
        condition: data.weather.description,  // Deskripsi cuaca
        temperature: `${data.temp}°C`,  // Suhu dalam Celsius
        humidity: `${data.rh}%`,  // Kelembaban
        windSpeed: `${(data.wind_spd * 3.6).toFixed(1)} km/h`,  // Kecepatan angin dalam km/h
        precipitation: `${data.precip} mm`,  // Curah hujan
      };
    });   


    return BaseResponse(c, 'Weather data fetched successfully', 'success', weather);
  } catch (error: unknown) {
    Logger.error(`${contextWeatherController} | Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return BaseResponse(c, 'Internal Server Error', 'error', { data: [] });
  }
};

export const getHistoryWeather = async (c: Context) => {
  const contextWeatherController = 'WeatherController';
  const { latitude, longitude, startDate, endDate } = c.req.query();

  if (!latitude || !longitude || !startDate || !endDate) {
    return BaseResponse(c, 'Latitude, longitude, start date, and end date are required', 'error', { data: [] });
  }

  // Convert latitude and longitude to numbers
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  // Check for invalid latitude and longitude
  if (isNaN(lat) || isNaN(lon)) {
    return BaseResponse(c, 'Invalid latitude or longitude', 'error', { data: [] });
  }

  try {
    const historyData = await weatherService.getHistoryWeatherData(lat, lon, startDate, endDate);
    if(!historyData){
      return BaseResponse(c, 'Failed fetching data now or expired API key', 'badRequest', { data: [] });
    }
    const history = historyData.data.map((data: any) => {
        const date = new Date(data.ts * 1000);
        const options: Intl.DateTimeFormatOptions = {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Jakarta',
        };
        
        // Format waktu menjadi HH:mm:ss
        const timeString = new Intl.DateTimeFormat('id-ID', options).format(date);
      
        return {
          location: historyData.timezone,  // Lokasi berdasarkan timezone
          time: timeString,  // Waktu dalam format HH:mm:ss
          condition: data.weather.description,  // Deskripsi cuaca
          temperature: `${data.temp}°C`,  // Suhu dalam Celsius
          humidity: `${data.rh}%`,  // Kelembaban
          windSpeed: `${(data.wind_spd * 3.6).toFixed(1)} km/h`,  // Kecepatan angin dalam km/h
          precipitation: `${data.precip} mm`,  // Curah hujan
        };
      });      

    return BaseResponse(c, 'Weather history data fetched successfully', 'success', history);
  } catch (error: unknown) {
    Logger.error(`${contextWeatherController} | Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return BaseResponse(c, 'Internal Server Error', 'error', { data: [] });
  }
};

export const addWeather = async (c: Context) => {
  const contextWeatherController = 'WeatherController';
  const { latitude, longitude, include } = c.req.query();

  if (!latitude || !longitude) {
    return BaseResponse(c, 'Latitude and longitude are required', 'error', { data: [] });
  }

  // Convert latitude and longitude to numbers
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  // Check for invalid latitude and longitude
  if (isNaN(lat) || isNaN(lon)) {
    return BaseResponse(c, 'Invalid latitude or longitude', 'error', { data: [] });
  }

  try {
    const weatherData = await weatherService.getWeatherData(lat, lon, include);
    const weather = weatherData.data.map((data: any) => {
      const date = new Date(data.ts * 1000);
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
      };
      
      // Format waktu menjadi HH:mm:ss
      const timeString = new Intl.DateTimeFormat('id-ID', options).format(date);

    
      return {
        location: data.city_name,  // Lokasi berdasarkan timezone
        time: timeString,  // Waktu dalam format HH:mm:ss
        condition: data.weather.description,  // Deskripsi cuaca
        temperature: `${data.temp}°C`,  // Suhu dalam Celsius
        humidity: `${data.rh}%`,  // Kelembaban
        windSpeed: `${(data.wind_spd * 3.6).toFixed(1)} km/h`,  // Kecepatan angin dalam km/h
        precipitation: `${data.precip} mm`,  // Curah hujan
      };

    });   

    await WeatherService.createWeather(weather[0].location, weather[0].time, weather[0].condition, weather[0].temperature, weather[0].humidity, weather[0].windSpeed, weather[0].precipitation);

    return BaseResponse(c, 'Weather data added successfully', 'success', weather);
  } catch (error: unknown) {
    Logger.error(`${contextWeatherController} | Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return BaseResponse(c, 'Internal Server Error', 'error', { data: [] });
  }
};

export const getListWeather = async (c: Context) => {
  const response = await WeatherService.getAllWeathers();
  Logger.info(`getListWeather | getListWeather`, response);
  return BaseResponse(c, 'weather fetched successfully', 'success', response)
};

export const getForecastWeather = async (c: Context) => {
  const { latitude, longitude } = c.req.query();

  if (!latitude || !longitude) {
    return BaseResponse(c, 'Latitude and longitude are required', 'error', { data: [] });
  }

  // Convert latitude and longitude to numbers
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  // Check for invalid latitude and longitude
  if (isNaN(lat) || isNaN(lon)) {
    return BaseResponse(c, 'Invalid latitude or longitude', 'error', { data: [] });
  }

  try {
    const response = await weatherService.getForecastWeatherData(lat, lon);

    const forecastPoints = response.list.slice(0, 10).map((item: any) => {
      const itemDate = new Date(item.dt * 1000);
      const hours = itemDate.getHours();
      const formattedHour = `${hours}:00`;

      let rainDescription = "moderate rain";
      if (item.rain) {
        if (item.rain['3h'] < 2) rainDescription = "light rain";
        else if (item.rain['3h'] > 7) rainDescription = "heavy rain";
      }

      const windSpeed = (item.wind.speed).toFixed(1);

      return {
        time: formattedHour,
        temp: Math.round(item.main.temp),
        precipitation1: item.rain?.['3h'] ? Math.min(item.rain['3h'] * 10, 100) : 0,
        description1: rainDescription,
        windSpeed1: `${windSpeed}m/s`,
      };
    });
  
    Logger.info(`WeatherController | getForecastWeather`, forecastPoints);
    return BaseResponse(c, 'weather fetched successfully', 'success', forecastPoints)
  } catch (error) {
    Logger.error(`WeatherController | getForecastWeather`, error);
    return BaseResponse(c, 'Internal Server Error', 'error', { data: [] });
  }
};