import api from "./api";

export const getFarms = async () => {
  const response = await api.get("/farms");

  return response.data;
};

export const getFarmById = async (farmId) => {
  const response = await api.get(`/farms/${farmId}`);

  return response.data;
};

export const createFarm = async (farmData) => {
  const response = await api.post("/farms", farmData);

  return response.data;
};

export const updateFarm = async (farmId, farmData) => {
  const response = await api.put(
    `/farms/${farmId}`,
    farmData
  );

  return response.data;
};

export const deleteFarm = async (farmId) => {
  const response = await api.delete(
    `/farms/${farmId}`
  );

  return response.data;
};