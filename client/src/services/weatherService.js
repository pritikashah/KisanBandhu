
import api from "./api";

export const getCurrentWeather = async (params = {}) => {
  const response = await api.get("/weather/current", { params });
  return response.data;
};

export const getWeatherForecast = async (params = {}) => {
  const response = await api.get("/weather/forecast", { params });
  return response.data;
};
