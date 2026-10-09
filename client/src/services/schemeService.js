import api from "./api";

export const getSchemes = async () => {
  const response = await api.get("/schemes");
  return response.data;
};

export const getSchemeById = async (id) => {
  const response = await api.get(`/schemes/${id}`);
  return response.data;
};

export const searchSchemes = async (query) => {
  const response = await api.get("/schemes/search", {
    params: { keyword: query },
  });

  return response.data;
};

export const createScheme = async (data) => {
  const response = await api.post("/schemes", data);
  return response.data;
};

export const updateScheme = async (id, data) => {
  const response = await api.put(`/schemes/${id}`, data);
  return response.data;
};

export const deleteScheme = async (id) => {
  const response = await api.delete(`/schemes/${id}`);
  return response.data;
};