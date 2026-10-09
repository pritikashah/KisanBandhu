
import api from "./api";

export const getReminders = async (params = {}) => {
  const response = await api.get("/reminders", { params });
  return response.data;
};

export const createReminder = async (data) => {
  const response = await api.post("/reminders", data);
  return response.data;
};

export const updateReminder = async (id, data) => {
  const response = await api.put(`/reminders/${id}`, data);
  return response.data;
};

export const completeReminder = async (id) => {
  const response = await api.patch(`/reminders/${id}/complete`);
  return response.data;
};

export const deleteReminder = async (id) => {
  const response = await api.delete(`/reminders/${id}`);
  return response.data;
};
