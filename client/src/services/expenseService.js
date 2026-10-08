import api from "./api";

export const getExpenses = async (params = {}) => {
  const response = await api.get(
    "/expenses",
    {
      params,
    }
  );

  return response.data;
};

export const getExpenseById = async (
  expenseId
) => {
  const response = await api.get(
    `/expenses/${expenseId}`
  );

  return response.data;
};

export const createExpense = async (
  expenseData
) => {
  const response = await api.post(
    "/expenses",
    expenseData
  );

  return response.data;
};

export const updateExpense = async (
  expenseId,
  expenseData
) => {
  const response = await api.put(
    `/expenses/${expenseId}`,
    expenseData
  );

  return response.data;
};

export const deleteExpense = async (
  expenseId
) => {
  const response = await api.delete(
    `/expenses/${expenseId}`
  );

  return response.data;
};

export const getExpenseSummary = async (
  params = {}
) => {
  const response = await api.get(
    "/expenses/summary",
    {
      params,
    }
  );

  return response.data;
};