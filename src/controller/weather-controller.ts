import { BaseResponse, Logger } from '../helper';
import { Context } from 'hono';
import WeatherService from '../service/weather-service';
import axios from 'axios';

const API_KEY = '715c761658e94947baa52463aececb51';
const BASE_URL = 'http://api.weatherbit.io/v2.0/current';
const HISTORY_URL = 'https://api.weatherbit.io/v2.0/history/hourly';

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
      throw new Error('Failed to fetch history weather data');
    }
  },
};

export const getWeather = async (c: Context) => {
  const contextWeatherController = 'WeatherController';
  const { latitude, longitude, include } = c.req.query();

  if (!latitude || !longitude) {
    return BaseResponse(c, 'Latitude and longitude are required', 'error', { data: null });
  }

  // Convert latitude and longitude to numbers
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  // Check for invalid latitude and longitude
  if (isNaN(lat) || isNaN(lon)) {
    return BaseResponse(c, 'Invalid latitude or longitude', 'error', { data: null });
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
    return BaseResponse(c, 'Internal Server Error', 'error', { data: null });
  }
};

export const getHistoryWeather = async (c: Context) => {
  const contextWeatherController = 'WeatherController';
  const { latitude, longitude, startDate, endDate } = c.req.query();

  if (!latitude || !longitude || !startDate || !endDate) {
    return BaseResponse(c, 'Latitude, longitude, start date, and end date are required', 'error', { data: null });
  }

  // Convert latitude and longitude to numbers
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  // Check for invalid latitude and longitude
  if (isNaN(lat) || isNaN(lon)) {
    return BaseResponse(c, 'Invalid latitude or longitude', 'error', { data: null });
  }

  try {
    const historyData = await weatherService.getHistoryWeatherData(lat, lon, startDate, endDate);
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
    return BaseResponse(c, 'Internal Server Error', 'error', { data: null });
  }
};

export const addWeather = async (c: Context) => {
  const contextWeatherController = 'WeatherController';
  const { latitude, longitude, include } = c.req.query();

  if (!latitude || !longitude) {
    return BaseResponse(c, 'Latitude and longitude are required', 'error', { data: null });
  }

  // Convert latitude and longitude to numbers
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  // Check for invalid latitude and longitude
  if (isNaN(lat) || isNaN(lon)) {
    return BaseResponse(c, 'Invalid latitude or longitude', 'error', { data: null });
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
    return BaseResponse(c, 'Internal Server Error', 'error', { data: null });
  }
};

export const getListWeather = async (c: Context) => {
  const response = await WeatherService.getAllWeathers();
  Logger.info(`getListWeather | getListWeather`, response);
  return BaseResponse(c, 'weather fetched successfully', 'success', response)
};

