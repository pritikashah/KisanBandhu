const mongoose = require("mongoose");

const Farm = require("../models/Farm");

const getCoordinates = async ({
  farmId,
  lat,
  lon,
  userId,
}) => {
  if (farmId) {
    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return {
        valid: false,
        status: 400,
        message: "Invalid farm ID.",
      };
    }

    const farm = await Farm.findOne({
      _id: farmId,
      userId,
      isActive: true,
    });

    if (!farm) {
      return {
        valid: false,
        status: 404,
        message:
          "Farm not found or you are not authorized to access this farm.",
      };
    }

    if (
      typeof farm.location?.latitude !== "number" ||
      typeof farm.location?.longitude !== "number"
    ) {
      return {
        valid: false,
        status: 400,
        message:
          "Selected farm does not have valid latitude and longitude.",
      };
    }

    return {
      valid: true,
      latitude: farm.location.latitude,
      longitude: farm.location.longitude,
      location: {
        farmId: farm._id,
        farmName: farm.name,
        village: farm.location.village,
        district: farm.location.district,
        state: farm.location.state,
        country: farm.location.country,
      },
    };
  }

  if (lat === undefined || lon === undefined) {
    return {
      valid: false,
      status: 400,
      message:
        "Provide either farmId or both latitude and longitude.",
    };
  }

  const latitude = Number(lat);
  const longitude = Number(lon);

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    return {
      valid: false,
      status: 400,
      message: "Invalid latitude.",
    };
  }

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      valid: false,
      status: 400,
      message: "Invalid longitude.",
    };
  }

  return {
    valid: true,
    latitude,
    longitude,
    location: {
      latitude,
      longitude,
    },
  };
};

const getApiKey = () => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return null;
  }

  return apiKey;
};

const getCurrentWeather = async (req, res) => {
  try {
    const { farmId, lat, lon } = req.query;

    const apiKey = getApiKey();

    if (!apiKey) {
      return res.status(500).json({
        message:
          "OpenWeather API key is not configured on the server.",
      });
    }

    const coordinateResult = await getCoordinates({
      farmId,
      lat,
      lon,
      userId: req.user.userId,
    });

    if (!coordinateResult.valid) {
      return res.status(coordinateResult.status).json({
        message: coordinateResult.message,
      });
    }

    const url = new URL(
      "https://api.openweathermap.org/data/2.5/weather"
    );

    url.searchParams.set(
      "lat",
      String(coordinateResult.latitude)
    );

    url.searchParams.set(
      "lon",
      String(coordinateResult.longitude)
    );

    url.searchParams.set("appid", apiKey);
    url.searchParams.set("units", "metric");

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error(
        "OpenWeather current weather error:",
        data
      );

      return res.status(
        response.status === 401 ||
          response.status === 404
          ? response.status
          : 502
      ).json({
        message:
          data.message ||
          "Unable to fetch current weather data.",
      });
    }

    return res.status(200).json({
      message: "Current weather fetched successfully.",

      location: coordinateResult.location,

      weather: {
        city: data.name,
        country: data.sys?.country,
        temperature: data.main?.temp,
        feelsLike: data.main?.feels_like,
        minimumTemperature: data.main?.temp_min,
        maximumTemperature: data.main?.temp_max,
        humidity: data.main?.humidity,
        pressure: data.main?.pressure,
        condition: data.weather?.[0]?.main,
        description: data.weather?.[0]?.description,
        icon: data.weather?.[0]?.icon,
        windSpeed: data.wind?.speed,
        windDirection: data.wind?.deg,
        cloudiness: data.clouds?.all,
        visibility: data.visibility,
        observationTime: data.dt,
      },
    });
  } catch (error) {
    console.error(
      "Get current weather error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching current weather.",
    });
  }
};

const getWeatherForecast = async (req, res) => {
  try {
    const { farmId, lat, lon } = req.query;

    const apiKey = getApiKey();

    if (!apiKey) {
      return res.status(500).json({
        message:
          "OpenWeather API key is not configured on the server.",
      });
    }

    const coordinateResult = await getCoordinates({
      farmId,
      lat,
      lon,
      userId: req.user.userId,
    });

    if (!coordinateResult.valid) {
      return res.status(coordinateResult.status).json({
        message: coordinateResult.message,
      });
    }

    const url = new URL(
      "https://api.openweathermap.org/data/2.5/forecast"
    );

    url.searchParams.set(
      "lat",
      String(coordinateResult.latitude)
    );

    url.searchParams.set(
      "lon",
      String(coordinateResult.longitude)
    );

    url.searchParams.set("appid", apiKey);
    url.searchParams.set("units", "metric");

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error(
        "OpenWeather forecast error:",
        data
      );

      return res.status(
        response.status === 401 ||
          response.status === 404
          ? response.status
          : 502
      ).json({
        message:
          data.message ||
          "Unable to fetch weather forecast.",
      });
    }

    const forecast = Array.isArray(data.list)
      ? data.list.map((item) => ({
          dateTime: item.dt_txt,
          timestamp: item.dt,
          temperature: item.main?.temp,
          feelsLike: item.main?.feels_like,
          minimumTemperature: item.main?.temp_min,
          maximumTemperature: item.main?.temp_max,
          humidity: item.main?.humidity,
          pressure: item.main?.pressure,
          condition: item.weather?.[0]?.main,
          description: item.weather?.[0]?.description,
          icon: item.weather?.[0]?.icon,
          windSpeed: item.wind?.speed,
          windDirection: item.wind?.deg,
          cloudiness: item.clouds?.all,
          precipitationProbability: item.pop,
          rain3Hours: item.rain?.["3h"] || 0,
        }))
      : [];

    return res.status(200).json({
      message:
        "Weather forecast fetched successfully.",

      location: coordinateResult.location,

      city: data.city?.name,
      country: data.city?.country,

      forecast,
    });
  } catch (error) {
    console.error(
      "Get weather forecast error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching weather forecast.",
    });
  }
};

module.exports = {
  getCurrentWeather,
  getWeatherForecast,
};