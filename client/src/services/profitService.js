import api from "./api";

export const getOverallProfit = async () => {
  const response = await api.get(
    "/expenses/profit/overall"
  );

  return response.data;
};

export const getFarmProfit = async (
  farmId
) => {
  const response = await api.get(
    `/expenses/profit/farm/${farmId}`
  );

  return response.data;
};

export const getCropProfit = async (
  cropId
) => {
  const response = await api.get(
    `/expenses/profit/crop/${cropId}`
  );

  return response.data;
};