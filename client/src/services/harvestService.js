import api from "./api";

export const getHarvests = async (
  params = {}
) => {
  const response = await api.get(
    "/harvests",
    {
      params,
    }
  );

  return response.data;
};

export const getHarvestById = async (
  harvestId
) => {
  const response = await api.get(
    `/harvests/${harvestId}`
  );

  return response.data;
};

export const createHarvest = async (
  harvestData
) => {
  const response = await api.post(
    "/harvests",
    harvestData
  );

  return response.data;
};

export const updateHarvest = async (
  harvestId,
  harvestData
) => {
  const response = await api.put(
    `/harvests/${harvestId}`,
    harvestData
  );

  return response.data;
};

export const deleteHarvest = async (
  harvestId
) => {
  const response = await api.delete(
    `/harvests/${harvestId}`
  );

  return response.data;
};