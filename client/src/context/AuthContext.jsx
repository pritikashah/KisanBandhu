import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("kisanbandhu_token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("kisanbandhu_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("kisanbandhu_user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token: newToken, user: loggedInUser } = response.data;

    localStorage.setItem("kisanbandhu_token", newToken);
    localStorage.setItem(
      "kisanbandhu_user",
      JSON.stringify(loggedInUser)
    );

    setToken(newToken);
    setUser(loggedInUser);

    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);

    const { token: newToken, user: registeredUser } = response.data;

    localStorage.setItem("kisanbandhu_token", newToken);
    localStorage.setItem(
      "kisanbandhu_user",
      JSON.stringify(registeredUser)
    );

    setToken(newToken);
    setUser(registeredUser);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("kisanbandhu_token");
    localStorage.removeItem("kisanbandhu_user");

    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}